import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

export interface RunSummary {
  runId: string;
  provider: string;
  createdAt: string;
  count: number;
  reportDirectory: string;
}

interface RunManifestLike {
  runId?: string;
  provider?: string;
  createdAt?: string;
  count?: number;
}

export async function listAvailableRuns(outputDir: string): Promise<RunSummary[]> {
  const runsDirectory = path.resolve(outputDir, "runs");
  let entries: string[];

  try {
    entries = await readdir(runsDirectory);
  } catch {
    return [];
  }

  const runs = await Promise.all(
    entries.map(async (entry) => {
      const runDirectory = path.join(runsDirectory, entry);
      const reportDirectory = path.join(runDirectory, "report");
      const manifestPath = path.join(runDirectory, "manifest.json");

      try {
        const [directoryStat, manifestRaw] = await Promise.all([
          stat(reportDirectory),
          readFile(manifestPath, "utf8"),
        ]);

        if (!directoryStat.isDirectory()) {
          return undefined;
        }

        const manifest = JSON.parse(manifestRaw) as RunManifestLike;

        return {
          runId: manifest.runId ?? entry,
          provider: manifest.provider ?? "unknown",
          createdAt: manifest.createdAt ?? entry,
          count: manifest.count ?? 0,
          reportDirectory,
        } satisfies RunSummary;
      } catch {
        return undefined;
      }
    }),
  );

  return runs
    .filter((run): run is RunSummary => Boolean(run))
    .sort((left, right) => right.runId.localeCompare(left.runId));
}
