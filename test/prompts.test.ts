import { describe, expect, it } from "vitest";

import type { IdeaBrief, RunPersona } from "../src/domain/types.js";
import { buildPersonaEvaluationPrompt } from "../src/prompts.js";

const brief: IdeaBrief = {
  title: "FocusFlow",
  oneLineSummary: "An app that turns long tasks into guided 20-minute sprints.",
  targetUser: "Busy knowledge workers who struggle to start deep work.",
  problemSolved: "People procrastinate on cognitively heavy work.",
  proposedValue: "Structured momentum with low-friction task starts.",
  assumptions: ["Users want lightweight structure instead of a full project suite."],
  concerns: ["May feel too similar to existing timer apps."],
  sourceKind: "text",
  sourceLabel: "inline",
};

const persona: RunPersona = {
  seed: {
    id: "persona-001",
    name: "Alex",
    ageBand: "adult",
    sex: "female",
    industry: "consumer_tech",
    domain: "productivity",
    roleFamily: "manager",
    regionGroup: "north_america",
    techFamiliarity: "high",
    spendingStyle: "balanced",
    decisionStyle: "deliberate",
    skepticismLevel: "medium",
    toneBaseline: "practical",
    archetype: "efficiency seeker",
    lifeStage: "career_building",
    summary: "Often tests new productivity tools but drops them if setup is annoying.",
    tags: ["productivity"],
  },
  overlay: {
    tone: "measured",
    noveltyAppetite: 58,
    budgetSensitivity: 49,
    clarityTolerance: 42,
    speedPreference: 71,
  },
  personaPromptSummary: "Adult productivity manager with a measured tone.",
  reactionStyleInstruction: "Deliver `shortReaction` in a polished, articulate style with complete sentences and no slang.",
  reactionOpeningExamples: ["Honestly,", "Feels promising, but", "Wow,"],
};

describe("buildPersonaEvaluationPrompt", () => {
  it("injects the persona-specific reaction style instruction", () => {
    const prompt = buildPersonaEvaluationPrompt(brief, persona);

    expect(prompt).toContain(persona.reactionStyleInstruction);
    expect(prompt).toContain("Examples of how `shortReaction` can start for this persona:");
    expect(prompt).toContain('"Honestly,"');
    expect(prompt).toContain("These are examples, not a required template.");
  });
});
