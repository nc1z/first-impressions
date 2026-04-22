import { describe, expect, it } from "vitest";

import { loadPersonaCatalog, selectRunPersonas } from "../src/personas.js";

describe("persona catalog", () => {
  it("loads the curated 100-persona catalog", async () => {
    const catalog = await loadPersonaCatalog();
    expect(catalog).toHaveLength(100);
  });

  it("keeps the general audience age distribution stable", async () => {
    const personas = await selectRunPersonas({
      count: 100,
      mode: "general",
      seed: 42,
    });

    const counts = personas.reduce<Record<string, number>>((accumulator, persona) => {
      accumulator[persona.seed.ageBand] = (accumulator[persona.seed.ageBand] ?? 0) + 1;
      return accumulator;
    }, {});

    expect(counts).toEqual({
      teen: 5,
      young_adult: 28,
      adult: 42,
      midlife: 18,
      senior: 7,
    });
  });

  it("reproduces the same persona mix for the same seed", async () => {
    const [firstRun, secondRun] = await Promise.all([
      selectRunPersonas({ count: 20, mode: "general", seed: 111 }),
      selectRunPersonas({ count: 20, mode: "general", seed: 111 }),
    ]);

    expect(firstRun).toEqual(secondRun);
  });
});
