import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { executeRun } from "./run.js";
import { buildUIHtml } from "./ui-html.js";
import { openUrlInBrowser } from "./server.js";
import type { RunProgressEvent } from "./terminal.js";

interface Session {
  buffer: string[];
  sseRes: ServerResponse | null;
  done: boolean;
}

const sessions = new Map<string, Session>();

function createSession(): string {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  sessions.set(id, { buffer: [], sseRes: null, done: false });
  return id;
}

function emitEvent(sessionId: string, event: object): void {
  const sess = sessions.get(sessionId);
  if (!sess || sess.done) return;
  const line = `data: ${JSON.stringify(event)}\n\n`;
  if (sess.sseRes) {
    sess.sseRes.write(line);
  } else {
    sess.buffer.push(line);
  }
}

function finishSession(sessionId: string): void {
  const sess = sessions.get(sessionId);
  if (!sess) return;
  sess.done = true;
  sess.sseRes?.end();
  setTimeout(() => sessions.delete(sessionId), 60_000);
}

async function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function contentTypeFor(filePath: string): string {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".woff2")) return "font/woff2";
  return "text/plain; charset=utf-8";
}

async function handleRunRequest(req: IncomingMessage, res: ServerResponse, outputDir: string): Promise<void> {
  let body: { provider: string; personaSet: string; count: number; concurrency: number; idea: string };
  try {
    body = JSON.parse(await readBody(req)) as typeof body;
  } catch {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid JSON body" }));
    return;
  }

  if (!body.idea?.trim()) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "idea is required" }));
    return;
  }

  const sessionId = createSession();

  void executeRun({
    text: body.idea,
    provider: body.provider as "codex" | "claude" | "copilot",
    personaSet: body.personaSet as "general" | "tech-general",
    mode: "general",
    count: Math.max(1, Math.min(100, body.count ?? 100)),
    concurrency: Math.max(1, Math.min(20, body.concurrency ?? 5)),
    outputDir,
    onProgress: (event: RunProgressEvent) => {
      emitEvent(sessionId, event);
    },
  })
    .then(({ artifacts }) => {
      emitEvent(sessionId, {
        stage: "complete",
        runId: artifacts.manifest.runId,
        insights: artifacts.insights,
      });
      finishSession(sessionId);
    })
    .catch((err: unknown) => {
      emitEvent(sessionId, {
        stage: "error",
        message: err instanceof Error ? err.message : String(err),
      });
      finishSession(sessionId);
    });

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ sessionId }));
}

function handleEventsRequest(req: IncomingMessage, res: ServerResponse): void {
  const url = new URL(req.url ?? "/", "http://localhost");
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) {
    res.writeHead(400);
    res.end();
    return;
  }

  const sess = sessions.get(sessionId);
  if (!sess) {
    res.writeHead(404);
    res.end();
    return;
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();

  // Drain buffered events
  for (const line of sess.buffer) {
    res.write(line);
  }
  sess.buffer = [];
  sess.sseRes = res;

  if (sess.done) {
    res.end();
    return;
  }

  req.on("close", () => {
    if (sess.sseRes === res) sess.sseRes = null;
  });
}

async function handleReportRequest(res: ServerResponse, outputDir: string, runId: string, filePath: string): Promise<void> {
  const normalized = filePath === "/" || filePath === "" ? "index.html" : filePath.replace(/^\//, "");
  const fullPath = path.join(outputDir, "runs", runId, "report", normalized);
  try {
    const content = await readFile(fullPath);
    res.writeHead(200, { "Content-Type": contentTypeFor(fullPath) });
    res.end(content);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
}

export async function launchUI(options: { outputDir: string; port?: number }): Promise<void> {
  const { outputDir } = options;
  const html = buildUIHtml();

  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const method = req.method ?? "GET";

    // Root: serve UI
    if (method === "GET" && url.pathname === "/") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }

    // POST /api/run
    if (method === "POST" && url.pathname === "/api/run") {
      void handleRunRequest(req, res, outputDir);
      return;
    }

    // GET /api/events
    if (method === "GET" && url.pathname === "/api/events") {
      handleEventsRequest(req, res);
      return;
    }

    // GET /runs/:runId/report/*
    const reportMatch = /^\/runs\/([^/]+)\/report(\/.*)?$/.exec(url.pathname);
    if (method === "GET" && reportMatch) {
      const runId = reportMatch[1] as string;
      const filePath = reportMatch[2] ?? "/index.html";
      void handleReportRequest(res, outputDir, runId, filePath);
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  });

  await new Promise<void>((resolve) => {
    server.listen(options.port ?? 0, "127.0.0.1", () => resolve());
  });

  const addr = server.address();
  if (!addr || typeof addr === "string") throw new Error("UI server failed to start.");
  const url = `http://127.0.0.1:${addr.port}`;

  console.log(`\nUI  ${url}\n`);
  await openUrlInBrowser(url);
  console.log("Press Ctrl+C to stop.\n");

  await new Promise<void>((resolve, reject) => {
    process.once("SIGINT", () => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });
}
