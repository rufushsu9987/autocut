---
name: auto-video-deck
description: Create a structurally varied animated MP4 presentation from a topic, document, URL, repository, or storyboard using AutoCut templates, Fish Audio, Playwright, and ffmpeg.
---

# Auto Video Deck

Use this skill when the user wants to turn an idea, brief, repository, Markdown document, or outline into a professional animated MP4 presentation with voiceover.

## Core model

Keep these concepts separate:

```text
Template = deck-level visual language
Layout   = slide-level content structure
Effect   = slide-level motion
```

Do not treat `zoom`, `wipe`, `slide`, or `spotlight` as templates. A varied deck must use multiple structural layouts.

## Output contract

Create or update a Storyboard JSON file, then run AutoCut:

```bash
node bin/autocut.mjs render --input storyboard.json --out dist/final.mp4 --require-tts
```

For local visual review without Fish Audio credits:

```bash
node bin/autocut.mjs render --input storyboard.json --out dist/final.mp4 --no-tts
```

## Required environment

Read Fish Audio / Fish Studio keys from environment variables. Never write secrets into source files, Storyboard JSON, generated HTML, or logs.

```bash
export FISH_API_KEY="..."
# accepted aliases:
# export FISH_AUDIO_API_KEY="..."
# export FISH_STUDIO_API_KEY="..."
```

Optional voice model:

```bash
export FISH_REFERENCE_ID="..."
```

## Choose a visual template

Use one deck-level template:

| Template | Use when |
| --- | --- |
| `editorial` | Premium business, strategy, consulting-style narrative |
| `corporate` | Enterprise architecture, executive report, cloud review |
| `midnight` | Infrastructure, platform, cybersecurity, technical product |
| `aurora` | AI, launch, product demo, high-energy video |
| `paper` | Research, evidence, analysis, academic content |
| `terminal` | CLI, DevOps, developer tool, security demo |

The user's brand system overrides these defaults when provided.

## Choose layouts by content intent

Use at least four distinct layouts in a normal 6–10 slide deck.

| Intent | Layout | Structured field |
| --- | --- | --- |
| Opening hook | `hero` | `title`, `subtitle`, `tags` |
| Chapter reset | `section` | `title`, `subtitle` |
| General explanation | `split` or `visual-left` | `body`, `bullets`, optional `image` |
| Process or request path | `flow` | `steps` |
| KPI or benchmark | `metrics` | `metrics` |
| Before / after or choices | `compare` | `comparison` |
| Memorable insight | `quote` | `quote`, `quoteBy` |
| Roadmap or chronology | `timeline` | `timeline` |
| Parallel capabilities | `cards` | `cards` |
| One dominant fact | `statement` | `statement`, `emphasis` |
| CLI or source example | `code` | `code` |
| Layered platform | `architecture` | `layers` |
| Closing action | `ending` | `cta`, `tags` |

Do not invent metrics. Use `metrics` only when the source contains real numbers or the user explicitly provides them.

## Storyboard rules

- Prefer Traditional Chinese unless the user requests another language.
- Give every slide one clear communication job.
- Use 4–6 bullets maximum on ordinary content slides.
- Write a natural narration paragraph for every slide.
- Match narration to approximately 5–12 seconds per slide unless the user specifies a target duration.
- Vary layouts based on information intent, not randomly.
- Use `effect` values from `fade`, `zoom`, `wipe`, `slide`, `spotlight`, `rise`, or `none`.
- Use business/professional visual language, not cartoon styling, unless explicitly requested.
- Do not include API keys, private credentials, or secrets.
- Do not invent claims, benchmarks, customer quotes, or architecture evidence.

## Recommended story arc

A strong 7-slide technical deck can use:

```text
1. hero          Hook and promise
2. statement     Why the problem matters
3. flow          Current or proposed process
4. architecture  Technical design
5. metrics       Evidence, only when real data exists
6. compare       Trade-off or before / after
7. ending        Recommendation and next action
```

## Minimal Storyboard

```json
{
  "title": "Project Demo",
  "template": "corporate",
  "voice": {
    "model": "s2.1-pro-free",
    "referenceId": null,
    "prosody": { "speed": 1, "volume": 0 }
  },
  "slides": [
    {
      "layout": "hero",
      "kicker": "OPENING",
      "title": "Project Demo",
      "subtitle": "One clear promise",
      "tags": ["Architecture", "Automation"],
      "effect": "zoom",
      "narration": "Natural speaker narration for the opening slide."
    },
    {
      "layout": "flow",
      "title": "Delivery Flow",
      "steps": [
        { "title": "Input", "detail": "Repository or brief" },
        { "title": "Story", "detail": "Storyboard and narration" },
        { "title": "Render", "detail": "Animated MP4" }
      ],
      "effect": "wipe",
      "narration": "The workflow moves from source input to story design and final rendering."
    }
  ]
}
```

## Recommended workflow

1. Inspect the source material and identify audience, duration, and decision goal.
2. Draft a story arc before choosing visual effects.
3. Assign a structural layout to every slide.
4. Save the result as `storyboard.json`.
5. Run `node bin/autocut.mjs templates` to verify supported names.
6. Run `node bin/autocut.mjs doctor`.
7. Render with `--no-tts` first for visual review.
8. Review layout variety, overflow, factual accuracy, and narration timing.
9. Render with `--require-tts` for the final voiceover.
10. Verify `manifest.json` and the final MP4.

## Quality checklist

- The deck does not repeat the same structure on every slide.
- Layout choice matches content intent.
- Template is visually consistent across the deck.
- Effects support the story and do not substitute for layout variation.
- Title slide is minimal and readable.
- Every slide has narration.
- Metrics and quotes are source-backed.
- Code and commands are escaped and readable.
- Secrets are not written to repository files or generated artifacts.
