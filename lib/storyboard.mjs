import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { clamp, seconds, slugify } from './utils.mjs';

const DEFAULT_THEME = {
  background: '#f6efe4',
  foreground: '#201916',
  muted: '#6f625a',
  accent: '#c86f43',
  accentSoft: '#ead2c0',
  panel: '#fffaf2'
};

const DEFAULT_SETTINGS = {
  width: 1920,
  height: 1080,
  fps: 30,
  minSlideSeconds: 5.2,
  paddingSeconds: 0.45,
  transitionMs: 720
};

const DEFAULT_VOICE = {
  provider: 'fish-audio',
  model: 's2.1-pro-free',
  referenceId: null,
  format: 'mp3',
  latency: 'balanced',
  prosody: {
    speed: 1.0,
    volume: 0
  }
};

export function createStoryboard(topic, options = {}) {
  const slideCount = clamp(Number(options.slideCount || options.slides || 6), 4, 10);
  const language = options.language || 'zh-TW';
  const title = String(topic || 'AI 技術簡報').trim();

  const templates = [
    {
      kicker: 'OPENING',
      title,
      subtitle: '自動生成的動畫影片簡報',
      body: '把簡報產生、動畫錄製與 Fish Audio 配音串成一條可重複執行的本機流程。',
      bullets: ['HTML 簡報', '動畫轉場', '逐頁旁白', 'MP4 輸出'],
      effect: 'zoom',
      narration: `今天要分享的是 ${title}。這份影片簡報會展示從內容生成、動畫呈現、旁白合成到 MP4 匯出的完整流程。`
    },
    {
      kicker: 'WHY NOW',
      title: '為什麼需要 AutoCut',
      body: '一般簡報工兛很適合編輯，但很難把 Agent 生成、動畫錄影、配音與影片產出整合成自動化 Pipeline。',
      bullets: ['減少人工錄影與剪輯時間', '保留動畫與節奏', '讓簡報能直接變成影片素材'],
      effect: 'wipe',
      narration: '我們常常可以快速產生投影片，但要把投影片變成有動畫、有旁白、可以上傳分享的影片，仍然需要很多手動步驟。AutoCut 的目標就是把這些步驟自動化。'
    },
    {
      kicker: 'PIPELINE',
      title: '核心流程',
      body: 'Storyboard 是唯一資料來源，CLI 會產出 Deck HTML、呼叫 Fish Audio、錄製瀏覽器動畫，最後用 ffmpeg 合成影片。',
      bullets: ['Storyboard JSON / Markdown', 'Fish Audio TTS', 'Playwright browser recording', 'ffmpeg muxing'],
      effect: 'slide',
      metrics: [
        { value: '1', label: 'source of truth' },
        { value: '4', label: 'pipeline steps' }
      ],
      narration: 'AutoCut 使用 Storyboard 作為唯一資料來源。內容會先被渲染成 HTML 簡報，再逐頁產生配音，接著透過 Playwright 錄下動畫，最後由 ffmpeg 合成 MP4。'
    },
    {
      kicker: 'VISUAL',
      title: '動畫與節奏設計',
      body: '每頁支援 zoom、wipe、slide、spotlight 等企業風格效果，錄影時按照旁白長度自動調整停留時間。',
      bullets: ['逐項 reveal', '段落進場延遲', '旁白長度校準', '16:9 高解析輸出'],
      effect: 'spotlight',
      narration: '動畫不是為了花俏，而是為了讓觀眾能跟上故事節奏。每張投影片會用逐項揭露與轉場效果，並且根據配音長度調整停留秒數。'
    },
    {
      kicker: 'VOICEOVER',
      title: 'Fish Audio 配音整合',
      body: '工具使用 Fish Audio REST API，讀取 FISH_API_KEY、FISH_AUDIO_API_KEY 或 FISH_STUDIO_API_KEY，不會把金鑰寫進 repository。',
      bullets: ['支援 reference_id 指定聲音', '支援 prosody speed / volume', '無 key 時可產生靜音影片做開發測試'],
      effect: 'wipe',
      narration: '配音部分直接串接 Fish Audio API。API Key 只從環境變數讀取，也支援指定 reference id 使用特定聲音。沒有 key 的時候，仍然可以產生靜音影片做流程驗證。'
    },
    {
      kicker: 'NEXT',
      title: '適合的使用情境',
      body: '最適合技術分享、產品 Demo、開源專案介紹、內部訓練與社群短影片。',
      bullets: ['快速生成可分享影片', '讓 Agent 幫你補齊簡報故事線', '把內容輸出成可重複製作的素材管線'],
      effect: 'zoom',
      narration: '接下來可以把 AutoCut 接到 Codex 或 Claude Code 的 Agent 工作流，讓 Agent 先產生 Storyboard，再自動輸出成有動畫與旁白的 MP4。'
    },
    {
      kicker: 'QUALITY',
      title: '品質與安全控制',
      body: '輸出前可檢查字數、旁白長度、缺失欄位、環境相依工具與 API Key 狀態。',
      bullets: ['本機執行，不上傳素材到未知服務', 'API Key 不落地', '可在 CI 檢查 storyboard 與語法'],
      effect: 'slide',
      narration: '企業實務上，安全與可維護性很重要。AutoCut 盡量把敏感資訊放在環境變數，本機負責渲染與合成，並提供 doctor 與測試指令協助檢查。'
    },
    {
      kicker: 'ROADMAP',
      title: '下一步 Roadmap',
      body: '後續可以加入模板系統、PPTX 匯入、字幕燒錄、批次影片與 GitHub Actions 發布。',
      bullets: ['PPTX / Marp 匯入', '字幕與章節', '多音色對話', '雲端批次渲染'],
      effect: 'spotlight',
      narration: '這個版本先完成最小可用的自動化流程。未來可以加入 PPTX 匯入、字幕、不同角色的多音色對話，以及雲端批次渲染。'
    }
  ];

  return normalizeStoryboard({
    title,
    slug: slugify(title),
    language,
    theme: DEFAULT_THEME,
    settings: DEFAULT_SETTINGS,
    voice: DEFAULT_VOICE,
    slides: templates.slice(0, slideCount)
  });
}

export async function loadStoryboard(inputPath) {
  const raw = await readFile(inputPath, 'utf8');
  const ext = extname(inputPath).toLowerCase();

  if (ext === '.md' || ext === '.markdown') {
    return normalizeStoryboard(storyboardFromMarkdown(raw));
  }

  try {
    return normalizeStoryboard(JSON.parse(raw));
  } catch (error) {
    throw new Error(`Unable to parse storyboard ${inputPath}: ${error.message}`);
  }
}

export function storyboardFromMarkdown(markdown) {
  const chunks = markdown
    .split(/^---\s*$/m)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const slides = chunks.map((chunk, index) => parseMarkdownSlide(chunk, index));
  const title = slides[0]?.title || 'AutoCut Deck';

  return {
    title,
    slug: slugify(title),
    language: 'zh-TW',
    theme: DEFAULT_THEME,
    settings: DEFAULT_SETTINGS,
    voice: DEFAULT_VOICE,
    slides
  };
}

function parseMarkdownSlide(chunk, index) {
  const lines = chunk.split(/\r?\n/).map((line) => line.trimEnd());
  const titleLine = lines.find((line) => /^#{1,2}\s+/.test(line));
  const title = titleLine ? titleLine.replace(/^#{1,2}\s+/, '').trim() : `Slide ${index + 1}`;
  const bullets = [];
  const paragraphs = [];
  const notes = [];
  let inNotes = false;

  for (const line of lines) {
    if (/^#{1,2}\s+/.test(line)) continue;
    if (/^:::notes/i.test(line) || /^notes\s*:/i.test(line)) {
      inNotes = true;
      continue;
    }
    if (/^:::$/.test(line)) {
      inNotes = false;
      continue;
    }
    if (!line.trim()) continue;
    if (inNotes) {
      notes.push(line.trim());
      continue;
    }
    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      bullets.push(bulletMatch[1].trim());
    } else {
      paragraphs.push(line.replace(/^>\s*/, '').trim());
    }
  }

  return {
    kicker: `SLIDE ${String(index + 1).padStart(2, '0')}`,
    title,
    body: paragraphs.join(' '),
    bullets,
    effect: ['zoom', 'wipe', 'slide', 'spotlight'][index % 4],
    narration: notes.join(' ') || [title, ...paragraphs, ...bullets].join('。')
  };
}

export function normalizeStoryboard(input) {
  if (!input || typeof input !== 'object') {
    throw new Error('Storyboard must be an object.');
  }

  const title = String(input.title || 'AutoCut Deck').trim();
  const settings = { ...DEFAULT_SETTINGS, ...(input.settings || {}) };
  const voice = {
    ...DEFAULT_VOICE,
    ...(input.voice || {}),
    prosody: {
      ...DEFAULT_VOICE.prosody,
      ...((input.voice || {}).prosody || {})
    }
  };

  const slides = Array.isArray(input.slides) ? input.slides : [];
  if (slides.length === 0) {
    throw new Error('Storyboard requires at least one slide.');
  }

  return {
    title,
    slug: input.slug || slugify(title),
    language: input.language || 'zh-TW',
    theme: { ...DEFAULT_THEME, ...(input.theme || {}) },
    settings: {
      width: Math.round(Number(settings.width) || DEFAULT_SETTINGS.width),
      height: Math.round(Number(settings.height) || DEFAULT_SETTINGS.height),
      fps: Math.round(Number(settings.fps) || DEFAULT_SETTINGS.fps),
      minSlideSeconds: seconds(settings.minSlideSeconds, DEFAULT_SETTINGS.minSlideSeconds),
      paddingSeconds: seconds(settings.paddingSeconds, DEFAULT_SETTINGS.paddingSeconds),
      transitionMs: Math.round(Number(settings.transitionMs) || DEFAULT_SETTINGS.transitionMs)
    },
    voice,
    slides: slides.map((slide, index) => normalizeSlide(slide, index))
  };
}

function normalizeSlide(slide, index) {
  if (!slide || typeof slide !== 'object') {
    throw new Error(`Slide ${index + 1} must be an object.`);
  }

  const title = String(slide.title || `Slide ${index + 1}`).trim();
  const bullets = Array.isArray(slide.bullets)
    ? slide.bullets.map((item) => String(item).trim()).filter(Boolean)
    : [];

  return {
    id: slide.id || `slide-${String(index + 1).padStart(2, '0')}`,
    kicker: slide.kicker || `SLIDE ${String(index + 1).padStart(2, '0')}`,
    title,
    subtitle: slide.subtitle || '',
    body: slide.body || '',
    bullets,
    metrics: Array.isArray(slide.metrics) ? slide.metrics : [],
    effect: ['zoom', 'wipe', 'slide', 'spotlight'].includes(slide.effect) ? slide.effect : 'zoom',
    narration: String(slide.narration || [title, slide.body, ...bullets].filter(Boolean).join('。')).trim(),
    duration: seconds(slide.duration, 0)
  };
}
