import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeStoryboard } from '../lib/storyboard.mjs';
import { renderDeckHtml } from '../lib/deck-html.mjs';

function showcase() {
  return normalizeStoryboard({
    title: 'Template Showcase',
    template: 'aurora',
    slides: [
      { layout: 'hero', title: 'Hero', tags: ['A', 'B'] },
      { layout: 'flow', title: 'Flow', steps: ['Input', 'Render', 'Ship'] },
      { layout: 'metrics', title: 'Metrics', metrics: [{ value: '6', label: 'themes' }, { value: '14', label: 'layouts' }] },
      { layout: 'compare', title: 'Compare', comparison: { before: { title: 'Before', items: ['One DOM'] }, after: { title: 'After', items: ['Registry'] } } },
      { layout: 'timeline', title: 'Timeline', timeline: [{ label: 'Now', title: 'Templates' }, { label: 'Next', title: 'Assets' }] },
      { layout: 'code', title: 'Code', code: { language: 'js', content: '<script>alert(1)</script>', highlights: [1] } },
      { layout: 'architecture', title: 'Architecture', layers: [{ title: 'App', items: ['Web', 'API'] }, { title: 'Data', items: ['Postgres'] }] },
      { layout: 'ending', title: 'Next action', cta: 'npm run render' }
    ]
  });
}

test('renderDeckHtml emits distinct DOM structures for structural layouts', () => {
  const html = renderDeckHtml(showcase());
  for (const token of ['hero-stage', 'flow-track', 'metric-grid', 'compare-grid', 'timeline-track', 'code-window', 'architecture-stack', 'ending-symbol']) {
    assert.match(html, new RegExp(token));
  }
  assert.match(html, /data-template="aurora"/);
  assert.match(html, /window\.__autocut/);
  assert.match(html, /layouts:/);
});

test('renderDeckHtml escapes user-provided code and text', () => {
  const html = renderDeckHtml(showcase());
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});

test('ordinary split slides render an abstract visual instead of invented KPI cards', () => {
  const storyboard = normalizeStoryboard({
    title: 'Split',
    slides: [
      { title: 'Cover' },
      { title: 'Plain', layout: 'split', body: 'No fake metrics.' }
    ]
  });
  const html = renderDeckHtml(storyboard);
  assert.match(html, /abstract-scene/);
  assert.doesNotMatch(html, /<div class="mini-metrics"><div class="mini-metric"><strong>1/);
});

test('renderDeckHtml emits hooks for content-led beat animation', () => {
  const storyboard = normalizeStoryboard({
    title: 'Beat animation',
    slides: [
      { title: 'Cover' },
      {
        layout: 'flow',
        title: 'Pipeline',
        steps: ['Input', 'Render'],
        beats: [
          { at: 0, action: 'show-title' },
          { at: 1.4, action: 'reveal-step', target: 0 },
          { at: 3.2, action: 'focus-step', target: 1 }
        ]
      }
    ]
  });
  const html = renderDeckHtml(storyboard);
  assert.match(html, /data-beats=/);
  assert.match(html, /data-beat-title/);
  assert.match(html, /data-beat-target="0"/);
  assert.match(html, /function scheduleBeats/);
  assert.match(html, /focus-step/);
});

test('renderDeckHtml renders a simple infographic diagram with beat targets', () => {
  const storyboard = normalizeStoryboard({
    title: 'Infographic',
    template: 'claude-editorial',
    slides: [
      { title: 'Cover' },
      {
        layout: 'infographic',
        title: '問題到結果',
        infographic: {
          left: { title: '問題', detail: '資料散落各處' },
          center: { title: '方法', detail: '整理成任務' },
          right: { title: '結果', detail: '進度可見', items: ['完成', '下一步'] },
          takeaways: ['先整理', '再執行']
        },
        beats: [
          { at: 0, action: 'show-title' },
          { at: 0.8, action: 'reveal', target: 'left' },
          { at: 1.8, action: 'focus', target: 'center' },
          { at: 3, action: 'reveal', target: 'right' },
          { at: 4.2, action: 'complete' }
        ]
      }
    ]
  });
  const html = renderDeckHtml(storyboard);
  assert.match(html, /infographic-stage/);
  assert.match(html, /diagram-node/);
  assert.match(html, /diagram-arrow/);
  assert.match(html, /data-beat-target="left"/);
  assert.match(html, /takeaway-pill/);
});

test('renderDeckHtml can place generated SVG art inside infographic nodes', () => {
  const storyboard = normalizeStoryboard({
    title: 'Infographic art',
    template: 'claude-editorial',
    slides: [
      { title: 'Cover' },
      {
        layout: 'infographic',
        title: 'Generated art',
        infographic: {
          left: { title: 'Problem', detail: 'Files', art: '../examples/assets/infographic/problem.svg' },
          center: { title: 'Method', detail: 'Core', art: '../examples/assets/infographic/method.svg' },
          right: { title: 'Result', detail: 'Dashboard', art: '../examples/assets/infographic/result.svg' }
        }
      }
    ]
  });
  const html = renderDeckHtml(storyboard);
  assert.match(html, /class="diagram-art" src="\.\.\/examples\/assets\/infographic\/problem\.svg"/);
  assert.match(html, /class="diagram-art" src="\.\.\/examples\/assets\/infographic\/method\.svg"/);
  assert.match(html, /class="diagram-art" src="\.\.\/examples\/assets\/infographic\/result\.svg"/);
});
