# AutoCut Template System

AutoCut 0.2 separates three concepts that were previously mixed together:

```text
Template  = deck-level visual language
Layout    = slide-level information structure
Effect    = slide-level motion behavior
Beat      = content-level reveal, focus, and completion timeline
```

Changing an effect must not change the content hierarchy. Changing a template must not rewrite the storyboard. Changing a layout must create a genuinely different DOM structure.

## Design references

The implementation is original, but the architecture borrows proven concepts from adjacent presentation tools:

- **Slidev**: a slide declares a `layout`, while themes and custom layouts are independent extension layers.
- **reveal.js**: structural helpers such as stack, fit text, stretch, and fragments are different from transition effects.
- **Marp**: a concise source document can apply deck-level themes and local slide directives.
- **Remotion**: composition and timeline concerns remain separate from transitions and rendering.

AutoCut applies these ideas to a local Storyboard → TTS → browser recording → MP4 pipeline.

## Built-in visual templates

| Template | Mode | Best for |
| --- | --- | --- |
| `editorial` | Light | Strategy, proposals, premium business storytelling |
| `claude-editorial` | Light | claude-code-slides warm ivory, charcoal, and terracotta technical storytelling |
| `corporate` | Light | Enterprise architecture, executive reports, cloud reviews |
| `midnight` | Dark | Technical products, infrastructure, cybersecurity |
| `aurora` | Dark | AI launches, product demos, high-energy videos |
| `paper` | Light | Research, analysis, academic and evidence-heavy decks |
| `terminal` | Dark | CLI, DevOps, developer tooling, security demonstrations |

A template controls palette, typography, surface treatment, radius, shadow, and background art. It does not choose the slide layout.

```json
{
  "title": "AI Platform Review",
  "template": "midnight",
  "slides": []
}
```

Render the same storyboard with another template:

```bash
node bin/autocut.mjs render \
  --input storyboard.json \
  --template corporate \
  --out dist/corporate.mp4 \
  --no-tts
```

### Custom palette override

Use a built-in template as the safe base and override only the required tokens:

```json
{
  "template": "corporate",
  "theme": {
    "accent": "#0066cc",
    "accent2": "#00a6a6",
    "headingFont": "Inter, system-ui, sans-serif"
  }
}
```

## Built-in structural layouts

| Layout | Primary structured fields | Typical use |
| --- | --- | --- |
| `hero` | `title`, `subtitle`, `tags` | Opening cover and hook |
| `section` | `title`, `subtitle` | Chapter divider |
| `split` | `body`, `bullets`, `image`, `metrics` | General explanation, visual on right |
| `visual-left` | `body`, `bullets`, `image`, `metrics` | Evidence-first explanation |
| `flow` | `steps` | Process, pipeline, request flow |
| `infographic` | `infographic.left`, `.center`, `.right`, `takeaways` | Simple problem → method → result diagram |
| `metrics` | `metrics` | KPI, benchmark, evidence |
| `compare` | `comparison.left`, `comparison.right` | Before / after, option A / B |
| `quote` | `quote`, `quoteBy`, `quoteSource` | Testimonial, insight, design principle |
| `timeline` | `timeline` | Roadmap, milestones, phases |
| `cards` | `cards` | Parallel capabilities or categories |
| `statement` | `statement`, `emphasis` | One dominant claim or fact |
| `code` | `code`, `bullets` | CLI, source code, configuration |
| `architecture` | `layers` | Platform stack and layered architecture |
| `ending` | `cta`, `tags` | Closing summary and next action |

Aliases are available for familiar names:

```text
cover       -> hero
image-left  -> visual-left
image-right -> split
fact        -> statement
process     -> flow
roadmap     -> timeline
comparison  -> compare
end         -> ending
```

## Structured examples

### Flow

```json
{
  "layout": "flow",
  "title": "Repository to MP4",
  "steps": [
    { "title": "Intake", "detail": "Repository / URL / Brief" },
    { "title": "Story", "detail": "Storyboard + narration" },
    { "title": "Deck", "detail": "Layout + template" },
    { "title": "Voice", "detail": "Fish Audio" },
    { "title": "Render", "detail": "Playwright + ffmpeg" }
  ],
  "effect": "wipe",
  "narration": "The pipeline moves from source intake to story, deck, voice, and final rendering."
}
```

### Infographic

Use `infographic` when one simple diagram can explain the relationship better than a list of cards:

```json
{
  "layout": "infographic",
  "title": "把複雜工作流畫成三步",
  "infographic": {
    "left": { "title": "問題", "detail": "資料散落各處", "value": "01" },
    "center": { "title": "方法", "detail": "Story + Layout + Verify" },
    "right": { "title": "結果", "detail": "HTML / Marp / PPTX", "items": ["可編輯", "可驗證"] },
    "takeaways": ["先整理來源", "再建立故事", "最後輸出影片"]
  },
  "beats": [
    { "at": 0, "action": "show-title" },
    { "at": 0.8, "action": "reveal", "target": "left" },
    { "at": 2, "action": "focus", "target": "center" },
    { "at": 3.2, "action": "reveal", "target": "right" },
    { "at": 4.9, "action": "complete" }
  ]
}
```

### Compare

```json
{
  "layout": "compare",
  "title": "Before / After",
  "comparison": {
    "left": {
      "eyebrow": "BEFORE",
      "title": "Fixed DOM",
      "body": "Every slide uses the same two-column composition.",
      "items": ["Same hierarchy", "Fake default metrics"]
    },
    "right": {
      "eyebrow": "AFTER",
      "title": "Layout Registry",
      "body": "Each content type uses a dedicated renderer.",
      "items": ["Structured fields", "Real visual rhythm"]
    }
  }
}
```

### Code

```json
{
  "layout": "code",
  "title": "Render all templates",
  "code": {
    "language": "bash",
    "filename": "render.sh",
    "content": "node bin/autocut.mjs render --input deck.json --template midnight --out dist/deck.mp4",
    "highlights": [1]
  }
}
```

### Architecture

```json
{
  "layout": "architecture",
  "title": "Platform Architecture",
  "layers": [
    { "title": "Experience", "items": ["Web", "Mobile", "Agent"] },
    { "title": "Services", "items": ["API Gateway", "RAG", "Workflow"] },
    { "title": "Data", "items": ["Postgres", "Vector DB", "Object Storage"] }
  ]
}
```

## Automatic layout inference

When `layout` is omitted, AutoCut uses the slide content to choose a renderer:

1. The first slide becomes `hero`.
2. `quote` selects `quote`.
3. `comparison` selects `compare`.
4. `timeline` selects `timeline`.
5. `layers` selects `architecture`.
6. `code` selects `code`.
7. `steps` selects `flow`.
8. `infographic` selects `infographic`.
9. `metrics` selects `metrics`.
10. `cards` selects `cards`.
11. A closing slide with `cta` selects `ending`.
12. A short single idea selects `statement`.
13. Other content uses `split` or `visual-left` when the image position is left.

An unknown explicit layout fails fast instead of silently rendering the wrong structure.

## Markdown directives

Deck-level frontmatter chooses the template:

```markdown
---
title: AI Platform Review
template: midnight
language: zh-TW
---
```

Per-slide HTML comments choose the layout and effect:

```markdown
<!-- layout: quote -->
<!-- effect: spotlight -->
<!-- quoteBy: Platform Team -->

# Design Principle

> Layout is structure. Effect is motion.

:::notes
This paragraph becomes the narration for the slide.
:::
```

JSON remains the recommended format for `metrics`, `comparison`, `timeline`, `cards`, and `architecture` because those layouts require structured data.

## Effects

Effects remain independent of layouts:

```text
fade
zoom
wipe
slide
spotlight
rise
none
```

The same `flow` layout can use `wipe`, `rise`, or `zoom` without changing the process DOM.

## Beat Timeline: content-led motion

Effects describe how a scene enters. A beat timeline describes how the audience's attention moves inside that scene. Beat timestamps are seconds from the start of the slide, so a flow can reveal one step at a time while narration explains the causal order:

```json
{
  "layout": "flow",
  "title": "Repository to MP4",
  "steps": [
    { "title": "Intake", "detail": "Repository / URL / Brief" },
    { "title": "Story", "detail": "Storyboard + narration" },
    { "title": "Render", "detail": "Playwright + ffmpeg" }
  ],
  "beats": [
    { "at": 0, "action": "show-title" },
    { "at": 0.9, "action": "reveal-step", "target": 0 },
    { "at": 2.1, "action": "focus-step", "target": 1 },
    { "at": 3.4, "action": "reveal-step", "target": 2 },
    { "at": 4.6, "action": "complete-flow" }
  ]
}
```

Supported actions:

```text
show-title                  reveal the semantic title
reveal / reveal-step        make a target visible
focus / focus-step          reveal and visually emphasize a target
emphasize                   focus a semantic target such as statement emphasis
complete / complete-flow    reveal the remaining content and clear focus
```

Targets are zero-based for `steps`, `metrics`, `timeline`, `cards`, `layers`, bullets, and code lines. `compare` uses `left` and `right`. The renderer adds semantic `data-beat-*` hooks, so beat animation remains separate from layout markup and from page transitions.

## CLI

List all built-in options:

```bash
node bin/autocut.mjs templates
node bin/autocut.mjs templates --json
```

Create a varied storyboard:

```bash
node bin/autocut.mjs create \
  "AI Agent 技術提案" \
  --slides 8 \
  --template aurora \
  --out storyboard.json
```

Preview all layouts without TTS cost:

```bash
node bin/autocut.mjs render \
  --input examples/template-showcase.json \
  --out dist/template-showcase.mp4 \
  --no-tts
```

## Migration from 0.1

Existing fields remain supported:

```text
title, subtitle, body, bullets, metrics, effect, narration
```

The important behavior change is that AutoCut no longer creates default metrics when a slide does not provide metrics. Existing ordinary slides automatically fall back to `split` with an abstract visual composition.

## Current asset limitation

Remote image URLs and data URLs can be rendered directly. Copying local images into the output work directory is still an asset-pipeline roadmap item. For fully reproducible local renders, prefer data URLs or assets already available from the generated HTML location.
