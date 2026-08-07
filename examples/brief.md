# AutoCut Demo

把自動生成的簡報轉成有動畫與旁白的影片。

- HTML Deck
- Fish Audio 配音
- Playwright 錄影
- ffmpeg 合成

:::notes
這一頁介紹 AutoCut 的整體目標：把簡報生成、動畫錄影、配音與 MP4 輸出整合成自動化流程。
:::

---

# Pipeline

Storyboard 是唯一資料來源，接著依序產生 HTML、音訊、動畫錄影與最終 MP4。

- Storyboard JSON 或 Markdown
- Per-slide TTS
- Browser video recording
- MP4 muxing

:::notes
這一頁說明實作流程。先把內容整理成 Storyboard，再產生 HTML 簡報，接著逐頁配音，最後錄製動畫並合成影片。
:::
