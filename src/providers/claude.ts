import { ideaBriefSchema, personaReactionSchema } from "../domain/schemas.js";
import type { IdeaBrief, IdeaInput, RunPersona } from "../domain/types.js";
import { buildIdeaSummaryPrompt, buildPersonaEvaluationPrompt } from "../prompts.js";
import type { ProviderAdapter } from "./base.js";
import { extractJsonObject, isCommandAvailable, runCommand } from "./shell.js";

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

}
