#!/usr/bin/env node

import path from "node:path";

import { Command } from "commander";
import { stat } from "node:fs/promises";

import { loadPersonaCatalog } from "./personas.js";
import { listProviderStatuses } from "./providers/index.js";
import { executeRun } from "./run.js";
import { startStaticServer } from "./server.js";

const program = new Command();

program
  .name("first-impressions")
  .description("CLI market-reaction simulator powered by persona-based AI subagents.")
  .version("0.1.0");

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
    });

    console.log(`Run complete: ${artifacts.manifest.runId}`);
    console.log(`Provider: ${artifacts.manifest.provider}`);
    console.log(`Artifacts: ${runDirectory}`);
    console.log(`Report files: ${path.join(runDirectory, "report")}`);
    console.log(`Average reaction score: ${artifacts.insights.averageReactionScore}`);
  });

const providersCommand = program.command("providers").description("Inspect provider availability.");
providersCommand
  .command("list")
  .description("List available providers.")
  .action(async () => {
    const providers = await listProviderStatuses();

    for (const provider of providers) {
      console.log(`${provider.name}\t${provider.available ? "available" : "missing"}`);
    }
  });

const personasCommand = program.command("personas").description("Inspect the persona catalog.");
personasCommand
  .command("list")
  .description("List persona IDs and summaries.")
  .action(async () => {
    const catalog = await loadPersonaCatalog();

    for (const persona of catalog) {
      console.log(`${persona.id}\t${persona.ageBand}\t${persona.industry}\t${persona.summary}`);
    }
  });

program
  .command("report")
  .description("Serve a generated report for an existing run.")
  .argument("<runId>", "Run ID to serve")
  .option("--output <path>", "Base output directory", path.resolve(process.cwd(), ".first-impressions"))
  .option("--port <number>", "Port to bind to", "0")
  .action(async (runId: string, options) => {
    const reportDirectory = path.resolve(options.output, "runs", runId, "report");
    await stat(path.join(reportDirectory, "index.html"));
    const server = await startStaticServer({
      directory: reportDirectory,
      port: Number(options.port),
    });

    console.log(`Serving report for ${runId}`);
    console.log(server.url);

    process.on("SIGINT", async () => {
      await server.close();
      process.exit(0);
    });
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
