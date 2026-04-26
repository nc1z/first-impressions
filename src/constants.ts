export const INDUSTRIES = [
  "technology",
  "finance",
  "healthcare",
  "education",
  "media_entertainment",
  "retail_consumer_goods",
  "food_hospitality",
  "professional_services",
  "manufacturing_industry",
  "transportation_logistics",
  "energy_utilities",
  "real_estate_construction",
  "government_public_sector",
  "nonprofit_social",
  "environment_cleantech",
  "agriculture",
  "telecommunications",
  "aerospace_defense",
  "legal",
  "life_sciences",
  "automotive",
  "sports_recreation",
  "insurance",
  "mining_resources",
] as const;

export type Industry = (typeof INDUSTRIES)[number];

export const LIFE_STAGES = [
  // Youth & Education
  "secondary_student",
  "college_bound",
  "student",

  // Early Adulthood
  "first_job",
  "early_career",
  "young_parent",

  // Building Phase
  "career_building",
  "independent_professional",
  "household_manager",
  "parent",

  // Mid Life
  "mid_career",
  "team_lead",
  "small_business_owner",
  "caregiver",

  // Late Career
  "consulting",

  // Later Life
  "community_volunteer",
  "grandparent",
  "retired",
] as const;

export type LifeStage = (typeof LIFE_STAGES)[number];

export const ARCHETYPES = [
  "early_adopter",
  "trend_aware_browser",
  "late_majority_pragmatist",
  "trust_first_skeptic",
  "efficiency_seeker",
  "busy_planner",
  "detail_focused_evaluator",
  "budget_conscious_shopper",
  "career_climber",
  "family_centered_decision_maker",
  "community_minded_adopter",
  "local_first_supporter",
] as const;

export type Archetype = (typeof ARCHETYPES)[number];

export const TECH_FAMILIARITY = ["low", "medium", "high"] as const;

export type TechFamiliarity = (typeof TECH_FAMILIARITY)[number];

export const SPENDING_STYLES = ["frugal", "balanced", "premium_sensitive"] as const;

export type SpendingStyle = (typeof SPENDING_STYLES)[number];

export const DECISION_STYLES = ["intuitive", "deliberate", "social_proof", "risk_averse"] as const;

export type DecisionStyle = (typeof DECISION_STYLES)[number];

export const SKEPTICISM_LEVELS = ["low", "medium", "high"] as const;

export type SkepticismLevel = (typeof SKEPTICISM_LEVELS)[number];

export const TONE_BASELINES = ["warm", "blunt", "curious", "skeptical", "optimistic", "practical"] as const;

export type ToneBaseline = (typeof TONE_BASELINES)[number];

export const LANGUAGES = ["en-US"] as const;

export type Language = (typeof LANGUAGES)[number];

export const REGION_GROUPS = [
  "north_america",
  "europe",
  "asia_pacific",
  "latin_america",
  "africa_middle_east",
] as const;

export type RegionGroup = (typeof REGION_GROUPS)[number];

export const TAGS = [
  // Age & life stage
  "teen",
  "young_adult",
  "adult",
  "midlife",
  "senior",
  "student",
  "parent",
  "retiree",

  // Role & work
  "entrepreneur",
  "freelancer",
  "manager",
  "executive",
  "blue_collar",
  "creative",
  "caregiver",
  "stay_at_home",

  // Tech attitude
  "tech_savvy",
  "tech_averse",
  "early_adopter",
  "late_adopter",

  // Financial
  "budget_conscious",
  "middle_income",
  "affluent",
  "deal_seeker",

  // Lifestyle & interests
  "fitness",
  "wellness",
  "foodie",
  "traveler",
  "gamer",
  "fashion",
  "outdoors",
  "homebody",
  "social",
  "community",

  // Values
  "environmentally_conscious",
  "health_conscious",
  "family_first",
  "career_driven",
  "spiritually_inclined",
  "politically_engaged",

  // Consumer behavior
  "impulse_buyer",
  "researcher",
  "brand_loyal",
  "price_sensitive",
  "convenience_driven",
] as const;

export type Tag = (typeof TAGS)[number];
