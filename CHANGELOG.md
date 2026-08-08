# Changelog

## 0.2.0

### Added

- 15 structural slide layouts with dedicated renderers, including `infographic`.
- 7 visual templates: editorial, claude-editorial, corporate, midnight, aurora, paper, and terminal.
- `claude-editorial` theme adapted from the claude-code-slides warm ivory, charcoal, terracotta, serif/sans/mono visual system.
- `lib/templates.mjs` registry and automatic layout inference.
- Structured storyboard fields for flow, comparison, timeline, cards, code, architecture, quote, statement, image, and CTA content.
- `infographic` fields for simple problem → method → result diagrams, checklists, progress bars, and takeaway pills.
- Scene / Beat timeline hooks for semantic reveal, focus, emphasis, and completion.
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
