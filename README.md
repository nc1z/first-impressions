# first-impressions

Give an idea to `first-impressions` and get back a simulated audience reaction across 100 diverse personas.

You pass in text, a file, or a URL. The CLI summarizes your idea into a structured brief, runs it past 100 diverse perspectives from a curated set of personas, and generates a local report with sentiment breakdowns, highlights, and filters.

## Getting started

Install dependencies:

```sh
pnpm install
```

Run it:

```sh
pnpm fi
```

You will see:

```text
You are now in front of an audience of 100 people.
Share your project or idea.
idea>
```

For scripted or explicit-input runs:

```sh
pnpm fi run "Your idea here" --provider claude
pnpm fi run --file ./idea.txt --provider claude
pnpm fi run --url https://example.com --provider claude
```

Open a report from a previous run:

```sh
pnpm fi report <run-id>
```

Other commands:

```sh
pnpm fi providers list
pnpm fi personas list
```

## Requirements

The CLI calls out to an AI provider CLI that must already be installed and authenticated in your environment. Supported providers: `claude`, `copilot`, `codex`.

## Options

| Flag | Default | Description |
|---|---|---|
| `--provider` | — | Which provider CLI to use |
| `--count` | `100` | Number of personas to run |
| `--seed` | auto | Seed for reproducible runs |
| `--concurrency` | auto | Max parallel evaluations |
| `--output` | `.first-impressions/` | Where to write run artifacts |

Run artifacts are written to `.first-impressions/runs/<run-id>/`.

## Scripts

```sh
pnpm fi        # run the CLI (no build needed)
pnpm build     # compile to dist/
pnpm start     # run compiled build
pnpm test      # run tests
pnpm lint      # typecheck
```
