import { writeTextFile, escapeHtml } from './utils.mjs';

export async function writeDeckHtml(storyboard, outputPath) {
  const html = renderDeckHtml(storyboard);
  await writeTextFile(outputPath, html);
  return outputPath;
}

export function renderDeckHtml(storyboard) {
  const { theme, settings, templateMeta, brand } = storyboard;
  const slides = storyboard.slides
    .map((slide, index) => renderSlide(slide, index, storyboard.slides.length, storyboard))
    .join('\n');

  return `<!doctype html>
<html lang="${escapeHtml(storyboard.language || 'zh-TW')}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="${templateMeta.mode === 'dark' ? 'dark' : 'light'}" />
  <title>${escapeHtml(storyboard.title)}</title>
  <style>
    :root {
      --bg: ${theme.background};
      --bg-alt: ${theme.backgroundAlt};
      --fg: ${theme.foreground};
      --muted: ${theme.muted};
      --accent: ${theme.accent};
      --accent-2: ${theme.accent2};
      --panel: ${theme.panel};
      --panel-strong: ${theme.panelStrong};
      --line: ${theme.line};
      --shadow: ${theme.shadow};
      --radius: ${theme.radius};
      --heading-font: ${theme.headingFont};
      --body-font: ${theme.bodyFont};
      --mono-font: ${theme.monoFont};
      --transition-ms: ${settings.transitionMs}ms;
      --page-x: clamp(58px, 6.1vw, 118px);
      --page-y: clamp(42px, 5.2vh, 76px);
      --frame-size: clamp(13px, 0.88vw, 18px);
      --title-xl: clamp(72px, 7.7vw, 148px);
      --title-lg: clamp(54px, 5.2vw, 100px);
      --title-md: clamp(42px, 3.8vw, 74px);
      --body-lg: clamp(25px, 1.7vw, 34px);
      --body-md: clamp(20px, 1.35vw, 28px);
    }

    * { box-sizing: border-box; }
    html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: var(--bg); color: var(--fg); }
    body {
      font-family: var(--body-font);
      -webkit-font-smoothing: antialiased;
      text-rendering: geometricPrecision;
    }

    .deck {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      isolation: isolate;
      background: var(--bg);
    }

    .deck::before,
    .deck::after {
      content: "";
      position: absolute;
      pointer-events: none;
      z-index: 0;
    }

    .art-editorial .deck::before {
      width: 52vw;
      height: 52vw;
      right: -19vw;
      top: -24vw;
      border-radius: 50%;
      border: 1px solid color-mix(in srgb, var(--accent) 28%, transparent);
      box-shadow: 0 0 0 8vw color-mix(in srgb, var(--accent) 7%, transparent), 0 0 0 17vw color-mix(in srgb, var(--fg) 3%, transparent);
    }

    .art-editorial .deck::after {
      width: 42vw;
      height: 14px;
      left: -8vw;
      bottom: 9vh;
      background: linear-gradient(90deg, transparent, var(--accent), transparent);
      opacity: 0.22;
      transform: rotate(-7deg);
    }

    .art-bands .deck::before {
      inset: -18vh -10vw auto 42vw;
      height: 76vh;
      transform: rotate(-13deg);
      border-radius: 50%;
      background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 18%, transparent), color-mix(in srgb, var(--accent-2) 10%, transparent));
      filter: blur(2px);
    }

    .art-bands .deck::after {
      left: 0;
      right: 0;
      bottom: 0;
      height: 12vh;
      background: linear-gradient(90deg, color-mix(in srgb, var(--accent) 11%, transparent), transparent 42%, color-mix(in srgb, var(--accent-2) 9%, transparent));
    }

    .art-halo .deck::before {
      width: 72vw;
      height: 72vw;
      right: -26vw;
      top: -35vw;
      border-radius: 50%;
      background: radial-gradient(circle, color-mix(in srgb, var(--accent) 27%, transparent), transparent 64%);
      filter: blur(18px);
    }

    .art-halo .deck::after {
      inset: 0;
      background-image: linear-gradient(color-mix(in srgb, var(--fg) 5%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--fg) 5%, transparent) 1px, transparent 1px);
      background-size: 64px 64px;
      mask-image: linear-gradient(to bottom, black, transparent 75%);
      opacity: 0.5;
    }

    .art-aurora .deck::before {
      inset: -35% -24% auto 8%;
      height: 115%;
      border-radius: 50%;
      background: conic-gradient(from 210deg, color-mix(in srgb, var(--accent) 52%, transparent), transparent 30%, color-mix(in srgb, var(--accent-2) 46%, transparent), transparent 71%);
      filter: blur(80px);
      opacity: 0.78;
      animation: auroraDrift 12s ease-in-out infinite alternate;
    }

    .art-aurora .deck::after {
      inset: 0;
      background: radial-gradient(circle at 18% 80%, color-mix(in srgb, var(--accent-2) 16%, transparent), transparent 34%);
    }

    .art-grid .deck::before {
      inset: 0;
      background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px);
      background-size: 42px 42px;
      opacity: 0.42;
    }

    .art-grid .deck::after {
      left: var(--page-x);
      top: 0;
      bottom: 0;
      width: 1px;
      background: color-mix(in srgb, var(--accent) 42%, transparent);
    }

    .art-terminal .deck::before {
      inset: 0;
      background: repeating-linear-gradient(to bottom, transparent 0, transparent 3px, color-mix(in srgb, var(--accent) 4%, transparent) 4px);
      opacity: 0.65;
    }

    .art-terminal .deck::after {
      width: 12px;
      height: 12px;
      left: 28px;
      top: 28px;
      border-radius: 50%;
      background: var(--accent);
      box-shadow: 22px 0 0 color-mix(in srgb, var(--accent-2) 88%, transparent), 44px 0 0 color-mix(in srgb, var(--fg) 38%, transparent);
    }

    .slide {
      position: absolute;
      inset: 0;
      z-index: 1;
      opacity: 0;
      pointer-events: none;
      overflow: hidden;
      transition: opacity calc(var(--transition-ms) * 0.62) ease;
    }

    .slide.active {
      opacity: 1;
      pointer-events: auto;
      z-index: 2;
    }

    .slide-shell {
      position: absolute;
      inset: 0;
      padding: var(--page-y) var(--page-x) calc(var(--page-y) * 0.72);
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) auto;
      gap: 24px;
    }

    .frame-top,
    .frame-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      font-size: var(--frame-size);
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--muted);
      position: relative;
      z-index: 8;
    }

    .brand-lockup,
    .frame-meta,
    .frame-pagination {
      display: inline-flex;
      align-items: center;
      gap: 13px;
      white-space: nowrap;
    }

    .brand-mark {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: inline-grid;
      place-items: center;
      background: var(--accent);
      color: var(--bg);
      font-family: var(--mono-font);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: -0.03em;
      box-shadow: 0 0 0 6px color-mix(in srgb, var(--accent) 11%, transparent);
    }

    .brand-name { color: var(--fg); font-weight: 800; letter-spacing: 0.11em; }
    .frame-rule { width: min(18vw, 260px); height: 1px; background: var(--line); }
    .frame-id { font-family: var(--mono-font); }

    .progress {
      width: min(20vw, 330px);
      height: 5px;
      overflow: hidden;
      border-radius: 999px;
      background: color-mix(in srgb, var(--fg) 10%, transparent);
    }

    .progress > span {
      display: block;
      height: 100%;
      width: var(--progress, 0%);
      border-radius: inherit;
      background: linear-gradient(90deg, var(--accent), var(--accent-2));
    }

    .layout-stage {
      min-height: 0;
      position: relative;
      align-self: stretch;
      display: grid;
      opacity: 0;
      transform: translateY(18px);
      filter: saturate(0.92);
    }

    .active .layout-stage {
      opacity: 1;
      transform: none;
      filter: none;
      transition: opacity var(--transition-ms) ease, transform var(--transition-ms) cubic-bezier(.2,.8,.2,1), filter var(--transition-ms) ease;
    }

    .effect-none .layout-stage { opacity: 1; transform: none; filter: none; }
    .effect-zoom .layout-stage { transform: scale(0.935); }
    .effect-zoom.active .layout-stage { transform: scale(1); }
    .effect-slide .layout-stage { transform: translateX(54px); }
    .effect-slide.active .layout-stage { transform: translateX(0); }
    .effect-rise .layout-stage { transform: translateY(54px); }
    .effect-rise.active .layout-stage { transform: translateY(0); }
    .effect-spotlight .layout-stage { transform: scale(0.982); filter: brightness(0.7) blur(1px); }
    .effect-spotlight.active .layout-stage { transform: scale(1); filter: brightness(1) blur(0); }
    .effect-wipe .layout-stage::after {
      content: "";
      position: absolute;
      inset: -4%;
      z-index: 30;
      background: linear-gradient(105deg, transparent 0%, color-mix(in srgb, var(--panel-strong) 96%, transparent) 35%, color-mix(in srgb, var(--accent) 42%, var(--panel-strong)) 50%, transparent 72%);
      transform: translateX(-130%);
      pointer-events: none;
    }
    .effect-wipe.active .layout-stage::after { animation: wipeAcross 1.25s cubic-bezier(.2,.8,.2,1) 180ms both; }

    .reveal {
      opacity: 0;
      transform: translateY(24px);
    }

    .active .reveal {
      animation: revealUp 760ms cubic-bezier(.2,.8,.2,1) forwards;
      animation-delay: var(--delay, 0ms);
    }

    .kicker {
      display: inline-flex;
      align-items: center;
      gap: 13px;
      margin-bottom: 22px;
      color: var(--accent);
      font-size: clamp(15px, 1.08vw, 21px);
      font-weight: 850;
      letter-spacing: 0.17em;
      text-transform: uppercase;
    }

    .kicker::before {
      content: "";
      width: 48px;
      height: 7px;
      border-radius: 999px;
      background: var(--accent);
    }

    .slide-title {
      margin: 0;
      font-family: var(--heading-font);
      font-size: var(--title-lg);
      line-height: 0.98;
      letter-spacing: -0.055em;
      text-wrap: balance;
    }

    .slide-subtitle {
      margin-top: 22px;
      max-width: 980px;
      color: var(--muted);
      font-size: clamp(27px, 2vw, 40px);
      line-height: 1.18;
      font-weight: 680;
      text-wrap: balance;
    }

    .slide-body {
      margin: 26px 0 0;
      max-width: 900px;
      color: var(--muted);
      font-size: var(--body-md);
      line-height: 1.48;
    }

    .bullet-list {
      margin: 32px 0 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: 17px;
    }

    .bullet-list li {
      position: relative;
      padding-left: 34px;
      font-size: clamp(21px, 1.38vw, 29px);
      line-height: 1.32;
      font-weight: 620;
    }

    .bullet-list li::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0.5em;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--accent);
      box-shadow: 0 0 0 7px color-mix(in srgb, var(--accent) 12%, transparent);
    }

    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 11px;
      margin-top: 30px;
    }

    .tag {
      display: inline-flex;
      align-items: center;
      min-height: 36px;
      padding: 7px 14px;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: color-mix(in srgb, var(--panel) 76%, transparent);
      color: var(--muted);
      font-family: var(--mono-font);
      font-size: clamp(13px, 0.85vw, 17px);
      letter-spacing: 0.045em;
    }

    /* Hero */
    .hero-stage {
      grid-template-columns: minmax(0, 1.22fr) minmax(380px, 0.78fr);
      align-items: center;
      gap: 5vw;
    }

    .hero-copy { position: relative; z-index: 3; }
    .hero-title { font-size: var(--title-xl); max-width: 1180px; }
    .hero-subtitle { max-width: 850px; }

    .hero-signature {
      position: relative;
      align-self: stretch;
      min-height: 540px;
      display: grid;
      place-items: center;
    }

    .hero-index {
      position: relative;
      z-index: 3;
      font-family: var(--heading-font);
      font-size: clamp(150px, 18vw, 350px);
      line-height: 0.8;
      letter-spacing: -0.09em;
      color: color-mix(in srgb, var(--accent) 82%, var(--fg));
      text-shadow: 0 24px 70px color-mix(in srgb, var(--accent) 18%, transparent);
    }

    .hero-ring,
    .hero-dot {
      position: absolute;
      border-radius: 50%;
    }

    .hero-ring.one { width: 78%; aspect-ratio: 1; border: 1px solid color-mix(in srgb, var(--accent) 42%, transparent); }
    .hero-ring.two { width: 58%; aspect-ratio: 1; border: 16px solid color-mix(in srgb, var(--accent) 12%, transparent); }
    .hero-ring.three { width: 96%; aspect-ratio: 1; border: 1px dashed color-mix(in srgb, var(--fg) 18%, transparent); animation: rotateSlow 18s linear infinite; }
    .hero-dot { width: 18px; height: 18px; top: 16%; right: 12%; background: var(--accent-2); box-shadow: 0 0 0 12px color-mix(in srgb, var(--accent-2) 12%, transparent); }
    .hero-template-label { position: absolute; right: 4%; bottom: 8%; font-family: var(--mono-font); font-size: 15px; color: var(--muted); letter-spacing: 0.13em; text-transform: uppercase; }

    /* Section */
    .section-stage {
      grid-template-columns: minmax(180px, 0.32fr) minmax(0, 1.68fr);
      align-items: center;
      gap: clamp(46px, 6vw, 120px);
    }

    .section-number {
      font-family: var(--mono-font);
      font-size: clamp(120px, 16vw, 300px);
      line-height: 0.8;
      color: color-mix(in srgb, var(--accent) 24%, transparent);
      writing-mode: vertical-rl;
      transform: rotate(180deg);
      justify-self: center;
    }

    .section-copy {
      border-left: 9px solid var(--accent);
      padding-left: clamp(40px, 5vw, 94px);
      max-width: 1260px;
    }

    .section-copy .slide-title { font-size: var(--title-xl); }

    /* Split and visual-left */
    .split-stage {
      grid-template-columns: minmax(0, 1.04fr) minmax(420px, 0.96fr);
      align-items: center;
      gap: clamp(40px, 5vw, 96px);
    }

    .visual-left-stage { grid-template-columns: minmax(420px, 0.96fr) minmax(0, 1.04fr); }
    .split-copy { position: relative; z-index: 4; }
    .visual-left-stage .split-copy { order: 2; }
    .visual-left-stage .visual-panel { order: 1; }

    .visual-panel {
      min-height: min(63vh, 680px);
      border-radius: var(--radius);
      border: 1px solid var(--line);
      background: linear-gradient(145deg, color-mix(in srgb, var(--panel-strong) 94%, transparent), color-mix(in srgb, var(--panel) 70%, transparent));
      box-shadow: var(--shadow);
      overflow: hidden;
      position: relative;
      isolation: isolate;
    }

    .visual-panel::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 10%, transparent), transparent 48%, color-mix(in srgb, var(--accent-2) 9%, transparent));
      z-index: -1;
    }

    .visual-image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: var(--image-fit, cover);
      object-position: var(--image-position, center);
    }

    .image-overlay {
      position: absolute;
      inset: auto 0 0;
      padding: 32px;
      color: #fff;
      background: linear-gradient(transparent, rgba(0,0,0,0.72));
      font-size: 17px;
      z-index: 2;
    }

    .abstract-scene {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
    }

    .scene-core {
      width: 44%;
      aspect-ratio: 1;
      border-radius: 36% 64% 58% 42% / 42% 35% 65% 58%;
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      box-shadow: 0 28px 90px color-mix(in srgb, var(--accent) 28%, transparent);
      animation: morph 7s ease-in-out infinite alternate;
    }

    .scene-ring { position: absolute; border-radius: 50%; border: 1px solid var(--line); }
    .scene-ring.r1 { width: 68%; aspect-ratio: 1; }
    .scene-ring.r2 { width: 86%; aspect-ratio: 1; border-style: dashed; animation: rotateSlow 20s linear infinite reverse; }
    .scene-chip {
      position: absolute;
      min-width: 132px;
      padding: 13px 17px;
      border-radius: 15px;
      background: color-mix(in srgb, var(--panel-strong) 88%, transparent);
      border: 1px solid var(--line);
      color: var(--fg);
      font-family: var(--mono-font);
      font-size: 14px;
      box-shadow: 0 14px 40px color-mix(in srgb, var(--bg) 32%, transparent);
    }
    .scene-chip.a { left: 8%; top: 16%; }
    .scene-chip.b { right: 7%; top: 28%; }
    .scene-chip.c { left: 18%; bottom: 12%; }
    .scene-caption { position: absolute; right: 28px; bottom: 22px; font-family: var(--mono-font); font-size: 13px; color: var(--muted); letter-spacing: 0.11em; text-transform: uppercase; }

    .mini-metrics {
      position: absolute;
      inset: 34px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 18px;
      align-content: end;
    }

    .mini-metric {
      min-height: 132px;
      padding: 22px;
      border-radius: min(var(--radius), 22px);
      background: color-mix(in srgb, var(--panel-strong) 86%, transparent);
      border: 1px solid var(--line);
      backdrop-filter: blur(10px);
    }
    .mini-metric strong { display: block; font-family: var(--heading-font); font-size: clamp(38px, 3vw, 62px); color: var(--accent); line-height: 1; }
    .mini-metric span { display: block; margin-top: 8px; color: var(--muted); font-size: 15px; text-transform: uppercase; letter-spacing: 0.08em; }

    /* Flow */
    .flow-stage,
    .metrics-stage,
    .compare-stage,
    .timeline-stage,
    .cards-stage,
    .architecture-stage {
      grid-template-rows: auto minmax(0, 1fr);
      gap: clamp(28px, 4vh, 54px);
    }

    .layout-heading {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
      gap: 48px;
      align-items: end;
    }
    .layout-heading .slide-title { font-size: var(--title-md); }
    .layout-heading .slide-body { margin: 0; justify-self: end; max-width: 620px; }

    .flow-track {
      display: grid;
      grid-template-columns: repeat(var(--flow-columns, 6), minmax(0, 1fr));
      align-items: stretch;
      gap: 18px;
      min-height: 0;
    }

    .flow-step {
      position: relative;
      min-width: 0;
      padding: clamp(24px, 2vw, 38px) clamp(20px, 1.55vw, 30px);
      border-radius: min(var(--radius), 26px);
      border: 1px solid var(--line);
      background: color-mix(in srgb, var(--panel) 86%, transparent);
      box-shadow: 0 18px 55px color-mix(in srgb, var(--bg) 22%, transparent);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 36px;
      overflow: hidden;
    }

    .flow-step::before {
      content: attr(data-step);
      position: absolute;
      right: -4px;
      bottom: -24px;
      font-family: var(--heading-font);
      font-size: clamp(80px, 8vw, 150px);
      line-height: 1;
      color: color-mix(in srgb, var(--accent) 10%, transparent);
    }

    .flow-step:not(:last-child)::after {
      content: "→";
      position: absolute;
      top: 50%;
      right: -17px;
      transform: translate(50%, -50%);
      z-index: 6;
      color: var(--accent);
      font-family: var(--mono-font);
      font-size: 26px;
    }

    .step-index { font-family: var(--mono-font); color: var(--accent); font-size: 16px; letter-spacing: 0.12em; }
    .step-title { position: relative; z-index: 2; margin: 0; font-size: clamp(25px, 1.65vw, 34px); line-height: 1.08; }
    .step-detail { position: relative; z-index: 2; margin-top: 14px; color: var(--muted); font-size: clamp(17px, 1.08vw, 22px); line-height: 1.38; }

    /* Metrics */
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(var(--metric-columns, 4), minmax(0, 1fr));
      gap: clamp(18px, 1.8vw, 32px);
      min-height: 0;
    }

    .metric-card {
      position: relative;
      padding: clamp(28px, 2.2vw, 44px);
      border-radius: var(--radius);
      border: 1px solid var(--line);
      background: color-mix(in srgb, var(--panel) 88%, transparent);
      box-shadow: 0 18px 60px color-mix(in srgb, var(--bg) 26%, transparent);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }

    .metric-card::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 8px;
      background: linear-gradient(90deg, var(--accent), var(--accent-2));
      transform-origin: left;
      transform: scaleX(var(--meter, 0.72));
    }

    .metric-value { display: block; font-family: var(--heading-font); font-size: clamp(64px, 6vw, 120px); line-height: 0.88; letter-spacing: -0.065em; color: var(--accent); }
    .metric-label { margin-top: 24px; font-size: clamp(19px, 1.25vw, 26px); font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; }
    .metric-detail { margin-top: 13px; color: var(--muted); font-size: clamp(16px, 1vw, 21px); line-height: 1.4; }
    .metric-trend { align-self: flex-start; margin-top: 20px; padding: 6px 10px; border-radius: 999px; color: var(--accent-2); background: color-mix(in srgb, var(--accent-2) 10%, transparent); font-family: var(--mono-font); font-size: 13px; }

    /* Compare */
    .compare-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: clamp(24px, 3vw, 56px);
      min-height: 0;
    }

    .compare-side {
      position: relative;
      padding: clamp(34px, 3vw, 58px);
      border-radius: var(--radius);
      border: 1px solid var(--line);
      background: color-mix(in srgb, var(--panel) 86%, transparent);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .compare-side.right {
      background: linear-gradient(145deg, color-mix(in srgb, var(--accent) 15%, var(--panel)), color-mix(in srgb, var(--accent-2) 8%, var(--panel)));
      border-color: color-mix(in srgb, var(--accent) 38%, var(--line));
      box-shadow: var(--shadow);
    }

    .compare-side::before {
      content: attr(data-symbol);
      position: absolute;
      right: 26px;
      top: 10px;
      font-family: var(--heading-font);
      font-size: clamp(100px, 10vw, 190px);
      line-height: 1;
      color: color-mix(in srgb, var(--accent) 9%, transparent);
    }

    .compare-eyebrow { color: var(--accent); font-family: var(--mono-font); font-size: 15px; letter-spacing: 0.14em; text-transform: uppercase; }
    .compare-title { position: relative; margin: 24px 0 0; font-family: var(--heading-font); font-size: clamp(42px, 4vw, 76px); line-height: 0.98; letter-spacing: -0.045em; }
    .compare-body { position: relative; margin: 22px 0 0; color: var(--muted); font-size: var(--body-md); line-height: 1.42; }
    .compare-items { position: relative; margin: auto 0 0; padding: 34px 0 0; list-style: none; display: grid; gap: 14px; }
    .compare-items li { padding: 14px 0; border-top: 1px solid var(--line); font-size: clamp(19px, 1.25vw, 26px); font-weight: 660; }

    /* Quote */
    .quote-stage {
      grid-template-columns: minmax(0, 1.55fr) minmax(290px, 0.45fr);
      align-items: center;
      gap: clamp(46px, 7vw, 130px);
    }

    .quote-main { position: relative; padding-left: clamp(38px, 4vw, 76px); }
    .quote-main::before { content: "“"; position: absolute; left: -10px; top: -80px; font-family: var(--heading-font); font-size: clamp(180px, 20vw, 360px); line-height: 1; color: color-mix(in srgb, var(--accent) 22%, transparent); }
    .quote-text { position: relative; margin: 0; font-family: var(--heading-font); font-size: clamp(58px, 6.2vw, 118px); line-height: 1.02; letter-spacing: -0.045em; text-wrap: balance; }
    .quote-attribution { margin-top: 40px; display: flex; align-items: center; gap: 16px; color: var(--muted); font-size: clamp(18px, 1.2vw, 24px); }
    .quote-attribution::before { content: ""; width: 64px; height: 5px; border-radius: 999px; background: var(--accent); }
    .quote-aside { align-self: stretch; border-left: 1px solid var(--line); padding-left: 38px; display: flex; flex-direction: column; justify-content: center; gap: 24px; }
    .quote-aside-label { font-family: var(--mono-font); font-size: 14px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); }
    .quote-aside .slide-body { margin: 0; }

    /* Timeline */
    .timeline-track {
      position: relative;
      margin: 0;
      padding: 42px 0 0;
      list-style: none;
      display: grid;
      grid-template-columns: repeat(var(--timeline-columns, 4), minmax(0, 1fr));
      gap: 22px;
      align-items: stretch;
    }

    .timeline-track::before {
      content: "";
      position: absolute;
      left: 2%;
      right: 2%;
      top: 20px;
      height: 3px;
      border-radius: 999px;
      background: linear-gradient(90deg, var(--accent), var(--accent-2));
    }

    .timeline-item {
      position: relative;
      padding: 34px 28px 30px;
      border-radius: min(var(--radius), 24px);
      background: color-mix(in srgb, var(--panel) 82%, transparent);
      border: 1px solid var(--line);
    }

    .timeline-item::before {
      content: "";
      position: absolute;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      top: -31px;
      left: 28px;
      background: var(--accent);
      border: 5px solid var(--bg);
      box-shadow: 0 0 0 2px var(--accent);
    }

    .timeline-label { font-family: var(--mono-font); color: var(--accent); font-size: 15px; letter-spacing: 0.11em; }
    .timeline-title { margin: 24px 0 0; font-family: var(--heading-font); font-size: clamp(31px, 2.4vw, 48px); line-height: 1.02; }
    .timeline-detail { margin-top: 18px; color: var(--muted); font-size: clamp(17px, 1.08vw, 22px); line-height: 1.43; }

    /* Cards */
    .card-grid {
      display: grid;
      grid-template-columns: repeat(var(--card-columns, 4), minmax(0, 1fr));
      gap: clamp(18px, 1.8vw, 30px);
      min-height: 0;
    }

    .content-card {
      position: relative;
      padding: clamp(28px, 2.2vw, 44px);
      border-radius: var(--radius);
      border: 1px solid var(--line);
      background: color-mix(in srgb, var(--panel) 86%, transparent);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      min-height: 260px;
    }

    .content-card::after {
      content: "";
      position: absolute;
      width: 160px;
      height: 160px;
      border-radius: 50%;
      right: -70px;
      bottom: -80px;
      background: color-mix(in srgb, var(--accent) 11%, transparent);
      box-shadow: 0 0 0 30px color-mix(in srgb, var(--accent-2) 5%, transparent);
    }

    .card-tag { color: var(--accent); font-family: var(--mono-font); font-size: 15px; letter-spacing: 0.12em; text-transform: uppercase; }
    .card-title { position: relative; z-index: 2; margin: auto 0 0; font-family: var(--heading-font); font-size: clamp(34px, 2.7vw, 54px); line-height: 1.02; }
    .card-body { position: relative; z-index: 2; margin-top: 18px; color: var(--muted); font-size: clamp(17px, 1.08vw, 22px); line-height: 1.42; }

    /* Statement */
    .statement-stage {
      align-items: center;
      justify-items: start;
    }

    .statement-wrap { max-width: 1420px; position: relative; }
    .statement-emphasis { margin-bottom: 28px; font-family: var(--mono-font); color: var(--accent); font-size: clamp(16px, 1.1vw, 22px); letter-spacing: 0.16em; text-transform: uppercase; }
    .statement-text { margin: 0; font-family: var(--heading-font); font-size: clamp(72px, 8vw, 154px); line-height: 0.98; letter-spacing: -0.06em; text-wrap: balance; }
    .statement-text strong { color: var(--accent); font-weight: inherit; }
    .statement-stage .slide-body { margin-top: 42px; max-width: 980px; font-size: var(--body-lg); }
    .statement-rail { position: absolute; left: 0; bottom: -38px; width: min(68vw, 1120px); height: 12px; background: linear-gradient(90deg, var(--accent), var(--accent-2), transparent); border-radius: 999px; }

    /* Code */
    .code-stage {
      grid-template-columns: minmax(330px, 0.72fr) minmax(0, 1.28fr);
      align-items: center;
      gap: clamp(38px, 5vw, 88px);
    }

    .code-window {
      min-width: 0;
      min-height: min(61vh, 660px);
      border-radius: var(--radius);
      overflow: hidden;
      background: #090d13;
      color: #dce7f5;
      border: 1px solid rgba(255,255,255,0.12);
      box-shadow: 0 34px 100px rgba(0,0,0,0.42);
      display: grid;
      grid-template-rows: auto 1fr;
    }

    .code-toolbar { height: 58px; padding: 0 22px; display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.045); border-bottom: 1px solid rgba(255,255,255,0.09); font-family: var(--mono-font); font-size: 14px; color: #8fa1b8; }
    .code-dots { display: inline-flex; gap: 9px; }
    .code-dots span { width: 12px; height: 12px; border-radius: 50%; background: #ff6b6b; }
    .code-dots span:nth-child(2) { background: #f2c94c; }
    .code-dots span:nth-child(3) { background: #59d987; }
    .code-language { color: color-mix(in srgb, var(--accent) 86%, #fff); text-transform: uppercase; letter-spacing: 0.09em; }
    .code-block { margin: 0; padding: 30px 0 34px; overflow: hidden; font-family: var(--mono-font); font-size: clamp(16px, 1.05vw, 22px); line-height: 1.55; counter-reset: code-line; }
    .code-line { display: block; padding: 0 34px 0 76px; min-height: 1.55em; position: relative; white-space: pre-wrap; }
    .code-line::before { counter-increment: code-line; content: counter(code-line); position: absolute; left: 28px; width: 28px; color: #536274; text-align: right; }
    .code-line.highlight { background: color-mix(in srgb, var(--accent) 15%, transparent); border-left: 4px solid var(--accent); padding-left: 72px; }
    .code-caption { margin-top: 18px; color: var(--muted); font-family: var(--mono-font); font-size: 14px; }

    /* Architecture */
    .architecture-stack {
      display: grid;
      gap: 14px;
      align-content: center;
      min-height: 0;
    }

    .architecture-layer {
      display: grid;
      grid-template-columns: minmax(180px, 0.33fr) minmax(0, 1.67fr);
      gap: 24px;
      align-items: center;
      min-height: 92px;
      padding: 20px 24px;
      border-radius: min(var(--radius), 22px);
      border: 1px solid var(--line);
      background: color-mix(in srgb, var(--panel) 84%, transparent);
      box-shadow: 0 13px 36px color-mix(in srgb, var(--bg) 22%, transparent);
    }

    .architecture-layer:nth-child(2n) { margin-left: 5%; }
    .architecture-layer:nth-child(3n) { margin-right: 5%; }
    .layer-title { font-family: var(--heading-font); font-size: clamp(25px, 1.8vw, 36px); color: var(--accent); }
    .layer-items { display: flex; flex-wrap: wrap; gap: 10px; }
    .layer-item { padding: 10px 15px; border-radius: 12px; border: 1px solid var(--line); background: color-mix(in srgb, var(--panel-strong) 82%, transparent); font-size: clamp(15px, 0.92vw, 19px); font-weight: 680; }
    .layer-description { color: var(--muted); font-size: 17px; }

    /* Ending */
    .ending-stage {
      grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
      align-items: center;
      gap: 6vw;
    }

    .ending-copy .slide-title { font-size: var(--title-xl); max-width: 1220px; }
    .ending-cta { margin-top: 40px; padding: 18px 22px; border-left: 6px solid var(--accent); background: color-mix(in srgb, var(--panel) 72%, transparent); color: var(--muted); font-family: var(--mono-font); font-size: clamp(15px, 1vw, 20px); line-height: 1.45; word-break: break-word; }
    .ending-symbol { width: min(34vw, 520px); aspect-ratio: 1; border-radius: 50%; display: grid; place-items: center; background: linear-gradient(135deg, var(--accent), var(--accent-2)); color: var(--bg); font-family: var(--heading-font); font-size: clamp(170px, 18vw, 330px); line-height: 1; box-shadow: var(--shadow); transform: rotate(-12deg); }

    /* Template-specific details */
    .template-terminal .kicker::before,
    .template-terminal .brand-mark { border-radius: 3px; }
    .template-terminal .visual-panel,
    .template-terminal .metric-card,
    .template-terminal .compare-side,
    .template-terminal .content-card,
    .template-terminal .flow-step { box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 12%, transparent), 0 20px 70px rgba(0,0,0,.46); }
    .template-terminal .slide-title::before { content: "> "; color: var(--accent); }
    .template-paper .frame-top, .template-paper .frame-bottom { color: color-mix(in srgb, var(--fg) 65%, transparent); }
    .template-paper .metric-card, .template-paper .content-card, .template-paper .compare-side { box-shadow: 7px 7px 0 color-mix(in srgb, var(--fg) 9%, transparent); }
    .template-aurora .visual-panel, .template-aurora .metric-card, .template-aurora .compare-side, .template-aurora .content-card { backdrop-filter: blur(18px); }
    .mode-dark .brand-mark { color: var(--fg); }

    @keyframes revealUp { to { opacity: 1; transform: translateY(0); } }
    @keyframes wipeAcross { from { transform: translateX(-130%); } to { transform: translateX(130%); } }
    @keyframes rotateSlow { to { transform: rotate(360deg); } }
    @keyframes morph { from { transform: rotate(-9deg) scale(.94); border-radius: 36% 64% 58% 42% / 42% 35% 65% 58%; } to { transform: rotate(12deg) scale(1.06); border-radius: 61% 39% 35% 65% / 52% 62% 38% 48%; } }
    @keyframes auroraDrift { to { transform: translate(7%, 5%) rotate(12deg) scale(1.08); } }

    @media (max-aspect-ratio: 4/3) {
      .hero-stage, .split-stage, .visual-left-stage, .code-stage, .quote-stage, .ending-stage { grid-template-columns: 1fr; gap: 30px; }
      .hero-signature, .visual-panel, .code-window, .ending-symbol { min-height: 330px; max-height: 38vh; }
      .hero-signature { order: -1; }
      .visual-left-stage .split-copy, .visual-left-stage .visual-panel { order: initial; }
      .flow-track, .metric-grid, .card-grid, .timeline-track { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .layout-heading { grid-template-columns: 1fr; }
      .layout-heading .slide-body { justify-self: start; }
    }
  </style>
</head>
<body class="template-${escapeHtml(storyboard.template)} mode-${escapeHtml(templateMeta.mode)} art-${escapeHtml(templateMeta.art)}">
  <main class="deck" data-template="${escapeHtml(storyboard.template)}" data-title="${escapeHtml(storyboard.title)}">
${slides}
  </main>
  <script>
    (() => {
      const slides = [...document.querySelectorAll('.slide')];
      let current = -1;

      function show(index) {
        const next = Math.max(0, Math.min(slides.length - 1, Number(index) || 0));
        slides.forEach((slide) => slide.classList.remove('active'));
        current = next;
        void slides[next].offsetWidth;
        slides[next].classList.add('active');
        document.documentElement.style.setProperty('--active-slide', String(next));
      }

      function move(delta) {
        show(current + delta);
      }

      window.__autocut = {
        count: slides.length,
        show,
        next: () => move(1),
        previous: () => move(-1),
        title: ${JSON.stringify(storyboard.title)},
        template: ${JSON.stringify(storyboard.template)},
        layouts: ${JSON.stringify(storyboard.slides.map((slide) => slide.layout))}
      };

      window.addEventListener('keydown', (event) => {
        if (['ArrowRight', 'PageDown', ' '].includes(event.key)) move(1);
        if (['ArrowLeft', 'PageUp'].includes(event.key)) move(-1);
      });

      show(0);
    })();
  </script>
</body>
</html>`;
}

function renderSlide(slide, index, total, storyboard) {
  const progress = Math.round(((index + 1) / total) * 100);
  const layoutHtml = renderLayout(slide, index, total, storyboard);
  const topFrame = renderTopFrame(storyboard, slide);
  const bottomFrame = renderBottomFrame(storyboard, slide, index, total, progress);

  return `    <section class="slide layout-${escapeHtml(slide.layout)} effect-${escapeHtml(slide.effect)} variant-${escapeHtml(slide.variant)}" id="${escapeHtml(slide.id)}" data-index="${index}" data-layout="${escapeHtml(slide.layout)}" data-effect="${escapeHtml(slide.effect)}">
      <div class="slide-shell">
        ${topFrame}
        ${layoutHtml}
        ${bottomFrame}
      </div>
    </section>`;
}

function renderLayout(slide, index, total, storyboard) {
  const renderers = {
    hero: renderHero,
    section: renderSection,
    split: renderSplit,
    'visual-left': renderVisualLeft,
    flow: renderFlow,
    metrics: renderMetrics,
    compare: renderCompare,
    quote: renderQuote,
    timeline: renderTimeline,
    cards: renderCards,
    statement: renderStatement,
    code: renderCode,
    architecture: renderArchitecture,
    ending: renderEnding
  };
  return renderers[slide.layout](slide, index, total, storyboard);
}

function renderTopFrame(storyboard, slide) {
  const brand = storyboard.brand;
  return `<header class="frame-top">
          <div class="brand-lockup"><span class="brand-mark">AC</span><span class="brand-name">${escapeHtml(brand.name)}</span><span>${escapeHtml(brand.label)}</span></div>
          <div class="frame-meta"><span>${escapeHtml(storyboard.templateMeta.label)}</span><span class="frame-rule"></span><span>${escapeHtml(slide.layout)}</span></div>
        </header>`;
}

function renderBottomFrame(storyboard, slide, index, total, progress) {
  const brand = storyboard.brand;
  const pagination = brand.showSlideNumber
    ? `<span class="frame-pagination"><span>${String(index + 1).padStart(2, '0')}</span><span>/</span><span>${String(total).padStart(2, '0')}</span></span>`
    : '';
  const progressBar = brand.showProgress
    ? `<span class="progress" style="--progress:${progress}%"><span></span></span>`
    : '';
  return `<footer class="frame-bottom"><span class="frame-id">${escapeHtml(slide.id)}</span><span class="frame-pagination">${progressBar}${pagination}</span></footer>`;
}

function renderHero(slide, index, total, storyboard) {
  return `<div class="layout-stage hero-stage">
          <div class="hero-copy">
            ${renderKicker(slide, 60)}
            <h1 class="slide-title hero-title reveal" style="--delay:140ms">${escapeHtml(slide.title)}</h1>
            ${slide.subtitle ? `<div class="slide-subtitle hero-subtitle reveal" style="--delay:260ms">${escapeHtml(slide.subtitle)}</div>` : ''}
            ${renderBody(slide.body, 350)}
            ${renderTags(slide.tags, 450)}
          </div>
          <div class="hero-signature reveal" style="--delay:220ms" aria-hidden="true">
            <span class="hero-ring one"></span><span class="hero-ring two"></span><span class="hero-ring three"></span><span class="hero-dot"></span>
            <span class="hero-index">${String(index + 1).padStart(2, '0')}</span>
            <span class="hero-template-label">${escapeHtml(storyboard.templateMeta.label)} / ${String(total).padStart(2, '0')} scenes</span>
          </div>
        </div>`;
}

function renderSection(slide, index) {
  return `<div class="layout-stage section-stage">
          <div class="section-number reveal" style="--delay:70ms">${String(index + 1).padStart(2, '0')}</div>
          <div class="section-copy">
            ${renderKicker(slide, 140)}
            <h1 class="slide-title reveal" style="--delay:240ms">${escapeHtml(slide.title)}</h1>
            ${slide.subtitle ? `<div class="slide-subtitle reveal" style="--delay:340ms">${escapeHtml(slide.subtitle)}</div>` : ''}
            ${renderBody(slide.body, 430)}
          </div>
        </div>`;
}

function renderSplit(slide) {
  return `<div class="layout-stage split-stage">
          <div class="split-copy">
            ${renderKicker(slide, 60)}
            <h1 class="slide-title reveal" style="--delay:150ms">${escapeHtml(slide.title)}</h1>
            ${slide.subtitle ? `<div class="slide-subtitle reveal" style="--delay:250ms">${escapeHtml(slide.subtitle)}</div>` : ''}
            ${renderBody(slide.body, 340)}
            ${renderBullets(slide.bullets, 430)}
            ${renderTags(slide.tags, 620)}
          </div>
          ${renderVisualPanel(slide, 230)}
        </div>`;
}

function renderVisualLeft(slide) {
  return `<div class="layout-stage split-stage visual-left-stage">
          ${renderVisualPanel(slide, 120)}
          <div class="split-copy">
            ${renderKicker(slide, 150)}
            <h1 class="slide-title reveal" style="--delay:240ms">${escapeHtml(slide.title)}</h1>
            ${slide.subtitle ? `<div class="slide-subtitle reveal" style="--delay:340ms">${escapeHtml(slide.subtitle)}</div>` : ''}
            ${renderBody(slide.body, 430)}
            ${renderBullets(slide.bullets, 510)}
          </div>
        </div>`;
}

function renderFlow(slide) {
  const steps = slide.steps.length ? slide.steps : slide.bullets.map((title, index) => ({ title, detail: '', index: index + 1 }));
  const columns = Math.min(Math.max(steps.length, 2), 6);
  const cards = steps.map((step, index) => `<article class="flow-step reveal" data-step="${String(index + 1).padStart(2, '0')}" style="--delay:${180 + index * 105}ms">
            <span class="step-index">STEP ${String(index + 1).padStart(2, '0')}</span>
            <div><h2 class="step-title">${escapeHtml(step.title)}</h2>${step.detail ? `<div class="step-detail">${escapeHtml(step.detail)}</div>` : ''}</div>
          </article>`).join('');
  return `<div class="layout-stage flow-stage" style="--flow-columns:${columns}">
          ${renderLayoutHeading(slide)}
          <div class="flow-track">${cards}</div>
        </div>`;
}

function renderMetrics(slide) {
  const metrics = slide.metrics;
  const columns = Math.min(Math.max(metrics.length, 2), 4);
  const cards = metrics.map((metric, index) => `<article class="metric-card reveal" style="--delay:${170 + index * 110}ms;--meter:${0.48 + ((index * 17) % 42) / 100}">
            <div><strong class="metric-value">${escapeHtml(metric.value)}</strong><div class="metric-label">${escapeHtml(metric.label)}</div>${metric.detail ? `<div class="metric-detail">${escapeHtml(metric.detail)}</div>` : ''}</div>
            ${metric.trend ? `<span class="metric-trend">${escapeHtml(metric.trend)}</span>` : ''}
          </article>`).join('');
  return `<div class="layout-stage metrics-stage" style="--metric-columns:${columns}">
          ${renderLayoutHeading(slide)}
          <div class="metric-grid">${cards}</div>
        </div>`;
}

function renderCompare(slide) {
  const comparison = slide.comparison;
  return `<div class="layout-stage compare-stage">
          ${renderLayoutHeading(slide)}
          <div class="compare-grid">
            ${renderCompareSide(comparison.left, 'left', '×', 170)}
            ${renderCompareSide(comparison.right, 'right', '✓', 290)}
          </div>
        </div>`;
}

function renderCompareSide(side, sideClass, symbol, delay) {
  return `<article class="compare-side ${sideClass} reveal" data-symbol="${symbol}" style="--delay:${delay}ms">
          ${side.eyebrow ? `<span class="compare-eyebrow">${escapeHtml(side.eyebrow)}</span>` : ''}
          <h2 class="compare-title">${escapeHtml(side.title)}</h2>
          ${side.body ? `<div class="compare-body">${escapeHtml(side.body)}</div>` : ''}
          ${side.items.length ? `<ul class="compare-items">${side.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
        </article>`;
}

function renderQuote(slide) {
  const quote = slide.quote || slide.statement || slide.body || slide.title;
  return `<div class="layout-stage quote-stage">
          <div class="quote-main">
            ${renderKicker(slide, 70)}
            <blockquote class="quote-text reveal" style="--delay:170ms">${escapeHtml(quote)}</blockquote>
            ${slide.quoteBy || slide.quoteSource ? `<div class="quote-attribution reveal" style="--delay:310ms"><span>${escapeHtml([slide.quoteBy, slide.quoteSource].filter(Boolean).join(' · '))}</span></div>` : ''}
          </div>
          <aside class="quote-aside reveal" style="--delay:360ms">
            <span class="quote-aside-label">Context</span>
            ${slide.title && slide.title !== quote ? `<h2 class="slide-title" style="font-size:var(--title-md)">${escapeHtml(slide.title)}</h2>` : ''}
            ${slide.body && slide.body !== quote ? `<div class="slide-body">${escapeHtml(slide.body)}</div>` : ''}
            ${renderTags(slide.tags, 0, false)}
          </aside>
        </div>`;
}

function renderTimeline(slide) {
  const columns = Math.min(Math.max(slide.timeline.length, 2), 5);
  const items = slide.timeline.map((item, index) => `<li class="timeline-item reveal" style="--delay:${180 + index * 120}ms">
            <span class="timeline-label">${escapeHtml(item.label)}</span>
            <h2 class="timeline-title">${escapeHtml(item.title)}</h2>
            ${item.detail ? `<div class="timeline-detail">${escapeHtml(item.detail)}</div>` : ''}
          </li>`).join('');
  return `<div class="layout-stage timeline-stage" style="--timeline-columns:${columns}">
          ${renderLayoutHeading(slide)}
          <ol class="timeline-track">${items}</ol>
        </div>`;
}

function renderCards(slide) {
  const cards = slide.cards.length ? slide.cards : slide.bullets.map((title, index) => ({ tag: String(index + 1).padStart(2, '0'), title, body: '' }));
  const columns = cards.length <= 2 ? 2 : cards.length === 3 ? 3 : 4;
  const items = cards.map((card, index) => `<article class="content-card reveal" style="--delay:${170 + index * 105}ms">
            <span class="card-tag">${escapeHtml(card.tag)}</span>
            <h2 class="card-title">${escapeHtml(card.title)}</h2>
            ${card.body ? `<div class="card-body">${escapeHtml(card.body)}</div>` : ''}
          </article>`).join('');
  return `<div class="layout-stage cards-stage" style="--card-columns:${columns}">
          ${renderLayoutHeading(slide)}
          <div class="card-grid">${items}</div>
        </div>`;
}

function renderStatement(slide) {
  const statement = slide.statement || slide.body || slide.title;
  return `<div class="layout-stage statement-stage">
          <div class="statement-wrap">
            ${renderKicker(slide, 60)}
            ${slide.emphasis ? `<div class="statement-emphasis reveal" style="--delay:130ms">${escapeHtml(slide.emphasis)}</div>` : ''}
            <h1 class="statement-text reveal" style="--delay:220ms">${escapeHtml(statement)}</h1>
            ${slide.body && slide.body !== statement ? `<div class="slide-body reveal" style="--delay:360ms">${escapeHtml(slide.body)}</div>` : ''}
            ${renderTags(slide.tags, 460)}
            <span class="statement-rail reveal" style="--delay:520ms"></span>
          </div>
        </div>`;
}

function renderCode(slide) {
  const code = slide.code;
  const lines = code.content.split('\n').map((line, index) => `<span class="code-line${code.highlights.includes(index + 1) ? ' highlight' : ''}">${escapeHtml(line || ' ')}</span>`).join('');
  return `<div class="layout-stage code-stage">
          <div class="split-copy">
            ${renderKicker(slide, 60)}
            <h1 class="slide-title reveal" style="--delay:150ms">${escapeHtml(slide.title)}</h1>
            ${renderBody(slide.body, 260)}
            ${renderBullets(slide.bullets, 350)}
          </div>
          <div class="reveal" style="--delay:220ms">
            <div class="code-window">
              <div class="code-toolbar"><span class="code-dots"><span></span><span></span><span></span></span><span>${escapeHtml(code.filename || 'snippet')}</span><span class="code-language">${escapeHtml(code.language)}</span></div>
              <pre class="code-block"><code>${lines}</code></pre>
            </div>
            ${code.caption ? `<div class="code-caption">${escapeHtml(code.caption)}</div>` : ''}
          </div>
        </div>`;
}

function renderArchitecture(slide) {
  const layers = slide.layers;
  const items = layers.map((layer, index) => `<article class="architecture-layer reveal" style="--delay:${170 + index * 110}ms">
            <div><div class="layer-title">${escapeHtml(layer.title)}</div>${layer.description ? `<div class="layer-description">${escapeHtml(layer.description)}</div>` : ''}</div>
            <div class="layer-items">${layer.items.map((item) => `<span class="layer-item">${escapeHtml(item)}</span>`).join('')}</div>
          </article>`).join('');
  return `<div class="layout-stage architecture-stage">
          ${renderLayoutHeading(slide)}
          <div class="architecture-stack">${items}</div>
        </div>`;
}

function renderEnding(slide) {
  return `<div class="layout-stage ending-stage">
          <div class="ending-copy">
            ${renderKicker(slide, 60)}
            <h1 class="slide-title reveal" style="--delay:150ms">${escapeHtml(slide.title)}</h1>
            ${renderBody(slide.body, 300)}
            ${slide.cta ? `<div class="ending-cta reveal" style="--delay:410ms">${escapeHtml(slide.cta)}</div>` : ''}
            ${renderTags(slide.tags, 500)}
          </div>
          <div class="ending-symbol reveal" style="--delay:220ms" aria-hidden="true">↗</div>
        </div>`;
}

function renderLayoutHeading(slide) {
  return `<header class="layout-heading">
          <div>${renderKicker(slide, 50)}<h1 class="slide-title reveal" style="--delay:130ms">${escapeHtml(slide.title)}</h1>${slide.subtitle ? `<div class="slide-subtitle reveal" style="--delay:230ms">${escapeHtml(slide.subtitle)}</div>` : ''}</div>
          ${slide.body ? `<div class="slide-body reveal" style="--delay:230ms">${escapeHtml(slide.body)}</div>` : '<span></span>'}
        </header>`;
}

function renderVisualPanel(slide, delay) {
  let content;
  if (slide.image) {
    content = `<img class="visual-image" src="${escapeHtml(slide.image.src)}" alt="${escapeHtml(slide.image.alt)}" style="--image-fit:${escapeHtml(slide.image.fit)};--image-position:${escapeHtml(slide.image.focalPoint)}" />${slide.image.caption ? `<div class="image-overlay">${escapeHtml(slide.image.caption)}</div>` : ''}`;
  } else if (slide.metrics.length) {
    content = `<div class="mini-metrics">${slide.metrics.slice(0, 4).map((metric) => `<div class="mini-metric"><strong>${escapeHtml(metric.value)}</strong><span>${escapeHtml(metric.label)}</span></div>`).join('')}</div>`;
  } else {
    content = `<div class="abstract-scene"><span class="scene-ring r1"></span><span class="scene-ring r2"></span><span class="scene-core"></span><span class="scene-chip a">STORY / 01</span><span class="scene-chip b">MOTION / 02</span><span class="scene-chip c">VOICE / 03</span><span class="scene-caption">${escapeHtml(slide.kicker)}</span></div>`;
  }
  return `<div class="visual-panel reveal" style="--delay:${delay}ms">${content}</div>`;
}

function renderKicker(slide, delay = 0) {
  return slide.kicker ? `<div class="kicker reveal" style="--delay:${delay}ms">${escapeHtml(slide.kicker)}</div>` : '';
}

function renderBody(body, delay = 0) {
  return body ? `<div class="slide-body reveal" style="--delay:${delay}ms">${escapeHtml(body)}</div>` : '';
}

function renderBullets(bullets, startDelay = 0) {
  if (!bullets.length) return '';
  return `<ul class="bullet-list">${bullets.map((bullet, index) => `<li class="reveal" style="--delay:${startDelay + index * 85}ms">${escapeHtml(bullet)}</li>`).join('')}</ul>`;
}

function renderTags(tags, delay = 0, reveal = true) {
  if (!tags.length) return '';
  return `<div class="tag-list${reveal ? ' reveal' : ''}"${reveal ? ` style="--delay:${delay}ms"` : ''}>${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>`;
}
