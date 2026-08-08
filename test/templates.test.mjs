import test from 'node:test';
import assert from 'node:assert/strict';
import { listLayouts, listTemplates, resolveLayoutName, resolveTemplate } from '../lib/templates.mjs';

test('template registry exposes multiple visual systems and structural layouts', () => {
  assert.ok(listTemplates().length >= 6);
  assert.ok(listLayouts().length >= 12);
  assert.ok(listLayouts().some((layout) => layout.name === 'architecture'));
  assert.ok(listLayouts().some((layout) => layout.name === 'compare'));
  assert.ok(listLayouts().some((layout) => layout.name === 'infographic'));
});

test('layout aliases remain compatible with familiar presentation naming', () => {
  assert.equal(resolveLayoutName('cover'), 'hero');
  assert.equal(resolveLayoutName('image-left'), 'visual-left');
  assert.equal(resolveLayoutName('fact'), 'statement');
  assert.equal(resolveLayoutName('diagram'), 'infographic');
});

test('template resolution supports safe palette overrides', () => {
  const template = resolveTemplate('midnight', { accent: '#ff00aa', shadow: '0 8px 30px rgba(0,0,0,.3)' });
  assert.equal(template.name, 'midnight');
  assert.equal(template.theme.accent, '#ff00aa');
  assert.equal(template.mode, 'dark');
});

test('claude-editorial preserves the claude-code-slides visual system', () => {
  const template = resolveTemplate('claude-editorial');
  assert.equal(template.name, 'claude-editorial');
  assert.equal(template.label, 'Claude Editorial');
  assert.equal(template.mode, 'light');
  assert.equal(template.theme.background, '#F7F3EC');
  assert.equal(template.theme.panel, '#FFFDF9');
  assert.equal(template.theme.foreground, '#211F1B');
  assert.equal(template.theme.muted, '#6F6962');
  assert.equal(template.theme.accent, '#D97757');
  assert.equal(template.theme.accent2, '#5E8065');
  assert.match(template.theme.headingFont, /Iowan Old Style|Palatino Linotype|Georgia/);
  assert.match(template.theme.bodyFont, /Inter/);
  assert.match(template.theme.monoFont, /SFMono-Regular/);
});
