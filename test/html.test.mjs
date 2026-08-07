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
