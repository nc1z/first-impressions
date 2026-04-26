/**
 * Persona catalog generator.
 * Usage: pnpm generate <set-name>
 * Example: pnpm generate general
 *          pnpm generate tech-general
 */

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { CatalogConfig } from "./generator.js";
import { generateCatalog } from "./generator.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Registry ────────────────────────────────────────────────────────────────

const sets: Record<string, () => Promise<Omit<CatalogConfig, "outputPath">>> = {
  "general": () => import("./sets/general.js").then((m) => m.config),
  "tech-general": () => import("./sets/tech-general.js").then((m) => m.config),
};

// ─── Run ─────────────────────────────────────────────────────────────────────

const setName = process.argv[2];

if (!setName) {
  console.error(`Usage: pnpm generate <set-name>\nAvailable: ${Object.keys(sets).join(", ")}`);
  process.exit(1);
}

if (!(setName in sets)) {
  console.error(`Unknown set "${setName}". Available: ${Object.keys(sets).join(", ")}`);
  process.exit(1);
}

const config = await sets[setName]!();
generateCatalog({
  ...config,
  outputPath: resolve(__dirname, `${setName}.json`),
});
