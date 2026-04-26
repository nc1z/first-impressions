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
  --indigo:#16a34a;
  --indigo-bg:rgba(22,163,74,.08);
  --indigo-ring:rgba(22,163,74,.16);
  --green:#15803d;
  --green-bg:rgba(21,128,61,.07);
  --yellow:#a16207;
  --yellow-bg:rgba(161,98,7,.07);
  --score-red:#be123c;
  --score-red-bg:rgba(190,18,60,.07);
  --shadow:0 1px 2px rgba(0,0,0,.05),0 4px 20px rgba(0,0,0,.06);
  --card-w:272px;
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

/* top progress strip */
.top-prog{height:3px;background:var(--border);flex-shrink:0}
.top-prog-fill{height:100%;width:25%;background:var(--indigo);
  transition:width .5s cubic-bezier(.4,0,.2,1);border-radius:0 2px 2px 0}

/* slides container */
.slides-wrap{flex:1;position:relative;overflow:hidden}

/* individual slides */
.slide{
  position:absolute;inset:0;
  display:flex;align-items:center;justify-content:center;
  padding:40px 60px;
  opacity:0;pointer-events:none;
  will-change:transform,opacity;
}
@media(max-width:600px){.slide{padding:32px 28px}}

.q-wrap{width:100%;max-width:680px}

.q-step{
  font-size:12px;font-weight:700;letter-spacing:.14em;
  color:var(--muted);text-transform:uppercase;
  margin-bottom:16px;display:flex;align-items:center;gap:8px;
}
.q-step svg{flex-shrink:0;opacity:.5}

.q-text{
  font-size:clamp(30px,4.8vw,52px);
  font-weight:800;letter-spacing:-.028em;line-height:1.1;
  color:var(--text);margin-bottom:clamp(28px,4vw,44px);
}

/* ── provider tiles ── */
.provider-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;
  max-width:580px;margin-bottom:40px}
.p-tile{
  padding:clamp(20px,3vw,32px) 16px;border-radius:14px;
  border:2px solid var(--border);background:var(--surface);
  text-align:center;cursor:pointer;user-select:none;
  transition:border-color .15s,background .15s,box-shadow .15s,transform .1s;
}
.p-tile:focus{outline:none}
.p-tile:focus-visible{border-color:var(--indigo);box-shadow:0 0 0 4px var(--indigo-ring)}
.p-tile:hover{border-color:var(--border-hover);box-shadow:0 3px 14px rgba(0,0,0,.08)}
.p-tile:active{transform:scale(.97)}
.p-tile.selected{
  border-color:var(--indigo);background:var(--indigo-bg);
  box-shadow:0 0 0 4px var(--indigo-ring);
}
.p-tile-name{font-size:clamp(16px,2.2vw,22px);font-weight:800;
  display:block;color:var(--text)}
.p-tile-sub{font-size:12px;color:var(--muted);display:block;margin-top:5px}

/* ── audience select ── */
.select-wrap{position:relative;max-width:560px;margin-bottom:40px}
.big-select{
  width:100%;background:var(--surface);border:2px solid var(--border);
  border-radius:12px;padding:18px 48px 18px 20px;
  font-family:inherit;font-size:clamp(15px,2vw,18px);color:var(--text);
  cursor:pointer;outline:none;appearance:none;-webkit-appearance:none;
  transition:border-color .15s,box-shadow .15s;
}
.big-select:focus{border-color:var(--indigo);box-shadow:0 0 0 4px var(--indigo-ring)}
.sel-chev{pointer-events:none;position:absolute;right:16px;top:50%;
  transform:translateY(-50%);color:var(--muted)}

/* ── count ── */
.big-num-wrap{margin-bottom:28px}
.big-num{
  display:block;font-size:clamp(100px,22vw,190px);
  font-weight:900;letter-spacing:-.06em;line-height:1;
  color:var(--text);
}
.big-slider-wrap{max-width:560px;margin-bottom:40px}
.big-slider{
  width:100%;-webkit-appearance:none;appearance:none;
  height:5px;background:var(--border);border-radius:3px;
  outline:none;cursor:pointer;
}
.big-slider::-webkit-slider-thumb{
  -webkit-appearance:none;width:24px;height:24px;border-radius:50%;
  background:var(--text);cursor:pointer;
  box-shadow:0 2px 6px rgba(0,0,0,.22);
  transition:transform .15s;
}
.big-slider::-webkit-slider-thumb:active{transform:scale(1.2)}

/* ── idea textarea ── */
.idea-area{
  width:100%;max-width:680px;background:var(--surface);
  border:2px solid var(--border);border-radius:12px;
  padding:18px 20px;resize:vertical;min-height:190px;
  font-family:inherit;font-size:clamp(15px,2vw,18px);
  line-height:1.65;color:var(--text);outline:none;
  transition:border-color .15s,box-shadow .15s;
  display:block;margin-bottom:32px;
}
.idea-area:focus{border-color:var(--indigo);box-shadow:0 0 0 4px var(--indigo-ring)}
.idea-area::placeholder{color:var(--muted)}

/* ── ok / submit buttons ── */
.slide-actions{display:flex;align-items:center;gap:12px}
.ok-btn{
  display:inline-flex;align-items:center;gap:8px;
  padding:11px 22px;font-size:14px;font-weight:700;letter-spacing:.01em;
  color:#fff;background:var(--text);border:none;border-radius:10px;
  cursor:pointer;transition:background .15s,transform .1s,box-shadow .15s;
}
.ok-btn:hover{background:#333;box-shadow:0 4px 14px rgba(0,0,0,.18)}
.ok-btn:active{transform:scale(.96)}
.ok-btn:disabled{background:var(--muted);cursor:not-allowed;box-shadow:none}
.action-hint{font-size:12px;color:var(--muted)}

/* ── bottom nav ── */
.bottom-nav{
  height:52px;flex-shrink:0;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 60px;border-top:1px solid var(--border);background:var(--bg);
}
@media(max-width:600px){.bottom-nav{padding:0 28px}}
.brand-small{font-size:12px;font-weight:700;letter-spacing:.07em;
  color:var(--muted);text-transform:uppercase;user-select:none}
.nav-arrows{display:flex;gap:4px}
.nav-arrow{
  width:34px;height:34px;border-radius:8px;
  border:1px solid var(--border);background:var(--surface);
  color:var(--text);cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:background .12s,border-color .12s;
}
.nav-arrow:hover:not(:disabled){background:#f4f4f4;border-color:var(--border-hover)}
.nav-arrow:disabled{color:var(--muted);cursor:default}

/* ━━━━ RUNNING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.run-topbar{
  padding:12px 24px 10px;background:var(--surface);
  border-bottom:1px solid var(--border);flex-shrink:0;
}
.run-topbar-inner{max-width:960px;margin:auto;display:flex;align-items:center;gap:16px}
.run-brief-title{font-size:14px;font-weight:700;color:var(--text);
  flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  display:none}
.run-brief-title.visible{display:block;animation:fadeUp .4s ease}
.run-prog-track{width:140px;height:3px;background:var(--border);
  border-radius:2px;overflow:hidden;flex-shrink:0}
.run-prog-fill{height:100%;width:0%;background:var(--green);
  transition:width .35s ease}
.run-status{font-size:12px;color:var(--muted);white-space:nowrap}

.audience-outer{flex:1;overflow-y:auto;background:var(--bg);padding:18px 24px}
.audience-grid{max-width:960px;margin:auto;
  display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--card-w),1fr));gap:10px}

/* ── persona card ── */
.pc{
  background:var(--surface);border:1px solid var(--border);border-radius:12px;
  padding:13px 14px 11px;display:grid;
  grid-template-columns:50px 1fr;grid-template-rows:auto auto;
  column-gap:12px;row-gap:0;
  box-shadow:var(--shadow);opacity:0;
}
.pc.err{background:#fdfafa;border-color:#f0e0e0}
.pc-ring{position:relative;width:50px;height:50px;grid-row:1/3;align-self:center}
.pc-ring svg{display:block}
.pc-ring-score{position:absolute;inset:0;display:flex;align-items:center;
  justify-content:center;font-size:12px;font-weight:800}
.pc-name{font-weight:700;font-size:13px;color:var(--text);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;align-self:end;padding-bottom:1px}
.pc-role{font-size:11px;color:var(--muted);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;align-self:start}
.pc-quote{grid-column:1/-1;margin-top:8px;font-size:12px;color:var(--mid);
  font-style:italic;line-height:1.55;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pc-badges{grid-column:1/-1;margin-top:8px;display:flex;flex-wrap:wrap;gap:4px}
.b{font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px}
.b-on{background:var(--green-bg);color:var(--green);border:1px solid rgba(21,128,61,.18)}
.b-off{background:#f4f4f5;color:var(--muted);border:1px solid var(--border)}
.b-high{background:var(--green-bg);color:var(--green);border:1px solid rgba(21,128,61,.18)}
.b-mixed{background:var(--yellow-bg);color:var(--yellow);border:1px solid rgba(161,98,7,.18)}
.b-low{background:var(--score-red-bg);color:var(--score-red);border:1px solid rgba(190,18,60,.18)}

/* ── done bar ── */
.done-bar{display:none;background:var(--surface);border-top:1px solid var(--border);
  padding:14px 24px;flex-shrink:0}
.done-bar.show{display:block;animation:slideUp .45s ease}
.done-bar-inner{max-width:960px;margin:auto;display:flex;align-items:center;gap:24px;flex-wrap:wrap}
.done-kpis{display:flex;gap:28px;flex:1;flex-wrap:wrap}
.kpi{text-align:center}
.kpi-val{font-size:22px;font-weight:800;color:var(--text);letter-spacing:-.03em;line-height:1}
.kpi-lbl{font-size:10px;color:var(--muted);margin-top:3px;text-transform:uppercase;letter-spacing:.07em}
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

    <!-- 01: Provider -->
    <div class="slide" id="s0">
      <div class="q-wrap">
        <div class="q-step">
          <span>01 / 04</span>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <path d="M1 5h12M8 1l4 4-4 4" stroke="currentColor" stroke-width="1.6"
              stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 class="q-text">Which agent runs the show?</h1>
        <div class="provider-grid" id="provider-selector">
          <div class="p-tile selected" data-val="codex" tabindex="0">
            <span class="p-tile-name">Codex</span>
            <span class="p-tile-sub">OpenAI</span>
          </div>
          <div class="p-tile" data-val="claude" tabindex="0">
            <span class="p-tile-name">Claude</span>
            <span class="p-tile-sub">Anthropic</span>
          </div>
          <div class="p-tile" data-val="copilot" tabindex="0">
            <span class="p-tile-name">Copilot</span>
            <span class="p-tile-sub">GitHub</span>
          </div>
        </div>
        <div class="slide-actions">
          <button class="ok-btn" id="ok-0">
            OK
            <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
              <path d="M1.5 6l4 4 7-8" stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <span class="action-hint">Shift + Enter &crarr;</span>
        </div>
      </div>
    </div>

    <!-- 02: Audience -->
    <div class="slide" id="s1">
      <div class="q-wrap">
        <div class="q-step">
          <span>02 / 04</span>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <path d="M1 5h12M8 1l4 4-4 4" stroke="currentColor" stroke-width="1.6"
              stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 class="q-text">Who&rsquo;s in the room?</h1>
        <div class="select-wrap">
          <select id="persona-set" class="big-select">
            <option value="general">General &mdash; broad consumer &amp; professional mix</option>
            <option value="tech-general">Tech &mdash; tech-oriented across all industries</option>
          </select>
          <svg class="sel-chev" width="14" height="8" viewBox="0 0 14 8" fill="none">
            <path d="M1 1l6 6 6-6" stroke="currentColor" stroke-width="1.6"
              stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="slide-actions">
          <button class="ok-btn" id="ok-1">
            OK
            <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
              <path d="M1.5 6l4 4 7-8" stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <span class="action-hint">Shift + Enter &crarr;</span>
        </div>
      </div>
    </div>

    <!-- 03: Count -->
    <div class="slide" id="s2">
      <div class="q-wrap">
        <div class="q-step">
          <span>03 / 04</span>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <path d="M1 5h12M8 1l4 4-4 4" stroke="currentColor" stroke-width="1.6"
              stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 class="q-text">How large is the audience?</h1>
        <div class="big-num-wrap">
          <span class="big-num" id="count-disp">100</span>
        </div>
        <div class="big-slider-wrap">
          <input type="range" id="count-slider" class="big-slider"
            min="5" max="100" value="100" step="5">
        </div>
        <div class="slide-actions">
          <button class="ok-btn" id="ok-2">
            OK
            <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
              <path d="M1.5 6l4 4 7-8" stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <span class="action-hint">Shift + Enter &crarr;</span>
        </div>
      </div>
    </div>

    <!-- 04: Idea -->
    <div class="slide" id="s3">
      <div class="q-wrap">
        <div class="q-step">
          <span>04 / 04</span>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <path d="M1 5h12M8 1l4 4-4 4" stroke="currentColor" stroke-width="1.6"
              stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 class="q-text">What are you pitching?</h1>
        <textarea id="idea" class="idea-area"
          placeholder="Describe your product, feature, or startup idea. Add context, the problem, links &mdash; anything that helps."></textarea>
        <div class="slide-actions">
          <button class="ok-btn" id="ok-3">
            Pitch it
            <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
              <path d="M1 7h14M9 1l6 6-6 6" stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <span class="action-hint">Shift + Enter &crarr;</span>
        </div>
      </div>
    </div>

  </div><!-- /slides-wrap -->

  <div class="bottom-nav">
    <span class="brand-small">First Impressions</span>
    <div class="nav-arrows">
      <button class="nav-arrow" id="nav-up" disabled title="Previous (↑)">
        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
          <path d="M1 7.5l5-5 5 5" stroke="currentColor" stroke-width="1.7"
            stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button class="nav-arrow" id="nav-down" title="Next (↓)">
        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
          <path d="M1 2.5l5 5 5-5" stroke="currentColor" stroke-width="1.7"
            stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
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
  <div class="audience-outer">
    <div id="audience-grid" class="audience-grid"></div>
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

// ── state ────────────────────────────────────────────────
var provider = 'codex';
var cur = 0;
var rCompleted = 0, rTotal = 0;
const CIRC = 2 * Math.PI * 21; // r=21

var slides = ['s0','s1','s2','s3'].map(function(id){ return document.getElementById(id); });

// ── init first slide ─────────────────────────────────────
(function init() {
  slides.forEach(function(s, i) {
    s.style.transition = 'none';
    if (i === 0) {
      s.style.opacity = '1';
      s.style.transform = 'translateY(0)';
      s.style.pointerEvents = 'all';
      s.removeAttribute('inert');
    } else {
      s.style.opacity = '0';
      s.style.transform = 'translateY(60px)';
      s.style.pointerEvents = 'none';
      s.setAttribute('inert', '');
    }
  });
  updateNavArrows();
  // focus first tile so keyboard works immediately
  var firstTile = document.querySelector('.p-tile');
  if (firstTile) setTimeout(function(){ firstTile.focus(); }, 80);
})();

// ── slide navigation ─────────────────────────────────────
var EASE = 'cubic-bezier(.4,0,.2,1)';
var DUR  = '480ms';

function goTo(n) {
  if (n < 0 || n >= slides.length || n === cur) return;
  var dir   = n > cur ? 1 : -1;
  var fromEl = slides[cur];
  var toEl   = slides[n];

  // snap incoming slide to starting position (no transition)
  toEl.style.transition = 'none';
  toEl.style.opacity    = '0';
  toEl.style.transform  = 'translateY(' + (dir * 60) + 'px)';
  toEl.style.pointerEvents = 'none';

  // force reflow so the snap takes effect before we re-enable transitions
  toEl.getBoundingClientRect();

  var tr = 'opacity ' + DUR + ' ' + EASE + ', transform ' + DUR + ' ' + EASE;

  // animate out
  fromEl.style.transition   = tr;
  fromEl.style.opacity      = '0';
  fromEl.style.transform    = 'translateY(' + (-dir * 60) + 'px)';
  fromEl.style.pointerEvents= 'none';

  // animate in
  toEl.style.transition   = tr;
  toEl.style.opacity      = '1';
  toEl.style.transform    = 'translateY(0)';
  toEl.style.pointerEvents= 'all';

  cur = n;
  // manage inert so Tab stays within the active slide
  slides.forEach(function(s, i) {
    if (i === n) s.removeAttribute('inert');
    else s.setAttribute('inert', '');
  });
  updateProgress();
  updateNavArrows();
  autoFocus(n);
}

function advance() { if (cur < slides.length - 1) goTo(cur + 1); }
function retreat() { if (cur > 0) goTo(cur - 1); }

function updateProgress() {
  var pct = Math.round(((cur + 1) / slides.length) * 100);
  document.getElementById('top-prog-fill').style.width = pct + '%';
}

function updateNavArrows() {
  document.getElementById('nav-up').disabled   = cur === 0;
  document.getElementById('nav-down').disabled = cur === slides.length - 1;
}

function autoFocus(n) {
  setTimeout(function() {
    if (n === 0) {
      var sel = document.querySelector('.p-tile.selected') || document.querySelector('.p-tile');
      if (sel) sel.focus();
    } else if (n === 1) {
      document.getElementById('persona-set').focus();
    } else if (n === 2) {
      document.getElementById('count-slider').focus();
    } else if (n === 3) {
      document.getElementById('idea').focus();
    }
  }, 80);
}

// ── provider selector ─────────────────────────────────────
var providerGrid = document.getElementById('provider-selector');
var pTiles = Array.from(providerGrid.querySelectorAll('.p-tile'));

function selectTile(tile) {
  pTiles.forEach(function(t){ t.classList.remove('selected'); });
  tile.classList.add('selected');
  provider = tile.dataset.val;
}

providerGrid.addEventListener('click', function(e) {
  var tile = e.target.closest('.p-tile');
  if (!tile) return;
  selectTile(tile);
  tile.focus();
  setTimeout(advance, 280);
});

// Arrow keys + Space/Enter within the provider grid
pTiles.forEach(function(tile, idx) {
  tile.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      pTiles[(idx + 1) % pTiles.length].focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      pTiles[(idx - 1 + pTiles.length) % pTiles.length].focus();
    } else if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
      e.preventDefault();
      selectTile(tile);
    }
  });
});

// ── count slider ──────────────────────────────────────────
document.getElementById('count-slider').addEventListener('input', function() {
  document.getElementById('count-disp').textContent = this.value;
});

// ── OK buttons ────────────────────────────────────────────
document.getElementById('ok-0').addEventListener('click', advance);
document.getElementById('ok-1').addEventListener('click', advance);
document.getElementById('ok-2').addEventListener('click', advance);
document.getElementById('ok-3').addEventListener('click', doSubmit);
document.getElementById('nav-up').addEventListener('click', retreat);
document.getElementById('nav-down').addEventListener('click', function(){
  if (cur < slides.length - 1) goTo(cur + 1);
});

// ── keyboard ──────────────────────────────────────────────
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && e.shiftKey) {
    e.preventDefault();
    if (cur === slides.length - 1) doSubmit();
    else advance();
  }
});

// ── submit ────────────────────────────────────────────────
function doSubmit() {
  var idea = document.getElementById('idea').value.trim();
  if (!idea) { document.getElementById('idea').focus(); return; }

  var btn = document.getElementById('ok-3');
  btn.disabled = true;

  var count = parseInt(document.getElementById('count-slider').value, 10);
  rTotal = count;
  rCompleted = 0;

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

// ── transition to running screen ──────────────────────────
function toRunning() {
  var setup   = document.getElementById('screen-setup');
  var running = document.getElementById('screen-running');
  setup.classList.add('exit');
  running.classList.remove('hidden');
  anime({ targets: running, opacity:[0,1], translateY:[16,0], duration:480, easing:'cubicBezier(.4,0,.2,1)' });
}

// ── SSE ───────────────────────────────────────────────────
function startSSE(sessionId) {
  var es = new EventSource('/api/events?sessionId=' + encodeURIComponent(sessionId));
  es.onmessage = function(e) { try { onEvent(JSON.parse(e.data)); } catch(_) {} };
  es.onerror   = function()  { es.close(); };
}

// ── events ────────────────────────────────────────────────
function onEvent(ev) {
  if (ev.stage === 'summary' && ev.brief) {
    var el = document.getElementById('brief-title');
    el.textContent = ev.brief.title;
    el.classList.add('visible');
    return;
  }
  if (ev.stage === 'personas' && typeof ev.total === 'number') {
    rTotal = ev.total;
    setRunProgress(0, rTotal, 'Warming up the audience\u2026');
    return;
  }
  if (ev.stage === 'evaluations') {
    if (ev.persona && ev.reaction) {
      rCompleted = ev.completed || rCompleted + 1;
      setRunProgress(rCompleted, rTotal, rCompleted + '\u2009/\u2009' + rTotal);
      addCard(ev.persona, ev.reaction);
    } else {
      setRunProgress(0, rTotal, 'Inviting personas\u2026');
    }
    return;
  }
  if (ev.stage === 'complete') {
    setRunProgress(rTotal, rTotal, rTotal + '\u2009/\u2009' + rTotal + ' \u2014 done');
    showDone(ev);
    return;
  }
  if (ev.stage === 'error') {
    document.getElementById('run-status').textContent = 'Error: ' + ev.message;
  }
}

function setRunProgress(done, tot, label) {
  var pct = tot > 0 ? Math.round((done / tot) * 100) : 0;
  document.getElementById('run-prog-fill').style.width = pct + '%';
  document.getElementById('run-status').textContent = label;
}

// ── persona card ──────────────────────────────────────────
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function scoreColor(s) {
  return s >= 70 ? 'var(--green)' : s >= 45 ? 'var(--yellow)' : 'var(--score-red)';
}
function describe(seed) {
  return seed.lifeStage.replace(/_/g,' ') + ' in ' + seed.industry.replace(/_/g,' ');
}

function addCard(persona, reaction) {
  var grid   = document.getElementById('audience-grid');
  var score  = reaction.reactionScore;
  var color  = scoreColor(score);
  var offset = CIRC * (1 - score / 100);
  var isErr  = !!reaction.error;
  var ring   = isErr ? 'var(--muted)' : color;

  var card = document.createElement('div');
  card.className = 'pc' + (isErr ? ' err' : '');
  card.innerHTML =
    '<div class="pc-ring">' +
      '<svg viewBox="0 0 50 50" width="50" height="50">' +
        '<circle cx="25" cy="25" r="21" fill="none" stroke="var(--border)" stroke-width="3.5"/>' +
        '<circle class="rarc" cx="25" cy="25" r="21" fill="none"' +
          ' stroke="' + ring + '" stroke-width="3.5"' +
          ' stroke-dasharray="' + CIRC + '" stroke-dashoffset="' + CIRC + '"' +
          ' stroke-linecap="round" transform="rotate(-90 25 25)"/>' +
      '</svg>' +
      '<span class="pc-ring-score" style="color:' + ring + '">' + (isErr ? '!' : score) + '</span>' +
    '</div>' +
    '<div class="pc-name">' + esc(persona.seed.name) + '</div>' +
    '<div class="pc-role">' + esc(describe(persona.seed)) + '</div>' +
    '<div class="pc-quote">\u201c' + esc(reaction.shortReaction || reaction.mainConcern || '') + '\u201d</div>' +
    '<div class="pc-badges">' +
      b('try',   reaction.wouldTry) + b('share', reaction.wouldShare) + b('pay', reaction.wouldPay) +
      '<span class="b b-' + reaction.audienceFit + '">' + reaction.audienceFit + '</span>' +
    '</div>';

  grid.appendChild(card);
  grid.parentElement.scrollTop = grid.parentElement.scrollHeight;

  anime({ targets: card, opacity:[0,1], translateY:[12,0], duration:320, easing:'easeOutQuart' });
  if (!isErr) {
    anime({ targets: card.querySelector('.rarc'),
      strokeDashoffset: [CIRC, offset], duration:580, easing:'easeOutCubic', delay:60 });
  }
}

function b(label, on) {
  return '<span class="b ' + (on ? 'b-on' : 'b-off') + '">' + label + '</span>';
}

// ── done ─────────────────────────────────────────────────
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
  document.getElementById('done-bar').classList.add('show');
}

function kpi(val, label) {
  return '<div class="kpi"><div class="kpi-val">' + esc(String(val)) + '</div>' +
    '<div class="kpi-lbl">' + esc(label) + '</div></div>';
}

})();
</script>
</body>
</html>`;
}
