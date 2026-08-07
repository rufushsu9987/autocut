import test from 'node:test';
import assert from 'node:assert/strict';
import { createStoryboard, normalizeStoryboard, storyboardFromMarkdown } from '../lib/storyboard.mjs';

test('createStoryboard returns normalized slides', () => {
  const storyboard = createStoryboard('AI Agent 技術提案', { slides: 6 });
  assert.equal(storyboard.title, 'AI Agent 技術提案');
  assert.equal(storyboard.slides.length, 6);
  assert.ok(storyboard.slides.every((slide) => slide.narration.length > 0));
});

test('storyboardFromMarkdown parses slides and notes', () => {
  const storyboard = storyboardFromMarkdown(`# Title\n\n- A\n- B\n\n:::notes\nNarration here.\n:::\n\n---\n\n# Second\n\nBody text`);
  assert.equal(storyboard.slides.length, 2);
  assert.equal(storyboard.slides[0].title, 'Title');
  assert.deepEqual(storyboard.slides[0].bullets, ['A', 'B']);
  assert.equal(storyboard.slides[0].narration, 'Narration here.');
});

test('normalizeStoryboard rejects empty decks', () => {
  assert.throws(() => normalizeStoryboard({ title: 'No slides', slides: [] }), /at least one slide/);
});
