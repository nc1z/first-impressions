import path from "node:path";

import { aggregateInsights } from "./analysis.js";
import type { IdeaInput, PersonaReaction, PersonaSeed, ProviderName, RunArtifacts, RunMode, RunPersona } from "./domain/types.js";
import { resolveIdeaInput } from "./ingest.js";
import { selectRunPersonas } from "./personas.js";
import type { ProviderAdapter } from "./providers/base.js";
import { createProviderAdapter } from "./providers/index.js";
import { generateReport } from "./report.js";
import type { RunProgressEvent } from "./terminal.js";
import { ensureDir, writeJson, writeJsonLines } from "./utils/fs.js";
import { createSeedFromText } from "./utils/random.js";

export interface ExecuteRunOptions {
  text?: string | undefined;
  file?: string | undefined;
  url?: string | undefined;
  provider: ProviderName;
  count: number;
  mode: RunMode;
  seed?: number | undefined;
  concurrency: number;
  outputDir: string;
  audienceDescription?: string | undefined;
  onProgress?: ((event: RunProgressEvent) => void) | undefined;
}

export async function executeRun(options: ExecuteRunOptions): Promise<{ artifacts: RunArtifacts; runDirectory: string }> {
  const startedAt = Date.now();
  const emit = (event: Omit<RunProgressEvent, "elapsedMs">): void => {
    options.onProgress?.({
      ...event,
      elapsedMs: Date.now() - startedAt,
    });
  };

  emit({
    stage: "input",
    message: "Resolving idea input",
  });
  const input = await resolveIdeaInput({
    text: options.text,
    file: options.file,
    url: options.url,
  });
  const seed = options.seed ?? createSeedFromText(`${input.label}:${input.value.slice(0, 200)}`);
  const adapter = createProviderAdapter(options.provider);
  const available = await adapter.isAvailable();

  if (!available) {
    throw new Error(`Provider CLI "${options.provider}" is not available in PATH.`);
  }

  emit({
    stage: "summary",
    message: `Generating structured brief via ${options.provider}`,
  });
  const brief = await adapter.summarizeIdea(input);
  emit({
    stage: "summary",
    message: "Structured brief ready",
    brief,
  });

  emit({
    stage: "personas",
    message: options.audienceDescription
      ? `Generating custom audience: "${options.audienceDescription}"`
      : `Selecting ${options.count} personas`,
  });
  const personas = options.audienceDescription
    ? await generateCustomPersonas({ description: options.audienceDescription, count: options.count, seed, adapter })
    : await selectRunPersonas({ count: options.count, mode: options.mode, seed });
  emit({
    stage: "personas",
    message: "Personas ready",
    completed: personas.length,
    total: personas.length,
  });

  emit({
    stage: "evaluations",
    message: "Starting persona evaluations",
    completed: 0,
    total: personas.length,
  });
  const responses = await evaluatePersonas({
    provider: options.provider,
    personas,
    concurrency: options.concurrency,
    evaluate: async (persona) => {
      const startedAt = Date.now();

      try {
        const response = await adapter.evaluatePersona(brief, persona);
        return {
          ...response,
          personaId: persona.seed.id,
          provider: options.provider,
          durationMs: Date.now() - startedAt,
        };
      } catch (error) {
        return {
          personaId: persona.seed.id,
          provider: options.provider,
          reactionScore: 0,
          interestLevel: 0,
          clarityLevel: 0,
          trustLevel: 0,
          audienceFit: "low",
          wouldTry: false,
          wouldShare: false,
          wouldPay: false,
          mainPositive: "response failed",
          mainConcern: "provider response failed",
          shortReaction: "No usable output received from the provider.",
          tags: ["failed"],
          durationMs: Date.now() - startedAt,
          error: error instanceof Error ? error.message : String(error),
        } satisfies PersonaReaction;
      }
    },
    onProgress: ({ completed, persona, reaction }) => {
      emit({
        stage: "evaluations",
        message: "Persona completed",
        completed,
        total: personas.length,
        persona,
        reaction,
      });
    },
  });
  const insights = aggregateInsights(personas, responses);
  const runId = createRunId();
  const runDirectory = path.resolve(options.outputDir, "runs", runId);
  const reportPath = path.join(runDirectory, "report");

  const artifacts: RunArtifacts = {
    manifest: {
      runId,
      provider: options.provider,
      mode: options.mode,
      count: options.count,
      concurrency: options.concurrency,
      seed,
      createdAt: new Date().toISOString(),
      source: input,
      reportPath,
    },
    brief,
    personas,
    responses,
    insights,
  };

  emit({
    stage: "persist",
    message: "Writing run artifacts",
  });
  await persistRunArtifacts(runDirectory, artifacts, input);
  emit({
    stage: "report",
    message: "Generating local report",
  });
  await generateReport({
    runDirectory,
    artifacts,
  });
  emit({
    stage: "done",
    message: "Run complete",
  });

  return { artifacts, runDirectory };
}

async function generateCustomPersonas(options: {
  description: string;
  count: number;
  seed: number;
  adapter: ProviderAdapter;
}): Promise<RunPersona[]> {
  const { createRandomSource } = await import("./utils/random.js");
  const { createPersonaOverlay, createPersonaPromptSummary } = await import("./personas.js");

  const seeds = await options.adapter.generatePersonas(options.description, options.count);
  if (seeds.length === 0) {
    throw new Error("Provider returned no personas for the given audience description.");
  }

  const random = createRandomSource(options.seed);
  return seeds.map((seed: PersonaSeed) => {
    const overlay = createPersonaOverlay(random);
    return {
      seed,
      overlay,
      personaPromptSummary: createPersonaPromptSummary(seed, overlay),
    };
  });
}

async function evaluatePersonas(options: {
  provider: ProviderName;
  personas: RunPersona[];
  concurrency: number;
  evaluate: (persona: RunPersona) => Promise<PersonaReaction>;
  onProgress?: ((event: { completed: number; persona: RunPersona; reaction: PersonaReaction }) => void) | undefined;
}): Promise<PersonaReaction[]> {
  const results: PersonaReaction[] = [];
  let currentIndex = 0;
  let completed = 0;

  const worker = async (): Promise<void> => {
    while (currentIndex < options.personas.length) {
      const persona = options.personas[currentIndex] as RunPersona;
      currentIndex += 1;
      const result = await options.evaluate(persona);
      results.push(result);
      completed += 1;
      options.onProgress?.({
        completed,
        persona,
        reaction: result,
      });
    }
  };

  const workerCount = Math.max(1, Math.min(options.concurrency, options.personas.length));
  await Promise.all(Array.from({ length: workerCount }, async () => worker()));

  return results.sort((left, right) => left.personaId.localeCompare(right.personaId));
}

async function persistRunArtifacts(runDirectory: string, artifacts: RunArtifacts, input: IdeaInput): Promise<void> {
  await ensureDir(path.join(runDirectory, "report"));
  await writeJson(path.join(runDirectory, "manifest.json"), artifacts.manifest);
  await writeJson(path.join(runDirectory, "idea-input.json"), input);
  await writeJson(path.join(runDirectory, "idea-brief.json"), artifacts.brief);
  await writeJson(path.join(runDirectory, "personas.json"), artifacts.personas);
  await writeJsonLines(path.join(runDirectory, "responses.jsonl"), artifacts.responses);
  await writeJson(path.join(runDirectory, "insights.json"), artifacts.insights);
}

function createRunId(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}
