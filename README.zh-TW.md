# AutoCut — 自動生成動畫簡報、配音並輸出 MP4

AutoCut 是一個本機 CLI 工具，可以把 Storyboard 轉成有動畫、有旁白、可直接分享的 MP4 簡報影片。

核心流程：

1. 產生 16:9 HTML 簡報與企業風格動畫效果。
2. 使用 Fish Audio / Fish Studio API Key 逐頁產生旁白。
3. 使用 Playwright 錄製瀏覽器動畫，保留轉場與 reveal 效果。
4. 使用 ffmpeg 合成影片與音訊，輸出 MP4。

此專案參考 [`claude-code-slides`](https://github.com/rufushsu9987/claude-code-slides) 的 Agent-friendly 工作流：用結構化輸入、可重複的本機輸出，以及可被 Codex / Claude Code 呼叫的 Skill。

## 功能

- 支援 Storyboard JSON 與 Markdown 輸入。
- 內建 `zoom`、`wipe`、`slide`、`spotlight` 動畫效果。
- 透過 REST API 串接 Fish Audio TTS。
- API Key 只讀環境變數，不寫入 repo。
- 使用 Playwright 錄下 HTML / CSS 動畫。
- 使用 ffmpeg 輸出 H.264 + AAC MP4。
- 沒有 API Key 時可用靜音模式驗證影片流程。
- 內建 `skills/auto-video-deck/SKILL.md`，方便 Agent 產生影片簡報。

## 安裝需求

```bash
npm install
npm run setup:browser
brew install ffmpeg # macOS，如尚未安裝 ffmpeg
```

需要：

- Node.js 20+
- ffmpeg / ffprobe
- Fish Audio API Key（要產生真實配音時）

## 設定 Fish Audio / Fish Studio API Key

請不要把 Key 寫進程式碼或 commit 到 GitHub。

```bash
export FISH_API_KEY="your_api_key_here"
```

相容別名：

```bash
export FISH_AUDIO_API_KEY="your_api_key_here"
export FISH_STUDIO_API_KEY="your_api_key_here"
```

如果要指定聲音模型：

```bash
export FISH_REFERENCE_ID="your_voice_model_id"
```

## 快速使用

產生 Storyboard：

```bash
node bin/autocut.mjs create "AI Agent 技術提案" --slides 6 --out storyboard.json
```

輸出 MP4：

```bash
node bin/autocut.mjs render --input storyboard.json --out dist/demo.mp4
```

本機測試流程，不呼叫 TTS：

```bash
node bin/autocut.mjs render --input examples/storyboard.json --out dist/demo.mp4 --no-tts
```

正式產生時要求一定要有 Fish Audio Key：

```bash
node bin/autocut.mjs render --input examples/storyboard.json --out dist/demo.mp4 --require-tts
```

測試 Fish Audio 是否可用：

```bash
node bin/autocut.mjs fish-test --out dist/fish-test.mp3
```

檢查環境：

```bash
node bin/autocut.mjs doctor
```

## Storyboard 範例

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

## Markdown 範例

用 `---` 分隔投影片，`:::notes` 內文會變成旁白。

```markdown
# AutoCut Demo

把自動化簡報轉成有動畫與旁白的影片。

- 產生 HTML Deck
- Fish Audio 配音
- Playwright 錄影

:::notes
這一頁介紹 AutoCut 的整體目標。
:::

---

# Pipeline

- Storyboard
- TTS
- Browser recording
- MP4 muxing
```

## 架構

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

## 建議用法

- 開源專案介紹影片。
- 技術提案或內部處會分享。
- AI Agent / RAG / Cloud Native 架構解說。
- 產品 Demo 或短影片素材。

## 注意事項

- 預設 TTS model 是 `s2.1-pro-free`，正式情境可用 `--model s2.1-pro`。
- `--no-tts` 可避免開發時消耗 API 額度。
- `--require-tts` 適合正式產出，避免忘記設定 Key 卻產出靜音影片。
- `.env`、音訊檔、MP4 檔已在 `.gitignore` 中排除。

## 授權

MIT
