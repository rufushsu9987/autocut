# AutoCut — Multi-layout animated presentations with Fish Audio and MP4 export

AutoCut is a local-first CLI that turns a structured storyboard into an animated presentation video. It renders genuinely different slide structures, synthesizes per-slide narration with Fish Audio, records CSS motion with Playwright, and muxes the result into MP4 with ffmpeg.

```text
Storyboard → Template System → Fish Audio → Browser Recording → MP4
```

Inspired by the agent-friendly workflow of [`claude-code-slides`](https://github.com/rufushsu9987/claude-code-slides), AutoCut is designed for repository demos, technical proposals, architecture reviews, product updates, and automated content pipelines.

[繁體中文](./README.zh-TW.md)

## Template System

AutoCut 0.2 separates three independent concerns:

```text
Template  = deck-level palette, typography, surfaces, and background art
Layout    = slide-level DOM structure and information hierarchy
Effect    = slide-level entrance and transition motion
Beat      = content-level reveal, focus, and completion timeline
```

### Visual templates

`editorial`, `claude-editorial`, `corporate`, `midnight`, `aurora`, `paper`, and `terminal`.

`claude-editorial` is the warm ivory / charcoal / terracotta visual system from
[`claude-code-slides`](https://github.com/rufushsu9987/claude-code-slides),
adapted to AutoCut's independent structural layouts and browser renderer.

### Structural layouts

`hero`, `section`, `split`, `visual-left`, `flow`, `metrics`, `compare`, `quote`, `timeline`, `cards`, `statement`, `code`, `architecture`, and `ending`.

See [Template System documentation](./docs/template-system.md) for the field reference and examples.

## Features

- Storyboard JSON and Markdown input.
- Automatic layout inference or explicit per-slide `layout`.
- 15 dedicated layout renderers instead of one fixed two-column DOM.
- 7 deck-level visual templates with CLI override.
- Independent `fade`, `zoom`, `wipe`, `slide`, `spotlight`, `rise`, and `none` effects.
- Content-led `beats` for step-by-step reveal, focus, emphasis, and completion inside a slide.
- Fish Audio REST TTS with optional `reference_id` voice model.
- Playwright recording that preserves HTML/CSS animation.
- ffmpeg H.264 + AAC MP4 output.
- Silent `--no-tts` mode for visual and CI tests.
- Manifest metadata for template, layout, effect, narration, and timing.
- Portable Agent Skill at `skills/auto-video-deck/SKILL.md`.

## Requirements

- Node.js 20+
- ffmpeg / ffprobe
- Fish Audio API key for real voiceover

```bash
git clone https://github.com/rufushsu9987/autocut.git
cd autocut
npm install
npm run setup:browser
brew install ffmpeg # macOS, if needed
```

## API key

```bash
export FISH_API_KEY="your_api_key_here"
```

Accepted aliases:

```bash
export FISH_AUDIO_API_KEY="your_api_key_here"
export FISH_STUDIO_API_KEY="your_api_key_here"
```

Optional voice model:

```bash
export FISH_REFERENCE_ID="your_voice_model_id"
```

## Quick start

List built-in options:

```bash
node bin/autocut.mjs templates
```

Create a varied storyboard:

```bash
node bin/autocut.mjs create \
  "AI Agent Architecture" \
  --slides 8 \
  --template midnight \
  --out storyboard.json
```

Render without TTS cost:

```bash
node bin/autocut.mjs render \
  --input storyboard.json \
  --out dist/preview.mp4 \
  --no-tts
```

Render final Fish Audio voiceover:

```bash
node bin/autocut.mjs render \
  --input storyboard.json \
  --out dist/final.mp4 \
  --require-tts
```

Override the visual template without rewriting slides:

```bash
node bin/autocut.mjs render \
  --input storyboard.json \
  --template corporate \
  --out dist/corporate.mp4 \
  --no-tts
```

## Complete layout showcase

`examples/template-showcase.json` contains all 14 built-in layouts:

```bash
node bin/autocut.mjs render \
  --input examples/template-showcase.json \
  --out dist/template-showcase.mp4 \
  --no-tts
```

## Storyboard example

```json
{
  "title": "AI Platform Review",
  "template": "corporate",
  "slides": [
    {
      "layout": "hero",
      "title": "AI Platform Review",
      "subtitle": "Architecture, controls, and roadmap",
      "effect": "zoom",
      "narration": "This presentation reviews the target AI platform architecture."
    },
    {
      "layout": "flow",
      "title": "Request Flow",
      "steps": [
        { "title": "Gateway", "detail": "Authentication and policy" },
        { "title": "Planner", "detail": "Task decomposition" },
        { "title": "Tools", "detail": "MCP and internal APIs" },
        { "title": "Guardrail", "detail": "Validation and audit" }
      ],
      "effect": "wipe",
      "narration": "Requests pass through the gateway, planner, tools, and guardrail."
    }
  ]
}
```

## Architecture

```text
Storyboard JSON / Markdown
        │
        ▼
Normalize + infer layout
        │
        ├── Layout Registry ──► distinct DOM structures
        ├── Template Registry ─► visual language
        └── Effect             ─► motion only
        │
        ▼
HTML Deck
        ├── Fish Audio TTS ──► narration.mp3
        └── Playwright ──────► deck.webm
                       │
                       ▼
                 ffmpeg ──► MP4
```

See [Architecture](./docs/architecture.md).

## Security and cost controls

- API keys are read only from environment variables.
- `.env`, generated audio, and generated videos are ignored by Git.
- User text and code are HTML-escaped.
- Unsafe CSS delimiters are rejected from custom theme tokens.
- Use `--no-tts` during development and CI.
- Use `--require-tts` for production to fail fast when the API key is missing.

## Tests

```bash
npm run check
npm test
npm run smoke
```

## Current limitations

- Remote image URLs and data URLs work directly; copying local assets into the render work directory is a future asset-pipeline feature.
- Built-in chart and Mermaid rendering are not included yet.
- Subtitle and chapter marker generation are planned.

## License

MIT
