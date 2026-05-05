<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>LinearCrypt — Hill Cipher Interactive Lab</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,300;1,9..144,700;1,9..144,900&family=Geist+Mono:wght@300;400;500&family=Geist:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:         #08090f;
  --bg-2:       #0e1019;
  --bg-3:       #151823;
  --bg-4:       #1c2133;
  --bg-5:       #232840;
  --bg-6:       #2a304d;

  --green:      #c7d2fe;
  --green-2:    #e0e7ff;
  --green-3:    #9aa0c4;
  --green-4:    #6a7099;
  --green-5:    #1c2060;
  --green-hi:   #ffffff;
  --green-dim:  #818cf8;

  --amber:      #818cf8;
  --amber-bg:   #0d0f28;
  --amber-2:    #c7d2fe;

  --red:        #4a2a4a;
  --red-bg:     #100810;

  --text-1:    #f5f7ff;
  --text-2:    #9aa0c4;
  --text-3:    #6a7099;
  --text-4:    #3a4060;

  --rule:      #111522;
  --rule-2:    #181e30;
  --rule-3:    #222840;

  --ff-display: 'Fraunces', Georgia, serif;
  --ff-mono:    'Geist Mono', 'Courier New', monospace;
  --ff-body:    'Geist', system-ui, sans-serif;

  --r:  5px;
  --rl: 10px;
  --rx: 16px;
}

html { scroll-behavior: smooth; }

body {
  background: var(--bg);
  color: var(--text-1);
  font-family: var(--ff-body);
  font-size: 16px;
  line-height: 1.7;
  overflow-x: hidden;
}

:focus-visible { outline: 2px solid var(--green); outline-offset: 3px; }

/* ─── NAV ─── */
nav {
  position: fixed; top: 0; left: 0; right: 0;
  height: 60px;
  background: var(--bg-2);
  border-bottom: 1px solid var(--rule-2);
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 0 40px; z-index: 200;
}

.nav-logo {
  font-family: var(--ff-mono); font-size: 14px; font-weight: 500;
  color: var(--green); text-decoration: none;
  display: flex; align-items: center; gap: 10px;
  letter-spacing: 0.04em;
}
.nav-logo-mark {
  width: 28px; height: 28px;
  background: var(--bg-4);
  border: 1px solid var(--rule-3);
  border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; color: var(--green); font-weight: 600;
}

.nav-links { display: flex; align-items: center; gap: 36px; list-style: none; }
.nav-links a {
  font-size: 13px; font-weight: 400; color: var(--text-3);
  text-decoration: none; letter-spacing: 0.02em; transition: color 160ms;
}
.nav-links a:hover { color: var(--text-1); }

.nav-right { display: flex; align-items: center; gap: 8px; }

.btn-flat {
  font-size: 13px; font-weight: 500; color: var(--text-3);
  background: var(--bg-3); border: 1px solid var(--rule-2);
  padding: 7px 16px; border-radius: var(--r); cursor: pointer;
  text-decoration: none; transition: color 160ms, border-color 160ms;
}
.btn-flat:hover { color: var(--text-1); border-color: var(--rule-3); }

.btn-cta {
  font-size: 13px; font-weight: 600; color: var(--bg);
  background: var(--green); border: 1px solid var(--green);
  padding: 7px 18px; border-radius: var(--r); cursor: pointer;
  text-decoration: none; transition: background 160ms;
}
.btn-cta:hover { background: var(--green-hi); }

.nav-toggle {
  display: none; flex-direction: column; gap: 5px;
  background: none; border: none; cursor: pointer; padding: 8px;
}
.nav-toggle span { display: block; width: 20px; height: 1.5px; background: var(--text-2); transition: all 230ms; }
.nav-toggle.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
.nav-toggle.open span:nth-child(2) { opacity: 0; }
.nav-toggle.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

.mobile-menu {
  display: none; position: fixed;
  top: 60px; left: 0; right: 0;
  background: var(--bg-2);
  border-bottom: 1px solid var(--rule);
  padding: 18px 24px 26px; z-index: 190;
  flex-direction: column;
}
.mobile-menu.open { display: flex; }
.mobile-menu a {
  font-size: 15px; color: var(--text-2);
  text-decoration: none; padding: 12px 0;
  border-bottom: 1px solid var(--rule); transition: color 160ms;
}
.mobile-menu a:hover { color: var(--green); }
.mobile-cta {
  margin-top: 16px; display: block; text-align: center;
  font-size: 14px; font-weight: 600; color: var(--bg);
  background: var(--green); padding: 12px; border-radius: var(--r);
  text-decoration: none;
}

/* ─── HERO ─── */
.hero {
  background: var(--bg);
  padding: 120px 40px 80px;
  border-bottom: 1px solid var(--rule);
}
.hero-inner {
  max-width: 1160px; margin: 0 auto;
  display: flex; flex-direction: column;
  align-items: center;
}

/* CHANGE 1: Center the hero left column text */
.hero-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 680px;
}

.badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--bg-4);
  border: 1px solid var(--rule-3);
  border-radius: 100px; padding: 4px 14px 4px 10px;
  font-family: var(--ff-mono); font-size: 10px;
  color: var(--green-hi); letter-spacing: 0.12em;
  text-transform: uppercase; margin-bottom: 28px;
}
.badge-dot {
  width: 5px; height: 5px;
  background: var(--amber-2); border-radius: 50%;
  animation: pulse-dot 2.4s ease-in-out infinite;
}
@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.2} }

h1 {
  font-family: var(--ff-display);
  font-size: clamp(42px, 4.6vw, 66px);
  font-weight: 900; line-height: 1.04;
  color: var(--text-1); letter-spacing: -0.03em;
  margin-bottom: 6px;
}
h1 em { font-style: italic; color: var(--amber-2); }

.hero-sub-formula {
  display: inline-block;
  font-family: var(--ff-mono); font-size: 13px;
  color: var(--amber-2); background: var(--amber-bg);
  border: 1px solid var(--rule-3);
  border-radius: var(--r); padding: 6px 16px;
  margin: 22px 0 28px; letter-spacing: 0.05em;
}

.hero-desc {
  font-size: 16px; color: var(--text-2);
  line-height: 1.82; max-width: 480px; margin-bottom: 38px;
}

.hero-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }

.btn-primary {
  font-size: 14px; font-weight: 600; color: var(--bg);
  background: var(--green); border: 1px solid var(--green);
  padding: 12px 30px; border-radius: var(--r); cursor: pointer;
  text-decoration: none; display: inline-block;
  transition: background 160ms;
}
.btn-primary:hover { background: var(--green-hi); }

.btn-secondary {
  font-size: 14px; font-weight: 500; color: var(--text-2);
  background: var(--bg-3); border: 1px solid var(--rule-2);
  padding: 12px 26px; border-radius: var(--r); cursor: pointer;
  text-decoration: none; display: inline-block;
  transition: border-color 160ms, color 160ms;
}
.btn-secondary:hover { border-color: var(--rule-3); color: var(--text-1); }

.hero-trust {
  display: flex; align-items: center; gap: 28px;
  margin-top: 36px; padding-top: 32px;
  border-top: 1px solid var(--rule); flex-wrap: wrap;
  justify-content: center;
}
.trust-item {
  font-family: var(--ff-mono); font-size: 11px;
  color: var(--text-4); letter-spacing: 0.08em;
  display: flex; align-items: center; gap: 8px;
}
.trust-item::before {
  content:''; display:block; width:5px; height:5px;
  background: var(--amber); border-radius: 50%;
}

/* ─── TERMINAL CARD ─── */
.terminal {
  background: var(--bg-3);
  border: 1px solid var(--rule-3);
  border-radius: var(--rl); overflow: hidden;
}
.term-bar {
  background: var(--bg-4);
  border-bottom: 1px solid var(--rule-3);
  padding: 11px 18px;
  display: flex; align-items: center; gap: 10px;
}
.term-dots { display: flex; gap: 6px; }
.tdot { width: 10px; height: 10px; border-radius: 50%; }
.tdot-r { background: #4a2a4a; }
.tdot-y { background: #3a4a2a; }
.tdot-g { background: var(--amber); }
.term-title {
  font-family: var(--ff-mono); font-size: 11px;
  color: var(--text-4); letter-spacing: 0.08em;
  margin-left: auto; margin-right: auto;
}
.term-body { padding: 24px 24px 18px; }
.term-comment {
  font-family: var(--ff-mono); font-size: 10px;
  color: var(--text-4); letter-spacing: 0.14em;
  text-transform: uppercase; margin-bottom: 20px;
}
.matrix-row { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.mat-label { font-family: var(--ff-mono); font-size: 12px; color: var(--text-3); min-width: 28px; }
.mat-bracket {
  font-family: var(--ff-display); font-size: 36px;
  line-height: 1; font-weight: 300; color: var(--rule-3);
  align-self: center;
}
.mat-grid { display: grid; grid-template-columns: repeat(3, 30px); gap: 5px; }
.mat-cell {
  font-family: var(--ff-mono); font-size: 12px; font-weight: 500;
  text-align: center; border-radius: 3px; padding: 4px 0;
  color: var(--text-1); background: var(--bg-4); border: 1px solid var(--rule-3);
}
.mat-vec { display: grid; grid-template-columns: 30px; gap: 5px; }
.mat-vec .mat-cell { color: var(--text-2); background: var(--bg-5); border-color: var(--rule-3); }
.mat-vec.result .mat-cell {
  color: var(--amber-2); background: var(--amber-bg); border-color: var(--rule-3);
}
.arrow-glyph { font-size: 16px; color: var(--text-4); margin: 0 4px; }

.term-footer {
  background: var(--bg-4);
  border-top: 1px solid var(--rule-3);
  padding: 12px 18px;
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;
}
.pill-row { display: flex; gap: 6px; flex-wrap: wrap; }
.pill {
  font-family: var(--ff-mono); font-size: 10px;
  padding: 3px 10px; border-radius: 100px; border: 1px solid;
}
.pill-plain { color: var(--text-3); border-color: var(--rule-2); background: var(--bg-3); }
.pill-cipher { color: var(--amber-2); border-color: var(--rule-3); background: var(--amber-bg); }
.term-mod { font-family: var(--ff-mono); font-size: 10px; color: var(--text-4); }

/* ─── STATS ─── */
.stats { background: var(--bg-2); border-bottom: 1px solid var(--rule); }
.stats-row {
  max-width: 1160px; margin: 0 auto;
  display: grid; grid-template-columns: repeat(4, 1fr);
}
.stat-cell { padding: 36px 24px; text-align: center; border-right: 1px solid var(--rule); }
.stat-cell:last-child { border-right: none; }
.stat-val {
  display: block;
  font-family: var(--ff-display); font-size: 44px;
  font-weight: 900; color: var(--amber-2);
  line-height: 1; letter-spacing: -0.04em;
}
.stat-label {
  display: block;
  font-family: var(--ff-mono); font-size: 10px;
  color: var(--text-4); letter-spacing: 0.18em;
  text-transform: uppercase; margin-top: 8px;
}

/* ─── SECTION BASE ─── */
section { display: block; }
.wrap { max-width: 1160px; margin: 0 auto; padding: 96px 40px; }

.sec-tag {
  font-family: var(--ff-mono); font-size: 10px;
  color: var(--amber); letter-spacing: 0.22em;
  text-transform: uppercase; margin-bottom: 18px;
  display: flex; align-items: center; gap: 10px;
}
.sec-tag::after {
  content:''; display:block;
  width:24px; height:1px; background: var(--rule-3);
}

h2 {
  font-family: var(--ff-display);
  font-size: clamp(30px, 3.2vw, 48px);
  font-weight: 900; color: var(--text-1);
  line-height: 1.08; letter-spacing: -0.03em;
}
h2 em { font-style: italic; color: var(--amber-2); }

.sec-sub {
  font-size: 15px; color: var(--text-2);
  max-width: 460px; margin-top: 14px; line-height: 1.76;
}

/* ─── FEATURES ─── */
#features { background: var(--bg); border-bottom: 1px solid var(--rule); }

.feat-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  margin-top: 56px;
  border: 1px solid var(--rule-3);
  border-radius: var(--rx); overflow: hidden;
}
.feat-card {
  background: var(--bg-3);
  padding: 32px 26px;
  border-right: 1px solid var(--rule-2);
  border-bottom: 1px solid var(--rule-2);
  position: relative; transition: background 200ms;
}
.feat-grid > .feat-card:nth-child(3n) { border-right: none; }
.feat-grid > .feat-card:nth-last-child(-n+3) { border-bottom: none; }
.feat-card:hover { background: var(--bg-4); }
.feat-card::before {
  content:''; position: absolute; left:0; top:0;
  width:100%; height:2px; background: var(--bg-4);
  transition: background 200ms;
}
.feat-card:hover::before { background: var(--amber); }

.feat-num { font-family: var(--ff-mono); font-size: 10px; color: var(--text-4); letter-spacing: 0.18em; margin-bottom: 18px; }
.feat-icon {
  width: 38px; height: 38px;
  background: var(--bg-4); border: 1px solid var(--rule-3);
  border-radius: var(--r); display: flex; align-items: center;
  justify-content: center; font-family: var(--ff-mono);
  font-size: 11px; color: var(--amber-2); font-weight: 500;
  margin-bottom: 18px;
}
h3 {
  font-family: var(--ff-display); font-size: 18px; font-weight: 700;
  color: var(--text-1); margin-bottom: 10px; letter-spacing: -0.02em;
}
.feat-card p { font-size: 13px; color: var(--text-2); line-height: 1.72; }
.feat-tag {
  display: inline-block; margin-top: 18px;
  font-family: var(--ff-mono); font-size: 10px;
  color: var(--amber-2); background: var(--amber-bg);
  border: 1px solid var(--rule-3);
  border-radius: 100px; padding: 3px 12px;
  letter-spacing: 0.1em; text-transform: uppercase;
}

/* ─── TIMELINE ─── */
#timeline { background: var(--bg-2); border-bottom: 1px solid var(--rule); }

.tl-track {
  display: grid; grid-template-columns: repeat(5, 1fr);
  margin-top: 56px;
  border: 1px solid var(--rule-2);
  border-radius: var(--rx); overflow: hidden;
}
.tl-cell {
  padding: 32px 20px 28px;
  background: var(--bg-3);
  border-right: 1px solid var(--rule);
  text-align: center; position: relative;
  transition: background 200ms;
}
.tl-cell:last-child { border-right: none; }
.tl-cell:hover { background: var(--bg-4); }

.tl-node {
  width: 48px; height: 48px;
  background: var(--bg-4); border: 1px solid var(--rule-2);
  border-radius: 50%; margin: 0 auto 16px;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--ff-mono); font-size: 11px; font-weight: 500;
  color: var(--text-3);
  transition: border-color 200ms, color 200ms, background 200ms;
}
.tl-cell:hover .tl-node { border-color: var(--amber); color: var(--amber-2); background: var(--amber-bg); }
.tl-label { font-family: var(--ff-display); font-size: 13px; font-weight: 700; color: var(--text-2); margin-bottom: 6px; }
.tl-desc { font-size: 11px; color: var(--text-3); line-height: 1.6; }

.tl-cell::after {
  content: '›'; position: absolute; right: -10px; top: 50%;
  transform: translateY(-50%);
  font-size: 16px; color: var(--rule-3); z-index: 2; background: var(--bg-3);
}
.tl-cell:last-child::after { display: none; }

/* ─── PROCESS ─── */
#process { background: var(--bg); border-bottom: 1px solid var(--rule); }

.process-header { text-align: center; max-width: 560px; margin: 0 auto 64px; }
.process-header .sec-tag { justify-content: center; }
.process-header .sec-tag::after { display: none; }
.process-header .sec-sub { margin: 14px auto 0; }

/* Scattered bento grid */
.scatter-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
}

.scatter-card {
  background: var(--bg-3);
  border: 1px solid var(--rule-3);
  border-radius: var(--rx);
  padding: 28px 26px;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(24px) scale(0.97);
  transition: opacity 0.55s ease, transform 0.55s ease,
              background 0.2s ease, border-color 0.2s ease;
}
.scatter-card.in-view {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.scatter-card:hover {
  background: var(--bg-4);
  border-color: var(--amber);
}

.scatter-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, var(--amber), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.scatter-card:hover::before { opacity: 1; }

.scatter-card::after {
  content: '';
  position: absolute;
  width: 140px; height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--amber-bg) 0%, transparent 70%);
  bottom: -50px; right: -50px;
  opacity: 0; transition: opacity 0.4s ease;
  pointer-events: none;
}
.scatter-card:hover::after { opacity: 1; }

/* Grid placements */
.scatter-card:nth-child(1) { grid-column: 1 / 6;   grid-row: 1; }
.scatter-card:nth-child(2) { grid-column: 6 / 10;  grid-row: 1; }
.scatter-card:nth-child(3) { grid-column: 10 / 13; grid-row: 1; }
.scatter-card:nth-child(4) { grid-column: 1 / 5;   grid-row: 2; }
.scatter-card:nth-child(5) { grid-column: 5 / 13;  grid-row: 2; }

/* Staggered animation delays */
.scatter-card:nth-child(1) { transition-delay: 0.05s; }
.scatter-card:nth-child(2) { transition-delay: 0.15s; }
.scatter-card:nth-child(3) { transition-delay: 0.25s; }
.scatter-card:nth-child(4) { transition-delay: 0.35s; }
.scatter-card:nth-child(5) { transition-delay: 0.45s; }

.scatter-num {
  font-family: var(--ff-mono); font-size: 10px;
  color: var(--text-4); letter-spacing: 0.18em;
  margin-bottom: 20px; display: block;
}
.scatter-icon {
  width: 44px; height: 44px;
  background: var(--bg-5); border: 1px solid var(--rule-3);
  border-radius: var(--r);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--ff-mono); font-size: 13px;
  color: var(--amber-2); font-weight: 500;
  margin-bottom: 18px;
  transition: background 0.2s, border-color 0.2s;
}
.scatter-card:hover .scatter-icon { background: var(--amber-bg); border-color: var(--amber); }
.scatter-card h4 {
  font-family: var(--ff-display); font-size: 17px; font-weight: 700;
  color: var(--text-1); margin-bottom: 8px; letter-spacing: -0.02em;
}
.scatter-card p { font-size: 13px; color: var(--text-2); line-height: 1.68; }

/* Wide card with visual side */
.scatter-card.wide-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: center;
}
.card-visual {
  display: flex; align-items: center; justify-content: center;
  flex-wrap: wrap; gap: 8px;
}
.fchain-block {
  font-family: var(--ff-mono); font-size: 11px;
  background: var(--bg-5); border: 1px solid var(--rule-3);
  border-radius: var(--r); padding: 8px 14px;
  color: var(--amber-2);
  animation: float-chip 3s ease-in-out infinite;
}
.fchain-block:nth-child(1) { animation-delay: 0s; }
.fchain-block:nth-child(2) { animation-delay: 0.6s; color: var(--text-2); }
.fchain-block:nth-child(3) { animation-delay: 1.2s; }
.fchain-block:nth-child(4) { animation-delay: 1.8s; color: var(--text-2); }
.fchain-block:nth-child(5) { animation-delay: 2.4s; }
.fchain-arr { font-size: 14px; color: var(--text-4); }

@keyframes float-chip {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
}

@media (max-width: 1024px) {
  .scatter-grid { grid-template-columns: 1fr 1fr; }
  .scatter-card:nth-child(1),
  .scatter-card:nth-child(2),
  .scatter-card:nth-child(3),
  .scatter-card:nth-child(4) { grid-column: span 1; grid-row: auto; }
  .scatter-card:nth-child(5) { grid-column: span 2; grid-row: auto; }
  .scatter-card.wide-card { grid-template-columns: 1fr; }
  .card-visual { display: none; }
}
@media (max-width: 640px) {
  .scatter-grid { grid-template-columns: 1fr; }
  .scatter-card { grid-column: 1 / 2 !important; grid-row: auto !important; }
}

/* ─── MODULES ─── */
#modules { background: var(--bg-2); border-bottom: 1px solid var(--rule); }

.modules-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 1px; margin-top: 52px;
  background: var(--rule-2);
  border: 1px solid var(--rule-3);
  border-radius: var(--rx); overflow: hidden;
}
.mod-card {
  background: var(--bg-3); padding: 26px 22px;
  display: flex; gap: 16px; align-items: flex-start;
  transition: background 200ms; cursor: pointer; text-decoration: none;
}
.mod-card:hover { background: var(--bg-4); }
.mod-icon {
  width: 40px; height: 40px; min-width: 40px;
  background: var(--bg-4); border: 1px solid var(--rule-3);
  border-radius: var(--r); display: flex; align-items: center;
  justify-content: center; font-family: var(--ff-mono);
  font-size: 11px; color: var(--amber-2); font-weight: 500;
  transition: background 200ms, border-color 200ms;
}
.mod-card:hover .mod-icon { background: var(--bg-5); border-color: var(--amber); }
.mod-info h4 { font-family: var(--ff-display); font-size: 15px; font-weight: 700; color: var(--text-1); margin-bottom: 7px; letter-spacing: -0.015em; }
.mod-info p { font-size: 12px; color: var(--text-2); line-height: 1.66; }
.mod-formula {
  display: inline-block; margin-top: 10px;
  font-family: var(--ff-mono); font-size: 10px;
  color: var(--amber-2); background: var(--amber-bg);
  border: 1px solid var(--rule-3); border-radius: 4px;
  padding: 3px 10px; letter-spacing: 0.05em;
}

/* ─── CTA ─── */
#cta { background: var(--bg); border-bottom: 1px solid var(--rule); }
.cta-layout {
  max-width: 1160px; margin: 0 auto; padding: 96px 40px;
  display: grid; grid-template-columns: 1fr 340px;
  gap: 64px; align-items: center;
}
.cta-form-card {
  background: var(--bg-3);
  border: 1px solid var(--rule-3);
  border-radius: var(--rl); padding: 30px;
}
.cta-form-card h3 { font-size: 17px; color: var(--text-1); font-family: var(--ff-display); font-weight: 700; margin-bottom: 6px; letter-spacing: -0.02em; }
.cta-form-card .form-hint { font-size: 12px; color: var(--text-3); margin-bottom: 22px; }

.field-label {
  display: block;
  font-family: var(--ff-mono); font-size: 10px;
  color: var(--text-2); letter-spacing: 0.14em;
  text-transform: uppercase; margin-bottom: 6px;
}
.field-input {
  width: 100%; background: var(--bg-4);
  border: 1px solid var(--rule-3); border-radius: var(--r);
  padding: 10px 12px; font-family: var(--ff-mono); font-size: 12px;
  color: var(--text-1); margin-bottom: 14px;
  transition: border-color 160ms;
}
.field-input:focus { outline: none; border-color: var(--amber); }
.field-input::placeholder { color: var(--text-4); }
.form-note {
  font-size: 11px; color: var(--text-4);
  text-align: center; margin-top: 10px;
  font-family: var(--ff-mono); letter-spacing: 0.04em;
}

/* ─── FOOTER ─── */
footer {
  background: var(--bg-2);
  border-top: 1px solid var(--rule);
  padding: 52px 40px 36px;
}
.footer-inner { max-width: 1160px; margin: 0 auto; }
.footer-top {
  display: grid; grid-template-columns: 260px 1fr 1fr 1fr;
  gap: 48px; padding-bottom: 44px;
  border-bottom: 1px solid var(--rule);
}
.footer-logo-mark {
  font-family: var(--ff-mono); font-size: 14px;
  font-weight: 500; color: var(--green);
  display: block; margin-bottom: 12px; letter-spacing: 0.04em;
}
.footer-brand p { font-size: 12px; color: var(--text-4); line-height: 1.72; }
.footer-col h5 {
  font-family: var(--ff-mono); font-size: 10px;
  font-weight: 500; color: var(--text-4);
  letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 16px;
}
.footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 9px; }
.footer-col a { font-size: 13px; color: var(--text-3); text-decoration: none; transition: color 160ms; }
.footer-col a:hover { color: var(--text-1); }

.footer-bottom {
  display: flex; justify-content: space-between;
  align-items: center; padding-top: 24px; flex-wrap: wrap; gap: 12px;
}
.footer-copy { font-family: var(--ff-mono); font-size: 11px; color: var(--text-4); letter-spacing: 0.04em; }
.footer-copy strong { color: var(--amber); font-weight: 400; }
.footer-bottom-links { display: flex; gap: 22px; list-style: none; }
.footer-bottom-links a {
  font-family: var(--ff-mono); font-size: 11px;
  color: var(--text-4); text-decoration: none; letter-spacing: 0.04em; transition: color 160ms;
}
.footer-bottom-links a:hover { color: var(--text-2); }

/* ─── REVEAL ─── */
.reveal { opacity: 0; transform: translateY(16px); transition: opacity 440ms ease, transform 440ms ease; }
.reveal.visible { opacity: 1; transform: none; }

/* ─── CURSOR ─── */
.cursor {
  display: inline-block; width: 3px; height: 56px;
  background: var(--amber-2); vertical-align: middle;
  margin-left: 4px; border-radius: 1px;
  animation: blink-caret 1.1s step-end infinite;
}
@keyframes blink-caret { 0%,100%{opacity:1} 50%{opacity:0} }

/* ─── RESPONSIVE ─── */
@media (max-width: 1024px) {
  .hero-inner { grid-template-columns: 1fr; gap: 52px; }
  .tl-track { grid-template-columns: 1fr 1fr 1fr; }
  .tl-cell:nth-child(3) { border-right: none; }
  .tl-cell:nth-child(3)::after { display: none; }
  .tl-cell:nth-child(4), .tl-cell:nth-child(5) { border-top: 1px solid var(--rule); }
  .cta-layout { grid-template-columns: 1fr; }
  .footer-top { grid-template-columns: 1fr 1fr; gap: 32px; }
  .modules-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 768px) {
  nav { padding: 0 20px; }
  .nav-links, .nav-right { display: none; }
  .nav-toggle { display: flex; }
  .hero { padding: 90px 20px 60px; }
  .feat-grid, .modules-grid { grid-template-columns: 1fr; }
  .tl-track { grid-template-columns: 1fr; }
  .tl-cell { border-right: none !important; border-bottom: 1px solid var(--rule); }
  .tl-cell::after { display: none !important; }
  .stats-row { grid-template-columns: 1fr 1fr; }
  .stat-cell:nth-child(2), .stat-cell:nth-child(4) { border-right: none; }
  .stat-cell:nth-child(3), .stat-cell:nth-child(4) { border-top: 1px solid var(--rule); }
  .wrap { padding: 64px 20px; }
  .cta-layout { padding: 64px 20px; }
  footer { padding: 44px 20px 28px; }
  .footer-top { grid-template-columns: 1fr; gap: 28px; }
  .footer-bottom { flex-direction: column; text-align: center; }
  .feat-grid, .tl-track, .modules-grid { border-radius:0; border-left:none; border-right:none; }
}
@media (max-width: 480px) {
  h1 { font-size: 38px; }
  .hero-actions { flex-direction: column; align-items: center; }
  .stats-row { grid-template-columns: 1fr 1fr; }
}
</style>
</head>
<body>

<div class="mobile-menu" id="mobileMenu" aria-hidden="true">
  <a href="#features">Features</a>
  <a href="#timeline">Pipeline</a>
  <a href="#process">How It Works</a>
  <a href="#modules">Modules</a>
  <a href="#" class="mobile-cta">Open the Lab →</a>
</div>

<nav>
  <a class="nav-logo" href="#">
    <div class="nav-logo-mark">K</div>
    LinearCrypt
  </a>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#timeline">Pipeline</a></li>
    <li><a href="#process">How It Works</a></li>
    <li><a href="#modules">Modules</a></li>
  </ul>
  <div class="nav-right">
    <a href="#" class="btn-flat">Docs</a>
    <a href="#" class="btn-cta">Open Lab →</a>
  </div>
  <button class="nav-toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
</nav>

<main>

<!-- HERO -->
<section class="hero">
  <div class="hero-inner">
    <!-- CHANGE 1: Added hero-left class for centering -->
    <div class="hero-left">
      <div class="badge"><span class="badge-dot"></span>Interactive Educational System</div>
      <h1>Decode the<br>Math of<br><em>Encryption</em><span class="cursor" aria-hidden="true"></span></h1>
      <div class="hero-sub-formula">C ≡ K · M (mod 27)</div>
      <p class="hero-desc">LinearCrypt is a transparent, step-by-step laboratory for the Hill Cipher. Watch every matrix multiplication, modular reduction, and row operation unfold — live, as you type.</p>
      <div class="hero-actions">
        <a href="#" class="btn-primary">Open the Lab</a>
        <a href="#features" class="btn-secondary">Explore Features</a>
      </div>
      <div class="hero-trust">
        <span class="trust-item">Free to use</span>
        <span class="trust-item">Step-by-step breakdowns</span>
        <span class="trust-item">No prior knowledge needed</span>
      </div>
    </div>

  </div>
</section>

<!-- STATS -->
<div class="stats">
  <div class="stats-row">
    <div class="stat-cell reveal"><span class="stat-val">Z₂₇</span><span class="stat-label">Modular Field</span></div>
    <div class="stat-cell reveal"><span class="stat-val">3×3</span><span class="stat-label">Key Matrix</span></div>
    <div class="stat-cell reveal"><span class="stat-val">6</span><span class="stat-label">Standalone Modules</span></div>
    <div class="stat-cell reveal"><span class="stat-val">2</span><span class="stat-label">Decryption Methods</span></div>
  </div>
</div>

<!-- FEATURES -->
<section id="features">
  <div class="wrap">
    <div class="reveal">
      <div class="sec-tag">Core Features</div>
      <h2>Every Operation,<br><em>Fully Exposed</em></h2>
      <p class="sec-sub">No black boxes. Every scalar, every row operation, every modular step is shown in full.</p>
    </div>
    <div class="feat-grid reveal">
      <div class="feat-card">
        <div class="feat-num">01</div>
        <div class="feat-icon">M→N</div>
        <h3>Message Encoding</h3>
        <p>Map plaintext to a 27-character numerical alphabet — A–Z as 1–26, space and period as 0 — then chunk into padded 3×1 column vectors.</p>
        <span class="feat-tag">Alphabet Mapping</span>
      </div>
      <div class="feat-card">
        <div class="feat-num">02</div>
        <div class="feat-icon">K·M</div>
        <h3>Live Encryption</h3>
        <p>Execute C ≡ K·M (mod 27) in real time. Full scalar arithmetic breakdowns for the first three blocks show exactly how plaintext becomes ciphertext.</p>
        <span class="feat-tag">Linear Transform</span>
      </div>
      <div class="feat-card">
        <div class="feat-num">03</div>
        <div class="feat-icon">K⁻¹</div>
        <h3>Gauss-Jordan Inversion</h3>
        <p>Find K⁻¹ via the augmented matrix [K|I]. Every row swap, scale, and elimination is annotated step by step, including the Z₂₇ determinant inverse.</p>
        <span class="feat-tag">Modular Arithmetic</span>
      </div>
      <div class="feat-card">
        <div class="feat-num">04</div>
        <div class="feat-icon">Δᵢ/Δ</div>
        <h3>Cramer's Rule</h3>
        <p>Block 1 decryption solved as a modular linear system via Cramer's Rule — determinant ratios over Z₂₇ shown with full intermediate values.</p>
        <span class="feat-tag">System of Equations</span>
      </div>
      <div class="feat-card">
        <div class="feat-num">05</div>
        <div class="feat-icon">M≡</div>
        <h3>Dual Decryption</h3>
        <p>Two decryption paths compared side by side: Cramer's Rule for block 1, and inverse matrix multiplication M ≡ K⁻¹·C (mod 27) for all remaining blocks.</p>
        <span class="feat-tag">Comparative Analysis</span>
      </div>
      <div class="feat-card">
        <div class="feat-num">06</div>
        <div class="feat-icon">λ</div>
        <h3>Standalone Modules</h3>
        <p>Isolate any component — vector encoding, encryption, Gauss-Jordan, Cramer's Rule, or modular determinant — in its own independent sandbox.</p>
        <span class="feat-tag">Modular Lab</span>
      </div>
    </div>
  </div>
</section>

<!-- TIMELINE -->
<section id="timeline">
  <div class="wrap">
    <div class="reveal">
      <div class="sec-tag">The Pipeline</div>
      <h2>Your Message's<br><em>Complete Journey</em></h2>
      <p class="sec-sub">From raw text to ciphertext and back — every transformation tracked.</p>
    </div>
    <div class="tl-track reveal">
      <div class="tl-cell">
        <div class="tl-node">M</div>
        <div class="tl-label">Plaintext Input</div>
        <div class="tl-desc">Text mapped to 27-char alphabet values</div>
      </div>
      <div class="tl-cell">
        <div class="tl-node">→N</div>
        <div class="tl-label">Vector Partition</div>
        <div class="tl-desc">Chunked into padded 3×1 column vectors</div>
      </div>
      <div class="tl-cell">
        <div class="tl-node">K·M</div>
        <div class="tl-label">Encryption</div>
        <div class="tl-desc">Matrix multiplication mod 27 per block</div>
      </div>
      <div class="tl-cell">
        <div class="tl-node">K⁻¹</div>
        <div class="tl-label">Key Inversion</div>
        <div class="tl-desc">Gauss-Jordan over Z₂₇ with annotations</div>
      </div>
      <div class="tl-cell">
        <div class="tl-node">M′</div>
        <div class="tl-label">Decryption</div>
        <div class="tl-desc">Cramer's Rule + inverse multiplication</div>
      </div>
    </div>
  </div>
</section>

<!-- PROCESS -->
<section id="process">
  <div class="wrap">

    <div class="process-header">
      <div class="sec-tag">Step by Step</div>
      <h2>Complete <em>Cryptographic</em> Lifecycle</h2>
      <p class="sec-sub">Follow your message through every transformation in real time.</p>
    </div>

    <div class="scatter-grid" id="scatterGrid">

      <!-- Card 1 — wide left -->
      <div class="scatter-card">
        <span class="scatter-num">01</span>
        <div class="scatter-icon">M→N</div>
        <h4>Plaintext → Numeric Vectors</h4>
        <p>Input text is mapped to the 27-char alphabet — A–Z as 1–26, space as 0 — then chunked into padded 3×1 column vectors ready for matrix operations.</p>
      </div>

      <!-- Card 2 — mid -->
      <div class="scatter-card">
        <span class="scatter-num">02</span>
        <div class="scatter-icon">K·M</div>
        <h4>Matrix Multiplication (mod 27)</h4>
        <p>Each vector block multiplies with key matrix K. Full scalar arithmetic breakdowns shown for the first three blocks.</p>
      </div>

      <!-- Card 3 — narrow right -->
      <div class="scatter-card">
        <span class="scatter-num">03</span>
        <div class="scatter-icon">K⁻¹</div>
        <h4>Key Inversion via Gauss-Jordan</h4>
        <p>K⁻¹ computed with full row operation annotation and modular determinant inverse within Z₂₇.</p>
      </div>

      <!-- Card 4 — narrow left -->
      <div class="scatter-card">
        <span class="scatter-num">04</span>
        <div class="scatter-icon">Δ/Δᵢ</div>
        <h4>Cramer's Rule for Block 1</h4>
        <p>First cipher block solved as a modular linear system — determinant ratios over Z₂₇ with full intermediate values.</p>
      </div>

      <!-- Card 5 — wide right, with animated visual -->
      <div class="scatter-card wide-card">
        <div class="card-content">
          <span class="scatter-num">05</span>
          <div class="scatter-icon">M≡</div>
          <h4>Inverse Multiplication for All Others</h4>
          <p>All remaining blocks decrypt via M ≡ K⁻¹·C (mod 27), completing the full decryption pass efficiently with annotated steps.</p>
        </div>
        <div class="card-visual">
          <span class="fchain-block">C</span>
          <span class="fchain-arr">→</span>
          <span class="fchain-block">K⁻¹·C</span>
          <span class="fchain-arr">→</span>
          <span class="fchain-block">mod 27</span>
          <span class="fchain-arr">→</span>
          <span class="fchain-block">M′</span>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- MODULES -->
<section id="modules">
  <div class="wrap">
    <div class="reveal">
      <div class="sec-tag">Standalone Modules</div>
      <h2>Isolate. Experiment.<br><em>Understand.</em></h2>
      <p class="sec-sub">Each mathematical component lives in its own independent sandbox. Input your own values and see exactly what changes.</p>
    </div>
    <div class="modules-grid">
      <div class="mod-card reveal" tabindex="0" role="button">
        <div class="mod-icon">∑</div>
        <div class="mod-info">
          <h4>Vector Conversion Lab</h4>
          <p>Input any string and watch it decompose into 27-alphabet numerals, then partition into padded 3×1 column vectors.</p>
          <span class="mod-formula">text → [n₁, n₂, n₃]ᵀ mod 27</span>
        </div>
      </div>
      <div class="mod-card reveal" tabindex="0" role="button">
        <div class="mod-icon">K·</div>
        <div class="mod-info">
          <h4>Encryption Module</h4>
          <p>Supply any key matrix K and message vector M. See the full scalar arithmetic of each row multiplication before modular reduction.</p>
          <span class="mod-formula">C ≡ K · M (mod 27)</span>
        </div>
      </div>
      <div class="mod-card reveal" tabindex="0" role="button">
        <div class="mod-icon">[K|I]</div>
        <div class="mod-info">
          <h4>Gauss-Jordan Inverter</h4>
          <p>Step through augmented matrix row operations over Z₂₇. Every swap, scale, and elimination fully annotated with modular arithmetic.</p>
          <span class="mod-formula">det⁻¹(K) · adj(K) mod 27</span>
        </div>
      </div>
      <div class="mod-card reveal" tabindex="0" role="button">
        <div class="mod-icon">Δᵢ/Δ</div>
        <div class="mod-info">
          <h4>Cramer's Rule Solver</h4>
          <p>Provide a 3×3 coefficient matrix and RHS vector. Compute each replaced-column determinant and the final solution vector modulo 27.</p>
          <span class="mod-formula">xᵢ = det(Kᵢ) · det(K)⁻¹ mod 27</span>
        </div>
      </div>
      <div class="mod-card reveal" tabindex="0" role="button">
        <div class="mod-icon">K⁻¹·</div>
        <div class="mod-info">
          <h4>Decryption Module</h4>
          <p>Enter ciphertext vectors alongside K⁻¹. Watch the inverse multiplication restore each plaintext block with full intermediate breakdowns.</p>
          <span class="mod-formula">M ≡ K⁻¹ · C (mod 27)</span>
        </div>
      </div>
      <div class="mod-card reveal" tabindex="0" role="button">
        <div class="mod-icon">det</div>
        <div class="mod-info">
          <h4>Modular Determinant</h4>
          <p>Test any 3×3 matrix for invertibility within Z₂₇. Compute the determinant, find gcd(det, 27), and derive the modular multiplicative inverse.</p>
          <span class="mod-formula">det(K) mod 27 · x ≡ 1 mod 27</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section id="cta">
  <div class="cta-layout">
    <div class="reveal">
      <div class="sec-tag">Ready to Begin?</div>
      <h2>Start Decoding<br><em>Right Now</em></h2>
      <p style="font-size:16px;color:var(--text-2);max-width:420px;margin-top:16px;line-height:1.8">Type any message. Watch it encrypt, transform, and decrypt — every matrix operation explained at each step. No account required.</p>
      <div style="display:flex;gap:10px;margin-top:30px;flex-wrap:wrap">
        <a href="#" class="btn-primary">Open LinearCrypt Lab</a>
        <a href="#features" class="btn-secondary">Browse Features</a>
      </div>
    </div>
    <div class="cta-form-card reveal">
      <h3>Try it instantly</h3>
      <p class="form-hint">Enter a message below to preview the encoding — no sign-up needed.</p>
      <label class="field-label" for="demo-msg">Your Message</label>
      <input class="field-input" id="demo-msg" type="text" placeholder="e.g. HELLO WORLD" maxlength="30" autocomplete="off" spellcheck="false">
      <label class="field-label" for="demo-key">Key (optional)</label>
      <input class="field-input" id="demo-key" type="text" placeholder="Default key pre-loaded" maxlength="20" autocomplete="off">
      <a href="#" class="btn-primary" style="display:block;text-align:center;width:100%">Encrypt &amp; Visualize →</a>
      <p class="form-note">Free · No sign-up · Runs in your browser</p>
    </div>
  </div>
</section>

</main>

<footer>
  <div class="footer-inner">
    <div class="footer-top">
      <div class="footer-brand">
        <span class="footer-logo-mark">[LinearCrypt]</span>
        <p>An interactive educational laboratory for understanding the Hill Cipher through live mathematical visualization.</p>
      </div>
      <div class="footer-col">
        <h5>Learn</h5>
        <ul>
          <li><a href="#">Hill Cipher Overview</a></li>
          <li><a href="#">Linear Algebra Primer</a></li>
          <li><a href="#">Modular Arithmetic</a></li>
          <li><a href="#">Gauss-Jordan Guide</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5>Modules</h5>
        <ul>
          <li><a href="#">Vector Conversion</a></li>
          <li><a href="#">Encryption</a></li>
          <li><a href="#">Key Inversion</a></li>
          <li><a href="#">Cramer's Rule</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5>Project</h5>
        <ul>
          <li><a href="#">Documentation</a></li>
          <li><a href="#">Source Code</a></li>
          <li><a href="#">Changelog</a></li>
          <li><a href="#">About</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p class="footer-copy"><strong>LinearCrypt</strong> · Built for students of linear algebra and cryptography</p>
      <ul class="footer-bottom-links">
        <li><a href="#">Privacy</a></li>
        <li><a href="#">Terms</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </div>
  </div>
</footer>

<script>
const toggle = document.getElementById('navToggle');
const menu   = document.getElementById('mobileMenu');
toggle.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  toggle.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-hidden', String(!open));
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  menu.classList.remove('open');
  toggle.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-hidden', 'true');
}));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 60);
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.06 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const cells = document.querySelectorAll('#keyMatrix .mat-cell');
const origVals = Array.from(cells).map(c => c.textContent);
setInterval(() => {
  const idx = Math.floor(Math.random() * cells.length);
  const cell = cells[idx];
  cell.textContent = Math.floor(Math.random() * 27);
  cell.style.background = '#1c2060';
  cell.style.borderColor = '#c7d2fe';
  cell.style.color = '#e0e7ff';
  setTimeout(() => {
    cell.textContent = origVals[idx];
    cell.style.background = '';
    cell.style.borderColor = '';
    cell.style.color = '';
  }, 650);
}, 1400);

document.querySelectorAll('.mod-card[tabindex]').forEach(card => {
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
  });
});

// Scatter cards scroll-in animation
const scatterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      scatterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.scatter-card').forEach(card => scatterObserver.observe(card));
</script>
</body>
</html>