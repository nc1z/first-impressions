#!/usr/bin/env node

import path from "node:path";
import { emitKeypressEvents } from "node:readline";
import type { Key } from "node:readline";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

import { Command } from "commander";
import { stat } from "node:fs/promises";

import { loadPersonaCatalog, personaSetChoices } from "./personas.js";
import { listProviderStatuses } from "./providers/index.js";
import { executeRun } from "./run.js";
import { listAvailableRuns } from "./runs.js";
import { openUrlInBrowser, startStaticServer } from "./server.js";
import { asciiBanner, createRunReporter, formatDuration } from "./terminal.js";

const program = new Command();
let activeReporter: ReturnType<typeof createRunReporter> | undefined;

program
  .name("first-impressions")
  .description("CLI market-reaction simulator powered by persona-based AI subagents.")
  .version("0.1.0")
  .showHelpAfterError()
  .option("--provider <provider>", "Provider to use: codex, claude, copilot", "codex")
  .option("--persona-set <set>", "Persona set to use: general, tech-general", "general")
  .option("--mode <mode>", "Persona distribution mode", "general")
  .option("--count <number>", "Number of personas to evaluate", "100")
  .option("--seed <number>", "Seed for reproducible persona selection")
  .option("--concurrency <number>", "Parallel provider call limit", "10")
  .option("--output <path>", "Base output directory", path.resolve(process.cwd(), ".first-impressions"))
  .option("--no-serve", "Do not start the localhost report server after the run")
  .option("--report-port <number>", "Port to use when auto-serving the report", "0")
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
      "  $ first-impressions --persona-set tech-general",
      '  $ first-impressions run "A browser extension that turns job posts into interview prep"',
      "  $ first-impressions run --file ./idea.txt --provider claude --persona-set tech-general --count 25",
      "  $ first-impressions run --url https://example.com --provider copilot",
      "  $ first-impressions report <run-id>",
    ].join("\n"),
  );

program.action(async (options) => {
  const reporter = createRunReporter();
  activeReporter = reporter;
  reporter.intro();

  const providerSource = program.getOptionValueSource("provider");
  const provider =
    providerSource === "default" && stdin.isTTY
      ? await promptForProvider()
      : (options.provider as "codex" | "claude" | "copilot");
  const personaSetSource = program.getOptionValueSource("personaSet");
  const personaSet =
    personaSetSource === "default" && stdin.isTTY
      ? await promptForPersonaSet()
      : parsePersonaSet(options.personaSet as string);

  const text = await promptForIdeaText(reporter);
  await runSimulation({
    text,
    file: undefined,
    url: undefined,
    provider,
    personaSet,
    mode: options.mode as "general" | "tagged-segment",
    count: Number(options.count),
    seed: options.seed ? Number(options.seed) : undefined,
    concurrency: Number(options.concurrency),
    outputDir: path.resolve(options.output as string),
    serveReport: options.serve as boolean,
    reportPort: Number(options.reportPort),
    reporter,
  });
  activeReporter = undefined;
});

program
  .command("run")
  .description("Run a first-impressions audience simulation non-interactively.")
  .argument("[text]", "Direct idea text input")
  .option("--file <path>", "Read idea input from a local file")
  .option("--url <url>", "Read idea input from a URL")
  .option("--provider <provider>", "Provider to use: codex, claude, copilot", "codex")
  .option("--persona-set <set>", "Persona set to use: general, tech-general", "general")
  .option("--mode <mode>", "Persona distribution mode", "general")
  .option("--count <number>", "Number of personas to evaluate", "100")
  .option("--seed <number>", "Seed for reproducible persona selection")
  .option("--concurrency <number>", "Parallel provider call limit", "10")
  .option("--output <path>", "Base output directory", path.resolve(process.cwd(), ".first-impressions"))
  .option("--no-serve", "Do not start the localhost report server after the run")
  .option("--report-port <number>", "Port to use when auto-serving the report", "0")
  .action(async (text: string | undefined, _options, command: Command) => {
    const options = command.optsWithGlobals();
    const reporter = createRunReporter();
    activeReporter = reporter;
    reporter.intro();
    await runSimulation({
      text,
      file: options.file as string | undefined,
      url: options.url as string | undefined,
      provider: options.provider as "codex" | "claude" | "copilot",
      personaSet: parsePersonaSet(options.personaSet as string),
      mode: options.mode as "general" | "tagged-segment",
      count: Number(options.count),
      seed: options.seed ? Number(options.seed) : undefined,
      concurrency: Number(options.concurrency),
      outputDir: path.resolve(options.output),
      serveReport: options.serve as boolean,
      reportPort: Number(options.reportPort),
      reporter,
    });
    activeReporter = undefined;
  });

const providersCommand = program.command("providers").description("Inspect provider availability.");
providersCommand
  .command("list")
  .description("List available providers.")
  .action(async () => {
    const reporter = createRunReporter();
    activeReporter = reporter;
    reporter.info([asciiBanner(), "Checking provider availability...\n"]);
    const providers = await listProviderStatuses();

    for (const provider of providers) {
      console.log(`${provider.available ? "[ok]" : "[--]"} ${provider.name.padEnd(8)} ${provider.available ? "available" : "missing"}`);
    }
    activeReporter = undefined;
  });

const personasCommand = program.command("personas").description("Inspect the persona catalog.");
personasCommand
  .command("list")
  .description("List persona IDs and summaries.")
  .option("--persona-set <set>", "Persona set to inspect: general, tech-general", "general")
  .action(async (options) => {
    const reporter = createRunReporter();
    activeReporter = reporter;
    reporter.info([asciiBanner(), "Persona catalog snapshot:\n"]);
    const personaSet = parsePersonaSet(options.personaSet as string);
    const catalog = await loadPersonaCatalog(personaSet);

    for (const persona of catalog) {
      console.log(
        `${persona.id}  ${persona.ageBand.padEnd(11)}  ${persona.industry.padEnd(22)}  ${persona.summary}`,
      );
    }
    activeReporter = undefined;
  });

program
  .command("report")
  .description("Serve a generated report for an existing run.")
  .argument("[runId]", "Run ID to serve")
  .option("--output <path>", "Base output directory", path.resolve(process.cwd(), ".first-impressions"))
  .option("--port <number>", "Port to bind to", "0")
  .action(async (runId: string | undefined, options) => {
    const reporter = createRunReporter();
    activeReporter = reporter;
    const resolvedRunId = runId ?? (await promptForRunId(path.resolve(options.output)));
    await serveReport({
      runId: resolvedRunId,
      outputDir: path.resolve(options.output),
      port: Number(options.port),
      reporter,
    });
    activeReporter = undefined;
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  (activeReporter ?? createRunReporter()).failure(message);
  process.exitCode = 1;
});

async function runSimulation(options: {
  text?: string | undefined;
  file?: string | undefined;
  url?: string | undefined;
  provider: "codex" | "claude" | "copilot";
  personaSet: "general" | "tech-general";
  mode: "general" | "tagged-segment";
  count: number;
  seed?: number | undefined;
  concurrency: number;
  outputDir: string;
  serveReport: boolean;
  reportPort: number;
  reporter: ReturnType<typeof createRunReporter>;
}): Promise<void> {
  const startedAt = Date.now();
  const { artifacts, runDirectory } = await executeRun({
    text: options.text,
    file: options.file,
    url: options.url,
    provider: options.provider,
    personaSet: options.personaSet,
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
    `Audience     ${artifacts.manifest.count} personas from ${artifacts.manifest.personaSet} set (${artifacts.manifest.mode} mode)`,
    `Elapsed      ${formatDuration(elapsedMs)}`,
    `Artifacts    ${runDirectory}`,
    `Report       ${path.join(runDirectory, "report", "index.html")}`,
    `Avg Score    ${artifacts.insights.averageReactionScore}`,
    `Top Signal   ${artifacts.insights.topPositives[0]?.label ?? "No positive signal extracted"}`,
    `Top Risk     ${artifacts.insights.topConcerns[0]?.label ?? "No concern extracted"}`,
  ]);

  if (options.serveReport) {
    await serveReport({
      runId: artifacts.manifest.runId,
      outputDir: options.outputDir,
      port: options.reportPort,
      reporter: options.reporter,
    });
  }
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

async function serveReport(options: {
  runId: string;
  outputDir: string;
  port: number;
  reporter: ReturnType<typeof createRunReporter>;
}): Promise<void> {
  const reportDirectory = path.resolve(options.outputDir, "runs", options.runId, "report");
  await stat(path.join(reportDirectory, "index.html"));
  const server = await startStaticServer({
    directory: reportDirectory,
    port: options.port,
  });
  const opened = await openUrlInBrowser(server.url);

  options.reporter.reportServer([
    `Serving report for ${options.runId}`,
    `URL          ${server.url}`,
    opened ? "Browser      opened automatically" : "Browser      could not auto-open; use the URL above",
    "Keep this process running while you browse the report.",
    "Press Ctrl+C to stop the local server.",
  ]);

  await new Promise<void>((resolve, reject) => {
    process.once("SIGINT", () => {
      void server.close().then(resolve).catch(reject);
    });
  });
}

async function promptForProvider(): Promise<"codex" | "claude" | "copilot"> {
  const providers: Array<{ id: "codex" | "claude" | "copilot"; label: string }> = [
    { id: "codex", label: "codex      OpenAI Codex" },
    { id: "claude", label: "claude     Anthropic Claude" },
    { id: "copilot", label: "copilot    GitHub Copilot" },
  ];

  console.log("Choose a provider:\n");

  const renderList = (selected: number, firstRender: boolean) => {
    if (!firstRender) {
      stdout.write(`\x1b[${providers.length + 1}A`);
    }
    for (let i = 0; i < providers.length; i++) {
      const p = providers[i]!;
      if (i === selected) {
        stdout.write(`\r\x1b[K  \x1b[36m\x1b[1m> ${p.label}\x1b[0m\n`);
      } else {
        stdout.write(`\r\x1b[K    ${p.label}\n`);
      }
    }
    stdout.write(`\r\x1b[K\x1b[2m  ↑↓ navigate  Enter select\x1b[0m\n`);
  };

  return new Promise<"codex" | "claude" | "copilot">((resolve, reject) => {
    let selected = 0;
    renderList(selected, true);

    emitKeypressEvents(stdin);
    stdin.setRawMode(true);
    stdin.resume();

    const cleanup = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("keypress", onKeypress);
    };

    const onKeypress = (_str: string, key: Key) => {
      if (key.name === "up") {
        selected = Math.max(0, selected - 1);
        renderList(selected, false);
      } else if (key.name === "down") {
        selected = Math.min(providers.length - 1, selected + 1);
        renderList(selected, false);
      } else if (key.name === "return") {
        cleanup();
        stdout.write("\n");
        resolve(providers[selected]!.id);
      } else if (key.ctrl && key.name === "c") {
        cleanup();
        stdout.write("\n");
        reject(new Error("Cancelled."));
      }
    };

    stdin.on("keypress", onKeypress);
  });
}

async function promptForPersonaSet(): Promise<"general" | "tech-general"> {
  console.log("Choose an audience persona set:\n");

  const renderList = (selected: number, firstRender: boolean) => {
    if (!firstRender) {
      stdout.write(`\x1b[${personaSetChoices.length + 1}A`);
    }
    for (let i = 0; i < personaSetChoices.length; i++) {
      const set = personaSetChoices[i]!;
      const line = `${set.label.padEnd(13)} ${set.description}`;
      if (i === selected) {
        stdout.write(`\r\x1b[K  \x1b[36m\x1b[1m> ${line}\x1b[0m\n`);
      } else {
        stdout.write(`\r\x1b[K    ${line}\n`);
      }
    }
    stdout.write(`\r\x1b[K\x1b[2m  ↑↓ navigate  Enter select  (default: general)\x1b[0m\n`);
  };

  return new Promise<"general" | "tech-general">((resolve, reject) => {
    let selected = personaSetChoices.findIndex((choice) => choice.id === "general");
    renderList(selected, true);

    emitKeypressEvents(stdin);
    stdin.setRawMode(true);
    stdin.resume();

    const cleanup = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("keypress", onKeypress);
    };

    const onKeypress = (_str: string, key: Key) => {
      if (key.name === "up") {
        selected = Math.max(0, selected - 1);
        renderList(selected, false);
      } else if (key.name === "down") {
        selected = Math.min(personaSetChoices.length - 1, selected + 1);
        renderList(selected, false);
      } else if (key.name === "return") {
        cleanup();
        stdout.write("\n");
        resolve(personaSetChoices[selected]!.id);
      } else if (key.ctrl && key.name === "c") {
        cleanup();
        stdout.write("\n");
        reject(new Error("Cancelled."));
      }
    };

    stdin.on("keypress", onKeypress);
  });
}

async function promptForRunId(outputDir: string): Promise<string> {
  const runs = await listAvailableRuns(outputDir);
  if (runs.length === 0) {
    throw new Error(`No reports found in ${path.resolve(outputDir, "runs")}.`);
  }

  if (!stdin.isTTY) {
    throw new Error("Run ID is required when stdin is not interactive.");
  }

  console.log(asciiBanner());
  console.log("Choose a report to serve:\n");

  const renderList = (selected: number, firstRender: boolean) => {
    if (!firstRender) {
      stdout.write(`\x1b[${runs.length + 1}A`);
    }
    for (let i = 0; i < runs.length; i++) {
      const run = runs[i]!;
      const timestamp = new Date(run.createdAt).toLocaleString();
      const label = `${run.runId}  ${run.provider}  ${run.count} personas  ${timestamp}`;
      if (i === selected) {
        stdout.write(`\r\x1b[K  \x1b[36m\x1b[1m> ${label}\x1b[0m\n`);
      } else {
        stdout.write(`\r\x1b[K    ${label}\n`);
      }
    }
    stdout.write(`\r\x1b[K\x1b[2m  ↑↓ navigate  Enter select\x1b[0m\n`);
  };

  return new Promise<string>((resolve, reject) => {
    let selected = 0;
    renderList(selected, true);

    emitKeypressEvents(stdin);
    stdin.setRawMode(true);
    stdin.resume();

    const cleanup = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("keypress", onKeypress);
    };

    const onKeypress = (_str: string, key: Key) => {
      if (key.name === "up") {
        selected = Math.max(0, selected - 1);
        renderList(selected, false);
      } else if (key.name === "down") {
        selected = Math.min(runs.length - 1, selected + 1);
        renderList(selected, false);
      } else if (key.name === "return") {
        cleanup();
        stdout.write("\n");
        resolve(runs[selected]!.runId);
      } else if (key.ctrl && key.name === "c") {
        cleanup();
        stdout.write("\n");
        reject(new Error("Cancelled."));
      }
    };

    stdin.on("keypress", onKeypress);
  });
}

function parsePersonaSet(value: string): "general" | "tech-general" {
  const match = personaSetChoices.find((choice) => choice.id === value);
  if (!match) {
    throw new Error(`Unsupported persona set "${value}". Use one of: ${personaSetChoices.map((choice) => choice.id).join(", ")}`);
  }

  return match.id;
}
