# AutoCut — Animated Slides to MP4 with Fish Audio Voiceover

AutoCut turns a storyboard into a narrated MP4 presentation video:

1. generate a 16:9 HTML deck with business-style animation effects,
2. synthesize per-slide narration with Fish Audio / Fish Studio API key,
3. record the animated deck with Playwright,
4. mux the video and narration into MP4 with ffmpeg.

The project is inspired by the workflow style of [`claude-code-slides`](https://github.com/rufushsu9987/claude-code-slides): agent-friendly input, reproducible local output, and portable skills for Codex / Claude Code.

## Features

- Storyboard JSON and Markdown input
- HTML deck rendering with `zoom`, `wipe`, `slide`, and `spotlight` effects
- Fish Audio REST TTS integration via environment variables
- Playwright browser recording that preserves CSS animations
- ffmpeg MP4 output with AAC audio
- Silent fallback for local development when no API key is configured
- `skills/auto-video-deck/SKILL.md` for agent-driven deck video generation

## Requirements

- Node.js 20+
- ffmpeg / ffprobe
- Fish Audio API key for voiceover

```bash
npm install
npm run setup:browser
brew install ffmpeg # macOS, if ffmpeg is not installed yet
```

## API key

AutoCut never stores your key in source code. Export one of these variables:

```bash
export FISH_API_KEY="your_api_key_here"
# aliases also accepted:
# export FISH_AUDIO_API_KEY="your_api_key_here"
# export FISH_STUDIO_API_KEY="your_api_key_here"
```

Optional voice model:

```bash
export FISH_REFERENCE_ID="your_voice_model_id"
```

## Quick start

Create a storyboard:

```bash
npm run create:demo
# or
node bin/autocut.mjs create "AI Agent 技術提案" --slides 6 --out storyboard.json
```

Render to MP4:

```bash
node bin/autocut.mjs render --input storyboard.json --out dist/demo.mp4
```

Render without TTS for local pipeline testing:

```bash
node bin/autocut.mjs render --input examples/storyboard.json --out dist/demo.mp4 --no-tts
```

Require real Fish Audio voiceover:

```bash
node bin/autocut.mjs render --input examples/storyboard.json --out dist/demo.mp4 --require-tts
```

Generate only a Fish Audio test clip:

```bash
node bin/autocut.mjs fish-test --out dist/fish-test.mp3
```

Check environment:

```bash
node bin/autocut.mjs doctor
```

## Storyboard format

```json
{
  "title": "AI Agent 技術提案",
  "voice": {
    "model": "s2.1-pro-free",
    "referenceId": null,
    "prosody": { "speed": 1.0, "volume": 0 }
  },
  "slides": [
    {
      "kicker": "OPENING",
      "title": "AI Agent 技術提案",
      "body": "把內容、動畫、旁白與影片輸出串成自動化流程。",
      "bullets": ["Storyboard", "HTML animation", "Fish Audio", "MP4 export"],
      "effect": "zoom",
      "narration": "今天要分享 AI Agent 技術提案，以及如何自動輸出有動畫與配音的影片簡報。"
    }
  ]
}
```

## Architecture

```text
Storyboard JSON / Markdown
        │
        ▼
HTML Deck + CSS Animations
        │
        ├── Fish Audio TTS ──► per-slide MP3 ──► narration.mp3
        │
        └── Playwright Chromium recording ──► deck.webm
                                      │
                                      ▼
                              ffmpeg mux ──► final MP4
```

## Notes

- The default Fish model is `s2.1-pro-free` for developer-friendly testing. Use `--model s2.1-pro` for production plans.
- `--no-tts` creates a silent narration track so MP4 rendering can be tested without spending API credits.
- `--require-tts` is recommended for production runs because it fails fast if the API key is missing.
- Do not commit `.env`, generated audio, or generated MP4 files.

## License

MIT
