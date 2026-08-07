# AutoCut Architecture

AutoCut keeps the rendering pipeline intentionally local and reproducible.

```text
input/storyboard
  ├─ normalize + validate
  ├─ render HTML deck
  ├─ generate or synthesize per-slide audio
  ├─ pad each slide audio to the visual duration
  ├─ record the HTML deck in Chromium
  └─ mux video and narration with ffmpeg
```

## Components

| Component | Responsibility |
| --- | --- |
| `lib/storyboard.mjs` | Create, parse, and normalize Storyboard JSON / Markdown. |
| `lib/deck-html.mjs` | Render a self-contained 16:9 HTML deck with CSS animations. |
| `lib/fish-audio.mjs` | Call Fish Audio TTS via raw REST API. |
| `lib/audio.mjs` | Use ffmpeg / ffprobe for silence, padding, concatenation, and muxing. |
| `lib/video.mjs` | Use Playwright to record the animated deck. |
| `lib/render.mjs` | Orchestrate the full pipeline and write `manifest.json`. |

## Security model

- Fish API keys are read only from environment variables.
- `.env`, generated audio, and generated videos are ignored by Git.
- The renderer runs locally; only TTS text is sent to Fish Audio when TTS is enabled.
- `--no-tts` enables offline rendering tests with silent audio.

## Extension ideas

- Import HTML exported by other slide generators.
- Import PPTX by converting each slide into a storyboard.
- Add subtitle generation and burned-in captions.
- Add GitHub Actions artifact publishing for generated demo videos.
- Add multiple voices for dialogue-style decks.
