/**
 * Generation parameters for the "general" persona set.
 * All weights are relative — they don't need to sum to 100.
 * Increase a value to make it more likely, decrease to make it rarer.
 */

export const params = {
  count: 100,

  // ─── Age bands ───────────────────────────────────────────────────────────────
  // Reflects a working-age-skewed general population. Adults (25–44) are the
  // core consumer majority. Teens are intentionally rare to keep the set
  // focused on people with real purchasing power.
  ageBand: {
    teen: 5,
    young_adult: 28,
    adult: 42,
    midlife: 18,
    senior: 7,
  },

  // ─── Life stages — picked within the matched age band ────────────────────────
  // Each age band has its own sub-distribution so life stages stay realistic.
  // e.g. a teen can only be secondary_student or college_bound, never retired.
  lifeStageByAgeBand: {
    teen: {
      // Most teens are still in high school; some are preparing for college.
      secondary_student: 60,
      college_bound: 40,
    },
    young_adult: {
      // Split between finishing studies, entering the workforce, and early parenting.
      student: 20,
      first_job: 25,
      early_career: 35,
      young_parent: 20,
    },
    adult: {
      // Broad mix: climbing careers, independent work, running households, raising kids.
      career_building: 25,
      independent_professional: 20,
      household_manager: 20,
      parent: 35,
    },
    midlife: {
      // Established professionals — managers, owners, caregivers for aging parents.
      mid_career: 30,
      team_lead: 25,
      small_business_owner: 25,
      caregiver: 20,
    },
    senior: {
      // Winding down from careers but still active — consulting, volunteering, family.
      consulting: 30,
      community_volunteer: 25,
      grandparent: 25,
      retired: 20,
    },
  },

  // ─── Industry ────────────────────────────────────────────────────────────────
  // Equal weight across all sectors — "general". If you want to
  // skew toward a specific sector, adjust individual values here.
  industry: {
    technology: 1,
    finance: 1,
    healthcare: 1,
    education: 1,
    media_entertainment: 1,
    retail_consumer_goods: 1,
    food_hospitality: 1,
    professional_services: 1,
    manufacturing_industry: 1,
    transportation_logistics: 1,
    energy_utilities: 1,
    real_estate_construction: 1,
    government_public_sector: 1,
    nonprofit_social: 1,
    environment_cleantech: 1,
    agriculture: 1,
    telecommunications: 1,
    aerospace_defense: 1,
    legal: 1,
    life_sciences: 1,
    automotive: 1,
    sports_recreation: 1,
    insurance: 1,
    mining_resources: 1,
  },

  // ─── Region ──────────────────────────────────────────────────────────────────
  // Biased toward English-speaking and western markets where most early-stage
  // products launch first. Increase asia_pacific or latin_america to stress-test
  // for global audiences.
  regionGroup: {
    north_america: 30,
    europe: 25,
    asia_pacific: 25,
    latin_america: 12,
    africa_middle_east: 8,
  },

  // ─── Sex ─────────────────────────────────────────────────────────────────────
  // Near-equal male/female split
  sex: {
    female: 40,
    male: 40,
    unspecified: 20,
  },

  // ─── Tech familiarity ────────────────────────────────────────────────────────
  // Most people are moderate users. High is common enough to be realistic but
  // not dominant — avoid skewing feedback toward power users.
  techFamiliarity: {
    low: 25,
    medium: 45,
    high: 30,
  },

  // ─── Spending style ──────────────────────────────────────────────────────────
  // Frugal is the plurality — most people are cost-conscious. Balanced is the
  // mode. Premium-sensitive is the smallest group, representing aspirational
  // but price-aware spenders (not necessarily affluent).
  spendingStyle: {
    frugal: 35,
    balanced: 40,
    premium_sensitive: 25,
  },

  // ─── Decision style ──────────────────────────────────────────────────────────
  // Intuitive and deliberate are equally common, reflecting real split between
  // fast/emotional and slow/rational buyers. Risk-averse is rare to avoid
  // over-weighting skeptical rejections in the simulation output.
  decisionStyle: {
    intuitive: 30,
    deliberate: 30,
    social_proof: 25,
    risk_averse: 15,
  },

  // ─── Skepticism ──────────────────────────────────────────────────────────────
  // Even distribution with a medium lean. Avoid stacking too many high-skeptic
  // personas or the simulation will always produce negative signals regardless
  // of idea quality.
  skepticismLevel: {
    low: 30,
    medium: 40,
    high: 30,
  },

  // ─── Tone baseline ───────────────────────────────────────────────────────────
  // Curious and warm are the most common baselines — people tend to engage
  // openly before forming opinions. Blunt and skeptical are kept lower to
  // prevent a harsh overall tone in aggregate reactions.
  toneBaseline: {
    warm: 18,
    blunt: 15,
    curious: 20,
    skeptical: 15,
    optimistic: 17,
    practical: 15,
  },

  // ─── Archetype ───────────────────────────────────────────────────────────────
  // Pragmatists, efficiency seekers, and busy planners dominate because they
  // represent the largest real-world consumer segments. Early adopters and
  // trend browsers are common but not overwhelming — a product shouldn't only
  // appeal to novelty-seekers. Niche archetypes (community, local-first) are
  // rarer to reflect their smaller real-world share.
  archetype: {
    early_adopter: 10,
    trend_aware_browser: 10,
    late_majority_pragmatist: 12,
    trust_first_skeptic: 8,
    efficiency_seeker: 12,
    busy_planner: 12,
    detail_focused_evaluator: 8,
    budget_conscious_shopper: 10,
    career_climber: 8,
    family_centered_decision_maker: 8,
    community_minded_adopter: 6,
    local_first_supporter: 6,
  },
} as const;

export type GeneralParams = typeof params;
