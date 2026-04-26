export type ProviderName = "codex" | "claude" | "copilot";

export type InputKind = "text" | "file" | "url";

export type RunMode = "general" | "tagged-segment";

export type PersonaSetId = "general" | "tech-general";

export type AgeBand = "teen" | "young_adult" | "adult" | "midlife" | "senior";

export type Sex = "female" | "male" | "unspecified";

export interface IdeaInput {
  kind: InputKind;
  value: string;
  label: string;
}

export interface IdeaBrief {
  title: string;
  oneLineSummary: string;
  targetUser: string;
  problemSolved: string;
  proposedValue: string;
  assumptions: string[];
  concerns: string[];
  sourceKind: InputKind;
  sourceLabel: string;
}

export interface PersonaSeed {
  id: string;
  name: string;
  ageBand: AgeBand;
  sex: Sex;
  industry: string;
  domain: string;
  roleFamily: string;
  regionGroup: string;
  techFamiliarity: "low" | "medium" | "high";
  spendingStyle: "frugal" | "balanced" | "premium_sensitive";
  decisionStyle: "intuitive" | "deliberate" | "social_proof" | "risk_averse";
  skepticismLevel: "low" | "medium" | "high";
  toneBaseline: "warm" | "blunt" | "curious" | "skeptical" | "optimistic" | "practical";
  archetype: string;
  lifeStage: string;
  summary: string;
  tags: string[];
}

export interface PersonaOverlay {
  tone: "supportive" | "neutral" | "skeptical" | "enthusiastic" | "measured";
  noveltyAppetite: number;
  budgetSensitivity: number;
  clarityTolerance: number;
  speedPreference: number;
}

export interface RunPersona {
  seed: PersonaSeed;
  overlay: PersonaOverlay;
  personaPromptSummary: string;
}

export interface PersonaReaction {
  personaId: string;
  provider: ProviderName;
  reactionScore: number;
  interestLevel: number;
  clarityLevel: number;
  trustLevel: number;
  audienceFit: "low" | "mixed" | "high";
  wouldTry: boolean;
  wouldShare: boolean;
  wouldPay: boolean;
  mainPositive: string;
  mainConcern: string;
  shortReaction: string;
  tags: string[];
  durationMs: number;
  error?: string;
}

export interface InsightBucket {
  label: string;
  count: number;
}

export interface FeaturedQuote {
  personaId: string;
  name: string;
  ageBand: string;
  domain: string;
  description: string;
  score: number;
  quote: string;
  sentiment: "positive" | "neutral" | "negative";
}

export interface AggregatedInsights {
  totalResponses: number;
  successfulResponses: number;
  failedResponses: number;
  averageReactionScore: number;
  averageInterestLevel: number;
  averageClarityLevel: number;
  averageTrustLevel: number;
  wouldTryPercent: number;
  wouldSharePercent: number;
  wouldPayPercent: number;
  audienceFitBreakdown: { low: number; mixed: number; high: number };
  topPositives: InsightBucket[];
  topConcerns: InsightBucket[];
  ageBandBreakdown: Array<InsightBucket & { averageReactionScore: number }>;
  domainBreakdown: Array<InsightBucket & { averageReactionScore: number }>;
  strongestSupporters: Array<{ personaId: string; summary: string; score: number }>;
  strongestSkeptics: Array<{ personaId: string; summary: string; score: number }>;
  featuredQuotes: FeaturedQuote[];
}

export interface RunManifest {
  runId: string;
  provider: ProviderName;
  personaSet: PersonaSetId;
  mode: RunMode;
  count: number;
  concurrency: number;
  seed: number;
  createdAt: string;
  source: IdeaInput;
  reportPath: string;
}

export interface RunArtifacts {
  manifest: RunManifest;
  brief: IdeaBrief;
  personas: RunPersona[];
  responses: PersonaReaction[];
  insights: AggregatedInsights;
}
