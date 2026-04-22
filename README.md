# first-impressions

`first-impressions` is a TypeScript CLI for fast audience simulation.

You give it an idea as text, a file, or a URL. The CLI first normalizes that input into a concise structured idea brief. It then runs a large batch of provider-backed persona evaluations and produces a local report with highlights, filters, and charts.

## Planned Workflow

1. Ingest text, files, or URLs.
2. Summarize the idea into a normalized brief.
3. Select 100 personas from a curated seed catalog with controlled randomization.
4. Run fast first-impression evaluations through a provider adapter.
5. Aggregate the results into insights.
6. Persist run artifacts under a gitignored output folder.
7. Serve a localhost report for inspection.

## Provider Assumptions

The CLI is designed to work with installed provider CLIs:

- `codex`
- `claude`
- `copilot`

They must already be installed and authenticated in the local environment.

## Package Management

This repository is configured for `pnpm`, with a 7-day `minimumReleaseAge` set in `pnpm-workspace.yaml`.

## Commands

- `pnpm dev run "Your idea here" --provider codex`
- `pnpm dev run --file ./idea.txt --provider claude`
- `pnpm dev run --url https://example.com --provider copilot`
- `pnpm dev providers list`
- `pnpm dev personas list`
- `pnpm dev report <run-id>`

For the built CLI:

- `pnpm build`
- `pnpm start -- run "Your idea here" --provider claude`

Run artifacts are written to `./.first-impressions/runs/<run-id>/`.

## Notes

- `claude` and `copilot` were validated end-to-end from this repo.
- `codex` is supported by the adapter layer, but it expects a writable Codex home/session area in the runtime environment.

## Scripts

- `pnpm build`
- `pnpm dev`
- `pnpm lint`
- `pnpm start`
- `pnpm test`
