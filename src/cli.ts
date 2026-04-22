#!/usr/bin/env node

import path from "node:path";

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
  .addHelpText(
    "beforeAll",
    `${asciiBanner()}\nFast AI audience simulation for startup ideas.\n`,
  )
  .addHelpText(
    "afterAll",
    [
      "",
      "Examples:",
      '  $ first-impressions run "A browser extension that turns job posts into interview prep"',
      "  $ first-impressions run --file ./idea.txt --provider claude --count 25",
      "  $ first-impressions run --url https://example.com --provider copilot",
      "  $ first-impressions report <run-id>",
    ].join("\n"),
  );

program
  .command("run")
  .description("Run a first-impressions audience simulation.")
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
    const startedAt = Date.now();
    reporter.intro();

    const { artifacts, runDirectory } = await executeRun({
      text,
      file: options.file as string | undefined,
      url: options.url as string | undefined,
      provider: options.provider,
      mode: options.mode,
      count: Number(options.count),
      seed: options.seed ? Number(options.seed) : undefined,
      concurrency: Number(options.concurrency),
      outputDir: path.resolve(options.output),
      onProgress: (event) => {
        reporter.onProgress(event);
      },
    });

    const elapsedMs = Date.now() - startedAt;
    reporter.success([
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
