import path from "node:path";

import { aggregateInsights } from "./analysis.js";
import type { IdeaInput, PersonaReaction, ProviderName, RunArtifacts, RunMode, RunPersona } from "./domain/types.js";
import { resolveIdeaInput } from "./ingest.js";
import { selectRunPersonas } from "./personas.js";
import { createProviderAdapter } from "./providers/index.js";
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
}

export async function executeRun(options: ExecuteRunOptions): Promise<{ artifacts: RunArtifacts; runDirectory: string }> {
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

  const brief = await adapter.summarizeIdea(input);
  const personas = await selectRunPersonas({
    count: options.count,
    mode: options.mode,
    seed,
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

  await persistRunArtifacts(runDirectory, artifacts, input);

  return { artifacts, runDirectory };
}

async function evaluatePersonas(options: {
  provider: ProviderName;
  personas: RunPersona[];
  concurrency: number;
  evaluate: (persona: RunPersona) => Promise<PersonaReaction>;
}): Promise<PersonaReaction[]> {
  const results: PersonaReaction[] = [];
  let currentIndex = 0;

  const worker = async (): Promise<void> => {
    while (currentIndex < options.personas.length) {
      const persona = options.personas[currentIndex] as RunPersona;
      currentIndex += 1;
      const result = await options.evaluate(persona);
      results.push(result);
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
