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

export function buildAudiencePersonasPrompt(description: string, count: number): string {
  return [
    `Generate exactly ${count} realistic, diverse user personas that all belong to this target audience:`,
    `"${description}"`,
    "",
    "Rules:",
    "- Every persona must genuinely belong to this audience (role, industry, background, concerns).",
    "- Maximize diversity WITHIN the audience: vary age band, region, tech familiarity, career stage, spending style, gender.",
    "- Use culturally diverse names that match the person's regionGroup (e.g. Japanese names for asia_pacific, French names for europe).",
    "- Each persona must be meaningfully distinct — no carbon copies.",
    "- The industry, domain, roleFamily, lifeStage, and archetype must reflect the audience — be specific and realistic, not generic.",
    "",
    "Return a JSON array of exactly " + count + " objects. No markdown. No explanation. Start with [ and end with ].",
    "",
    'Each object shape: {"name":"string","ageBand":"teen|young_adult|adult|midlife|senior","sex":"female|male|unspecified","industry":"string","domain":"string","roleFamily":"string","regionGroup":"north_america|europe|asia_pacific|latin_america|africa_middle_east","techFamiliarity":"low|medium|high","spendingStyle":"frugal|balanced|premium_sensitive","decisionStyle":"intuitive|deliberate|social_proof|risk_averse","skepticismLevel":"low|medium|high","toneBaseline":"warm|blunt|curious|skeptical|optimistic|practical","archetype":"string","lifeStage":"string","summary":"string","tags":["string"]}',
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
