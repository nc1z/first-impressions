import type { IdeaBrief, IdeaInput, PersonaReaction, ProviderName, RunPersona } from "../domain/types.js";

export interface ProviderAdapter {
  readonly name: ProviderName;
  isAvailable(): Promise<boolean>;
  summarizeIdea(input: IdeaInput): Promise<IdeaBrief>;
  evaluatePersona(brief: IdeaBrief, persona: RunPersona): Promise<Omit<PersonaReaction, "personaId" | "provider" | "durationMs">>;
}
