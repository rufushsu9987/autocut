import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { createStoryboard } from '../lib/storyboard.mjs';
import { writeDeckHtml } from '../lib/deck-html.mjs';
import { exists } from '../lib/utils.mjs';

const dir = await mkdtemp(join(tmpdir(), 'autocut-smoke-'));
try {
  const storyboard = createStoryboard('Smoke Test', { slides: 4 });
  const htmlPath = join(dir, 'deck.html');
  await writeDeckHtml(storyboard, htmlPath);
  assert.equal(await exists(htmlPath), true);
  console.log(`Smoke test ok: ${htmlPath}`);
} finally {
  await rm(dir, { recursive: true, force: true });
}
