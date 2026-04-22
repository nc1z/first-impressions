import type { IdeaBrief, PersonaReaction, RunPersona } from "./domain/types.js";

const colors = {
  reset: "\u001b[0m",
  dim: "\u001b[2m",
  bold: "\u001b[1m",
  cyan: "\u001b[36m",
  green: "\u001b[32m",
  yellow: "\u001b[33m",
  red: "\u001b[31m",
  blue: "\u001b[34m",
};

export type RunStage =
  | "input"
  | "summary"
  | "personas"
  | "evaluations"
  | "persist"
  | "report"
  | "done";

export interface RunProgressEvent {
  stage: RunStage;
  elapsedMs: number;
  message: string;
  completed?: number;
  total?: number;
  persona?: RunPersona;
  reaction?: PersonaReaction;
  brief?: IdeaBrief;
}

export function createRunReporter(options: { stream?: NodeJS.WriteStream } = {}) {
  const stream = options.stream ?? process.stdout;
  const interactive = Boolean(stream.isTTY);
  let spinner: Spinner | undefined;
  let lastPrintedLength = 0;
  let liveSamples = 0;

  const writeLine = (line = ""): void => {
    if (interactive && lastPrintedLength > 0) {
      stream.write("\r");
      stream.write(" ".repeat(lastPrintedLength));
      stream.write("\r");
      lastPrintedLength = 0;
    }

    stream.write(`${line}\n`);
  };

  const startStage = (label: string, detail: string, elapsed?: string): void => {
    stopSpinner();
    if (!interactive) {
      writeLine(`[${elapsed ?? "0ms"}] ${label}: ${detail}`);
      return;
    }

    spinner = new Spinner({
      stream,
      text: `${paint("cyan", label)} ${paint("dim", detail)}`,
      onFrame: (length) => {
        lastPrintedLength = length;
      },
    });
    spinner.start();
  };

  const updateStage = (label: string, detail: string): void => {
    if (spinner) {
      spinner.setText(`${paint("cyan", label)} ${paint("dim", detail)}`);
      return;
    }

    writeLine(`${label} ${detail}`);
  };

  const stopSpinner = (finalLine?: string): void => {
    if (!spinner) {
      if (finalLine) {
        writeLine(finalLine);
      }
      return;
    }

    spinner.stop();
    spinner = undefined;
    lastPrintedLength = 0;
    if (finalLine) {
      writeLine(finalLine);
    }
  };

  return {
    intro(): void {
      writeLine(paint("blue", asciiBanner()));
      writeLine(`${paint("dim", "Fast AI audience simulation for first impressions.")}`);
      writeLine();
    },
    onProgress(event: RunProgressEvent): void {
      const elapsed = formatDuration(event.elapsedMs);

      if (event.stage === "input") {
        startStage("Input", `${event.message} ${paint("dim", `(${elapsed})`)}`, elapsed);
        return;
      }

      if (event.stage === "summary") {
        if (event.brief) {
          stopSpinner(`${paint("green", "[ok]")} Summary ready ${paint("dim", `(${elapsed})`)}`);
          writeLine(`${paint("bold", event.brief.title)}`);
          writeLine(`${paint("dim", event.brief.oneLineSummary)}`);
        } else {
          updateStage("Summary", `${event.message} ${paint("dim", `(${elapsed})`)}`);
        }
        return;
      }

      if (event.stage === "personas") {
        if (typeof event.completed === "number" && typeof event.total === "number" && event.completed === event.total) {
          stopSpinner(
            `${paint("green", "[ok]")} Personas selected ${paint("dim", `${event.completed}/${event.total} in ${elapsed}`)}`,
          );
        } else {
          updateStage("Audience", `${event.message} ${paint("dim", `(${elapsed})`)}`);
        }
        return;
      }

      if (event.stage === "evaluations") {
        const completed = event.completed ?? 0;
        const total = event.total ?? 0;
        updateStage("Evaluating", `${completed}/${total} personas ${paint("dim", `(${elapsed})`)}`);
        if (event.persona && event.reaction && liveSamples < 10) {
          liveSamples += 1;
          writeLine(formatReactionSample(event.persona, event.reaction, elapsed));
        }
        return;
      }

      if (event.stage === "persist") {
        startStage("Writing", `${event.message} ${paint("dim", `(${elapsed})`)}`, elapsed);
        return;
      }

      if (event.stage === "report") {
        startStage("Report", `${event.message} ${paint("dim", `(${elapsed})`)}`, elapsed);
        return;
      }

      if (event.stage === "done") {
        stopSpinner(`${paint("green", "[done]")} Run finished ${paint("dim", `(${elapsed})`)}`);
      }
    },
    success(lines: string[]): void {
      stopSpinner();
      writeLine(paint("green", asciiRule("=")));
      for (const line of lines) {
        writeLine(line);
      }
      writeLine(paint("green", asciiRule("=")));
    },
    info(lines: string[]): void {
      stopSpinner();
      for (const line of lines) {
        writeLine(line);
      }
    },
    failure(message: string): void {
      stopSpinner();
      writeLine(`${paint("red", "[error]")} ${message}`);
    },
  };
}

export function formatDuration(elapsedMs: number): string {
  if (elapsedMs < 1000) {
    return `${elapsedMs}ms`;
  }

  const seconds = elapsedMs / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(seconds >= 10 ? 1 : 2)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}m ${String(remainingSeconds).padStart(2, "0")}s`;
}

export function asciiBanner(): string {
  return [
    "  __| _ _|  _ \\   __| __ __|   _ _|   \\  |  _ \\ _ \\  __|   __|   __| _ _|   _ \\   \\ |   __|",
    "  _|    |     / \\__ \\    |       |   |\\/ |  __/   /  _|  \\__ \\ \\__ \\   |   (   | .  | \\__ \\",
    " _|   ___| _|_\\ ____/   _|     ___| _|  _| _|  _|_\\ ___| ____/ ____/ ___| \\___/ _|\\_| ____/",
    "                                                                                             ",
  ].join("\n");
}

function asciiRule(character: string): string {
  return character.repeat(78);
}

function formatReactionSample(persona: RunPersona, reaction: PersonaReaction, elapsed: string): string {
  const scoreColor = reaction.error ? "red" : reaction.reactionScore >= 70 ? "green" : reaction.reactionScore >= 45 ? "yellow" : "red";
  const score = reaction.error ? "ERR" : `${reaction.reactionScore}`.padStart(3, " ");
  const blurb = truncate(reaction.shortReaction || reaction.mainConcern, 88);

  return [
    paint("dim", `[${elapsed}]`),
    paint("bold", persona.seed.name),
    paint("dim", `${persona.seed.ageBand}/${persona.seed.domain}`),
    paint(scoreColor, score),
    blurb,
  ].join("  ");
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}

function paint(color: keyof typeof colors, value: string): string {
  if (!process.stdout.isTTY) {
    return value;
  }

  return `${colors[color]}${value}${colors.reset}`;
}

class Spinner {
  private interval: NodeJS.Timeout | undefined;
  private frameIndex = 0;
  private text: string;

  constructor(
    private readonly options: {
      stream: NodeJS.WriteStream;
      text: string;
      onFrame: (lineLength: number) => void;
    },
  ) {
    this.text = options.text;
  }

  start(): void {
    this.render();
    this.interval = setInterval(() => this.render(), 80);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }

    this.options.stream.write("\r");
  }

  setText(text: string): void {
    this.text = text;
  }

  private render(): void {
    const frames = ["-", "\\", "|", "/"];
    const frame = frames[this.frameIndex % frames.length] as string;
    this.frameIndex += 1;
    const line = `${frame} ${this.text}`;
    this.options.stream.write(`\r${line}`);
    this.options.onFrame(stripAnsi(line).length);
  }
}

function stripAnsi(value: string): string {
  return value.replace(/\u001b\[[0-9;]*m/g, "");
}
