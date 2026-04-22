import type { ProviderName } from "../domain/types.js";
import type { ProviderAdapter } from "./base.js";
import { ClaudeAdapter } from "./claude.js";
import { CodexAdapter } from "./codex.js";
import { CopilotAdapter } from "./copilot.js";

export function createProviderAdapter(provider: ProviderName): ProviderAdapter {
  switch (provider) {
    case "claude":
      return new ClaudeAdapter();
    case "copilot":
      return new CopilotAdapter();
    case "codex":
    default:
      return new CodexAdapter();
  }
}

export async function listProviderStatuses(): Promise<Array<{ name: ProviderName; available: boolean }>> {
  const adapters = [new CodexAdapter(), new ClaudeAdapter(), new CopilotAdapter()];

  return Promise.all(
    adapters.map(async (adapter) => ({
      name: adapter.name,
      available: await adapter.isAvailable(),
    })),
  );
}
