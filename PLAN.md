# First Impressions v1 Plan

## Summary
Build `first-impressions` as a TypeScript monorepo-style CLI application that:
1. accepts either freeform idea text or a URL,
2. produces one normalized structured idea brief via a single provider adapter call,
3. runs 100 fast persona-based "first impression" evaluations through one selected provider for that run,
4. aggregates the results into structured insights,
5. writes all artifacts to a gitignored local output/temp area,
6. starts a lightweight localhost report server and opens an interactive browser report.

The default product shape is:
- TypeScript implementation
- single provider per run
- curated persona catalog with controlled randomization
- seeded randomness for reproducibility
- embedded local web server for the report

## Implementation Changes

### Architecture
- Use a small workspace with packages/modules for `cli`, `core`, `providers`, `personas`, and `reporting`.
- Define provider adapters behind a shared interface so `codex exec`, `claude -p`, and `copilot -p` are interchangeable.
- Keep the execution pipeline explicit:
  `input -> ingestion -> normalization brief -> persona selection/overlay -> parallel evaluations -> aggregation -> persisted artifacts -> localhost report`
- Add bounded concurrency controls so 100 evaluations run in parallel batches rather than unbounded fan-out.

### Public Interfaces and Types
- CLI commands:
  - `first-impressions run <text-or-url>`
  - `first-impressions run --file <path>`
  - `first-impressions run --url <url>`
  - `first-impressions providers list`
  - `first-impressions personas list`
  - `first-impressions report <run-id>`
- Core config surface:
  - `--provider <codex|claude|copilot>`
  - `--mode <general|tagged-segment>`
  - `--count <n>` default `100`
  - `--seed <value>` optional, auto-generated if omitted
  - `--concurrency <n>` with safe default
  - `--output <dir>` default to local gitignored output area
- Provider adapter contract:
  - `summarizeIdea(input) -> IdeaBrief`
  - `evaluatePersona({ brief, persona, promptTemplate }) -> PersonaReaction`
- Main data types:
  - `IdeaInput`
  - `IdeaBrief`
  - `PersonaSeed`
  - `PersonaOverlay`
  - `RunPersona`
  - `PersonaReaction`
  - `AggregatedInsights`
  - `RunManifest`

### Input and Summary Stage
- Support raw text directly and URL input via fetch + content extraction with conservative cleanup.
- Normalize both paths into one `IdeaBrief` JSON shape containing concise fields such as:
  - title
  - one-line summary
  - target user
  - problem solved
  - proposed value
  - assumptions/unknowns
  - possible concerns
- Keep the summary step single-pass and fast; the 100 persona runs consume only the structured brief, not arbitrary raw input.

### Persona System
- Store a curated catalog of persona seed JSON files with metadata tags such as:
  - `industry`
  - `domain`
  - `role_family`
  - `age_band`
  - `region_group`
  - `tech_familiarity`
  - `spending_style`
  - `decision_style`
  - `life_stage`
- Use a distribution engine to assemble the run population from the catalog plus overlays.
- Default `general` mode should enforce weighted distribution targets rather than pure random sampling.
- Bias toward adult and young-adult populations, with smaller representation for children and seniors, and keep domain/industry spread broad enough to avoid absurd clustering.
- Avoid religion entirely.
- For sex/gender handling, keep the v1 model minimal and neutral:
  - use optional `sex` metadata only for distribution realism, not as an analysis dimension
  - allowed values: `female`, `male`, `unspecified`
  - no downstream reporting should frame conclusions around sex
- Random overlays may vary tone, communication style, skepticism, budget sensitivity, and familiarity level, but must stay inside guardrails so personas remain plausible.
- Persist the exact selected personas and overlays per run so the same seed reproduces the same population.

### Provider Execution
- Implement one adapter per provider CLI:
  - command construction
  - stdin/argument strategy
  - timeout/retry behavior
  - output parsing into structured JSON
- Use short prompts with a fixed schema so each persona returns a compact first-impression payload, for example:
  - reaction score
  - interest level
  - clarity level
  - trust level
  - likely audience fit
  - main positive
  - main concern
  - would-share / would-try / would-pay style signals
  - short freeform reaction
- Require JSON output from adapters so aggregation is deterministic.
- Add retry-once behavior for malformed output, then mark the persona result as failed without stopping the whole run.
- Aggregate partial failures and expose them in the report.

### Aggregation and Reporting
- Build an analysis layer that derives:
  - overall sentiment and interest distributions
  - recurring positives
  - recurring objections
  - segment-level differences by metadata tags
  - "who likes this most / least"
  - notable contradictions and polarized reactions
- Persist artifacts under a gitignored local folder such as `./.first-impressions/`:
  - `runs/<run-id>/manifest.json`
  - `idea-brief.json`
  - `personas.json`
  - `responses.jsonl`
  - `insights.json`
  - generated report assets
- Start a lightweight local server for `first-impressions report <run-id>` and auto-open the browser to `http://localhost:<port>`.
- Report page should include:
  - headline summary
  - key highlights
  - persona reaction table
  - filterable charts by age/domain/role/etc.
  - strongest positives and objections
  - outlier reactions
  - raw response drill-down

### Repo/Foundation
- Initialize with:
  - TypeScript toolchain
  - package manager and scripts
  - lint/typecheck/test setup
  - `.gitignore` covering output/temp artifacts
  - sample env/config for provider CLI availability
  - seed persona dataset and prompt templates
- Document required external dependencies clearly: the provider CLIs must already be installed and authenticated.

## Test Plan
- CLI parsing for text, file, and URL inputs.
- URL ingestion fallback behavior when a page cannot be fetched or parsed cleanly.
- `IdeaBrief` normalization contract tests.
- Persona distribution tests:
  - total count is correct
  - weighted age mix stays within configured bounds
  - domain spread is not pathologically concentrated
  - seeded runs are reproducible
- Adapter contract tests using mocked provider outputs.
- Malformed/timeout provider response handling with partial-failure aggregation.
- End-to-end dry tests for:
  - one successful run with mocked provider adapter
  - report artifact generation
  - report server serving a chosen run
- Snapshot or schema validation for persisted JSON artifacts.
- Frontend report tests for filters, charts, empty states, and partial-failure display.

## Assumptions and Defaults
- v1 uses one provider per run; mixed-provider execution is deferred but kept possible by the adapter design.
- The primary mode is `general`; future audience presets can be added as tagged distributions over the same persona catalog.
- Persona realism is achieved through curated seeds plus overlays, not by generating all 100 personas from scratch every run.
- The tool is for directional market-reaction simulation, not statistically valid survey research.
- Output storage defaults to a local gitignored project folder rather than system temp so reports remain inspectable after the run.
- Browser auto-open is best effort; if it fails, the CLI prints the localhost URL and run path.
