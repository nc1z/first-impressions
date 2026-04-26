/**
 * Shared persona generation engine.
 * Each persona set (general, tech-general, etc.) calls generateCatalog()
 * with its own params, domains, role families, and output path.
 */

import { writeFileSync } from "node:fs";

import { createRandomSource } from "../src/utils/random.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PersonaSeed {
  id: string;
  name: string;
  ageBand: string;
  sex: string;
  industry: string;
  domain: string;
  roleFamily: string;
  regionGroup: string;
  techFamiliarity: string;
  spendingStyle: string;
  decisionStyle: string;
  skepticismLevel: string;
  toneBaseline: string;
  archetype: string;
  lifeStage: string;
  summary: string;
  tags: string[];
}

export interface PersonaSetParams {
  count: number;
  ageBand: Record<string, number>;
  lifeStageByAgeBand: Record<string, Record<string, number>>;
  industry: Record<string, number>;
  regionGroup: Record<string, number>;
  sex: Record<string, number>;
  techFamiliarity: Record<string, number>;
  spendingStyle: Record<string, number>;
  decisionStyle: Record<string, number>;
  skepticismLevel: Record<string, number>;
  toneBaseline: Record<string, number>;
  archetype: Record<string, number>;
}

export interface CatalogConfig {
  params: PersonaSetParams;
  /** Domain options per industry key. */
  domains: Record<string, string[]>;
  /**
   * Role families for personas.
   * Pass a Record<industry, string[]> to pick per industry (general-style).
   * Pass a string[] for a global pool used regardless of industry (tech-style).
   */
  roleFamilies: Record<string, string[]> | string[];
  /** Seed for deterministic output. Change to reshuffle. */
  seed: number;
  /** Absolute path where the JSON file will be written. */
  outputPath: string;
}

// ─── Weighted pick ────────────────────────────────────────────────────────────

export function weightedPick(
  weights: Record<string, number>,
  rng: ReturnType<typeof createRandomSource>,
): string {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = rng.next() * total;
  for (const [key, weight] of entries) {
    r -= weight;
    if (r <= 0) return key;
  }
  return entries.at(-1)![0];
}

// ─── Name pools ───────────────────────────────────────────────────────────────

export const NAMES: Record<string, Record<string, string[]>> = {
  north_america: {
    female: ["Alex", "Jordan", "Taylor", "Morgan", "Riley", "Avery", "Zoe", "Mia", "Emma", "Leah", "Maya", "Sofia", "Naomi", "Chloe", "Lily", "Ella", "Grace", "Nadia"],
    male: ["Ethan", "Ryan", "Noah", "Liam", "Owen", "Miles", "Mason", "Dylan", "Cole", "Caleb", "Jake", "Tyler", "Hunter", "Marcus", "Jaylen", "Derek", "Sean", "Aaron"],
    unspecified: ["Casey", "Jamie", "Drew", "Sam", "Blake", "Reese", "Skyler", "Finley", "Parker", "Dakota"],
  },
  europe: {
    female: ["Amélie", "Fleur", "Astrid", "Giulia", "Margot", "Pilar", "Katja", "Petra", "Ingrid", "Brigitte", "Annika", "Siobhan", "Miriam", "Elsa", "Helena", "Liesel"],
    male: ["Luca", "Klaus", "Pieter", "Hendrik", "François", "Antoine", "Sven", "Pablo", "Eoin", "Lars", "Viktor", "Tomász", "Bjorn", "Matthias", "Ciarán", "Adriaan"],
    unspecified: ["Robin", "Kai", "Sam", "Alex", "Jo"],
  },
  asia_pacific: {
    female: ["Mei", "Yuki", "Hana", "Sakura", "Thuy", "Anh", "Linh", "Priya", "Ananya", "Ji-Yeon", "Soo-Yeon", "Yuna", "Rin", "Divya", "Parvati", "Ning", "Suki"],
    male: ["Kenji", "Hiroshi", "Ryo", "Takeshi", "Jin-Ho", "Seo-Jun", "Wei", "Raj", "Vikram", "Arjun", "Roshan", "Thành", "Bao", "Chandra", "Karan", "Daisuke", "Mingyu"],
    unspecified: ["Kim", "Le", "Anh", "Bao", "Wei"],
  },
  latin_america: {
    female: ["Valentina", "Camila", "Mariana", "Daniela", "Isabela", "Gabriela", "Lucía", "Renata", "Sofía", "Natalia", "Paloma", "Andrea", "Fernanda", "Catalina"],
    male: ["Carlos", "Rodrigo", "Santiago", "Felipe", "Sebastián", "Andrés", "Tomás", "Emilio", "Rafael", "Nicolás", "Javier", "Diego", "Mateo", "Alejandro"],
    unspecified: ["Alex", "Camilo", "Noa", "Sage", "Río"],
  },
  africa_middle_east: {
    female: ["Amara", "Fatima", "Zainab", "Nia", "Nkechi", "Adaeze", "Dalia", "Aisha", "Layla", "Amira", "Nadia", "Yasmin", "Chisom"],
    male: ["Kwame", "Hassan", "Kofi", "Ibrahim", "Mustafa", "Chidi", "Khalid", "Emeka", "Abebe", "Olumide", "Tariq", "Omar", "Yemi", "Riad"],
    unspecified: ["Nour", "Sade", "Zara", "Kemi", "Amani"],
  },
};

// ─── Life stage labels ────────────────────────────────────────────────────────

export const LIFE_STAGE_LABELS: Record<string, string> = {
  secondary_student: "high school student",
  college_bound: "college student",
  student: "student",
  first_job: "new professional",
  early_career: "early-career professional",
  young_parent: "young parent",
  career_building: "career builder",
  independent_professional: "independent professional",
  household_manager: "household manager",
  parent: "parent",
  mid_career: "mid-career professional",
  team_lead: "team lead",
  small_business_owner: "small business owner",
  caregiver: "caregiver",
  consulting: "consultant",
  community_volunteer: "community volunteer",
  grandparent: "grandparent",
  retired: "retiree",
};

// ─── Tag derivation ───────────────────────────────────────────────────────────

export function deriveTags(p: Omit<PersonaSeed, "id" | "summary" | "tags">): string[] {
  const tags = new Set<string>();

  tags.add(p.ageBand);

  if (["student", "secondary_student", "college_bound"].includes(p.lifeStage)) tags.add("student");
  if (["parent", "young_parent"].includes(p.lifeStage)) tags.add("parent");
  if (p.lifeStage === "retired") tags.add("retiree");
  if (p.lifeStage === "caregiver") tags.add("caregiver");
  if (p.lifeStage === "small_business_owner") tags.add("entrepreneur");
  if (["team_lead", "consulting", "mid_career"].includes(p.lifeStage)) tags.add("manager");

  if (p.techFamiliarity === "high") tags.add("tech_savvy");
  if (p.techFamiliarity === "low") tags.add("tech_averse");

  if (p.spendingStyle === "frugal") tags.add("budget_conscious");

  if (p.archetype === "early_adopter") tags.add("early_adopter");
  if (p.archetype === "late_majority_pragmatist") tags.add("late_adopter");
  if (p.archetype === "family_centered_decision_maker") tags.add("family_first");
  if (p.archetype === "career_climber") tags.add("career_driven");

  if (["fitness", "sports", "outdoor"].includes(p.domain)) tags.add("fitness");
  if (["wellness", "mental_health"].includes(p.domain)) tags.add("wellness");
  if (["restaurants", "food_delivery", "food_beverage", "food_production"].includes(p.domain)) tags.add("foodie");
  if (p.domain === "travel") tags.add("traveler");
  if (p.domain === "gaming") tags.add("gamer");
  if (["fashion", "beauty"].includes(p.domain)) tags.add("fashion");
  if (p.domain === "social_media") tags.add("social");
  if (["community", "civic_tech", "advocacy", "volunteering"].includes(p.domain)) tags.add("community");

  if (p.industry === "environment_cleantech") tags.add("environmentally_conscious");
  if (["healthcare", "life_sciences", "sports_recreation"].includes(p.industry)) tags.add("health_conscious");
  if (p.industry === "nonprofit_social") tags.add("community");

  return [...tags];
}

// ─── Summary ──────────────────────────────────────────────────────────────────

export function buildSummary(p: Omit<PersonaSeed, "id" | "summary" | "tags">): string {
  const role = LIFE_STAGE_LABELS[p.lifeStage] ?? p.lifeStage.replace(/_/g, " ");
  const industry = p.industry.replace(/_/g, " ");
  const archetype = p.archetype.replace(/_/g, " ");
  return `${p.name} is a ${role} in ${industry} — ${archetype} with a ${p.toneBaseline} baseline, ${p.decisionStyle.replace(/_/g, " ")} decisions, and ${p.techFamiliarity} tech familiarity.`;
}

// ─── Core generator ───────────────────────────────────────────────────────────

export function generateCatalog(config: CatalogConfig): void {
  const { params, domains, roleFamilies, seed, outputPath } = config;
  const rng = createRandomSource(seed);
  const personas: PersonaSeed[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < params.count; i++) {
    const ageBand = weightedPick(params.ageBand, rng);
    const lifeStage = weightedPick(params.lifeStageByAgeBand[ageBand] ?? {}, rng);
    const industry = weightedPick(params.industry, rng);
    const regionGroup = weightedPick(params.regionGroup, rng);
    const sex = weightedPick(params.sex, rng);
    const techFamiliarity = weightedPick(params.techFamiliarity, rng);
    const spendingStyle = weightedPick(params.spendingStyle, rng);
    const decisionStyle = weightedPick(params.decisionStyle, rng);
    const skepticismLevel = weightedPick(params.skepticismLevel, rng);
    const toneBaseline = weightedPick(params.toneBaseline, rng);
    const archetype = weightedPick(params.archetype, rng);
    const domain = rng.pick(domains[industry] ?? ["general"]);

    const roleFamilyPool = Array.isArray(roleFamilies)
      ? roleFamilies
      : (roleFamilies[industry] ?? ["professional"]);
    const roleFamily = rng.pick(roleFamilyPool);

    const namePool = NAMES[regionGroup]?.[sex] ?? NAMES[regionGroup]?.["unspecified"] ?? ["Person"];
    const available = namePool.filter((n) => !usedNames.has(n));
    const name = rng.pick(available.length > 0 ? available : namePool);
    usedNames.add(name);

    const partial = { name, ageBand, sex, industry, domain, roleFamily, regionGroup, techFamiliarity, spendingStyle, decisionStyle, skepticismLevel, toneBaseline, archetype, lifeStage };

    personas.push({
      id: `persona-${String(i + 1).padStart(3, "0")}`,
      ...partial,
      summary: buildSummary(partial),
      tags: deriveTags(partial),
    });
  }

  writeFileSync(outputPath, JSON.stringify(personas, null, 2) + "\n", "utf8");
  console.log(`Generated ${personas.length} personas → ${outputPath}`);
}
