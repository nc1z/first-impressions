import { readFile } from "node:fs/promises";
import { URL } from "node:url";

import type { IdeaInput } from "./domain/types.js";

interface ResolveIdeaInputOptions {
  text?: string | undefined;
  file?: string | undefined;
  url?: string | undefined;
}

export async function resolveIdeaInput(options: ResolveIdeaInputOptions): Promise<IdeaInput> {
  const providedCount = [options.text, options.file, options.url].filter(Boolean).length;
  if (providedCount !== 1) {
    throw new Error("Provide exactly one of: direct text, --file, or --url.");
  }

  if (options.text) {
    return {
      kind: "text",
      value: options.text.trim(),
      label: "direct-text",
    };
  }

  if (options.file) {
    const fileContents = await readFile(options.file, "utf8");
    return {
      kind: "file",
      value: fileContents.trim(),
      label: options.file,
    };
  }

  const parsedUrl = new URL(options.url as string);
  const response = await fetch(parsedUrl, {
    headers: {
      "user-agent": "first-impressions/0.1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const textContent = normalizeUrlContent(html);

  return {
    kind: "url",
    value: textContent,
    label: parsedUrl.toString(),
  };
}

export function normalizeUrlContent(html: string): string {
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

  return stripped.slice(0, 12000);
}
