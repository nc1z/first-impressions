export function buildUIHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>First Impressions</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#fafaf8;
  --surface:#ffffff;
  --text:#18181b;
  --mid:#52525b;
  --muted:#a1a1aa;
  --border:#e4e4e7;
  --border-hover:#c4c4c8;
  --accent:#16a34a;
  --accent-bg:rgba(22,163,74,.08);
  --accent-ring:rgba(22,163,74,.16);
  --green:#15803d;
  --green-bg:rgba(21,128,61,.07);
  --yellow:#a16207;
  --yellow-bg:rgba(161,98,7,.07);
  --score-red:#be123c;
  --score-red-bg:rgba(190,18,60,.07);
}
html,body{height:100%;background:var(--bg);color:var(--text);
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",sans-serif;
  font-size:14px;-webkit-font-smoothing:antialiased;overflow:hidden}

/* ── screens ── */
.screen{position:fixed;inset:0;display:flex;flex-direction:column;
  transition:opacity .4s ease,transform .4s ease}
.screen.hidden{opacity:0;pointer-events:none}
#screen-setup{background:var(--bg)}
#screen-setup.exit{opacity:0;transform:translateY(-20px)}
#screen-running{opacity:0;transform:translateY(16px)}
#screen-running.active{opacity:1;transform:translateY(0)}

/* ━━━━ SETUP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.top-prog{height:3px;background:var(--border);flex-shrink:0}
.top-prog-fill{height:100%;width:25%;background:var(--accent);
  transition:width .5s cubic-bezier(.4,0,.2,1);border-radius:0 2px 2px 0}
.slides-wrap{flex:1;position:relative;overflow:hidden}
.slide{position:absolute;inset:0;display:flex;align-items:center;
  justify-content:center;padding:40px 60px;opacity:0;pointer-events:none;
  will-change:transform,opacity}
@media(max-width:600px){.slide{padding:32px 28px}}
.q-wrap{width:100%;max-width:680px}
.q-step{font-size:12px;font-weight:700;letter-spacing:.14em;color:var(--muted);
  text-transform:uppercase;margin-bottom:16px;display:flex;align-items:center;gap:8px}
.q-step svg{flex-shrink:0;opacity:.5}
.q-text{font-size:clamp(30px,4.8vw,52px);font-weight:800;letter-spacing:-.028em;
  line-height:1.1;color:var(--text);margin-bottom:clamp(28px,4vw,44px)}
.provider-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;
  max-width:580px;margin-bottom:40px}
.p-tile{padding:clamp(20px,3vw,32px) 16px;border-radius:14px;
  border:2px solid var(--border);background:var(--surface);
  text-align:center;cursor:pointer;user-select:none;
  transition:border-color .15s,background .15s,box-shadow .15s,transform .1s}
.p-tile:focus{outline:none}
.p-tile:focus-visible{border-color:var(--accent);box-shadow:0 0 0 4px var(--accent-ring)}
.p-tile:hover{border-color:var(--border-hover);box-shadow:0 3px 14px rgba(0,0,0,.08)}
.p-tile:active{transform:scale(.97)}
.p-tile.selected{border-color:var(--accent);background:var(--accent-bg);
  box-shadow:0 0 0 4px var(--accent-ring)}
.p-tile-name{font-size:clamp(16px,2.2vw,22px);font-weight:800;display:block;color:var(--text)}
.p-tile-sub{font-size:12px;color:var(--muted);display:block;margin-top:5px}
.select-wrap{position:relative;max-width:560px;margin-bottom:40px}
.big-select{width:100%;background:var(--surface);border:2px solid var(--border);
  border-radius:12px;padding:18px 48px 18px 20px;font-family:inherit;
  font-size:clamp(15px,2vw,18px);color:var(--text);cursor:pointer;
  outline:none;appearance:none;-webkit-appearance:none;
  transition:border-color .15s,box-shadow .15s}
.big-select:focus{border-color:var(--accent);box-shadow:0 0 0 4px var(--accent-ring)}
.sel-chev{pointer-events:none;position:absolute;right:16px;top:50%;
  transform:translateY(-50%);color:var(--muted)}
.big-num-wrap{margin-bottom:28px}
.big-num{display:block;font-size:clamp(100px,22vw,190px);
  font-weight:900;letter-spacing:-.06em;line-height:1;color:var(--text)}
.big-slider-wrap{max-width:560px;margin-bottom:40px}
.big-slider{width:100%;-webkit-appearance:none;appearance:none;
  height:5px;background:var(--border);border-radius:3px;outline:none;cursor:pointer}
.big-slider::-webkit-slider-thumb{-webkit-appearance:none;width:24px;height:24px;
  border-radius:50%;background:var(--text);cursor:pointer;
  box-shadow:0 2px 6px rgba(0,0,0,.22);transition:transform .15s}
.big-slider::-webkit-slider-thumb:active{transform:scale(1.2)}
.idea-area{width:100%;max-width:680px;background:var(--surface);
  border:2px solid var(--border);border-radius:12px;padding:18px 20px;
  resize:vertical;min-height:190px;font-family:inherit;
  font-size:clamp(15px,2vw,18px);line-height:1.65;color:var(--text);
  outline:none;transition:border-color .15s,box-shadow .15s;
  display:block;margin-bottom:32px}
.idea-area:focus{border-color:var(--accent);box-shadow:0 0 0 4px var(--accent-ring)}
.idea-area::placeholder{color:var(--muted)}
.slide-actions{display:flex;align-items:center;gap:12px}
.ok-btn{display:inline-flex;align-items:center;gap:8px;padding:11px 22px;
  font-size:14px;font-weight:700;letter-spacing:.01em;color:#fff;
  background:var(--text);border:none;border-radius:10px;cursor:pointer;
  transition:background .15s,transform .1s,box-shadow .15s}
.ok-btn:hover{background:#333;box-shadow:0 4px 14px rgba(0,0,0,.18)}
.ok-btn:active{transform:scale(.96)}
.ok-btn:disabled{background:var(--muted);cursor:not-allowed;box-shadow:none}
.action-hint{font-size:12px;color:var(--muted)}
.bottom-nav{height:52px;flex-shrink:0;display:flex;align-items:center;
  justify-content:space-between;padding:0 60px;
  border-top:1px solid var(--border);background:var(--bg)}
@media(max-width:600px){.bottom-nav{padding:0 28px}}
.brand-small{font-size:12px;font-weight:700;letter-spacing:.07em;
  color:var(--muted);text-transform:uppercase;user-select:none}
.nav-arrows{display:flex;gap:4px}
.nav-arrow{width:34px;height:34px;border-radius:8px;
  border:1px solid var(--border);background:var(--surface);color:var(--text);
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  transition:background .12s,border-color .12s}
.nav-arrow:hover:not(:disabled){background:#f4f4f4;border-color:var(--border-hover)}
.nav-arrow:disabled{color:var(--muted);cursor:default}

/* ── loading dots ── */
@keyframes dot-bounce{0%,80%,100%{transform:translateY(0);opacity:.35}40%{transform:translateY(-5px);opacity:1}}
.loading-dots{display:flex;gap:5px;align-items:center;padding:2px 0}
.loading-dots span{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.6);
  animation:dot-bounce 1.2s ease-in-out infinite}
.loading-dots span:nth-child(2){animation-delay:.18s}
.loading-dots span:nth-child(3){animation-delay:.36s}

/* ━━━━ RUNNING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.run-topbar{padding:12px 24px 10px;background:var(--surface);
  border-bottom:1px solid var(--border);flex-shrink:0}
.run-topbar-inner{max-width:1200px;margin:auto;display:flex;align-items:center;gap:16px}
.run-brief-title{font-size:14px;font-weight:700;color:var(--text);
  flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:none}
.run-brief-title.visible{display:block;animation:fadeUp .4s ease}
.run-prog-track{width:140px;height:3px;background:var(--border);
  border-radius:2px;overflow:hidden;flex-shrink:0}
.run-prog-fill{height:100%;width:0%;background:var(--accent);transition:width .35s ease}
.run-status{font-size:12px;color:var(--muted);white-space:nowrap}

/* ── theater ── */
#theater{flex:1;position:relative;overflow:hidden;background:var(--bg)}
.t-ambient{position:absolute;inset:0;pointer-events:none;
  background:
    radial-gradient(ellipse 80% 35% at 50% 105%,rgba(220,170,60,.08) 0%,transparent 65%),
    radial-gradient(ellipse 100% 40% at 50% -5%,rgba(180,160,220,.04) 0%,transparent 55%)}
.t-stage-floor{position:absolute;bottom:0;left:0;right:0;height:44px;
  pointer-events:none;
  background:linear-gradient(to top,rgba(200,160,60,.06) 0%,transparent 100%)}
.t-stage-line{position:absolute;bottom:44px;left:8%;right:8%;height:1px;
  background:linear-gradient(90deg,
    transparent 0%,rgba(180,140,40,.18) 20%,
    rgba(180,140,40,.4) 50%,
    rgba(180,140,40,.18) 80%,transparent 100%)}
#seat-layer,#bubble-layer{position:absolute;inset:0;pointer-events:none}
#bubble-layer{z-index:10}

/* ── seats ── */
.t-seat{position:absolute;transform:translate(-50%,-50%);
  display:flex;align-items:center;justify-content:center;pointer-events:none}
.t-av-wrap{position:relative;border-radius:50%;flex-shrink:0}
.t-av-ph{position:absolute;inset:0;border-radius:50%;
  background:radial-gradient(circle,#dddbd4 40%,#cac8c0 100%)}
@keyframes t-pulse{0%,100%{opacity:.45}50%{opacity:.75}}
.t-av-img{display:block;border-radius:50%;position:relative;z-index:1;
  opacity:0;transition:opacity .25s}
.t-av-img.loaded{opacity:1}
.t-ring-svg{position:absolute;pointer-events:none;z-index:2}

/* ── audience speech bubbles ── */
.t-bubble-anchor{position:absolute;transform:translate(-50%,-100%);
  pointer-events:none;padding-bottom:8px}
.t-bubble{background:var(--surface);border:1px solid var(--border);
  border-radius:12px;padding:9px 12px 8px;width:168px;
  box-shadow:0 4px 18px rgba(0,0,0,.1),0 1px 4px rgba(0,0,0,.06);
  white-space:normal;word-break:break-word;
  transform:scale(0);transform-origin:bottom center;
  opacity:0;position:relative}
.t-bubble::after{content:'';position:absolute;top:100%;left:50%;
  transform:translateX(-50%);border:6px solid transparent;
  border-top-color:var(--surface)}
.t-bubble::before{content:'';position:absolute;top:100%;left:50%;
  transform:translateX(-50%);margin-top:1px;
  border:7px solid transparent;border-top-color:var(--border)}
.t-bubble-score{font-size:11px;font-weight:800;padding:2px 7px;
  border-radius:20px;display:inline-block;margin-bottom:5px}
.t-bubble-quote{font-size:11.5px;line-height:1.5;color:#3f3f46}

/* ── presenter ── */
#presenter{position:absolute;bottom:44px;left:50%;
  transform:translateX(-50%) translateY(120%);
  display:flex;flex-direction:column;align-items:center;
  z-index:15;pointer-events:none;opacity:0}
#presenter-img{display:block;width:80px;height:80px;border-radius:50%;
  border:3px solid #fff;box-shadow:0 4px 20px rgba(0,0,0,.13)}
#presenter-label{margin-top:6px;font-size:11px;font-weight:700;
  color:var(--muted);letter-spacing:.06em;text-transform:uppercase}
#presenter-bubble-anchor{position:absolute;bottom:44px;left:50%;
  transform:translate(-50%,calc(-80px - 10px));
  pointer-events:none;z-index:16;padding-bottom:10px}
#presenter-bubble{background:var(--text);color:#fff;border-radius:14px;
  padding:14px 16px 12px;width:280px;max-width:72vw;
  box-shadow:0 8px 32px rgba(0,0,0,.16),0 2px 6px rgba(0,0,0,.08);
  white-space:normal;word-break:break-word;
  transform:scale(0);transform-origin:bottom center;
  opacity:0;position:relative}
#presenter-bubble::after{content:'';position:absolute;top:100%;left:50%;
  transform:translateX(-50%);border:8px solid transparent;
  border-top-color:var(--text)}
#presenter-bubble-label{font-size:10px;font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:8px}
#presenter-bubble-text{font-size:13px;line-height:1.6;color:#fff}

/* ── done bar ── */
.done-bar{display:none;background:var(--surface);border-top:1px solid var(--border);
  padding:14px 24px;flex-shrink:0}
.done-bar.show{display:block;animation:slideUp .45s ease}
.done-bar-inner{max-width:1200px;margin:auto;display:flex;
  align-items:center;gap:24px;flex-wrap:wrap}
.done-kpis{display:flex;gap:28px;flex:1;flex-wrap:wrap}
.kpi{text-align:center}
.kpi-val{font-size:22px;font-weight:800;color:var(--text);letter-spacing:-.03em;line-height:1}
.kpi-lbl{font-size:10px;color:var(--muted);margin-top:3px;
  text-transform:uppercase;letter-spacing:.07em}
.view-btn{padding:11px 24px;font-size:14px;font-weight:700;color:#fff;
  background:var(--text);border:none;border-radius:10px;cursor:pointer;
  text-decoration:none;white-space:nowrap;transition:background .15s,box-shadow .15s}
.view-btn:hover{background:#333;box-shadow:0 4px 14px rgba(0,0,0,.18)}

@keyframes fadeUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
</style>
</head>
<body>

<!-- ══════════ SETUP ══════════ -->
<div id="screen-setup" class="screen">
  <div class="top-prog"><div id="top-prog-fill" class="top-prog-fill"></div></div>
  <div class="slides-wrap" id="slides-wrap">

    <div class="slide" id="s0">
      <div class="q-wrap">
        <div class="q-step"><span>01 / 04</span>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <path d="M1 5h12M8 1l4 4-4 4" stroke="currentColor" stroke-width="1.6"
              stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <h1 class="q-text">Which agent runs the show?</h1>
        <div class="provider-grid" id="provider-selector">
          <div class="p-tile selected" data-val="codex" tabindex="0">
            <span class="p-tile-name">Codex</span><span class="p-tile-sub">OpenAI</span></div>
          <div class="p-tile" data-val="claude" tabindex="0">
            <span class="p-tile-name">Claude</span><span class="p-tile-sub">Anthropic</span></div>
          <div class="p-tile" data-val="copilot" tabindex="0">
            <span class="p-tile-name">Copilot</span><span class="p-tile-sub">GitHub</span></div>
        </div>
        <div class="slide-actions">
          <button class="ok-btn" id="ok-0">OK
            <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
              <path d="M1.5 6l4 4 7-8" stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          <span class="action-hint">Shift + Enter &crarr;</span>
        </div>
      </div>
    </div>

    <div class="slide" id="s1">
      <div class="q-wrap">
        <div class="q-step"><span>02 / 04</span>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <path d="M1 5h12M8 1l4 4-4 4" stroke="currentColor" stroke-width="1.6"
              stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <h1 class="q-text">Who&rsquo;s in the room?</h1>
        <div class="select-wrap">
          <select id="persona-set" class="big-select">
            <option value="general">General &mdash; broad consumer &amp; professional mix</option>
            <option value="tech-general">Tech &mdash; tech-oriented across all industries</option>
          </select>
          <svg class="sel-chev" width="14" height="8" viewBox="0 0 14 8" fill="none">
            <path d="M1 1l6 6 6-6" stroke="currentColor" stroke-width="1.6"
              stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="slide-actions">
          <button class="ok-btn" id="ok-1">OK
            <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
              <path d="M1.5 6l4 4 7-8" stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          <span class="action-hint">Shift + Enter &crarr;</span>
        </div>
      </div>
    </div>

    <div class="slide" id="s2">
      <div class="q-wrap">
        <div class="q-step"><span>03 / 04</span>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <path d="M1 5h12M8 1l4 4-4 4" stroke="currentColor" stroke-width="1.6"
              stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <h1 class="q-text">How large is the audience?</h1>
        <div class="big-num-wrap">
          <span class="big-num" id="count-disp">100</span>
        </div>
        <div class="big-slider-wrap">
          <input type="range" id="count-slider" class="big-slider"
            min="5" max="100" value="100" step="5">
        </div>
        <div class="slide-actions">
          <button class="ok-btn" id="ok-2">OK
            <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
              <path d="M1.5 6l4 4 7-8" stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          <span class="action-hint">Shift + Enter &crarr;</span>
        </div>
      </div>
    </div>

    <div class="slide" id="s3">
      <div class="q-wrap">
        <div class="q-step"><span>04 / 04</span>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <path d="M1 5h12M8 1l4 4-4 4" stroke="currentColor" stroke-width="1.6"
              stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <h1 class="q-text">What are you pitching?</h1>
        <textarea id="idea" class="idea-area"
          placeholder="Describe your product, feature, or startup idea. Add context, the problem, links &mdash; anything that helps."></textarea>
        <div class="slide-actions">
          <button class="ok-btn" id="ok-3">Pitch it
            <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
              <path d="M1 7h14M9 1l6 6-6 6" stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          <span class="action-hint">Shift + Enter &crarr;</span>
        </div>
      </div>
    </div>

  </div>
  <div class="bottom-nav">
    <span class="brand-small">First Impressions</span>
    <div class="nav-arrows">
      <button class="nav-arrow" id="nav-up" disabled>
        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
          <path d="M1 7.5l5-5 5 5" stroke="currentColor" stroke-width="1.7"
            stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <button class="nav-arrow" id="nav-down">
        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
          <path d="M1 2.5l5 5 5-5" stroke="currentColor" stroke-width="1.7"
            stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    </div>
  </div>
</div>

<!-- ══════════ RUNNING ══════════ -->
<div id="screen-running" class="screen hidden">
  <div class="run-topbar">
    <div class="run-topbar-inner">
      <div id="brief-title" class="run-brief-title"></div>
      <div class="run-prog-track"><div id="run-prog-fill" class="run-prog-fill"></div></div>
      <div id="run-status" class="run-status">Starting&hellip;</div>
    </div>
  </div>

  <div id="theater">
    <div class="t-ambient"></div>
    <div id="seat-layer"></div>
    <div id="bubble-layer"></div>
    <!-- presenter pitch bubble -->
    <div id="presenter-bubble-anchor">
      <div id="presenter-bubble">
        <div id="presenter-bubble-label">Summarising your pitch&hellip;</div>
        <div id="presenter-bubble-loading" class="loading-dots">
          <span></span><span></span><span></span>
        </div>
        <div id="presenter-bubble-text" style="display:none"></div>
      </div>
    </div>

    <!-- presenter avatar on stage -->
    <div id="presenter">
      <img id="presenter-img" src="" draggable="false">
      <span id="presenter-label">You</span>
    </div>

    <div class="t-stage-floor"></div>
    <div class="t-stage-line"></div>
  </div>

  <div id="done-bar" class="done-bar">
    <div class="done-bar-inner">
      <div id="done-kpis" class="done-kpis"></div>
      <a id="view-report" href="#" class="view-btn" target="_blank">View Report &rarr;</a>
    </div>
  </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js" crossorigin="anonymous"></script>
<script>
(function () {
'use strict';

// ── setup state ───────────────────────────────────────────
var provider = 'codex';
var cur = 0;
var slides = ['s0','s1','s2','s3'].map(function(id){ return document.getElementById(id); });

// ── theater state ─────────────────────────────────────────
var seats = [];
var tNextIdx = 0;
var tScores = [];
var tTotal = 0;
var tCompleted = 0;
var evalQueue = [];       // buffers evaluation events during presenter intro
var presenterDone = false;
var showPresenterSummary = null; // set by runPresenter, called when brief arrives

// ── row layout (panoramic arcs) ───────────────────────────
var ROW_DEFS = [
  { n: 10, sz: 60, baseY: 0.87, aFrac: 0.43, b: 18,  spread: 76, op: 1.00 },
  { n: 13, sz: 49, baseY: 0.71, aFrac: 0.45, b: 32,  spread: 79, op: 0.87 },
  { n: 16, sz: 39, baseY: 0.55, aFrac: 0.46, b: 50,  spread: 81, op: 0.73 },
  { n: 19, sz: 31, baseY: 0.39, aFrac: 0.47, b: 68,  spread: 82, op: 0.58 },
  { n: 22, sz: 25, baseY: 0.25, aFrac: 0.48, b: 86,  spread: 83, op: 0.43 },
  { n: 20, sz: 20, baseY: 0.13, aFrac: 0.49, b: 104, spread: 84, op: 0.30 },
];

function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

// ━━━━ SETUP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(function init() {
  slides.forEach(function(s, i) {
    s.style.transition = 'none';
    if (i === 0) {
      s.style.opacity = '1'; s.style.transform = 'translateY(0)';
      s.style.pointerEvents = 'all'; s.removeAttribute('inert');
    } else {
      s.style.opacity = '0'; s.style.transform = 'translateY(60px)';
      s.style.pointerEvents = 'none'; s.setAttribute('inert', '');
    }
  });
  updateNavArrows();
  var firstTile = document.querySelector('.p-tile');
  if (firstTile) setTimeout(function(){ firstTile.focus(); }, 80);
})();

var EASE = 'cubic-bezier(.4,0,.2,1)', DUR = '480ms';

function goTo(n) {
  if (n < 0 || n >= slides.length || n === cur) return;
  var dir = n > cur ? 1 : -1;
  var fromEl = slides[cur], toEl = slides[n];
  toEl.style.transition = 'none';
  toEl.style.opacity = '0';
  toEl.style.transform = 'translateY(' + (dir * 60) + 'px)';
  toEl.style.pointerEvents = 'none';
  toEl.getBoundingClientRect();
  var tr = 'opacity ' + DUR + ' ' + EASE + ', transform ' + DUR + ' ' + EASE;
  fromEl.style.transition = tr; fromEl.style.opacity = '0';
  fromEl.style.transform = 'translateY(' + (-dir * 60) + 'px)';
  fromEl.style.pointerEvents = 'none';
  toEl.style.transition = tr; toEl.style.opacity = '1';
  toEl.style.transform = 'translateY(0)'; toEl.style.pointerEvents = 'all';
  cur = n;
  slides.forEach(function(s, i) {
    if (i === n) s.removeAttribute('inert'); else s.setAttribute('inert', '');
  });
  updateProgress(); updateNavArrows(); autoFocus(n);
}

function advance() { if (cur < slides.length - 1) goTo(cur + 1); }
function retreat() { if (cur > 0) goTo(cur - 1); }

function updateProgress() {
  document.getElementById('top-prog-fill').style.width =
    Math.round(((cur + 1) / slides.length) * 100) + '%';
}
function updateNavArrows() {
  document.getElementById('nav-up').disabled   = cur === 0;
  document.getElementById('nav-down').disabled = cur === slides.length - 1;
}
function autoFocus(n) {
  setTimeout(function() {
    if (n === 0) { var s = document.querySelector('.p-tile.selected') || document.querySelector('.p-tile'); if(s) s.focus(); }
    else if (n === 1) document.getElementById('persona-set').focus();
    else if (n === 2) document.getElementById('count-slider').focus();
    else if (n === 3) document.getElementById('idea').focus();
  }, 80);
}

var providerGrid = document.getElementById('provider-selector');
var pTiles = Array.from(providerGrid.querySelectorAll('.p-tile'));
function selectTile(tile) {
  pTiles.forEach(function(t){ t.classList.remove('selected'); });
  tile.classList.add('selected'); provider = tile.dataset.val;
}
providerGrid.addEventListener('click', function(e) {
  var tile = e.target.closest('.p-tile'); if (!tile) return;
  selectTile(tile); tile.focus(); setTimeout(advance, 280);
});
pTiles.forEach(function(tile, idx) {
  tile.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); pTiles[(idx+1)%pTiles.length].focus(); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); pTiles[(idx-1+pTiles.length)%pTiles.length].focus(); }
    else if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') { e.preventDefault(); selectTile(tile); }
  });
});

document.getElementById('count-slider').addEventListener('input', function() {
  document.getElementById('count-disp').textContent = this.value;
});
document.getElementById('ok-0').addEventListener('click', advance);
document.getElementById('ok-1').addEventListener('click', advance);
document.getElementById('ok-2').addEventListener('click', advance);
document.getElementById('ok-3').addEventListener('click', doSubmit);
document.getElementById('nav-up').addEventListener('click', retreat);
document.getElementById('nav-down').addEventListener('click', function(){ if(cur<slides.length-1) goTo(cur+1); });
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && e.shiftKey) {
    e.preventDefault();
    if (cur === slides.length - 1) doSubmit(); else advance();
  }
});

// ━━━━ SUBMIT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function doSubmit() {
  var idea = document.getElementById('idea').value.trim();
  if (!idea) { document.getElementById('idea').focus(); return; }
  var btn = document.getElementById('ok-3');
  btn.disabled = true;
  var count = parseInt(document.getElementById('count-slider').value, 10);
  tTotal = count; tCompleted = 0;

  fetch('/api/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: provider,
      personaSet: document.getElementById('persona-set').value,
      count: count,
      concurrency: Math.min(10, Math.ceil(count / 8)),
      idea: idea,
    }),
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    toRunning();
    startSSE(data.sessionId);
  })
  .catch(function(err) {
    btn.disabled = false;
    alert('Error: ' + err.message);
  });
}

// ━━━━ TRANSITION TO RUNNING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function toRunning() {
  var setup   = document.getElementById('screen-setup');
  var running = document.getElementById('screen-running');
  setup.classList.add('exit');
  running.classList.remove('hidden');
  anime({ targets: running, opacity:[0,1], translateY:[16,0], duration:480,
    easing:'cubicBezier(.4,0,.2,1)',
    complete: function() {
      buildSeats();
      showPresenterSummary = runPresenter(function() {
        presenterDone = true;
        while (evalQueue.length) addPersona(evalQueue.shift());
      });
    }
  });
}

// ━━━━ THEATER SEATS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function buildSeats() {
  var theater = document.getElementById('theater');
  var W = theater.clientWidth, H = theater.clientHeight;
  var seatLayer   = document.getElementById('seat-layer');
  var bubbleLayer = document.getElementById('bubble-layer');
  seatLayer.innerHTML = ''; bubbleLayer.innerHTML = '';
  seats = []; tNextIdx = 0;

  var all = [];
  ROW_DEFS.forEach(function(row) {
    var sr = row.spread * Math.PI / 180;
    for (var si = 0; si < row.n; si++) {
      var frac  = row.n > 1 ? si / (row.n - 1) : 0.5;
      var theta = (frac - 0.5) * 2 * sr;
      all.push({
        x: W / 2 + row.aFrac * W * Math.sin(theta),
        y: row.baseY * H - row.b * (1 - Math.cos(theta)),
        sz: row.sz, op: row.op,
      });
    }
  });
  all = shuffle(all);

  all.forEach(function(s, i) {
    var sz = s.sz, r = sz/2+3, sw = sz<38?1.8:2.4;
    var circ = 2*Math.PI*r, dim = sz+12, cx = dim/2;

    var seatEl = document.createElement('div');
    seatEl.className = 't-seat';
    seatEl.style.cssText = 'left:'+s.x+'px;top:'+s.y+'px;opacity:'+s.op+';';
    seatEl.innerHTML =
      '<div class="t-av-wrap" style="width:'+sz+'px;height:'+sz+'px">'+
        '<div class="t-av-ph" style="animation:t-pulse '+
          (3+(i*137%20)/10).toFixed(1)+'s ease-in-out '+((i*79)%3000)+'ms infinite"></div>'+
        '<img class="t-av-img" width="'+sz+'" height="'+sz+'" draggable="false">'+
        '<svg class="t-ring-svg" style="left:-6px;top:-6px"'+
          ' width="'+dim+'" height="'+dim+'" viewBox="0 0 '+dim+' '+dim+'">'+
          '<circle cx="'+cx+'" cy="'+cx+'" r="'+r+'"'+
            ' fill="none" stroke="rgba(0,0,0,0.07)" stroke-width="'+sw+'"/>'+
          '<circle class="rarc" cx="'+cx+'" cy="'+cx+'" r="'+r+'"'+
            ' fill="none" stroke="#16a34a" stroke-width="'+sw+'"'+
            ' stroke-dasharray="'+circ+'" stroke-dashoffset="'+circ+'"'+
            ' stroke-linecap="round" transform="rotate(-90 '+cx+' '+cx+')"/>'+
        '</svg>'+
      '</div>';
    seatLayer.appendChild(seatEl);

    var bx = Math.max(90, Math.min(W-90, s.x));
    var anchor = document.createElement('div');
    anchor.className = 't-bubble-anchor';
    anchor.style.cssText = 'left:'+bx+'px;top:'+(s.y - sz/2)+'px;';
    var bubble = document.createElement('div');
    bubble.className = 't-bubble';
    bubble.innerHTML = '<span class="t-bubble-score"></span><div class="t-bubble-quote"></div>';
    anchor.appendChild(bubble);
    bubbleLayer.appendChild(anchor);

    seats.push({ circ, el: seatEl,
      rarc: seatEl.querySelector('.rarc'),
      img:  seatEl.querySelector('.t-av-img'),
      ph:   seatEl.querySelector('.t-av-ph'),
      bubbleEl: bubble,
    });
  });
}

window.addEventListener('resize', function() {
  if (!document.getElementById('screen-running').classList.contains('hidden')) buildSeats();
});

// ━━━━ PRESENTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Returns a showSummary(brief) function the caller invokes when the brief arrives.
function runPresenter(onDone) {
  document.getElementById('presenter-img').src =
    'https://api.dicebear.com/7.x/notionists/svg?seed=presenter-you&radius=50';

  var presEl      = document.getElementById('presenter');
  var bubbleEl    = document.getElementById('presenter-bubble');
  var labelEl     = document.getElementById('presenter-bubble-label');
  var loadingEl   = document.getElementById('presenter-bubble-loading');
  var textEl      = document.getElementById('presenter-bubble-text');

  setRunStatus('Summarising your pitch\u2026');

  // Walk presenter on stage
  anime({ targets: presEl,
    opacity: [0, 1], translateY: ['120%', '0%'], translateX: '-50%',
    duration: 600, easing: 'spring(1, 70, 12, 0)',
    begin: function() { presEl.style.opacity = '0'; },
  });

  // Pop bubble open with loading dots
  setTimeout(function() {
    anime({ targets: bubbleEl, opacity: [0, 1], scale: [0, 1],
      duration: 420, easing: 'spring(1, 90, 12, 0)' });
  }, 500);

  function exitPresenter() {
    bubbleEl.style.transition = 'opacity 0.2s ease';
    bubbleEl.style.opacity = '0';
    setTimeout(function() {
      anime({ targets: presEl, opacity: [1, 0], translateX: ['-50%', '80px'],
        duration: 480, easing: 'easeInQuart',
        complete: function() {
          presEl.style.display = 'none';
          setRunStatus('Audience is reacting\u2026');
          onDone();
        },
      });
    }, 300);
  }

  // Called by onEvent when summary arrives
  return function showSummary(brief) {
    // Swap loading dots → real text
    labelEl.textContent = brief.title;
    loadingEl.style.display = 'none';
    textEl.textContent = brief.oneLineSummary;
    textEl.style.display = 'block';

    // Reading time, then exit
    var readMs = Math.min(4500, Math.max(2000, brief.oneLineSummary.length * 22));
    setTimeout(exitPresenter, readMs);
  };
}

// ━━━━ SSE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function startSSE(sessionId) {
  var es = new EventSource('/api/events?sessionId=' + encodeURIComponent(sessionId));
  es.onmessage = function(e) { try { onEvent(JSON.parse(e.data)); } catch(_) {} };
  es.onerror   = function()  { es.close(); };
}

function onEvent(ev) {
  if (ev.stage === 'summary' && ev.brief) {
    var el = document.getElementById('brief-title');
    el.textContent = ev.brief.title; el.classList.add('visible');
    if (showPresenterSummary) {
      showPresenterSummary(ev.brief);
      showPresenterSummary = null; // only call once
    }
    return;
  }
  if (ev.stage === 'personas' && typeof ev.total === 'number') {
    tTotal = ev.total;
    setRunProgress(0, tTotal);
    return;
  }
  if (ev.stage === 'evaluations' && ev.persona && ev.reaction) {
    tCompleted = ev.completed || tCompleted + 1;
    setRunProgress(tCompleted, tTotal);
    if (presenterDone) addPersona(ev);
    else evalQueue.push(ev);
    return;
  }
  if (ev.stage === 'complete') {
    setRunProgress(tTotal, tTotal);
    // flush any remaining queue (shouldn't happen but safety net)
    while (evalQueue.length) addPersona(evalQueue.shift());
    showDone(ev);
    return;
  }
  if (ev.stage === 'error') {
    setRunStatus('Error: ' + ev.message);
  }
}

function setRunProgress(done, tot) {
  var pct = tot > 0 ? Math.round((done / tot) * 100) : 0;
  document.getElementById('run-prog-fill').style.width = pct + '%';
  if (presenterDone) {
    document.getElementById('run-status').textContent =
      done + '\u2009/\u2009' + tot;
  }
}
function setRunStatus(msg) {
  document.getElementById('run-status').textContent = msg;
}

// ━━━━ PERSONA CARD ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function scoreColor(s) { return s>=70?'#16a34a':s>=45?'#d97706':'#dc2626'; }
function scoreBg(s)    { return s>=70?'rgba(22,163,74,.1)':s>=45?'rgba(217,119,6,.1)':'rgba(220,38,38,.1)'; }

function addPersona(ev) {
  var persona  = ev.persona;
  var reaction = ev.reaction;
  if (tNextIdx >= seats.length) return;
  var seat   = seats[tNextIdx++];
  var score  = reaction.reactionScore;
  var color  = scoreColor(score);
  var offset = seat.circ * (1 - score / 100);

  seat.img.src =
    'https://api.dicebear.com/7.x/notionists/svg?seed=' +
    encodeURIComponent(persona.seed.name) + '&radius=50';
  seat.img.onload = function() { seat.img.classList.add('loaded'); };
  seat.ph.style.animation = 'none'; seat.ph.style.opacity = '0';
  seat.rarc.setAttribute('stroke', color);

  var avWrap = seat.el.querySelector('.t-av-wrap');
  avWrap.style.transform = 'scale(0)';
  anime({ targets: avWrap, scale:[0,1], duration:460, easing:'spring(1, 80, 12, 0)' });
  anime({ targets: seat.rarc, strokeDashoffset:[seat.circ, offset],
    duration:680, easing:'easeOutCubic', delay:130 });

  var bubble  = seat.bubbleEl;
  var scoreEl = bubble.querySelector('.t-bubble-score');
  scoreEl.textContent = score + ' / 100';
  scoreEl.style.background = scoreBg(score);
  scoreEl.style.color = color;
  bubble.querySelector('.t-bubble-quote').textContent =
    reaction.shortReaction || reaction.mainConcern || '';

  anime({ targets: bubble, opacity:[0,1], scale:[0,1],
    duration:340, easing:'spring(1, 90, 14, 0)', delay:40 });

  setTimeout(function() {
    bubble.style.transition = 'opacity 0.15s ease';
    bubble.style.opacity = '0';
  }, 4400);

  tScores.push(score);
}

// ━━━━ DONE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function showDone(ev) {
  var ins = ev.insights;
  if (ins) {
    document.getElementById('done-kpis').innerHTML =
      kpi(Math.round(ins.averageReactionScore),    'Avg score') +
      kpi(Math.round(ins.wouldTryPercent)   + '%', 'Would try') +
      kpi(Math.round(ins.wouldSharePercent) + '%', 'Would share') +
      kpi(Math.round(ins.wouldPayPercent)   + '%', 'Would pay');
  }
  if (ev.runId) document.getElementById('view-report').href = '/runs/' + ev.runId + '/report/';
  setRunStatus('Done');
  document.getElementById('done-bar').classList.add('show');
}

function kpi(val, label) {
  return '<div class="kpi"><div class="kpi-val">' + String(val) + '</div>' +
    '<div class="kpi-lbl">' + label + '</div></div>';
}

})();
</script>
</body>
</html>`;
}
