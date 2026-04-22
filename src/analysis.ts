import type { AggregatedInsights, PersonaReaction, RunPersona } from "./domain/types.js";

export function aggregateInsights(personas: RunPersona[], responses: PersonaReaction[]): AggregatedInsights {
  const successful = responses.filter((response) => !response.error);
  const personaById = new Map(personas.map((persona) => [persona.seed.id, persona]));

  return {
    totalResponses: responses.length,
    successfulResponses: successful.length,
    failedResponses: responses.length - successful.length,
    averageReactionScore: average(successful.map((response) => response.reactionScore)),
    averageInterestLevel: average(successful.map((response) => response.interestLevel)),
    averageClarityLevel: average(successful.map((response) => response.clarityLevel)),
    averageTrustLevel: average(successful.map((response) => response.trustLevel)),
    topPositives: topBuckets(successful.map((response) => response.mainPositive)),
    topConcerns: topBuckets(successful.map((response) => response.mainConcern)),
    ageBandBreakdown: breakdownBy(successful, personaById, (persona) => persona.seed.ageBand),
    domainBreakdown: breakdownBy(successful, personaById, (persona) => persona.seed.domain),
    strongestSupporters: successful
      .slice()
      .sort((left, right) => right.reactionScore - left.reactionScore)
      .slice(0, 5)
      .map((response) => ({
        personaId: response.personaId,
        summary: personaById.get(response.personaId)?.personaPromptSummary ?? response.shortReaction,
        score: response.reactionScore,
      })),
    strongestSkeptics: successful
      .slice()
      .sort((left, right) => left.reactionScore - right.reactionScore)
      .slice(0, 5)
      .map((response) => ({
        personaId: response.personaId,
        summary: personaById.get(response.personaId)?.personaPromptSummary ?? response.shortReaction,
        score: response.reactionScore,
      })),
  };
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

function topBuckets(values: string[]) {
  const buckets = new Map<string, number>();

  for (const value of values) {
    const normalized = normalizeBucketLabel(value);
    buckets.set(normalized, (buckets.get(normalized) ?? 0) + 1);
  }

  return [...buckets.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
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
    if (!persona) {
      continue;
    }

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
    .sort((left, right) => right.count - left.count || right.averageReactionScore - left.averageReactionScore)
    .slice(0, 10);
}

function normalizeBucketLabel(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}
