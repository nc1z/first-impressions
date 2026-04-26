/**
 * Generation parameters for the "tech-general" persona set.
 * Personas here work in or directly with tech — developers, analysts, product
 * managers, sales engineers, IT staff — across any industry. They don't all
 * work at tech companies; a nurse using clinical software or a teacher building
 * edtech courses qualifies. The unifying trait is meaningful daily engagement
 * with technology as part of their work.
 *
 * All weights are relative — they don't need to sum to 100.
 */

export const params = {
  count: 100,

  // ─── Age bands ─────────────────────────────────────────────────────────────
  // Tech skews younger-working-age. Teens are rarer (fewer in the workforce),
  // seniors are rarer (smaller share of active tech practitioners). The
  // sweet spot is young_adult through midlife.
  ageBand: {
    teen: 2,
    young_adult: 35,
    adult: 40,
    midlife: 18,
    senior: 5,
  },

  // ─── Life stages — picked within the matched age band ──────────────────────
  lifeStageByAgeBand: {
    teen: {
      // Teens in tech are mostly self-taught coders or bootcamp students.
      secondary_student: 40,
      college_bound: 60,
    },
    young_adult: {
      // Heavily career-entry focused — first roles and early hustle dominate.
      student: 15,
      first_job: 30,
      early_career: 40,
      young_parent: 15,
    },
    adult: {
      // Building careers and specialising. Independent work is common in tech.
      career_building: 30,
      independent_professional: 30,
      household_manager: 10,
      parent: 30,
    },
    midlife: {
      // Senior ICs, managers, and founders. Caregiving is less common here
      // than in the general set.
      mid_career: 35,
      team_lead: 30,
      small_business_owner: 25,
      caregiver: 10,
    },
    senior: {
      // Senior tech practitioners often stay active through consulting or
      // fractional roles rather than fully retiring.
      consulting: 50,
      community_volunteer: 15,
      grandparent: 15,
      retired: 20,
    },
  },

  // ─── Industry ──────────────────────────────────────────────────────────────
  // Equal weight — tech workers exist in every sector, and the goal is to
  // capture the full range of contexts in which tech is used, not just the
  // tech industry itself.
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

  // ─── Region ────────────────────────────────────────────────────────────────
  // North America, Europe, and Asia-Pacific carry the largest tech workforces
  // and most active developer communities. Latin America and Africa/Middle East
  // are rising but still underrepresented in current global tech hiring pools.
  regionGroup: {
    north_america: 32,
    europe: 27,
    asia_pacific: 27,
    latin_america: 9,
    africa_middle_east: 5,
  },

  // ─── Sex ───────────────────────────────────────────────────────────────────
  // Tech still skews male in most roles, but this set represents where the
  // workforce is heading rather than where it's been. A 45/40/15 split is
  // aspirational but not unrealistic for the next generation of practitioners.
  sex: {
    female: 40,
    male: 45,
    unspecified: 15,
  },

  // ─── Tech familiarity ──────────────────────────────────────────────────────
  // The defining trait of this set. Low familiarity is rare — a business
  // analyst at a SaaS company or a sales engineer still qualifies as
  // medium-high. Low covers edge cases like an admin at a tech firm.
  techFamiliarity: {
    low: 5,
    medium: 35,
    high: 60,
  },

  // ─── Spending style ────────────────────────────────────────────────────────
  // Tech workers generally earn above-median salaries. The frugal share is
  // lower than general; premium-sensitive is higher, reflecting willingness
  // to pay for quality tools and experiences.
  spendingStyle: {
    frugal: 20,
    balanced: 45,
    premium_sensitive: 35,
  },

  // ─── Decision style ────────────────────────────────────────────────────────
  // Tech practitioners lean deliberate and analytical. Social proof matters
  // (communities, reviews, GitHub stars). Intuitive decisions are less common
  // but present — especially in design and product roles.
  decisionStyle: {
    intuitive: 15,
    deliberate: 40,
    social_proof: 30,
    risk_averse: 15,
  },

  // ─── Skepticism ────────────────────────────────────────────────────────────
  // Tech audiences are harder to impress — they've seen many overhyped
  // products. Medium and high skepticism dominate; low is rare.
  skepticismLevel: {
    low: 15,
    medium: 45,
    high: 40,
  },

  // ─── Tone baseline ─────────────────────────────────────────────────────────
  // Practical and curious dominate — tech people want to understand how
  // things work. Blunt is common (directness is valued in eng culture).
  // Warm is less common but present in design, education, and community roles.
  toneBaseline: {
    warm: 10,
    blunt: 22,
    curious: 28,
    skeptical: 18,
    optimistic: 10,
    practical: 12,
  },

  // ─── Archetype ─────────────────────────────────────────────────────────────
  // Early adopters and efficiency seekers are over-represented — core traits
  // of tech-engaged personas. Detail-focused evaluators are common (code
  // review culture, technical due diligence). Local-first and budget-conscious
  // shopping archetypes are rare in this set.
  archetype: {
    early_adopter: 16,
    trend_aware_browser: 12,
    late_majority_pragmatist: 8,
    trust_first_skeptic: 10,
    efficiency_seeker: 16,
    busy_planner: 8,
    detail_focused_evaluator: 14,
    budget_conscious_shopper: 4,
    career_climber: 10,
    family_centered_decision_maker: 4,
    community_minded_adopter: 6,
    local_first_supporter: 2,
  },
} as const;

export type TechGeneralParams = typeof params;
