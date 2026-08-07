import test from 'node:test';
import assert from 'node:assert/strict';
import { createStoryboard } from '../lib/storyboard.mjs';
import { renderDeckHtml } from '../lib/deck-html.mjs';

test('renderDeckHtml emits self-contained AutoCut runtime', () => {
  const storyboard = createStoryboard('HTML Test', { slides: 4 });
  const html = renderDeckHtml(storyboard);
  assert.match(html, /window\.__autocut/);
  assert.match(html, /effect-zoom|effect-wipe|effect-slide|effect-spotlight/);
  assert.match(html, /AutoCut MP4 Deck/);
});
