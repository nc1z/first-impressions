import { ideaBriefSchema, personaReactionSchema, personaSeedSchema } from "../domain/schemas.js";
import type { IdeaBrief, IdeaInput, PersonaSeed, RunPersona } from "../domain/types.js";
import { buildAudiencePersonasPrompt, buildIdeaSummaryPrompt, buildPersonaEvaluationPrompt } from "../prompts.js";
import type { ProviderAdapter } from "./base.js";
import { extractJsonArray, extractJsonObject, isCommandAvailable, runCommand } from "./shell.js";

async function runCopilotPrompt(prompt: string): Promise<string> {
  const { stdout } = await runCommand({
    command: "copilot",
    args: [
      "-p",
      prompt,
      "-s",
      "--no-ask-user",
      "--output-format",
      "text",
    ],
    timeoutMs: 180000,
  });

  return stdout;
}

export class CopilotAdapter implements ProviderAdapter {
  readonly name = "copilot" as const;

  async isAvailable(): Promise<boolean> {
    return isCommandAvailable("copilot");
  }

  async summarizeIdea(input: IdeaInput): Promise<IdeaBrief> {
    const raw = await runCopilotPrompt(buildIdeaSummaryPrompt(input));
    const parsed = ideaBriefSchema.parse(JSON.parse(extractJsonObject(raw)));

    return {
      ...parsed,
      sourceKind: input.kind,
      sourceLabel: input.label,
    };
  }

  async evaluatePersona(brief: IdeaBrief, persona: RunPersona) {
    const raw = await runCopilotPrompt(buildPersonaEvaluationPrompt(brief, persona));
    return personaReactionSchema.parse(JSON.parse(extractJsonObject(raw)));
  }

  async generatePersonas(description: string, count: number): Promise<PersonaSeed[]> {
    const batchSize = 20;
    const batches = Math.ceil(count / batchSize);
    const results: PersonaSeed[] = [];

    for (let i = 0; i < batches; i++) {
      const batchCount = Math.min(batchSize, count - results.length);
      const raw = await runCopilotPrompt(buildAudiencePersonasPrompt(description, batchCount));
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
