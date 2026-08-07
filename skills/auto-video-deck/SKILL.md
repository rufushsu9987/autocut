---
name: auto-video-deck
description: Create an animated narrated MP4 presentation from a topic, document, URL, repository, or storyboard using AutoCut, Fish Audio, Playwright, and ffmpeg.
---

# Auto Video Deck

Use this skill when the user wants to turn an idea, brief, repository, Markdown, or existing outline into an animated MP4 presentation with voiceover.

## Output contract

Create or update a Storyboard JSON file, then run AutoCut:

```bash
node bin/autocut.mjs render --input storyboard.json --out dist/final.mp4 --require-tts
```

For local dry runs without Fish Audio credits:

```bash
node bin/autocut.mjs render --input storyboard.json --out dist/final.mp4 --no-tts
```

## Required environment

AutoCut reads Fish Audio / Fish Studio keys from environment variables. Never write secrets into files.

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

## Storyboard rules

- Prefer Traditional Chinese unless the user requests another language.
- Keep each slide focused on one idea.
- Use 4–6 bullets maximum per slide.
- Write a natural narration paragraph for every slide.
- Match narration length to roughly 5–12 seconds per slide.
- Use `effect` values from: `zoom`, `wipe`, `slide`, `spotlight`.
- Use business/professional visual language, not cartoonish styling.
- Do not include API keys, private credentials, or secrets in the storyboard.

## Minimal Storyboard

```json
{
  "title": "Project Demo",
  "voice": {
    "model": "s2.1-pro-free",
    "referenceId": null,
    "prosody": { "speed": 1.0, "volume": 0 }
  },
  "slides": [
    {
      "kicker": "OPENING",
      "title": "Project Demo",
      "body": "One clear idea for this slide.",
      "bullets": ["Point one", "Point two", "Point three"],
      "effect": "zoom",
      "narration": "Natural speaker narration for this slide."
    }
  ]
}
```

## Recommended workflow

1. Inspect the source material and identify the audience.
2. Draft a 5–8 slide storyboard with a clear story arc.
3. Save it as `storyboard.json`.
4. Run `node bin/autocut.mjs doctor`.
5. Render with `--no-tts` first if checking visuals only.
6. Render with `--require-tts` for final voiceover.
7. Verify that `dist/manifest.json` and `dist/final.mp4` exist.

## Quality checklist

- Title slide is minimal and not crowded.
- Every slide has narration.
- Animation effects vary but remain professional.
- Important claims are not invented; cite or phrase cautiously when source evidence is unavailable.
- Secrets are not written to repo files or logs.
