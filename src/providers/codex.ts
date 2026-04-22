import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { ideaBriefSchema, personaReactionSchema, personaSeedSchema } from "../domain/schemas.js";
import type { IdeaBrief, IdeaInput, PersonaSeed, RunPersona } from "../domain/types.js";
import { buildAudiencePersonasPrompt, buildIdeaSummaryPrompt, buildPersonaEvaluationPrompt } from "../prompts.js";
import type { ProviderAdapter } from "./base.js";
import { extractJsonArray, extractJsonObject, isCommandAvailable, runCommand } from "./shell.js";

export class CodexAdapter implements ProviderAdapter {
  readonly name = "codex" as const;

  async isAvailable(): Promise<boolean> {
    return isCommandAvailable("codex");
  }

  async summarizeIdea(input: IdeaInput): Promise<IdeaBrief> {
    const raw = await runCodexPrompt(buildIdeaSummaryPrompt(input));
    const parsed = ideaBriefSchema.parse(JSON.parse(extractJsonObject(raw)));

    return {
      ...parsed,
      sourceKind: input.kind,
      sourceLabel: input.label,
    };
  }

  async evaluatePersona(brief: IdeaBrief, persona: RunPersona) {
    const raw = await runCodexPrompt(buildPersonaEvaluationPrompt(brief, persona));
    return personaReactionSchema.parse(JSON.parse(extractJsonObject(raw)));
  }

  async generatePersonas(description: string, count: number): Promise<PersonaSeed[]> {
    const batchSize = 20;
    const batches = Math.ceil(count / batchSize);
    const results: PersonaSeed[] = [];

    for (let i = 0; i < batches; i++) {
      const batchCount = Math.min(batchSize, count - results.length);
      const raw = await runCodexPrompt(buildAudiencePersonasPrompt(description, batchCount));
      const parsed = JSON.parse(extractJsonArray(raw)) as unknown[];
      for (const item of parsed) {
        const validated = personaSeedSchema.safeParse(item);
        if (validated.success) {
          results.push({
            ...validated.data,
            id: `generated-${String(results.length + 1).padStart(3, "0")}`,
            tags: validated.data.tags ?? [],
          });
        }
      }
    }

    return results;
  }
}

async function runCodexPrompt(prompt: string): Promise<string> {
  const tempDirectory = await mkdtemp(path.join(tmpdir(), "first-impressions-codex-"));
  const outputPath = path.join(tempDirectory, "last-message.txt");

  try {
    await runCommand({
      command: "codex",
      args: [
        "exec",
        "--ephemeral",
        "--skip-git-repo-check",
        "--sandbox",
        "read-only",
        "--output-last-message",
        outputPath,
        prompt,
      ],
      timeoutMs: 180000,
    });

    return await readFile(outputPath, "utf8");
  } finally {
    await rm(tempDirectory, { recursive: true, force: true });
  }
}
