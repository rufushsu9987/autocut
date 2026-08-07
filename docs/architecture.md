# AutoCut Architecture

AutoCut keeps the rendering pipeline local and reproducible while separating information structure from visual styling.

```text
Storyboard JSON / Markdown
        │
        ▼
Normalize + infer layout
        │
        ├── Layout Registry ──► distinct DOM structures
        ├── Template Registry ─► palette / typography / surfaces
        └── Effect             ─► motion only
        │
        ▼
Self-contained HTML deck
        │
        ├── Fish Audio TTS ──► per-slide MP3 ──► narration.mp3
        │
        └── Playwright recording ──────────────► deck.webm
                                      │
                                      ▼
                              ffmpeg mux ──► final MP4
```

## Components

| Component | Responsibility |
| --- | --- |
| `lib/templates.mjs` | Built-in template and layout registries, aliases, safe theme resolution, and layout inference. |
| `lib/storyboard.mjs` | Create, parse, normalize, and validate structured Storyboard JSON / Markdown. |
| `lib/deck-html.mjs` | Dispatch each slide to a dedicated layout renderer and generate a self-contained animated deck. |
| `lib/fish-audio.mjs` | Call Fish Audio TTS through the REST API. |
| `lib/audio.mjs` | Use ffmpeg / ffprobe for silence, padding, concatenation, and muxing. |
| `lib/video.mjs` | Use Playwright to record the animated HTML deck. |
| `lib/render.mjs` | Orchestrate the full pipeline and write `manifest.json` with template, layout, effect, and duration metadata. |

## Design boundaries

- A **layout renderer** owns DOM structure and content hierarchy.
- A **template** owns CSS variables, typography, surfaces, and background art.
- An **effect** owns entrance or transition behavior.
- The audio and video pipeline does not need to understand layout internals.

## Security model

- Fish API keys are read only from environment variables.
- `.env`, generated audio, and generated videos are ignored by Git.
- Only narration text is sent to Fish Audio when TTS is enabled.
- `--no-tts` enables local visual tests without API usage.
- User text and code are HTML-escaped before being injected into the generated deck.
- Theme overrides reject CSS values containing statement or tag delimiters.

## Extension path

The registry design allows future work without returning to one monolithic `renderSlide()` function:

- user-defined layout modules,
- branded template packages,
- image and font asset packaging,
- charts and diagram renderers,
- subtitles and chapter markers,
- batch rendering and CI artifact publishing.
