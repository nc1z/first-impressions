import type { AggregatedInsights, FeaturedQuote, PersonaReaction, RunPersona } from "./domain/types.js";

export function aggregateInsights(personas: RunPersona[], responses: PersonaReaction[]): AggregatedInsights {
  const successful = responses.filter((response) => !response.error);
  const personaById = new Map(personas.map((persona) => [persona.seed.id, persona]));
  const n = successful.length || 1;

  const averageReactionScore = average(successful.map((r) => r.reactionScore));

  const sortedByScore = successful.slice().sort((a, b) => b.reactionScore - a.reactionScore);
  const bestResponse = sortedByScore[0] ?? null;
  const worstResponse = sortedByScore.length > 1 ? sortedByScore[sortedByScore.length - 1] : null;
  const midResponse =
    successful
      .filter((r) => r !== bestResponse && r !== worstResponse)
      .sort((a, b) => Math.abs(a.reactionScore - averageReactionScore) - Math.abs(b.reactionScore - averageReactionScore))[0] ?? null;

  const seenIds = new Set<string>();
  const featuredQuotes: FeaturedQuote[] = [bestResponse, midResponse, worstResponse]
    .filter((r): r is PersonaReaction => r !== null)
    .filter((r) => {
      if (seenIds.has(r.personaId)) return false;
      seenIds.add(r.personaId);
      return true;
    })
    .map((r) => {
      const persona = personaById.get(r.personaId);
      const sentiment: FeaturedQuote["sentiment"] =
        r.reactionScore >= 65 ? "positive" : r.reactionScore >= 40 ? "neutral" : "negative";
      return {
        personaId: r.personaId,
        name: persona?.seed.name ?? r.personaId,
        ageBand: persona?.seed.ageBand ?? "",
        domain: persona?.seed.domain ?? "",
        score: r.reactionScore,
        quote: r.shortReaction,
        sentiment,
      };
    });

  const fitCounts = { low: 0, mixed: 0, high: 0 };
  for (const r of successful) {
    fitCounts[r.audienceFit] += 1;
  }

  return {
    totalResponses: responses.length,
    successfulResponses: successful.length,
    failedResponses: responses.length - successful.length,
    averageReactionScore,
    averageInterestLevel: average(successful.map((r) => r.interestLevel)),
    averageClarityLevel: average(successful.map((r) => r.clarityLevel)),
    averageTrustLevel: average(successful.map((r) => r.trustLevel)),
    wouldTryPercent: pct(successful.filter((r) => r.wouldTry).length, n),
    wouldSharePercent: pct(successful.filter((r) => r.wouldShare).length, n),
    wouldPayPercent: pct(successful.filter((r) => r.wouldPay).length, n),
    audienceFitBreakdown: fitCounts,
    topPositives: topBuckets(successful.map((r) => r.mainPositive)),
    topConcerns: topBuckets(successful.map((r) => r.mainConcern)),
    ageBandBreakdown: breakdownBy(successful, personaById, (persona) => persona.seed.ageBand),
    domainBreakdown: breakdownBy(successful, personaById, (persona) => persona.seed.domain),
    strongestSupporters: sortedByScore.slice(0, 5).map((r) => ({
      personaId: r.personaId,
      summary: personaById.get(r.personaId)?.personaPromptSummary ?? r.shortReaction,
      score: r.reactionScore,
    })),
    strongestSkeptics: sortedByScore
      .slice()
      .reverse()
      .slice(0, 5)
      .map((r) => ({
        personaId: r.personaId,
        summary: personaById.get(r.personaId)?.personaPromptSummary ?? r.shortReaction,
        score: r.reactionScore,
      })),
    featuredQuotes,
  };
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Number((values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(2));
}

function pct(count: number, total: number): number {
  return Number(((count / total) * 100).toFixed(1));
}

function topBuckets(values: string[]) {
  const buckets = new Map<string, number>();
  for (const value of values) {
    const key = normalizeBucketLabel(value);
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return [...buckets.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([label, count]) => ({ label, count }));
}

function breakdownBy(
  responses: PersonaReaction[],
  personaById: Map<string, RunPersona>,
  keySelector: (persona: RunPersona) => string,
) {
  const buckets = new Map<string, { count: number; totalScore: number }>();
  for (const response of responses) {
    const persona = personaById.get(response.personaId);
    if (!persona) continue;
    const key = keySelector(persona);
    const existing = buckets.get(key) ?? { count: 0, totalScore: 0 };
    existing.count += 1;
    existing.totalScore += response.reactionScore;
    buckets.set(key, existing);
  }
  return [...buckets.entries()]
    .map(([label, bucket]) => ({
      label,
      count: bucket.count,
      averageReactionScore: Number((bucket.totalScore / bucket.count).toFixed(2)),
    }))
    .sort((a, b) => b.count - a.count || b.averageReactionScore - a.averageReactionScore)
    .slice(0, 10);
}

function normalizeBucketLabel(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}
