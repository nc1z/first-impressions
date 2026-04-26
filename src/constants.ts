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

export const REACTION_OPENING_EXAMPLES = [
  "At first glance,",
  "My first thought:",
  "My gut reaction is",
  "Honestly,",
  "Frankly,",
  "Right away,",
  "On first impression,",
  "My instant read is",
  "The first thing I think is",
  "My knee-jerk reaction:",
  "Initial vibe:",
  "First impression:",
  "My immediate take:",
  "My snap judgment is",
  "What jumps out to me is",
  "The hook for me is",
  "The part that loses me is",
  "The part I like is",
  "The part that makes me pause is",
  "My first response is basically",
  "I can already tell",
  "I'm already wondering if",
  "I would need to know",
  "I could see myself thinking",
  "I'm torn because",
  "I get what this is trying to do, but",
  "I see the appeal, but",
  "I like the premise, but",
  "I want to like this, but",
  "I'm not sold yet because",
  "I'm into this if",
  "I would try this if",
  "Grabs me, but",
  "Sounds useful, but",
  "Sounds clever, but",
  "Feels promising, but",
  "Feels niche to me because",
  "Feels overcomplicated because",
  "Feels like something I'd actually use",
  "Feels like a maybe, not a yes, because",
  "Interesting on paper, but",
  "Smart angle if",
  "Here's where I hesitate:",
  "Here's where you lose me:",
  "Intriguing, but",
  "Sounds convenient, but",
  "Sounds expensive unless",
  "That pitch works until",
  "Okay,",
  "Yeah,",
  "Hmm,",
  "Huh,",
  "Nah,",
  "Wow,",
  "Yo,",
  "Haha,",
  "Whoa,",
  "Alright,",
  "Look,",
  "For me,",
  "From where I sit,",
  "As a buyer,",
] as const;
