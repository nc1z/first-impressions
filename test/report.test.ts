import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { generateReport } from "../src/report.js";
import type { RunArtifacts } from "../src/domain/types.js";

describe("generateReport", () => {
  it("writes an HTML report with embedded run data", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "first-impressions-report-"));
    const artifacts: RunArtifacts = {
      manifest: {
        runId: "run-1",
        provider: "codex",
        personaSet: "general",
        mode: "general",
        count: 1,
        concurrency: 1,
        seed: 7,
        createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
        source: {
          kind: "text",
          value: "Idea",
          label: "direct-text",
        },
        reportPath: path.join(directory, "report"),
      },
      brief: {
        title: "Idea title",
        oneLineSummary: "Idea summary",
        targetUser: "Busy teams",
        problemSolved: "Cuts repetitive work.",
        proposedValue: "Makes validation faster.",
        assumptions: [],
        concerns: [],
        sourceKind: "text",
        sourceLabel: "direct-text",
      },
      personas: [],
      responses: [],
      insights: {
        totalResponses: 0,
        successfulResponses: 0,
        failedResponses: 0,
        averageReactionScore: 0,
        averageInterestLevel: 0,
        averageClarityLevel: 0,
        averageTrustLevel: 0,
        topPositives: [],
        topConcerns: [],
        ageBandBreakdown: [],
        domainBreakdown: [],
        strongestSupporters: [],
        strongestSkeptics: [],
      },
    };

    try {
      await generateReport({
        runDirectory: directory,
        artifacts,
      });

      const html = await readFile(path.join(directory, "report", "index.html"), "utf8");
      expect(html).toContain("Idea title");
      expect(html).toContain("Idea summary");
      expect(html).toContain('"runId":"run-1"');
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
