import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { listAvailableRuns } from "../src/runs.js";

describe("listAvailableRuns", () => {
  it("returns valid runs sorted from newest to oldest", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "first-impressions-runs-"));

    try {
      const firstRun = path.join(root, "runs", "2026-04-20T10-00-00-000Z");
      const secondRun = path.join(root, "runs", "2026-04-22T10-00-00-000Z");

      await mkdir(path.join(firstRun, "report"), { recursive: true });
      await mkdir(path.join(secondRun, "report"), { recursive: true });
      await writeFile(
        path.join(firstRun, "manifest.json"),
        JSON.stringify({
          runId: "2026-04-20T10-00-00-000Z",
          provider: "claude",
          createdAt: "2026-04-20T10:00:00.000Z",
          count: 20,
        }),
      );
      await writeFile(
        path.join(secondRun, "manifest.json"),
        JSON.stringify({
          runId: "2026-04-22T10-00-00-000Z",
          provider: "codex",
          createdAt: "2026-04-22T10:00:00.000Z",
          count: 100,
        }),
      );

      const runs = await listAvailableRuns(root);

      expect(runs.map((run) => run.runId)).toEqual([
        "2026-04-22T10-00-00-000Z",
        "2026-04-20T10-00-00-000Z",
      ]);
      expect(runs[0]).toMatchObject({
        provider: "codex",
        count: 100,
      });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
