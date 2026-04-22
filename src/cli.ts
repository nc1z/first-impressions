#!/usr/bin/env node

import path from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

import { Command } from "commander";
import { stat } from "node:fs/promises";

import { loadPersonaCatalog } from "./personas.js";
import { listProviderStatuses } from "./providers/index.js";
import { executeRun } from "./run.js";
import { startStaticServer } from "./server.js";
import { asciiBanner, createRunReporter, formatDuration } from "./terminal.js";

const program = new Command();

program
  .name("first-impressions")
  .description("CLI market-reaction simulator powered by persona-based AI subagents.")
  .version("0.1.0")
  .showHelpAfterError()
  .option("--provider <provider>", "Provider to use: codex, claude, copilot", "codex")
  .option("--mode <mode>", "Persona distribution mode", "general")
  .option("--count <number>", "Number of personas to evaluate", "100")
  .option("--seed <number>", "Seed for reproducible persona selection")
  .option("--concurrency <number>", "Parallel provider call limit", "10")
  .option("--output <path>", "Base output directory", path.resolve(process.cwd(), ".first-impressions"))
  .addHelpText(
    "beforeAll",
    `${asciiBanner()}\nFast AI audience simulation for startup ideas.\n\nRun with no subcommand to launch the interactive audience prompt.\n`,
  )
  .addHelpText(
    "afterAll",
    [
      "",
      "Examples:",
      "  $ first-impressions",
      "  $ first-impressions --provider claude --count 25",
      '  $ first-impressions run "A browser extension that turns job posts into interview prep"',
      "  $ first-impressions run --file ./idea.txt --provider claude --count 25",
      "  $ first-impressions run --url https://example.com --provider copilot",
      "  $ first-impressions report <run-id>",
    ].join("\n"),
  );

program.action(async (options) => {
  const reporter = createRunReporter();
  reporter.intro();

  const text = await promptForIdeaText(reporter);
  await runSimulation({
    text,
    file: undefined,
    url: undefined,
    provider: options.provider as "codex" | "claude" | "copilot",
    mode: options.mode as "general" | "tagged-segment",
    count: Number(options.count),
    seed: options.seed ? Number(options.seed) : undefined,
    concurrency: Number(options.concurrency),
    outputDir: path.resolve(options.output as string),
    reporter,
  });
});

program
  .command("run")
  .description("Run a first-impressions audience simulation non-interactively.")
  .argument("[text]", "Direct idea text input")
  .option("--file <path>", "Read idea input from a local file")
  .option("--url <url>", "Read idea input from a URL")
  .option("--provider <provider>", "Provider to use: codex, claude, copilot", "codex")
  .option("--mode <mode>", "Persona distribution mode", "general")
  .option("--count <number>", "Number of personas to evaluate", "100")
  .option("--seed <number>", "Seed for reproducible persona selection")
  .option("--concurrency <number>", "Parallel provider call limit", "10")
  .option("--output <path>", "Base output directory", path.resolve(process.cwd(), ".first-impressions"))
  .action(async (text: string | undefined, options) => {
    const reporter = createRunReporter();
    reporter.intro();
    await runSimulation({
      text,
      file: options.file as string | undefined,
      url: options.url as string | undefined,
      provider: options.provider as "codex" | "claude" | "copilot",
      mode: options.mode as "general" | "tagged-segment",
      count: Number(options.count),
      seed: options.seed ? Number(options.seed) : undefined,
      concurrency: Number(options.concurrency),
      outputDir: path.resolve(options.output),
      reporter,
    });
  });

const providersCommand = program.command("providers").description("Inspect provider availability.");
providersCommand
  .command("list")
  .description("List available providers.")
  .action(async () => {
    const reporter = createRunReporter();
    reporter.info([asciiBanner(), "Checking provider availability...\n"]);
    const providers = await listProviderStatuses();

    for (const provider of providers) {
      console.log(`${provider.available ? "[ok]" : "[--]"} ${provider.name.padEnd(8)} ${provider.available ? "available" : "missing"}`);
    }
  });

const personasCommand = program.command("personas").description("Inspect the persona catalog.");
personasCommand
  .command("list")
  .description("List persona IDs and summaries.")
  .action(async () => {
    const reporter = createRunReporter();
    reporter.info([asciiBanner(), "Persona catalog snapshot:\n"]);
    const catalog = await loadPersonaCatalog();

    for (const persona of catalog) {
      console.log(
        `${persona.id}  ${persona.ageBand.padEnd(11)}  ${persona.industry.padEnd(22)}  ${persona.summary}`,
      );
    }
  });

program
  .command("report")
  .description("Serve a generated report for an existing run.")
  .argument("<runId>", "Run ID to serve")
  .option("--output <path>", "Base output directory", path.resolve(process.cwd(), ".first-impressions"))
  .option("--port <number>", "Port to bind to", "0")
  .action(async (runId: string, options) => {
    const reporter = createRunReporter();
    reporter.info([asciiBanner(), `Preparing report for ${runId}...\n`]);
    const reportDirectory = path.resolve(options.output, "runs", runId, "report");
    await stat(path.join(reportDirectory, "index.html"));
    const server = await startStaticServer({
      directory: reportDirectory,
      port: Number(options.port),
    });

    reporter.success([
      `Serving report for ${runId}`,
      `URL          ${server.url}`,
      "Keep this process running while you browse the report.",
      "Press Ctrl+C to stop the local server.",
    ]);

    process.on("SIGINT", async () => {
      await server.close();
      process.exit(0);
    });
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  createRunReporter().failure(message);
  process.exitCode = 1;
});

async function runSimulation(options: {
  text?: string | undefined;
  file?: string | undefined;
  url?: string | undefined;
  provider: "codex" | "claude" | "copilot";
  mode: "general" | "tagged-segment";
  count: number;
  seed?: number | undefined;
  concurrency: number;
  outputDir: string;
  reporter: ReturnType<typeof createRunReporter>;
}): Promise<void> {
  const startedAt = Date.now();
  const { artifacts, runDirectory } = await executeRun({
    text: options.text,
    file: options.file,
    url: options.url,
    provider: options.provider,
    mode: options.mode,
    count: options.count,
    seed: options.seed,
    concurrency: options.concurrency,
    outputDir: options.outputDir,
    onProgress: (event) => {
      options.reporter.onProgress(event);
    },
  });

  const elapsedMs = Date.now() - startedAt;
  options.reporter.success([
    `Run ID       ${artifacts.manifest.runId}`,
    `Provider     ${artifacts.manifest.provider}`,
    `Audience     ${artifacts.manifest.count} personas in ${artifacts.manifest.mode} mode`,
    `Elapsed      ${formatDuration(elapsedMs)}`,
    `Artifacts    ${runDirectory}`,
    `Report       ${path.join(runDirectory, "report", "index.html")}`,
    `Avg Score    ${artifacts.insights.averageReactionScore}`,
    `Top Signal   ${artifacts.insights.topPositives[0]?.label ?? "No positive signal extracted"}`,
    `Top Risk     ${artifacts.insights.topConcerns[0]?.label ?? "No concern extracted"}`,
  ]);
}

async function promptForIdeaText(reporter: ReturnType<typeof createRunReporter>): Promise<string> {
  if (!stdin.isTTY) {
    const chunks: Buffer[] = [];
    for await (const chunk of stdin) {
      chunks.push(Buffer.from(chunk));
    }

    const pipedText = Buffer.concat(chunks).toString("utf8").trim();
    if (pipedText.length === 0) {
      throw new Error("No idea text received from stdin.");
    }

    return pipedText;
  }

  reporter.info([
    "You are now in front of an audience of 100 people.",
    "Pitch your product or idea.",
    "You can give extra context, explain the problem, and include links or source material if you want.",
    "",
  ]);

  const rl = createInterface({
    input: stdin,
    output: stdout,
  });

  try {
    const firstPass = (await rl.question("idea> ")).trim();
    if (firstPass.length > 0) {
      return firstPass;
    }

    throw new Error("Idea input cannot be empty.");
  } finally {
    rl.close();
  }
}
