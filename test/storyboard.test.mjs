import test from 'node:test';
import assert from 'node:assert/strict';
import { createStoryboard, normalizeStoryboard, storyboardFromMarkdown } from '../lib/storyboard.mjs';

test('createStoryboard returns a varied layout sequence', () => {
  const storyboard = createStoryboard('AI Agent 技術提案', { slides: 7, template: 'corporate' });
  assert.equal(storyboard.template, 'corporate');
  assert.equal(storyboard.slides.length, 7);
  assert.equal(storyboard.slides[0].layout, 'hero');
  assert.equal(storyboard.slides.at(-1).layout, 'ending');
  assert.ok(new Set(storyboard.slides.map((slide) => slide.layout)).size >= 5);
  assert.ok(storyboard.slides.every((slide) => slide.narration.length > 0));
});

test('normalizeStoryboard infers layouts from structured content', () => {
  const storyboard = normalizeStoryboard({
    title: 'Inference',
    template: 'paper',
    slides: [
      { title: 'Cover', body: 'Opening' },
      { title: 'Process', steps: ['A', 'B', 'C'] },
      { title: 'Numbers', metrics: [{ value: '42', label: 'answer' }] },
      { title: 'Roadmap', timeline: [{ label: 'Q1', title: 'Ship' }] },
      { title: 'Next action', cta: 'Run it' }
    ]
  });

  assert.deepEqual(storyboard.slides.map((slide) => slide.layout), ['hero', 'flow', 'metrics', 'timeline', 'ending']);
});

test('normalization does not invent metrics for ordinary slides', () => {
  const storyboard = normalizeStoryboard({
    title: 'No fake KPI',
    slides: [
      { title: 'Cover' },
      { title: 'Plain content', body: 'No metrics were provided.', bullets: ['A', 'B'] }
    ]
  });
  assert.deepEqual(storyboard.slides[1].metrics, []);
  assert.equal(storyboard.slides[1].layout, 'split');
});

test('unknown explicit layout fails fast', () => {
  assert.throws(() => normalizeStoryboard({
    title: 'Bad layout',
    slides: [{ title: 'Cover' }, { title: 'Typo', layout: 'metrcis' }]
  }), /Unknown slide layout/);
});

test('storyboardFromMarkdown supports deck template and per-slide layout directives', () => {
  const storyboard = normalizeStoryboard(storyboardFromMarkdown(`---
title: Markdown Demo
template: midnight
language: zh-TW
---
# Opening

Intro

---

<!-- layout: quote -->
<!-- quoteBy: Rufus -->
# Insight

> Layout is structure, effect is motion.

:::notes
This is the narration.
:::

---

<!-- layout: code -->
# CLI

\`\`\`bash
node bin/autocut.mjs templates
\`\`\`
`));

  assert.equal(storyboard.template, 'midnight');
  assert.equal(storyboard.slides[0].layout, 'hero');
  assert.equal(storyboard.slides[1].layout, 'quote');
  assert.equal(storyboard.slides[1].quoteBy, 'Rufus');
  assert.equal(storyboard.slides[1].narration, 'This is the narration.');
  assert.equal(storyboard.slides[2].layout, 'code');
  assert.match(storyboard.slides[2].code.content, /autocut\.mjs templates/);
});
