import { ideaBriefSchema, personaReactionSchema, personaSeedSchema } from "../domain/schemas.js";
import type { IdeaBrief, IdeaInput, PersonaSeed, RunPersona } from "../domain/types.js";
import { buildAudiencePersonasPrompt, buildIdeaSummaryPrompt, buildPersonaEvaluationPrompt } from "../prompts.js";
import type { ProviderAdapter } from "./base.js";
import { extractJsonArray, extractJsonObject, isCommandAvailable, runCommand } from "./shell.js";

async function generatePersonasInBatches(
  description: string,
  count: number,
  runPrompt: (prompt: string) => Promise<string>,
): Promise<PersonaSeed[]> {
  const batchSize = 20;
  const batches = Math.ceil(count / batchSize);
  const results: PersonaSeed[] = [];

  for (let i = 0; i < batches; i++) {
    const batchCount = Math.min(batchSize, count - results.length);
    const raw = await runPrompt(buildAudiencePersonasPrompt(description, batchCount));
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

async function runClaudePrompt(prompt: string): Promise<string> {
  const { stdout } = await runCommand({
    command: "claude",
    args: [
      "-p",
      "--output-format",
      "text",
      "--no-session-persistence",
      prompt,
    ],
    timeoutMs: 180000,
  });

  return stdout;
}

export class ClaudeAdapter implements ProviderAdapter {
  readonly name = "claude" as const;

  async isAvailable(): Promise<boolean> {
    return isCommandAvailable("claude");
  }

  async summarizeIdea(input: IdeaInput): Promise<IdeaBrief> {
    const raw = await runClaudePrompt(buildIdeaSummaryPrompt(input));
    const parsed = ideaBriefSchema.parse(JSON.parse(extractJsonObject(raw)));

    return {
      ...parsed,
      sourceKind: input.kind,
      sourceLabel: input.label,
    };
  }

  async evaluatePersona(brief: IdeaBrief, persona: RunPersona) {
    const raw = await runClaudePrompt(buildPersonaEvaluationPrompt(brief, persona));
    return personaReactionSchema.parse(JSON.parse(extractJsonObject(raw)));
  }

  async generatePersonas(description: string, count: number): Promise<PersonaSeed[]> {
    return generatePersonasInBatches(description, count, runClaudePrompt);
  }
}
