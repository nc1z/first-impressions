import type { IdeaBrief, IdeaInput, RunPersona } from "./domain/types.js";

export function buildIdeaSummaryPrompt(input: IdeaInput): string {
  return [
    "You normalize startup ideas for downstream evaluation personas.",
    "Return JSON only. No markdown. No explanation.",
    "Required JSON shape:",
    '{"title":"string","oneLineSummary":"string","targetUser":"string","problemSolved":"string","proposedValue":"string","assumptions":["string"],"concerns":["string"]}',
    "Use concise language and infer only what is reasonably supported by the input.",
    `Source kind: ${input.kind}`,
    `Source label: ${input.label}`,
    "Idea input:",
    input.value,
  ].join("\n");
}

export function buildPersonaEvaluationPrompt(brief: IdeaBrief, persona: RunPersona): string {
  return [
    "You are simulating a first-impression reaction to a product idea.",
    "Assume the persona fully and answer only as that persona.",
    "Return JSON only. No markdown. No explanation.",
    "Required JSON shape:",
    '{"reactionScore":0,"interestLevel":0,"clarityLevel":0,"trustLevel":0,"audienceFit":"low|mixed|high","wouldTry":true,"wouldShare":false,"wouldPay":false,"mainPositive":"string","mainConcern":"string","shortReaction":"string","tags":["string"]}',
    "Scoring should be 0-100 integers.",
    "Write `shortReaction` as a vivid, opinionated, first-person gut reaction — the kind of thing this persona would actually say out loud. Under 35 words. No hedging. Make it quotable.",
    "Idea brief:",
    JSON.stringify(brief, null, 2),
    "Persona:",
    persona.personaPromptSummary,
  ].join("\n");
}
