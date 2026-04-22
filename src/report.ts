import path from "node:path";
import { writeFile } from "node:fs/promises";

import type { RunArtifacts } from "./domain/types.js";
import { ensureDir } from "./utils/fs.js";

export async function generateReport(options: { runDirectory: string; artifacts: RunArtifacts }): Promise<void> {
  const reportDirectory = path.join(options.runDirectory, "report");
  await ensureDir(reportDirectory);
  await writeFile(path.join(reportDirectory, "index.html"), createReportHtml(options.artifacts), "utf8");
}

function createReportHtml(artifacts: RunArtifacts): string {
  const payload = JSON.stringify(artifacts).replace(/</g, "\\u003c");
  const title = artifacts.brief.title.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title} — First Impressions</title>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --navy:#0f172a;--slate:#334155;--muted:#64748b;
      --border:#e2e8f0;--bg:#f8fafc;--card:#fff;
      --green:#16a34a;--green-soft:#f0fdf4;--green-border:#bbf7d0;
      --amber:#d97706;--amber-soft:#fffbeb;
      --red:#dc2626;--red-soft:#fef2f2;
    }
    body{
      font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      background:var(--bg);color:var(--navy);line-height:1.6;
    }
    .s{padding:72px 24px}
    .s--dark{background:var(--navy);color:#f8fafc}
    .s--white{background:var(--card)}
    .s--gray{background:var(--bg)}
    .s--charcoal{background:#1e293b;color:#f8fafc}
    .wrap{max-width:760px;margin:0 auto}

    /* EYEBROW / DIVIDER */
    .eyebrow{
      font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;
      font-family:ui-monospace,'SFMono-Regular',monospace;color:var(--muted);
      margin-bottom:24px;display:flex;align-items:center;gap:12px;
    }
    .eyebrow::after{content:"";flex:1;height:1px;background:var(--border)}
    .s--charcoal .eyebrow{color:rgba(248,250,252,.35)}
    .s--charcoal .eyebrow::after{background:rgba(255,255,255,.1)}

    /* HERO */
    .hero-meta{font-size:13px;opacity:.5;margin-bottom:20px;font-family:ui-monospace,monospace;letter-spacing:.04em}
    .hero-title{
      font-size:clamp(44px,9vw,84px);font-weight:800;line-height:.95;
      letter-spacing:-.03em;color:#f8fafc;margin-bottom:20px;
    }
    .hero-summary{font-size:19px;line-height:1.5;max-width:560px;color:rgba(248,250,252,.6)}

    /* VERDICT */
    .verdict-wrap{text-align:center}
    .score-ring{display:block;margin:0 auto 20px}
    .verdict-label{font-size:24px;font-weight:800;margin-bottom:6px}
    .verdict-sub{color:var(--muted);font-size:14px;margin-bottom:28px}
    .pills{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
    .pill{
      background:var(--bg);border:1px solid var(--border);border-radius:999px;
      padding:8px 20px;font-size:14px;font-weight:500;display:flex;gap:6px;align-items:center;
    }
    .pill b{font-weight:800}

    /* AUDIENCE FIT */
    .fit-row{display:grid;grid-template-columns:160px 1fr;gap:48px;align-items:center}
    .fit-donut-wrap{position:relative;width:160px;height:160px;flex-shrink:0}
    .fit-center{
      position:absolute;inset:0;display:flex;flex-direction:column;
      align-items:center;justify-content:center;pointer-events:none;
    }
    .fit-center-num{font-size:30px;font-weight:800;line-height:1;color:var(--green)}
    .fit-center-sub{font-size:11px;color:var(--muted);margin-top:2px}
    .fit-legend{display:flex;flex-direction:column;gap:14px}
    .fit-row-item{display:flex;align-items:center;gap:12px}
    .fit-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
    .fit-name{flex:1;font-size:15px}
    .fit-pct{font-size:20px;font-weight:800}
    .actions{display:flex;gap:32px;margin-top:40px;flex-wrap:wrap}
    .action{text-align:center}
    .action-num{font-size:38px;font-weight:800;line-height:1}
    .action-label{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-top:4px}

    /* QUOTES */
    .quotes{display:grid;gap:14px}
    .quote-card{
      background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
      border-radius:16px;padding:28px 28px 20px;
    }
    .quote-mark{font-size:52px;line-height:.5;opacity:.18;font-family:Georgia,serif;margin-bottom:14px;display:block}
    .quote-text{font-size:18px;line-height:1.55;font-style:italic;margin-bottom:18px}
    .quote-byline{font-size:13px;color:rgba(248,250,252,.45);display:flex;align-items:center;gap:8px}
    .quote-badge{
      margin-left:auto;font-size:11px;font-weight:700;font-style:normal;
      padding:3px 10px;border-radius:999px;white-space:nowrap;
    }
    .badge-pos{background:rgba(22,163,74,.2);color:#4ade80}
    .badge-mid{background:rgba(217,119,6,.2);color:#fbbf24}
    .badge-neg{background:rgba(220,38,38,.2);color:#f87171}

    /* INSIGHTS */
    .two-col{display:grid;grid-template-columns:1fr 1fr;gap:32px}
    .insight-head{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px}
    .insight-head--pos{color:var(--green)}
    .insight-head--neg{color:var(--red)}
    .insight-list{display:flex;flex-direction:column;gap:8px}
    .insight-item{
      display:flex;align-items:flex-start;gap:10px;
      padding:12px 14px;border-radius:10px;border-left:3px solid;font-size:14px;line-height:1.4;
    }
    .insight-item--pos{background:var(--green-soft);border-color:var(--green)}
    .insight-item--neg{background:var(--red-soft);border-color:var(--red)}
    .insight-count{
      flex-shrink:0;font-size:11px;font-weight:700;background:rgba(0,0,0,.08);
      border-radius:999px;padding:2px 7px;margin-top:1px;white-space:nowrap;
    }

    /* BARS */
    .two-col-bars{display:grid;grid-template-columns:1fr 1fr;gap:40px}
    .bars-head{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:16px}
    .bar-list{display:flex;flex-direction:column;gap:16px}
    .bar-meta-row{display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px}
    .bar-name{font-weight:500}
    .bar-meta-text{color:var(--muted);font-size:12px}
    .bar-track{height:6px;background:var(--border);border-radius:999px;overflow:hidden}
    .bar-fill{height:100%;border-radius:999px}

    /* PROFILES */
    .profile-head{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px}
    .profile-head--sup{color:var(--green)}
    .profile-head--skep{color:var(--red)}
    .profile-list{display:flex;flex-direction:column;gap:10px}
    .profile-card{padding:14px;border-radius:10px;border:1px solid var(--border);font-size:13px}
    .profile-card--sup{border-left:3px solid var(--green)}
    .profile-card--skep{border-left:3px solid var(--red)}
    .profile-name{font-weight:700;margin-bottom:2px}
    .profile-who{color:var(--muted);font-size:12px;margin-bottom:6px}
    .profile-score{font-weight:800;font-size:14px}
    .profile-score--sup{color:var(--green)}
    .profile-score--skep{color:var(--red)}
    .profile-quote{font-style:italic;color:var(--slate);line-height:1.4;margin-top:8px;font-size:13px}

    /* TABLE TOGGLE */
    .toggle-btn{
      display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px;
      font-weight:600;background:none;border:none;color:var(--navy);
      margin-bottom:20px;padding:0;
    }
    .toggle-btn svg{transition:transform .2s}
    .toggle-btn.open svg{transform:rotate(180deg)}
    .table-wrap{overflow-x:auto}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th{
      text-align:left;padding:10px 12px;border-bottom:2px solid var(--border);
      font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);font-weight:600;
    }
    td{padding:12px;border-bottom:1px solid var(--border);vertical-align:top}
    tr:last-child td{border-bottom:none}
    tr:hover td{background:var(--bg)}
    .filters{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px}
    select{
      border:1px solid var(--border);border-radius:8px;padding:8px 12px;
      font-size:13px;background:var(--card);color:var(--navy);cursor:pointer;
    }

    /* FOOTER */
    footer{
      text-align:center;padding:40px 24px;font-size:13px;color:var(--muted);
      border-top:1px solid var(--border);
    }

    @media(max-width:640px){
      .fit-row,.two-col,.two-col-bars{grid-template-columns:1fr}
      .actions{justify-content:center}
    }
  </style>
</head>
<body>

<!-- HERO -->
<section class="s s--dark">
  <div class="wrap">
    <p class="hero-meta" id="hero-meta"></p>
    <h1 class="hero-title" id="hero-title"></h1>
    <p class="hero-summary" id="hero-summary"></p>
  </div>
</section>

<!-- VERDICT -->
<section class="s s--white">
  <div class="wrap verdict-wrap">
    <p class="eyebrow">Overall Score</p>
    <svg class="score-ring" width="160" height="160" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r="54" fill="none" stroke="#e2e8f0" stroke-width="14"/>
      <circle cx="70" cy="70" r="54" fill="none" stroke-width="14" stroke-linecap="round"
        id="score-arc" transform="rotate(-90 70 70)"/>
      <text x="70" y="67" text-anchor="middle" dominant-baseline="middle"
        font-size="30" font-weight="800" font-family="system-ui,sans-serif" id="score-num"/>
      <text x="70" y="87" text-anchor="middle" font-size="11" fill="#94a3b8"
        font-family="system-ui,sans-serif">out of 100</text>
    </svg>
    <p class="verdict-label" id="verdict-label"></p>
    <p class="verdict-sub" id="verdict-sub"></p>
    <div class="pills" id="verdict-pills"></div>
  </div>
</section>

<!-- AUDIENCE FIT -->
<section class="s s--gray">
  <div class="wrap">
    <p class="eyebrow">Audience Fit</p>
    <div class="fit-row">
      <div class="fit-donut-wrap">
        <svg width="160" height="160" viewBox="0 0 120 120" id="donut-svg">
          <circle cx="60" cy="60" r="45" fill="none" stroke="#e2e8f0" stroke-width="18"/>
        </svg>
        <div class="fit-center">
          <span class="fit-center-num" id="fit-high-num"></span>
          <span class="fit-center-sub">high fit</span>
        </div>
      </div>
      <div>
        <div class="fit-legend" id="fit-legend"></div>
        <div class="actions" id="actions"></div>
      </div>
    </div>
  </div>
</section>

<!-- QUOTES -->
<section class="s s--charcoal" id="voices-section">
  <div class="wrap">
    <p class="eyebrow">What They Said</p>
    <div class="quotes" id="quotes"></div>
  </div>
</section>

<!-- POSITIVES + CONCERNS -->
<section class="s s--white">
  <div class="wrap">
    <p class="eyebrow">What Resonated · What Concerns Them</p>
    <div class="two-col">
      <div>
        <p class="insight-head insight-head--pos">&#10003; Working for them</p>
        <div class="insight-list" id="positives"></div>
      </div>
      <div>
        <p class="insight-head insight-head--neg">&#10005; Concerns raised</p>
        <div class="insight-list" id="concerns"></div>
      </div>
    </div>
  </div>
</section>

<!-- BREAKDOWN -->
<section class="s s--gray">
  <div class="wrap">
    <p class="eyebrow">Audience Breakdown</p>
    <div class="two-col-bars">
      <div>
        <p class="bars-head">By Age</p>
        <div class="bar-list" id="age-bars"></div>
      </div>
      <div>
        <p class="bars-head">By Domain</p>
        <div class="bar-list" id="domain-bars"></div>
      </div>
    </div>
  </div>
</section>

<!-- PROFILES -->
<section class="s s--white">
  <div class="wrap">
    <p class="eyebrow">Notable Reactions</p>
    <div class="two-col">
      <div>
        <p class="profile-head profile-head--sup">Strongest Supporters</p>
        <div class="profile-list" id="supporters"></div>
      </div>
      <div>
        <p class="profile-head profile-head--skep">Strongest Skeptics</p>
        <div class="profile-list" id="skeptics"></div>
      </div>
    </div>
  </div>
</section>

<!-- ALL RESPONSES -->
<section class="s s--gray">
  <div class="wrap">
    <button class="toggle-btn" id="toggle-btn" onclick="toggleTable()">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 4.5l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      All ${artifacts.personas.length} Persona Responses
    </button>
    <div id="table-body" style="display:none">
      <div class="filters">
        <select id="age-filter"><option value="">All ages</option></select>
        <select id="domain-filter"><option value="">All domains</option></select>
        <select id="fit-filter">
          <option value="">All fit</option>
          <option value="high">High fit</option>
          <option value="mixed">Mixed fit</option>
          <option value="low">Low fit</option>
        </select>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>Persona</th><th>Score</th><th>Reaction</th><th>Main Concern</th>
          </tr></thead>
          <tbody id="responses"></tbody>
        </table>
      </div>
    </div>
  </div>
</section>

<footer id="footer"></footer>

<script id="run-data" type="application/json">${payload}</script>
<script>
(function () {
  const data = JSON.parse(document.getElementById('run-data').textContent);
  const { brief, manifest, insights, personas, responses } = data;
  const personaById = new Map(personas.map(p => [p.seed.id, p]));

  function sc(s) { return s >= 70 ? '#16a34a' : s >= 45 ? '#d97706' : '#dc2626'; }
  function sl(s) { return s >= 70 ? 'Positive Reception' : s >= 45 ? 'Mixed Reception' : 'Skeptical Reception'; }
  function esc(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function ageLbl(b) {
    return ({teen:'Teens',young_adult:'18\u201325',adult:'26\u201340',midlife:'41\u201360',senior:'60+'})[b] || b;
  }
  function fmt(n) { return String(Math.round(n)); }

  // HERO
  document.getElementById('hero-meta').textContent =
    'First Impressions \u00b7 ' + manifest.count + ' personas \u00b7 ' +
    new Date(manifest.createdAt).toLocaleDateString('en-US', {month:'long',day:'numeric',year:'numeric'});
  document.getElementById('hero-title').textContent = brief.title;
  document.getElementById('hero-summary').textContent = brief.oneLineSummary;

  // SCORE RING
  (function () {
    const score = insights.averageReactionScore;
    const r = 54, C = 2 * Math.PI * r;
    const arc = document.getElementById('score-arc');
    arc.setAttribute('stroke', sc(score));
    arc.setAttribute('stroke-dasharray', (score / 100) * C + ' ' + C);
    const num = document.getElementById('score-num');
    num.setAttribute('fill', sc(score));
    num.textContent = fmt(score);
    document.getElementById('verdict-label').textContent = sl(score);
    document.getElementById('verdict-label').style.color = sc(score);
    document.getElementById('verdict-sub').textContent =
      'Averaged across ' + insights.successfulResponses + ' of ' + insights.totalResponses + ' responses';
    document.getElementById('verdict-pills').innerHTML = [
      ['Interest', insights.averageInterestLevel],
      ['Clarity', insights.averageClarityLevel],
      ['Trust', insights.averageTrustLevel],
    ].map(function(pair) {
      return \`<div class="pill"><b style="color:\${sc(pair[1])}">\${fmt(pair[1])}</b>\${pair[0]}</div>\`;
    }).join('');
  })();

  // DONUT
  (function () {
    const fit = insights.audienceFitBreakdown || {low:0,mixed:0,high:0};
    const total = (fit.low + fit.mixed + fit.high) || 1;
    const segs = [
      {v: fit.high / total, color: '#16a34a', label: 'High fit', n: fit.high},
      {v: fit.mixed / total, color: '#d97706', label: 'Mixed fit', n: fit.mixed},
      {v: fit.low / total, color: '#dc2626', label: 'Low fit', n: fit.low},
    ];
    const r = 45, cx = 60, cy = 60, sw = 18;
    const C = 2 * Math.PI * r;
    const gap = 0.015;
    const svg = document.getElementById('donut-svg');
    let cum = 0;
    segs.forEach(function (seg) {
      if (seg.v <= 0) { cum += seg.v; return; }
      var dash = Math.max(0, (seg.v - gap) * C);
      var el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      el.setAttribute('cx', cx); el.setAttribute('cy', cy); el.setAttribute('r', r);
      el.setAttribute('fill', 'none'); el.setAttribute('stroke', seg.color);
      el.setAttribute('stroke-width', sw);
      el.setAttribute('stroke-dasharray', dash + ' ' + (C - dash));
      el.setAttribute('stroke-dashoffset', String(-cum * C));
      el.setAttribute('transform', 'rotate(-90 ' + cx + ' ' + cy + ')');
      svg.appendChild(el);
      cum += seg.v;
    });
    document.getElementById('fit-high-num').textContent = Math.round((fit.high / total) * 100) + '%';
    document.getElementById('fit-legend').innerHTML = segs.map(function (seg) {
      return \`<div class="fit-row-item">
        <div class="fit-dot" style="background:\${seg.color}"></div>
        <span class="fit-name">\${seg.label}</span>
        <span class="fit-pct" style="color:\${seg.color}">\${Math.round(seg.v * 100)}%</span>
      </div>\`;
    }).join('');
    document.getElementById('actions').innerHTML = [
      ['Would Try', insights.wouldTryPercent || 0, '#4f46e5'],
      ['Would Share', insights.wouldSharePercent || 0, '#0891b2'],
      ['Would Pay', insights.wouldPayPercent || 0, '#16a34a'],
    ].map(function (a) {
      return \`<div class="action">
        <div class="action-num" style="color:\${a[2]}">\${Math.round(a[1])}%</div>
        <div class="action-label">\${a[0]}</div>
      </div>\`;
    }).join('');
  })();

  // QUOTES
  (function () {
    var quotes = insights.featuredQuotes || [];
    if (!quotes.length) { document.getElementById('voices-section').style.display = 'none'; return; }
    document.getElementById('quotes').innerHTML = quotes.map(function (q) {
      var cls = q.sentiment === 'positive' ? 'badge-pos' : q.sentiment === 'negative' ? 'badge-neg' : 'badge-mid';
      return \`<div class="quote-card">
        <span class="quote-mark">&#8220;</span>
        <p class="quote-text">\${esc(q.quote)}</p>
        <div class="quote-byline">
          <span>\${esc(q.name)} &middot; \${ageLbl(q.ageBand)} &middot; \${esc(q.domain)}</span>
          <span class="quote-badge \${cls}">\${q.score}/100</span>
        </div>
      </div>\`;
    }).join('');
  })();

  // POSITIVES + CONCERNS
  function renderInsights(id, items, cls) {
    document.getElementById(id).innerHTML = items.slice(0, 6).map(function (item) {
      return \`<div class="insight-item insight-item--\${cls}">
        <span class="insight-count">\${item.count}&times;</span>
        <span>\${esc(item.label)}</span>
      </div>\`;
    }).join('');
  }
  renderInsights('positives', insights.topPositives, 'pos');
  renderInsights('concerns', insights.topConcerns, 'neg');

  // BARS
  function renderBars(id, items) {
    var max = Math.max.apply(null, items.map(function (i) { return i.count; }).concat([1]));
    document.getElementById(id).innerHTML = items.slice(0, 8).map(function (item) {
      var pct = (item.count / max) * 100;
      var label = item.label === 'young_adult' ? '18\u201325' :
        item.label === 'adult' ? '26\u201340' : item.label === 'midlife' ? '41\u201360' :
        item.label === 'senior' ? '60+' : item.label === 'teen' ? 'Teens' : item.label;
      return \`<div>
        <div class="bar-meta-row">
          <span class="bar-name">\${esc(label)}</span>
          <span class="bar-meta-text">\${item.count} people &middot; avg \${item.averageReactionScore}</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width:\${pct}%;background:\${sc(item.averageReactionScore)}"></div>
        </div>
      </div>\`;
    }).join('');
  }
  renderBars('age-bars', insights.ageBandBreakdown);
  renderBars('domain-bars', insights.domainBreakdown);

  // PROFILES
  function renderProfiles(id, items, cls) {
    document.getElementById(id).innerHTML = items.slice(0, 4).map(function (item) {
      var p = personaById.get(item.personaId);
      var r = responses.find(function (r) { return r.personaId === item.personaId; });
      var name = p ? p.seed.name : item.personaId;
      var who = p ? (ageLbl(p.seed.ageBand) + ' \u00b7 ' + p.seed.domain) : '';
      return \`<div class="profile-card profile-card--\${cls}">
        <div class="profile-name">\${esc(name)}</div>
        <div class="profile-who">\${esc(who)}</div>
        <div class="profile-score profile-score--\${cls}">\${item.score}/100</div>
        \${r ? '<div class="profile-quote">\u201c' + esc(r.shortReaction) + '\u201d</div>' : ''}
      </div>\`;
    }).join('');
  }
  renderProfiles('supporters', insights.strongestSupporters, 'sup');
  renderProfiles('skeptics', insights.strongestSkeptics, 'skep');

  // TABLE
  (function () {
    var ages = [...new Set(personas.map(function (p) { return p.seed.ageBand; }))].sort();
    var domains = [...new Set(personas.map(function (p) { return p.seed.domain; }))].sort();
    var af = document.getElementById('age-filter');
    var df = document.getElementById('domain-filter');
    var ff = document.getElementById('fit-filter');
    af.innerHTML += ages.map(function (a) { return \`<option value="\${a}">\${ageLbl(a)}</option>\`; }).join('');
    df.innerHTML += domains.map(function (d) { return \`<option value="\${esc(d)}">\${esc(d)}</option>\`; }).join('');
    function render() {
      var age = af.value, domain = df.value, fit = ff.value;
      var rows = responses.filter(function (r) {
        if (r.error) return false;
        var p = personaById.get(r.personaId);
        if (!p) return false;
        if (age && p.seed.ageBand !== age) return false;
        if (domain && p.seed.domain !== domain) return false;
        if (fit && r.audienceFit !== fit) return false;
        return true;
      });
      document.getElementById('responses').innerHTML = rows.map(function (r) {
        var p = personaById.get(r.personaId);
        return \`<tr>
          <td>
            <strong>\${esc(p ? p.seed.name : r.personaId)}</strong>
            <div style="color:#64748b;font-size:11px;margin-top:2px">\${esc(p ? ageLbl(p.seed.ageBand) + ' \u00b7 ' + p.seed.domain : '')}</div>
          </td>
          <td><span style="font-weight:800;color:\${sc(r.reactionScore)}">\${r.reactionScore}</span></td>
          <td style="max-width:260px;color:#334155;font-style:italic">\${esc(r.shortReaction)}</td>
          <td style="max-width:200px;color:#64748b;font-size:12px">\${esc(r.mainConcern)}</td>
        </tr>\`;
      }).join('');
    }
    af.addEventListener('change', render);
    df.addEventListener('change', render);
    ff.addEventListener('change', render);
    render();
  })();

  document.getElementById('footer').textContent =
    'First Impressions \u00b7 ' + manifest.provider + ' \u00b7 ' + manifest.count +
    ' personas \u00b7 ' + new Date(manifest.createdAt).toLocaleString();

  window.toggleTable = function () {
    var body = document.getElementById('table-body');
    var btn = document.getElementById('toggle-btn');
    var open = body.style.display === 'none';
    body.style.display = open ? '' : 'none';
    btn.classList.toggle('open', open);
  };
})();
</script>
</body>
</html>`;
}
