import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { createStoryboard } from '../lib/storyboard.mjs';
import { writeDeckHtml } from '../lib/deck-html.mjs';
import { exists } from '../lib/utils.mjs';

const dir = await mkdtemp(join(tmpdir(), 'autocut-smoke-'));
try {
  const storyboard = createStoryboard('Smoke Test', { slides: 7, template: 'midnight' });
  const htmlPath = join(dir, 'deck.html');
  await writeDeckHtml(storyboard, htmlPath);

  assert.equal(await exists(htmlPath), true);
  assert.ok(new Set(storyboard.slides.map((slide) => slide.layout)).size >= 5);

  const html = await readFile(htmlPath, 'utf8');
  assert.match(html, /data-template="midnight"/);
  assert.match(html, /layout-flow/);
  assert.match(html, /layout-metrics/);
  assert.match(html, /window\.__autocut/);

  console.log(`Smoke test ok: ${storyboard.slides.length} slides, ${new Set(storyboard.slides.map((slide) => slide.layout)).size} layouts, ${htmlPath}`);
} finally {
  await rm(dir, { recursive: true, force: true });
}
