import { spawn } from "node:child_process";

export async function isCommandAvailable(command: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const child = spawn("which", [command], {
      stdio: "ignore",
    });

    child.on("exit", (code) => resolve(code === 0));
    child.on("error", () => resolve(false));
  });
}

export async function runCommand(options: {
  command: string;
  args: string[];
  cwd?: string;
  timeoutMs?: number;
}): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(options.command, options.args, {
      cwd: options.cwd ?? process.cwd(),
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`Command timed out after ${options.timeoutMs ?? 120000}ms: ${options.command}`));
    }, options.timeoutMs ?? 120000);

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    child.on("exit", (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new Error(`Command failed (${code}): ${options.command}\n${stderr || stdout}`.trim()));
        return;
      }

      resolve({ stdout, stderr });
    });
  });
}

export function extractJsonObject(raw: string): string {
  const startIndex = raw.indexOf("{");
  if (startIndex === -1) {
    throw new Error(`Provider response did not contain JSON: ${raw.slice(0, 200)}`);
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = startIndex; index < raw.length; index += 1) {
    const character = raw[index] as string;

    if (escaped) {
      escaped = false;
      continue;
    }

    if (character === "\\") {
      escaped = true;
      continue;
    }

    if (character === "\"") {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;

      if (depth === 0) {
        return raw.slice(startIndex, index + 1);
      }
    }
  }

  throw new Error("Provider response contained an unterminated JSON object.");
}
