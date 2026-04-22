import { z } from "zod";

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
