import { ideaBriefSchema, personaReactionSchema } from "../domain/schemas.js";
import type { IdeaBrief, IdeaInput, RunPersona } from "../domain/types.js";
import { buildIdeaSummaryPrompt, buildPersonaEvaluationPrompt } from "../prompts.js";
import type { ProviderAdapter } from "./base.js";
import { extractJsonObject, isCommandAvailable, runCodexPrompt } from "./shell.js";

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
}
