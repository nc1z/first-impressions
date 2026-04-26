import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export async function ensureDir(directoryPath: string): Promise<void> {
  await mkdir(directoryPath, { recursive: true });
}

export async function writeJson(filePath: string, value: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function writeJsonLines(filePath: string, values: unknown[]): Promise<void> {
  await ensureDir(path.dirname(filePath));
  const lines = values.map((value) => JSON.stringify(value)).join("\n");
  await writeFile(filePath, `${lines}\n`, "utf8");
}
