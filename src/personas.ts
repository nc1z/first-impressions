import path from "node:path";

import type { AgeBand, PersonaOverlay, PersonaSeed, RunMode, RunPersona } from "./domain/types.js";
import { readJsonDirectory } from "./utils/fs.js";
import { createRandomSource } from "./utils/random.js";

const personaCatalogPath = path.resolve(process.cwd(), "personas", "catalog");

const generalAgeDistribution: Record<AgeBand, number> = {
  teen: 5,
  young_adult: 28,
  adult: 42,
  midlife: 18,
  senior: 7,
};

export async function loadPersonaCatalog(): Promise<PersonaSeed[]> {
  return readJsonDirectory<PersonaSeed>(personaCatalogPath);
}

export async function selectRunPersonas(options: {
  count: number;
  mode: RunMode;
  seed: number;
}): Promise<RunPersona[]> {
  const catalog = await loadPersonaCatalog();
  if (options.count > catalog.length) {
    throw new Error(`Requested ${options.count} personas but only ${catalog.length} are available.`);
  }

  const random = createRandomSource(options.seed);
  const selection =
    options.mode === "general"
      ? selectGeneralAudienceCatalog(catalog, options.count, random)
      : random.shuffle(catalog).slice(0, options.count);

  return selection.map((seed) => {
    const overlay = createPersonaOverlay(random);

    return {
      seed,
      overlay,
      personaPromptSummary: createPersonaPromptSummary(seed, overlay),
    };
  });
}

function selectGeneralAudienceCatalog(
  catalog: PersonaSeed[],
  count: number,
  random: ReturnType<typeof createRandomSource>,
): PersonaSeed[] {
  const selectedIds = new Set<string>();
  const grouped = groupByAgeBand(catalog);
  const picks: PersonaSeed[] = [];
  const targetCounts = computeTargetCounts(count);

  for (const [ageBand, ageCount] of Object.entries(targetCounts) as Array<[AgeBand, number]>) {
    const candidates = random.shuffle(grouped[ageBand]);
    const limit = Math.min(ageCount, candidates.length);

    for (let index = 0; index < limit; index += 1) {
      const candidate = candidates[index] as PersonaSeed;
      selectedIds.add(candidate.id);
      picks.push(candidate);
    }
  }

  if (picks.length < count) {
    const remainder = random
      .shuffle(catalog.filter((candidate) => !selectedIds.has(candidate.id)))
      .slice(0, count - picks.length);
    picks.push(...remainder);
  }

  return random.shuffle(picks);
}

function groupByAgeBand(catalog: PersonaSeed[]): Record<AgeBand, PersonaSeed[]> {
  return {
    teen: catalog.filter((persona) => persona.ageBand === "teen"),
    young_adult: catalog.filter((persona) => persona.ageBand === "young_adult"),
    adult: catalog.filter((persona) => persona.ageBand === "adult"),
    midlife: catalog.filter((persona) => persona.ageBand === "midlife"),
    senior: catalog.filter((persona) => persona.ageBand === "senior"),
  };
}

function computeTargetCounts(count: number): Record<AgeBand, number> {
  const exactCounts = Object.entries(generalAgeDistribution).map(([ageBand, ratio]) => ({
    ageBand: ageBand as AgeBand,
    base: Math.floor((count * ratio) / 100),
    remainder: (count * ratio) / 100 - Math.floor((count * ratio) / 100),
  }));

  let allocated = exactCounts.reduce((sum, entry) => sum + entry.base, 0);

  exactCounts
    .sort((left, right) => right.remainder - left.remainder)
    .forEach((entry) => {
      if (allocated < count) {
        entry.base += 1;
        allocated += 1;
      }
    });

  return Object.fromEntries(
    exactCounts.map((entry) => [entry.ageBand, entry.base]),
  ) as Record<AgeBand, number>;
}

function createPersonaOverlay(random: ReturnType<typeof createRandomSource>): PersonaOverlay {
  return {
    tone: random.pick(["supportive", "neutral", "skeptical", "enthusiastic", "measured"]),
    noveltyAppetite: random.integer(25, 95),
    budgetSensitivity: random.integer(20, 95),
    clarityTolerance: random.integer(20, 95),
    speedPreference: random.integer(20, 95),
  };
}

function createPersonaPromptSummary(seed: PersonaSeed, overlay: PersonaOverlay): string {
  return [
    `${seed.name} is a ${seed.ageBand.replace("_", " ")} ${seed.roleFamily.replace("_", " ")} in ${seed.industry.replace("_", " ")}.`,
    `Baseline disposition: ${seed.toneBaseline}, ${seed.decisionStyle.replace("_", " ")} decisions, ${seed.skepticismLevel} skepticism.`,
    `Overlay: ${overlay.tone} tone, novelty appetite ${overlay.noveltyAppetite}/100, budget sensitivity ${overlay.budgetSensitivity}/100, clarity tolerance ${overlay.clarityTolerance}/100, speed preference ${overlay.speedPreference}/100.`,
    `Context: ${seed.summary}`,
  ].join(" ");
}
