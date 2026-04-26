import { describe, expect, it } from "vitest";

import { aggregateInsights } from "../src/analysis.js";
import type { PersonaReaction, RunPersona } from "../src/domain/types.js";

const personas: RunPersona[] = [
  {
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
      summary: "Test persona",
      tags: ["consumer_tech"],
    },
    overlay: {
      tone: "neutral",
      noveltyAppetite: 60,
      budgetSensitivity: 55,
      clarityTolerance: 45,
      speedPreference: 70,
    },
    personaPromptSummary: "Adult productivity manager.",
    reactionStyleInstruction: "Deliver `shortReaction` in a measured, thoughtful style with clear wording and no slang.",
    reactionOpeningExamples: ["Honestly,", "Feels promising, but", "Here's where I hesitate:"],
  },
  {
    seed: {
      id: "persona-002",
      name: "Jordan",
      ageBand: "young_adult",
      sex: "male",
      industry: "education",
      domain: "learning",
      roleFamily: "student",
      regionGroup: "europe",
      techFamiliarity: "medium",
      spendingStyle: "frugal",
      decisionStyle: "social_proof",
      skepticismLevel: "low",
      toneBaseline: "curious",
      archetype: "early adopter",
      lifeStage: "student",
      summary: "Test persona",
      tags: ["education"],
    },
    overlay: {
      tone: "enthusiastic",
      noveltyAppetite: 80,
      budgetSensitivity: 65,
      clarityTolerance: 55,
      speedPreference: 85,
    },
    personaPromptSummary: "Young adult learning student.",
    reactionStyleInstruction: "Deliver `shortReaction` in a casual spoken style. Natural interjections like 'yeah', 'nah', or 'haha' are allowed if they fit organically.",
    reactionOpeningExamples: ["Yo,", "Haha,", "Sounds useful, but"],
  },
];

const responses: PersonaReaction[] = [
  {
    personaId: "persona-001",
    provider: "codex",
    reactionScore: 72,
    interestLevel: 75,
    clarityLevel: 70,
    trustLevel: 68,
    audienceFit: "high",
    wouldTry: true,
    wouldShare: false,
    wouldPay: true,
    mainPositive: "clear time savings",
    mainConcern: "needs stronger proof",
    shortReaction: "This seems practical if the workflow is reliable.",
    tags: ["productivity"],
    durationMs: 1200,
  },
  {
    personaId: "persona-002",
    provider: "codex",
    reactionScore: 38,
    interestLevel: 44,
    clarityLevel: 50,
    trustLevel: 36,
    audienceFit: "mixed",
    wouldTry: false,
    wouldShare: false,
    wouldPay: false,
    mainPositive: "interesting concept",
    mainConcern: "needs stronger proof",
    shortReaction: "I get the idea but I am not convinced yet.",
    tags: ["learning"],
    durationMs: 900,
  },
];

describe("aggregateInsights", () => {
  it("summarizes recurring positives and concerns", () => {
    const insights = aggregateInsights(personas, responses);

    expect(insights.successfulResponses).toBe(2);
    expect(insights.topConcerns[0]).toEqual({
      label: "needs stronger proof",
      count: 2,
    });
    expect(insights.strongestSupporters[0]?.personaId).toBe("persona-001");
    expect(insights.strongestSkeptics[0]?.personaId).toBe("persona-002");
  });
});
