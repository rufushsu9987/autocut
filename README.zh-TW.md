# AutoCut — 自動生成多版型動畫簡報、Fish Audio 配音與 MP4

AutoCut 是一個本機優先的影片簡報 CLI。它會把 Storyboard 轉成真正具有不同資訊結構的 HTML 簡報，使用 Fish Audio / Fish Studio API 逐頁產生旁白，再透過 Playwright 與 ffmpeg 輸出可直接分享的 MP4。

本專案延續 [`claude-code-slides`](https://github.com/rufushsu9987/claude-code-slides) 的 Agent-friendly 工作流，但專注於：

```text
Storyboard → Template System → Fish Audio → Animated Browser Recording → MP4
```

## 0.2 Template System

AutoCut 不再是「1 個固定版型 × 多種動畫」。現在三個層次彼此獨立：

```text
Template  決定整份簡報的色彩、字型、表面與背景語言
Layout    決定單頁內容的 DOM 結構與資訊層級
Effect    只決定進場與轉場動態
```

### 6 種視覺模板

| Template | 特色 | 適用情境 |
| --- | --- | --- |
| `editorial` | 暖色、高質感、編輯式排版 | 策略提案、商務簡報 |
| `corporate` | 企業藍、清楚、穩健 | 架構審查、主管報告 |
| `midnight` | 深色、藍青科技感 | 雲端、資安、基礎設施 |
| `aurora` | 紫青漸層、高動能 | AI、產品 Launch、Demo |
| `paper` | 白紙格線、研究感 | 論文、分析、證據型內容 |
| `terminal` | 黑綠 Monospace | CLI、DevOps、開發工具 |

### 14 種結構版型

```text
hero          大型封面／Hook
section       章節分隔
split         左文右視覺
visual-left   左視覺右文
flow          流程與 Pipeline
metrics       KPI 與數據證據
compare       Before / After、A / B
quote         大型引言與觀點
 timeline     Roadmap 與里程碑
cards         平行能力卡片
statement     單一大型主張／Fact
code          CLI、程式碼與設定檔
architecture  分層系統架構
ending        結論與下一步
```

詳細欄位與範例請參考 [`docs/template-system.md`](./docs/template-system.md)。

## 主要功能

- Storyboard JSON 與 Markdown 輸入。
- 依內容自動推斷 `layout`，也可逐頁明確指定。
- 6 種 deck-level Template，可由 CLI 覆寫。
- 14 種專用 DOM Renderer，不再每頁都是同一個左右 Grid。
- `fade`、`zoom`、`wipe`、`slide`、`spotlight`、`rise`、`none` 動態效果。
- Fish Audio REST TTS，支援聲音模型 `reference_id`。
- Playwright 錄製 HTML / CSS 動畫。
- ffmpeg 輸出 H.264 + AAC MP4。
- `--no-tts` 靜音模式，不消耗 API 額度。
- Manifest 記錄 Template、Layout、Effect、旁白與每頁秒數。
- Agent Skill：`skills/auto-video-deck/SKILL.md`。

## 安裝

需求：

- Node.js 20+
- ffmpeg / ffprobe
- Fish Audio API Key（正式配音時）

```bash
git clone https://github.com/rufushsu9987/autocut.git
cd autocut

npm install
npm run setup:browser
brew install ffmpeg # macOS，如尚未安裝
```

檢查環境：

```bash
node bin/autocut.mjs doctor
```

## Fish Audio / Fish Studio API Key

AutoCut 不會把 API Key 寫入 Storyboard、HTML 或 Repository。

```bash
export FISH_API_KEY="your_api_key_here"
```

相容別名：

```bash
export FISH_AUDIO_API_KEY="your_api_key_here"
export FISH_STUDIO_API_KEY="your_api_key_here"
```

指定聲音模型：

```bash
export FISH_REFERENCE_ID="your_voice_model_id"
```

## 快速開始

### 1. 查看可用 Template 與 Layout

```bash
node bin/autocut.mjs templates
node bin/autocut.mjs templates --json
```

### 2. 產生多版型 Storyboard

```bash
node bin/autocut.mjs create \
  "AI Agent 技術提案" \
  --slides 8 \
  --template aurora \
  --out storyboard.json
```

### 3. 先用靜音模式檢查畫面

```bash
node bin/autocut.mjs render \
  --input storyboard.json \
  --out dist/preview.mp4 \
  --no-tts
```

### 4. 正式產生 Fish Audio 配音

```bash
node bin/autocut.mjs render \
  --input storyboard.json \
  --out dist/final.mp4 \
  --require-tts
```

### 5. 同一份 Storyboard 切換風格

```bash
node bin/autocut.mjs render \
  --input storyboard.json \
  --template corporate \
  --out dist/corporate.mp4 \
  --no-tts
```

## 全版型 Showcase

`examples/template-showcase.json` 包含 14 種內建 layout：

```bash
node bin/autocut.mjs render \
  --input examples/template-showcase.json \
  --out dist/template-showcase.mp4 \
  --no-tts
```

切換成深色科技模板：

```bash
node bin/autocut.mjs render \
  --input examples/template-showcase.json \
  --template midnight \
  --out dist/template-showcase-midnight.mp4 \
  --no-tts
```

## Storyboard 範例

```json
{
  "title": "AI Agent 技術提案",
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
      "title": "AI Agent 技術提案",
      "subtitle": "從需求到可維護的企業 Agent 平台",
      "tags": ["Agent", "RAG", "Cloud Native"],
      "effect": "zoom",
      "narration": "今天分享企業 AI Agent 平台的架構與導入方式。"
    },
    {
      "layout": "flow",
      "title": "Agent Request Flow",
      "steps": [
        { "title": "Gateway", "detail": "Auth and policy" },
        { "title": "Planner", "detail": "Task decomposition" },
        { "title": "Tools", "detail": "MCP and internal APIs" },
        { "title": "Guardrail", "detail": "Validation and audit" }
      ],
      "effect": "wipe",
      "narration": "請求先通過 Gateway，再由 Planner 拆解任務，呼叫工具並經過 Guardrail 驗證。"
    }
  ]
}
```

## 自動 Layout 推斷

未指定 `layout` 時，AutoCut 會依結構化欄位判斷：

```text
第一頁       → hero
quote        → quote
comparison   → compare
 timeline     → timeline
layers       → architecture
code         → code
steps        → flow
metrics      → metrics
cards        → cards
cta 結尾頁   → ending
短主張       → statement
其他         → split
```

明確指定不存在的 layout 會直接報錯，避免安靜地渲染成錯誤版型。

## Markdown

```markdown
---
title: AutoCut Demo
template: midnight
language: zh-TW
---

# Opening

影片簡報開場。

---

<!-- layout: quote -->
<!-- effect: spotlight -->
<!-- quoteBy: AutoCut -->

# Design Principle

> Layout 是結構，Effect 是動態。

:::notes
這一段會成為旁白。
:::
```

需要 `metrics`、`comparison`、`timeline`、`cards`、`architecture` 等結構資料時，建議使用 JSON。

## 架構

```text
Storyboard JSON / Markdown
        │
        ▼
Normalize + Layout Inference
        │
        ├── Layout Registry ──► 專用 DOM
        ├── Template Registry ─► CSS variables / typography
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

完整架構請參考 [`docs/architecture.md`](./docs/architecture.md)。

## 安全與成本

- API Key 僅讀環境變數。
- `.env`、音訊與影片檔不進 Git。
- 使用者文字與程式碼會先 HTML escape。
- 自訂 Theme token 會拒絕危險 CSS 分隔符號。
- 開發與 CI 視覺驗證建議使用 `--no-tts`。
- 正式輸出使用 `--require-tts`，避免漏設 Key 卻產生靜音影片。

## 測試

```bash
npm run check
npm test
npm run smoke
```

## 目前限制

- 遠端圖片 URL 與 data URL 可直接使用；本機圖片自動複製到輸出目錄仍屬 Asset Pipeline 後續工作。
- 尚未內建圖表引擎與 Mermaid 轉圖。
- 尚未自動產生字幕與章節標記。

## Roadmap

- 自訂 Layout Module 與 Template Package。
- 圖片、Logo、圖表與字型 Asset Pipeline。
- Subtitle / SRT / burned-in captions。
- PPTX / Marp 匯入。
- GitHub Actions 批次渲染與 Artifact 發布。

## 授權

MIT
