import { z } from "zod";

export const personaSeedSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  ageBand: z.enum(["teen", "young_adult", "adult", "midlife", "senior"]),
  sex: z.enum(["female", "male", "unspecified"]).default("unspecified"),
  industry: z.string().min(1),
  domain: z.string().min(1),
  roleFamily: z.string().min(1),
  regionGroup: z.enum(["north_america", "europe", "asia_pacific", "latin_america", "africa_middle_east"]).default("north_america"),
  techFamiliarity: z.enum(["low", "medium", "high"]),
  spendingStyle: z.enum(["frugal", "balanced", "premium_sensitive"]),
  decisionStyle: z.enum(["intuitive", "deliberate", "social_proof", "risk_averse"]),
  skepticismLevel: z.enum(["low", "medium", "high"]),
  toneBaseline: z.enum(["warm", "blunt", "curious", "skeptical", "optimistic", "practical"]),
  archetype: z.string().min(1),
  lifeStage: z.string().min(1),
  summary: z.string().min(1),
  tags: z.array(z.string()).default([]),
});

export const ideaBriefSchema = z.object({
  title: z.string().min(1),
  oneLineSummary: z.string().min(1),
  targetUser: z.string().min(1),
  problemSolved: z.string().min(1),
  proposedValue: z.string().min(1),
  assumptions: z.array(z.string()),
  concerns: z.array(z.string()),
});

export const personaReactionSchema = z.object({
  reactionScore: z.number().min(0).max(100),
  interestLevel: z.number().min(0).max(100),
  clarityLevel: z.number().min(0).max(100),
  trustLevel: z.number().min(0).max(100),
  audienceFit: z.enum(["low", "mixed", "high"]),
  wouldTry: z.boolean(),
  wouldShare: z.boolean(),
  wouldPay: z.boolean(),
  mainPositive: z.string().min(1),
  mainConcern: z.string().min(1),
  shortReaction: z.string().min(1),
  tags: z.array(z.string()).default([]),
});
