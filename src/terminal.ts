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

  let spinnerInterval: ReturnType<typeof setInterval> | null = null;
  let spinnerFrame = 0;
  let spinnerLabel = "";
  const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

  const writeLine = (line = ""): void => {
    stream.write(`${line}\n`);
  };

  const startStage = (label: string, detail: string, elapsed?: string): void => {
    writeLine(`[${elapsed ?? "0ms"}] ${label}: ${detail}`);
  };

  const updateStage = (label: string, detail: string): void => {
    writeLine(`${label} ${detail}`);
  };

  const startSpinner = (label: string): void => {
    spinnerLabel = label;
    if (!spinnerInterval && stream.isTTY) {
      spinnerInterval = setInterval(() => {
        const frame = spinnerFrames[spinnerFrame % spinnerFrames.length] ?? "⠋";
        stream.write(`\r${paint("cyan", frame)} ${spinnerLabel}`);
        spinnerFrame++;
      }, 80);
    }
  };

  const stopSpinner = (finalLine?: string): void => {
    if (spinnerInterval) {
      clearInterval(spinnerInterval);
      spinnerInterval = null;
      stream.write("\r\x1b[K");
    }
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
          spinnerLabel = `${event.message} ${paint("dim", `(${elapsed})`)}`;
          startSpinner(spinnerLabel);
          if (!stream.isTTY) {
            updateStage("Summary", `${event.message} ${paint("dim", `(${elapsed})`)}`);
          }
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
        const baseLine = `Evaluating ${completed}/${total} personas ${paint("dim", `(${elapsed})`)}`;
        if (event.persona && event.reaction) {
          writeLine(`${baseLine} ${paint("dim", "-")} ${formatReactionSample(event.persona, event.reaction)}`);
        } else {
          updateStage("Evaluating", `${completed}/${total} personas ${paint("dim", `(${elapsed})`)}`);
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
    reportServer(lines: string[]): void {
      startStage("Report", `${paint("dim", "Serving localhost report")}`);
      writeLine(paint("green", asciiRule("=")));
      for (const line of lines) {
        writeLine(line);
      }
      writeLine(paint("green", asciiRule("=")));
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

function formatReactionSample(persona: RunPersona, reaction: PersonaReaction): string {
  const scoreColor = reaction.error ? "red" : reaction.reactionScore >= 70 ? "green" : reaction.reactionScore >= 45 ? "yellow" : "red";
  const score = reaction.error ? "ERR" : `${reaction.reactionScore}`.padStart(3, " ");
  const blurb = truncate(reaction.shortReaction || reaction.mainConcern, 88);

  return [
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
