import { basename } from 'node:path';
import { escapeHtml, writeTextFile } from './utils.mjs';

export async function writeDeckHtml(storyboard, outputPath) {
  const html = renderDeckHtml(storyboard);
  await writeTextFile(outputPath, html);
  return outputPath;
}

export function renderDeckHtml(storyboard) {
  const theme = storyboard.theme;
  const settings = storyboard.settings;
  const slides = storyboard.slides.map((slide, index) => renderSlide(slide, index, storyboard.slides.length)).join('\n');

  return `<!doctype html>
<html lang="${escapeHtml(storyboard.language || 'zh-TW')}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(storyboard.title)}</title>
  <style>
    :root {
      --bg: ${theme.background};
      --fg: ${theme.foreground};
      --muted: ${theme.muted};
      --accent: ${theme.accent};
      --accent-soft: ${theme.accentSoft};
      --panel: ${theme.panel};
      --transition-ms: ${settings.transitionMs}ms;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    * { box-sizing: border-box; }
    html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: var(--bg); color: var(--fg); }
    body { -webkit-font-smoothing: antialiased; }

    .deck {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      background:
        radial-gradient(circle at 8% 12%, rgba(200, 111, 67, 0.18), transparent 28%),
        radial-gradient(circle at 86% 10%, rgba(32, 25, 22, 0.08), transparent 22%),
        linear-gradient(135deg, rgba(255,255,255,0.45), rgba(246,239,228,0));
    }

    .slide {
      position: absolute;
      inset: 0;
      padding: 6.2vh 6.6vw;
      opacity: 0;
      transform: translateY(18px) scale(0.985);
      transition: opacity var(--transition-ms) ease, transform var(--transition-ms) ease;
      pointer-events: none;
      display: grid;
      grid-template-columns: minmax(0, 1.08fr) minmax(360px, 0.72fr);
      grid-template-rows: auto 1fr auto;
      gap: 32px 54px;
    }

    .slide.active {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
      z-index: 2;
    }

    .brandline {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--muted);
      letter-spacing: 0.15em;
      text-transform: uppercase;
      font-size: 17px;
      font-weight: 700;
    }

    .brandline::before {
      content: "";
      display: inline-block;
      width: 70px;
      height: 8px;
      border-radius: 99px;
      background: var(--accent);
      margin-right: 18px;
      vertical-align: middle;
    }

    .content {
      align-self: center;
      max-width: 1120px;
    }

    .kicker {
      display: inline-block;
      color: var(--accent);
      font-weight: 800;
      letter-spacing: 0.18em;
      font-size: 22px;
      margin-bottom: 28px;
    }

    h1 {
      margin: 0;
      font-size: clamp(64px, 7vw, 128px);
      line-height: 0.92;
      letter-spacing: -0.065em;
      max-width: 1050px;
    }

    .subtitle {
      color: var(--muted);
      margin-top: 28px;
      font-size: clamp(28px, 2.6vw, 48px);
      line-height: 1.16;
      max-width: 900px;
      font-weight: 620;
    }

    .body {
      margin-top: 34px;
      color: var(--muted);
      font-size: clamp(28px, 2.1vw, 40px);
      line-height: 1.34;
      max-width: 920px;
    }

    .bullets {
      margin: 42px 0 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: 18px;
      max-width: 900px;
    }

    .bullets li {
      position: relative;
      padding-left: 38px;
      font-size: clamp(26px, 1.9vw, 36px);
      line-height: 1.24;
      color: var(--fg);
      font-weight: 620;
    }

    .bullets li::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0.48em;
      width: 15px;
      height: 15px;
      border-radius: 50%;
      background: var(--accent);
      box-shadow: 0 0 0 8px rgba(200,111,67,0.13);
    }

    .visual {
      align-self: center;
      justify-self: stretch;
      min-height: 540px;
      border-radius: 42px;
      background: linear-gradient(145deg, rgba(255,255,255,0.72), rgba(255,250,242,0.46));
      border: 1px solid rgba(32,25,22,0.08);
      box-shadow: 0 26px 90px rgba(32,25,22,0.14);
      position: relative;
      overflow: hidden;
      padding: 42px;
    }

    .visual::before {
      content: "";
      position: absolute;
      inset: -25% auto auto -22%;
      width: 72%;
      height: 72%;
      background: radial-gradient(circle, rgba(200,111,67,0.28), transparent 65%);
      filter: blur(2px);
    }

    .orb {
      position: absolute;
      border-radius: 50%;
      background: rgba(200, 111, 67, 0.18);
      border: 1px solid rgba(200, 111, 67, 0.28);
    }

    .orb.one { width: 310px; height: 310px; right: -70px; top: 80px; }
    .orb.two { width: 180px; height: 180px; left: 60px; bottom: 60px; background: rgba(32,25,22,0.08); border-color: rgba(32,25,22,0.12); }
    .orb.three { width: 96px; height: 96px; right: 180px; bottom: 110px; background: var(--accent-soft); }

    .metric-grid {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
      margin-top: 300px;
    }

    .metric {
      border-radius: 28px;
      padding: 26px;
      background: rgba(255, 250, 242, 0.82);
      border: 1px solid rgba(32,25,22,0.08);
    }

    .metric strong {
      display: block;
      color: var(--accent);
      font-size: 52px;
      line-height: 1;
      letter-spacing: -0.05em;
    }

    .metric span {
      display: block;
      color: var(--muted);
      font-size: 18px;
      margin-top: 8px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .footer {
      grid-column: 1 / -1;
      color: var(--muted);
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .progress {
      height: 8px;
      width: 300px;
      border-radius: 99px;
      background: rgba(32,25,22,0.09);
      overflow: hidden;
    }

    .progress > span {
      display: block;
      height: 100%;
      background: var(--accent);
      border-radius: inherit;
    }

    .reveal {
      opacity: 0;
      transform: translateY(26px);
    }

    .active .reveal {
      animation: riseIn 760ms cubic-bezier(.2,.8,.2,1) forwards;
      animation-delay: var(--delay, 0ms);
    }

    .active.effect-zoom .visual { animation: visualZoom 1000ms cubic-bezier(.2,.8,.2,1) 160ms both; }
    .active.effect-wipe .visual::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.72) 38%, transparent 72%);
      transform: translateX(-110%);
      animation: wipe 1320ms ease 300ms both;
    }
    .active.effect-slide .visual { animation: slidePanel 980ms cubic-bezier(.2,.8,.2,1) 180ms both; }
    .active.effect-spotlight .visual { animation: spotlight 1600ms ease 180ms both; }

    .active .orb.one { animation: floatA 4.8s ease-in-out infinite alternate; }
    .active .orb.two { animation: floatB 5.2s ease-in-out infinite alternate; }
    .active .orb.three { animation: pulse 2.6s ease-in-out infinite alternate; }

    @keyframes riseIn { to { opacity: 1; transform: translateY(0); } }
    @keyframes visualZoom { from { opacity: 0; transform: scale(.92); } to { opacity: 1; transform: scale(1); } }
    @keyframes wipe { to { transform: translateX(115%); } }
    @keyframes slidePanel { from { opacity: 0; transform: translateX(46px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes spotlight { 0% { filter: brightness(.9); transform: scale(.98); } 55% { filter: brightness(1.06); } 100% { filter: brightness(1); transform: scale(1); } }
    @keyframes floatA { to { transform: translate(-20px, 22px) scale(1.03); } }
    @keyframes floatB { to { transform: translate(18px, -18px) scale(.98); } }
    @keyframes pulse { to { transform: scale(1.12); opacity: .64; } }
  </style>
</head>
<body>
  <main class="deck" data-title="${escapeHtml(storyboard.title)}">
${slides}
  </main>
  <script>
    (() => {
      const slides = [...document.querySelectorAll('.slide')];
      let current = -1;

      function show(index) {
        const next = Math.max(0, Math.min(slides.length - 1, Number(index) || 0));
        if (current === next && slides[next].classList.contains('active')) return;
        slides.forEach((slide) => slide.classList.remove('active'));
        current = next;
        // Force animation restart for deterministic video capture.
        void slides[next].offsetWidth;
        slides[next].classList.add('active');
      }

      window.__autocut = {
        count: slides.length,
        show,
        title: ${JSON.stringify(storyboard.title)}
      };

      show(0);
    })();
  </script>
</body>
</html>`;
}

function renderSlide(slide, index, total) {
  const bulletItems = slide.bullets.map((bullet, bulletIndex) => {
    const delay = 440 + bulletIndex * 130;
    return `<li class="reveal" style="--delay:${delay}ms">${escapeHtml(bullet)}</li>`;
  }).join('\n');

  const metrics = renderMetrics(slide, index);
  const progress = Math.round(((index + 1) / total) * 100);

  return `    <section class="slide effect-${escapeHtml(slide.effect)}" id="${escapeHtml(slide.id)}" data-index="${index}">
      <div class="brandline"><span>AutoCut MP4 Deck</span><span>${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span></div>
      <div class="content">
        <div class="kicker reveal" style="--delay:80ms">${escapeHtml(slide.kicker)}</div>
        <h1 class="reveal" style="--delay:170ms">${escapeHtml(slide.title)}</h1>
        ${slide.subtitle ? `<div class="subtitle reveal" style="--delay:270ms">${escapeHtml(slide.subtitle)}</div>` : ''}
        ${slide.body ? `<div class="body reveal" style="--delay:360ms">${escapeHtml(slide.body)}</div>` : ''}
        ${bulletItems ? `<ul class="bullets">${bulletItems}</ul>` : ''}
      </div>
      <aside class="visual" aria-label="visual composition">
        <div class="orb one"></div>
        <div class="orb two"></div>
        <div class="orb three"></div>
        ${metrics}
      </aside>
      <footer class="footer"><span>${escapeHtml(basename(slide.id))}</span><div class="progress"><span style="width:${progress}%"></span></div></footer>
    </section>`;
}

function renderMetrics(slide, index) {
  const metrics = slide.metrics?.length ? slide.metrics : defaultMetrics(slide, index);
  return `<div class="metric-grid">
    ${metrics.slice(0, 4).map((metric) => `<div class="metric reveal" style="--delay:620ms"><strong>${escapeHtml(metric.value)}</strong><span>${escapeHtml(metric.label)}</span></div>`).join('\n    ')}
  </div>`;
}

function defaultMetrics(slide, index) {
  const bulletCount = slide.bullets?.length || 0;
  const effect = slide.effect || 'zoom';
  return [
    { value: String(index + 1), label: 'chapter' },
    { value: String(bulletCount), label: 'key points' },
    { value: effect, label: 'effect' },
    { value: '16:9', label: 'video frame' }
  ];
}
