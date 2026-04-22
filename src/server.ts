import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function startStaticServer(options: {
  directory: string;
  port?: number;
}): Promise<{ url: string; close: () => Promise<void> }> {
  const server = createServer(async (request, response) => {
    try {
      const requestPath = request.url === "/" ? "/index.html" : request.url ?? "/index.html";
      const filePath = path.join(options.directory, requestPath.replace(/^\/+/, ""));
      const file = await readFile(filePath);
      response.writeHead(200, {
        "content-type": contentTypeFor(filePath),
      });
      response.end(file);
    } catch {
      response.writeHead(404, {
        "content-type": "text/plain; charset=utf-8",
      });
      response.end("Not found");
    }
  });

  await new Promise<void>((resolve) => {
    server.listen(options.port ?? 0, "127.0.0.1", () => resolve());
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to resolve report server address.");
  }

  return {
    url: `http://127.0.0.1:${address.port}`,
    close: async () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      }),
  };
}

export async function openUrlInBrowser(url: string): Promise<boolean> {
  const command = browserOpenCommand(url);
  if (!command) {
    return false;
  }

  return new Promise<boolean>((resolve) => {
    const child = spawn(command.command, command.args, {
      detached: true,
      stdio: "ignore",
    });

    child.once("spawn", () => {
      child.unref();
      resolve(true);
    });
    child.once("error", () => resolve(false));
  });
}

function browserOpenCommand(url: string): { command: string; args: string[] } | undefined {
  if (process.platform === "darwin") {
    return { command: "open", args: [url] };
  }

  if (process.platform === "win32") {
    return { command: "cmd", args: ["/c", "start", "", url] };
  }

  if (process.platform === "linux") {
    return { command: "xdg-open", args: [url] };
  }

  return undefined;
}

function contentTypeFor(filePath: string): string {
  if (filePath.endsWith(".html")) {
    return "text/html; charset=utf-8";
  }

  if (filePath.endsWith(".js")) {
    return "text/javascript; charset=utf-8";
  }

  if (filePath.endsWith(".json")) {
    return "application/json; charset=utf-8";
  }

  return "text/plain; charset=utf-8";
}
