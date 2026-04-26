/**
 * Generates personas/general.json from params.general.ts.
 * Run with: pnpm generate
 */

import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createRandomSource } from "../src/utils/random.js";
import { params } from "./params.general.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Types ───────────────────────────────────────────────────────────────────

interface PersonaSeed {
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

// ─── Weighted pick ────────────────────────────────────────────────────────────

function weightedPick(
  weights: Readonly<Record<string, number>>,
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

const NAMES: Record<string, Record<string, string[]>> = {
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

// ─── Domain pools per industry ────────────────────────────────────────────────

const DOMAINS: Record<string, string[]> = {
  technology: ["software", "gaming", "productivity", "ai", "hardware", "developer_tools", "cybersecurity"],
  finance: ["banking", "investing", "fintech", "personal_finance", "trading"],
  healthcare: ["clinical", "wellness", "mental_health", "fitness", "health_tech"],
  education: ["k12", "higher_ed", "e_learning", "tutoring", "career_development"],
  media_entertainment: ["film", "music", "gaming", "social_media", "content_creation", "podcasting"],
  retail_consumer_goods: ["fashion", "beauty", "home_goods", "food_beverage", "electronics"],
  food_hospitality: ["restaurants", "travel", "events", "food_delivery"],
  professional_services: ["consulting", "marketing", "hr", "accounting"],
  manufacturing_industry: ["production", "supply_chain", "industrial", "quality"],
  transportation_logistics: ["shipping", "mobility", "delivery", "fleet"],
  energy_utilities: ["renewable_energy", "utilities", "oil_gas"],
  real_estate_construction: ["residential", "commercial", "construction", "property"],
  government_public_sector: ["policy", "public_safety", "civic_tech", "social_services"],
  nonprofit_social: ["community", "advocacy", "social_impact", "volunteering"],
  environment_cleantech: ["sustainability", "clean_energy", "conservation"],
  agriculture: ["farming", "agtech", "food_production"],
  telecommunications: ["mobile", "broadband", "networking"],
  aerospace_defense: ["aerospace", "defense", "aviation"],
  legal: ["corporate_law", "compliance", "legal_tech", "litigation"],
  life_sciences: ["biotech", "pharma", "medical_devices", "clinical_research"],
  automotive: ["electric_vehicles", "automotive_tech", "fleet"],
  sports_recreation: ["fitness", "sports", "outdoor", "wellness"],
  insurance: ["health_insurance", "property_insurance", "life_insurance"],
  mining_resources: ["mining", "natural_resources", "commodities"],
};

// ─── Role family pools per industry ──────────────────────────────────────────

const ROLE_FAMILIES: Record<string, string[]> = {
  technology: ["engineer", "product_manager", "designer", "data_scientist", "developer"],
  finance: ["analyst", "advisor", "accountant", "trader", "manager"],
  healthcare: ["clinician", "nurse", "administrator", "therapist", "researcher"],
  education: ["teacher", "administrator", "researcher", "instructor", "counselor"],
  media_entertainment: ["creator", "producer", "writer", "editor", "performer"],
  retail_consumer_goods: ["buyer", "manager", "marketer", "merchandiser"],
  food_hospitality: ["chef", "manager", "server", "event_planner"],
  professional_services: ["consultant", "advisor", "manager", "specialist"],
  manufacturing_industry: ["operator", "engineer", "technician", "manager"],
  transportation_logistics: ["coordinator", "driver", "planner", "manager"],
  energy_utilities: ["engineer", "technician", "analyst", "manager"],
  real_estate_construction: ["agent", "developer", "contractor", "property_manager"],
  government_public_sector: ["civil_servant", "administrator", "officer", "analyst"],
  nonprofit_social: ["coordinator", "advocate", "program_manager", "volunteer"],
  environment_cleantech: ["scientist", "engineer", "advocate", "manager"],
  agriculture: ["farmer", "agronomist", "technician", "manager"],
  telecommunications: ["engineer", "technician", "sales", "manager"],
  aerospace_defense: ["engineer", "analyst", "technician", "manager"],
  legal: ["attorney", "paralegal", "compliance_officer", "counsel"],
  life_sciences: ["researcher", "scientist", "clinical_specialist", "manager"],
  automotive: ["engineer", "designer", "technician", "sales"],
  sports_recreation: ["coach", "trainer", "athlete", "manager"],
  insurance: ["agent", "underwriter", "adjuster", "manager"],
  mining_resources: ["engineer", "geologist", "operator", "manager"],
};

// ─── Life stage labels ────────────────────────────────────────────────────────

const LIFE_STAGE_LABELS: Record<string, string> = {
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

function deriveTags(p: Omit<PersonaSeed, "id" | "summary" | "tags">): string[] {
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

function buildSummary(p: Omit<PersonaSeed, "id" | "summary" | "tags">): string {
  const role = LIFE_STAGE_LABELS[p.lifeStage] ?? p.lifeStage.replace(/_/g, " ");
  const industry = p.industry.replace(/_/g, " ");
  const archetype = p.archetype.replace(/_/g, " ");
  return `${p.name} is a ${role} in ${industry} — ${archetype} with a ${p.toneBaseline} baseline, ${p.decisionStyle.replace(/_/g, " ")} decisions, and ${p.techFamiliarity} tech familiarity.`;
}

// ─── Generate ─────────────────────────────────────────────────────────────────

function generate(): PersonaSeed[] {
  const rng = createRandomSource(42);
  const personas: PersonaSeed[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < params.count; i++) {
    const ageBand = weightedPick(params.ageBand, rng);
    const lifeStage = weightedPick(params.lifeStageByAgeBand[ageBand as keyof typeof params.lifeStageByAgeBand], rng);
    const industry = weightedPick(params.industry, rng);
    const regionGroup = weightedPick(params.regionGroup, rng);
    const sex = weightedPick(params.sex, rng);
    const techFamiliarity = weightedPick(params.techFamiliarity, rng);
    const spendingStyle = weightedPick(params.spendingStyle, rng);
    const decisionStyle = weightedPick(params.decisionStyle, rng);
    const skepticismLevel = weightedPick(params.skepticismLevel, rng);
    const toneBaseline = weightedPick(params.toneBaseline, rng);
    const archetype = weightedPick(params.archetype, rng);
    const domain = rng.pick(DOMAINS[industry] ?? ["general"]);
    const roleFamily = rng.pick(ROLE_FAMILIES[industry] ?? ["professional"]);

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

  return personas;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const personas = generate();
const outputPath = resolve(__dirname, "general.json");
writeFileSync(outputPath, JSON.stringify(personas, null, 2) + "\n", "utf8");
console.log(`Generated ${personas.length} personas → ${outputPath}`);
