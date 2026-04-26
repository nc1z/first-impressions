import { describe, expect, it } from "vitest";

import { loadPersonaCatalog, selectRunPersonas } from "../src/personas.js";

describe("persona catalog", () => {
  it("loads the curated 100-persona catalog", async () => {
    const catalog = await loadPersonaCatalog();
    expect(catalog).toHaveLength(100);
  });

  it("loads the tech-general persona catalog", async () => {
    const catalog = await loadPersonaCatalog("tech-general");
    expect(catalog).toHaveLength(100);
  });

  it("returns the full general catalog without duplicates when count matches catalog size", async () => {
    const [catalog, personas] = await Promise.all([
      loadPersonaCatalog("general"),
      selectRunPersonas({
        count: 100,
        personaSet: "general",
        mode: "general",
        seed: 42,
      }),
    ]);

    expect(personas).toHaveLength(catalog.length);
    expect(new Set(personas.map((persona) => persona.seed.id)).size).toBe(catalog.length);
  });

  it("reproduces the same persona mix for the same seed", async () => {
    const [firstRun, secondRun] = await Promise.all([
      selectRunPersonas({ count: 20, personaSet: "general", mode: "general", seed: 111 }),
      selectRunPersonas({ count: 20, personaSet: "general", mode: "general", seed: 111 }),
    ]);

    expect(firstRun).toEqual(secondRun);
  });
});
