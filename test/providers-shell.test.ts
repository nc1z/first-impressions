import { describe, expect, it } from "vitest";

import { extractJsonObject } from "../src/providers/shell.js";

describe("extractJsonObject", () => {
  it("pulls the first full JSON object out of mixed stdout", () => {
    const raw = [
      "warning: provider banner",
      '{"ok":true,"nested":{"value":1}}',
      "trailing noise",
    ].join("\n");

    expect(extractJsonObject(raw)).toBe('{"ok":true,"nested":{"value":1}}');
  });
});
