import path from "node:path";

import type { RunArtifacts } from "./domain/types.js";
import { ensureDir } from "./utils/fs.js";
import { writeFile } from "node:fs/promises";

export async function generateReport(options: { runDirectory: string; artifacts: RunArtifacts }): Promise<void> {
  const reportDirectory = path.join(options.runDirectory, "report");
  await ensureDir(reportDirectory);

  const html = createReportHtml(options.artifacts);
  await writeFile(path.join(reportDirectory, "index.html"), html, "utf8");
}

function createReportHtml(artifacts: RunArtifacts): string {
  const payload = JSON.stringify(artifacts).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>First Impressions Report</title>
    <style>
      :root {
        --bg: #f5efe5;
        --panel: rgba(255, 252, 246, 0.9);
        --text: #1f2a1f;
        --muted: #5e6a61;
        --accent: #19647e;
        --accent-soft: #d9eef4;
        --warn: #b85c38;
        --good: #2b7a4b;
        --line: rgba(31, 42, 31, 0.12);
      }

      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Iowan Old Style", "Palatino Linotype", serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, rgba(25, 100, 126, 0.14), transparent 30%),
          radial-gradient(circle at top right, rgba(184, 92, 56, 0.14), transparent 24%),
          linear-gradient(180deg, #f8f3eb 0%, var(--bg) 100%);
      }

      main {
        max-width: 1240px;
        margin: 0 auto;
        padding: 32px 20px 64px;
      }

      .hero {
        display: grid;
        gap: 24px;
        grid-template-columns: 1.2fr 0.8fr;
        margin-bottom: 24px;
      }

      .panel {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 24px;
        padding: 24px;
        box-shadow: 0 12px 40px rgba(31, 42, 31, 0.06);
        backdrop-filter: blur(10px);
      }

      .eyebrow {
        margin: 0 0 8px;
        color: var(--muted);
        font: 600 0.75rem/1.2 ui-monospace, "SFMono-Regular", monospace;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      h1, h2, h3, p {
        margin-top: 0;
      }

      h1 {
        font-size: clamp(2.2rem, 5vw, 4rem);
        line-height: 0.95;
        margin-bottom: 16px;
      }

      .summary {
        color: var(--muted);
        font-size: 1.05rem;
        line-height: 1.5;
      }

      .kpis, .breakdowns, .feedback-grid {
        display: grid;
        gap: 16px;
      }

      .kpis {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        margin-bottom: 24px;
      }

      .metric {
        background: rgba(255, 255, 255, 0.6);
        border-radius: 18px;
        padding: 18px;
        border: 1px solid var(--line);
      }

      .metric strong {
        display: block;
        font-size: 2rem;
        margin-top: 6px;
      }

      .breakdowns {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        margin-bottom: 24px;
      }

      .bars {
        display: grid;
        gap: 12px;
      }

      .bar-row {
        display: grid;
        gap: 8px;
      }

      .bar-label {
        display: flex;
        justify-content: space-between;
        font-size: 0.92rem;
      }

      .bar-track {
        height: 12px;
        border-radius: 999px;
        overflow: hidden;
        background: rgba(25, 100, 126, 0.12);
      }

      .bar-fill {
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, var(--accent), #4da1a9);
      }

      .feedback-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        margin-bottom: 24px;
      }

      ul {
        margin: 0;
        padding-left: 18px;
      }

      .controls {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 16px;
      }

      select {
        border-radius: 999px;
        border: 1px solid var(--line);
        padding: 10px 14px;
        background: rgba(255, 255, 255, 0.85);
        color: var(--text);
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.94rem;
      }

      th, td {
        text-align: left;
        padding: 12px 10px;
        border-bottom: 1px solid var(--line);
        vertical-align: top;
      }

      tbody tr:hover {
        background: rgba(25, 100, 126, 0.04);
      }

      .pill {
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        padding: 4px 10px;
        font-size: 0.75rem;
        background: var(--accent-soft);
        color: var(--accent);
      }

      .stack {
        display: grid;
        gap: 16px;
      }

      @media (max-width: 900px) {
        .hero, .kpis, .breakdowns, .feedback-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <article class="panel">
          <p class="eyebrow">First Impressions</p>
          <h1 id="title"></h1>
          <p class="summary" id="summary"></p>
          <div class="stack">
            <div>
              <p class="eyebrow">Target User</p>
              <p id="target-user"></p>
            </div>
            <div>
              <p class="eyebrow">Problem / Value</p>
              <p id="problem-value"></p>
            </div>
          </div>
        </article>
        <aside class="panel">
          <p class="eyebrow">Run Metadata</p>
          <div class="stack" id="metadata"></div>
        </aside>
      </section>

      <section class="kpis">
        <article class="metric"><span>Average reaction</span><strong id="avg-reaction"></strong></article>
        <article class="metric"><span>Average interest</span><strong id="avg-interest"></strong></article>
        <article class="metric"><span>Average clarity</span><strong id="avg-clarity"></strong></article>
        <article class="metric"><span>Average trust</span><strong id="avg-trust"></strong></article>
      </section>

      <section class="breakdowns">
        <article class="panel">
          <p class="eyebrow">Age Mix</p>
          <div class="bars" id="age-breakdown"></div>
        </article>
        <article class="panel">
          <p class="eyebrow">Top Domains</p>
          <div class="bars" id="domain-breakdown"></div>
        </article>
      </section>

      <section class="feedback-grid">
        <article class="panel">
          <p class="eyebrow">Recurring Positives</p>
          <ul id="positives"></ul>
        </article>
        <article class="panel">
          <p class="eyebrow">Recurring Concerns</p>
          <ul id="concerns"></ul>
        </article>
      </section>

      <section class="feedback-grid">
        <article class="panel">
          <p class="eyebrow">Strongest Supporters</p>
          <ul id="supporters"></ul>
        </article>
        <article class="panel">
          <p class="eyebrow">Strongest Skeptics</p>
          <ul id="skeptics"></ul>
        </article>
      </section>

      <section class="panel">
        <p class="eyebrow">Persona Responses</p>
        <div class="controls">
          <select id="age-filter">
            <option value="all">All ages</option>
          </select>
          <select id="domain-filter">
            <option value="all">All domains</option>
          </select>
        </div>
        <table>
          <thead>
            <tr>
              <th>Persona</th>
              <th>Reaction</th>
              <th>Positive</th>
              <th>Concern</th>
              <th>Short Reaction</th>
            </tr>
          </thead>
          <tbody id="responses"></tbody>
        </table>
      </section>
    </main>

    <script id="run-data" type="application/json">${payload}</script>
    <script>
      const data = JSON.parse(document.getElementById("run-data").textContent);
      const personaById = new Map(data.personas.map((persona) => [persona.seed.id, persona]));

      document.getElementById("title").textContent = data.brief.title;
      document.getElementById("summary").textContent = data.brief.oneLineSummary;
      document.getElementById("target-user").textContent = data.brief.targetUser;
      document.getElementById("problem-value").textContent = data.brief.problemSolved + " " + data.brief.proposedValue;

      const metadataEntries = [
        ["Provider", data.manifest.provider],
        ["Run ID", data.manifest.runId],
        ["Personas", String(data.manifest.count)],
        ["Seed", String(data.manifest.seed)],
        ["Generated", new Date(data.manifest.createdAt).toLocaleString()],
      ];
      document.getElementById("metadata").innerHTML = metadataEntries.map(([label, value]) => \`<div><p class="eyebrow">\${label}</p><p>\${value}</p></div>\`).join("");

      document.getElementById("avg-reaction").textContent = String(data.insights.averageReactionScore);
      document.getElementById("avg-interest").textContent = String(data.insights.averageInterestLevel);
      document.getElementById("avg-clarity").textContent = String(data.insights.averageClarityLevel);
      document.getElementById("avg-trust").textContent = String(data.insights.averageTrustLevel);

      function renderBars(targetId, items, formatter) {
        const max = Math.max(...items.map((item) => item.count), 1);
        document.getElementById(targetId).innerHTML = items.map((item) => \`
          <div class="bar-row">
            <div class="bar-label">
              <span>\${item.label}</span>
              <span>\${formatter(item)}</span>
            </div>
            <div class="bar-track"><div class="bar-fill" style="width: \${(item.count / max) * 100}%"></div></div>
          </div>
        \`).join("");
      }

      renderBars("age-breakdown", data.insights.ageBandBreakdown, (item) => \`\${item.count} | score \${item.averageReactionScore}\`);
      renderBars("domain-breakdown", data.insights.domainBreakdown, (item) => \`\${item.count} | score \${item.averageReactionScore}\`);

      function renderList(targetId, items, mapper) {
        document.getElementById(targetId).innerHTML = items.map(mapper).join("");
      }

      renderList("positives", data.insights.topPositives, (item) => \`<li><span class="pill">\${item.count}</span> \${item.label}</li>\`);
      renderList("concerns", data.insights.topConcerns, (item) => \`<li><span class="pill">\${item.count}</span> \${item.label}</li>\`);
      renderList("supporters", data.insights.strongestSupporters, (item) => \`<li><strong>\${item.personaId}</strong> (\${item.score})<br />\${item.summary}</li>\`);
      renderList("skeptics", data.insights.strongestSkeptics, (item) => \`<li><strong>\${item.personaId}</strong> (\${item.score})<br />\${item.summary}</li>\`);

      const ageFilter = document.getElementById("age-filter");
      const domainFilter = document.getElementById("domain-filter");
      const ages = [...new Set(data.personas.map((persona) => persona.seed.ageBand))].sort();
      const domains = [...new Set(data.personas.map((persona) => persona.seed.domain))].sort();
      ageFilter.innerHTML += ages.map((value) => \`<option value="\${value}">\${value}</option>\`).join("");
      domainFilter.innerHTML += domains.map((value) => \`<option value="\${value}">\${value}</option>\`).join("");

      function renderResponses() {
        const age = ageFilter.value;
        const domain = domainFilter.value;
        const rows = data.responses.filter((response) => {
          const persona = personaById.get(response.personaId);
          if (!persona) return false;
          if (age !== "all" && persona.seed.ageBand !== age) return false;
          if (domain !== "all" && persona.seed.domain !== domain) return false;
          return true;
        });

        document.getElementById("responses").innerHTML = rows.map((response) => {
          const persona = personaById.get(response.personaId);
          return \`
            <tr>
              <td>
                <strong>\${persona.seed.name}</strong><br />
                <span class="pill">\${persona.seed.ageBand}</span>
                <span class="pill">\${persona.seed.domain}</span>
              </td>
              <td>\${response.reactionScore}/100</td>
              <td>\${response.mainPositive}</td>
              <td>\${response.mainConcern}</td>
              <td>\${response.shortReaction}</td>
            </tr>
          \`;
        }).join("");
      }

      ageFilter.addEventListener("change", renderResponses);
      domainFilter.addEventListener("change", renderResponses);
      renderResponses();
    </script>
  </body>
</html>`;
}
