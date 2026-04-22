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

const lifeStageLabels: Record<string, string> = {
  career_building: "career builder",
  caregiver: "caregiver",
  college_bound: "college student",
  community_volunteer: "community volunteer",
  consulting: "consultant",
  early_career: "early-career professional",
  first_job: "new professional",
  grandparent: "grandparent",
  household_manager: "household manager",
  independent_professional: "independent professional",
  mid_career: "mid-career professional",
  parent: "parent",
  retired: "retiree",
  secondary_student: "high school student",
  small_business_owner: "small business owner",
  student: "student",
  team_lead: "team lead",
  young_parent: "young parent",
};

const industryLabels: Record<string, string> = {
  consumer_tech: "consumer tech",
  creator_economy: "the creator economy",
  education: "education",
  finance: "finance",
  healthcare: "healthcare",
  hospitality: "hospitality",
  logistics: "logistics",
  manufacturing: "manufacturing",
  media: "media",
  professional_services: "professional services",
  public_sector: "the public sector",
  retail: "retail",
};

/** Returns a short natural-language description of who the persona is, e.g. "small business owner in healthcare" */
export function describePersona(seed: PersonaSeed): string {
  const role = lifeStageLabels[seed.lifeStage] ?? seed.lifeStage.replace(/_/g, " ");
  const industry = industryLabels[seed.industry] ?? seed.industry.replace(/_/g, " ");
  return `${role} in ${industry}`;
}

export async function loadPersonaCatalog(): Promise<PersonaSeed[]> {
  return readJsonDirectory<PersonaSeed>(personaCatalogPath);
}

export async function selectRunPersonas(options: {
  count: number;
  mode: RunMode;
  seed: number;
  audienceDescription?: string;
}): Promise<RunPersona[]> {
  const catalog = await loadPersonaCatalog();

  const pool =
    options.audienceDescription
      ? filterPersonaCatalog(catalog, options.audienceDescription)
      : catalog;

  if (pool.length === 0) {
    throw new Error("No personas matched the audience description. Try broader terms.");
  }

  const count = Math.min(options.count, pool.length);

  const random = createRandomSource(options.seed);
  const selection =
    options.mode === "general"
      ? selectGeneralAudienceCatalog(pool, count, random)
      : random.shuffle(pool).slice(0, count);

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

// Maps common plain-language terms to persona field values for richer matching.
const audienceSynonyms: Record<string, string[]> = {
  tech: ["consumer_tech", "technology", "software", "high"],
  startup: ["small_business_owner", "early_career", "career_building"],
  founder: ["small_business_owner", "independent_professional"],
  entrepreneur: ["small_business_owner", "independent_professional"],
  young: ["teen", "young_adult"],
  senior: ["senior", "retired", "grandparent"],
  older: ["midlife", "senior"],
  student: ["student", "secondary_student", "college_bound"],
  professional: ["professional_services", "mid_career", "team_lead", "consulting"],
  manager: ["team_lead", "mid_career"],
  health: ["healthcare", "wellness", "caregiver"],
  medical: ["healthcare"],
  finance: ["finance"],
  money: ["finance", "frugal", "balanced"],
  food: ["food", "hospitality"],
  creative: ["creator", "creator_economy", "media"],
  parent: ["parent", "young_parent", "caregiver"],
  retired: ["retired", "grandparent"],
  low: ["low"],
  medium: ["medium"],
  high: ["high"],
};

function filterPersonaCatalog(catalog: PersonaSeed[], description: string): PersonaSeed[] {
  const lower = description.toLowerCase();

  // Expand description with synonyms
  const expandedTerms = new Set<string>();
  for (const word of lower.split(/\W+/).filter((w) => w.length > 2)) {
    expandedTerms.add(word);
    for (const [key, values] of Object.entries(audienceSynonyms)) {
      if (key === word || word.startsWith(key)) {
        values.forEach((v) => expandedTerms.add(v.replace(/_/g, " ")));
      }
    }
  }

  const scored = catalog.map((persona) => {
    const searchable = [
      persona.industry,
      persona.domain,
      persona.roleFamily,
      persona.lifeStage,
      persona.ageBand,
      persona.techFamiliarity,
      persona.spendingStyle,
      persona.archetype,
      persona.summary,
      ...persona.tags,
    ]
      .join(" ")
      .toLowerCase()
      .replace(/_/g, " ");

    let score = 0;
    for (const term of expandedTerms) {
      if (searchable.includes(term)) score++;
    }

    return { persona, score };
  });

  const maxScore = Math.max(...scored.map((s) => s.score));
  if (maxScore === 0) return catalog; // No match at all — fall back to full catalog

  // Keep personas that score at least half the max score
  const threshold = Math.max(1, Math.floor(maxScore * 0.5));
  return scored.filter((s) => s.score >= threshold).map((s) => s.persona);
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
