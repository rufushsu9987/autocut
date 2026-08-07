import test from 'node:test';
import assert from 'node:assert/strict';
import { listLayouts, listTemplates, resolveLayoutName, resolveTemplate } from '../lib/templates.mjs';

test('template registry exposes multiple visual systems and structural layouts', () => {
  assert.ok(listTemplates().length >= 6);
  assert.ok(listLayouts().length >= 12);
  assert.ok(listLayouts().some((layout) => layout.name === 'architecture'));
  assert.ok(listLayouts().some((layout) => layout.name === 'compare'));
});

test('layout aliases remain compatible with familiar presentation naming', () => {
  assert.equal(resolveLayoutName('cover'), 'hero');
  assert.equal(resolveLayoutName('image-left'), 'visual-left');
  assert.equal(resolveLayoutName('fact'), 'statement');
});

test('template resolution supports safe palette overrides', () => {
  const template = resolveTemplate('midnight', { accent: '#ff00aa', shadow: '0 8px 30px rgba(0,0,0,.3)' });
  assert.equal(template.name, 'midnight');
  assert.equal(template.theme.accent, '#ff00aa');
  assert.equal(template.mode, 'dark');
});
