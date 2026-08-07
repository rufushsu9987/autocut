# Changelog

## 0.2.0

### Added

- 14 structural slide layouts with dedicated renderers.
- 6 visual templates: editorial, corporate, midnight, aurora, paper, and terminal.
- `lib/templates.mjs` registry and automatic layout inference.
- Structured storyboard fields for flow, comparison, timeline, cards, code, architecture, quote, statement, image, and CTA content.
- `autocut templates` CLI command and `--template` override for create/render.
- Template showcase example covering every built-in layout.
- Template, layout, and effect metadata in generated manifests.

### Changed

- Layout, template, and animation effect are now independent concepts.
- Ordinary slides no longer receive invented default metrics.
- Markdown supports deck-level template frontmatter and per-slide layout directives.

### Security

- User text and code are escaped by the HTML renderer.
- Custom theme values reject unsafe CSS delimiters.
