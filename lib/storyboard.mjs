import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { clamp, seconds, slugify } from './utils.mjs';
import { inferLayout, resolveLayoutName, resolveTemplate } from './templates.mjs';

const DEFAULT_SETTINGS = Object.freeze({
  width: 1920,
  height: 1080,
  fps: 30,
  minSlideSeconds: 5.2,
  paddingSeconds: 0.45,
  transitionMs: 720
});

const DEFAULT_VOICE = Object.freeze({
  provider: 'fish-audio',
  model: 's2.1-pro-free',
  referenceId: null,
  format: 'mp3',
  latency: 'balanced',
  normalize: true,
  prosody: {
    speed: 1.0,
    volume: 0
  }
});

export const SUPPORTED_EFFECTS = Object.freeze([
  'fade',
  'zoom',
  'wipe',
  'slide',
  'spotlight',
  'rise',
  'none'
]);

export const SUPPORTED_BEAT_ACTIONS = Object.freeze([
  'show-title',
  'reveal',
  'reveal-step',
  'focus',
  'focus-step',
  'emphasize',
  'complete',
  'complete-flow'
]);

export function createStoryboard(topic, options = {}) {
  const slideCount = clamp(Number(options.slideCount || options.slides || 7), 4, 12);
  const language = options.language || 'zh-TW';
  const title = String(topic || 'AI Agent 技術提案').trim();
  const template = options.template || 'editorial';

  const middleSlides = [
    {
      layout: 'statement',
      kicker: 'WHY NOW',
      title: '從流程驗證，走向可交付的影片簡報',
      statement: '內容、結構、動畫與配音必須由同一份 Storyboard 驅動。',
      emphasis: 'ONE SOURCE OF TRUTH',
      body: '避免人工錄影、旁白長度與投影片節奏彼此脫節。',
      effect: 'spotlight',
      narration: '真正可維護的影片簡報，不是把投影片錄下來而已，而是讓內容、結構、動畫與配音都由同一份 Storyboard 驅動。'
    },
    {
      layout: 'flow',
      kicker: 'PIPELINE',
      title: '從 Repository 到 MP4',
      body: '每一階段都有清楚的輸入與可驗證產物。',
      steps: [
        { title: 'Intake', detail: 'Repository / URL / Brief' },
        { title: 'Story', detail: 'Storyboard + narration' },
        { title: 'Deck', detail: 'Layout + theme + motion' },
        { title: 'Voice', detail: 'Fish Audio TTS' },
        { title: 'Render', detail: 'Playwright + ffmpeg' },
        { title: 'Verify', detail: 'Manifest + MP4' }
      ],
      effect: 'wipe',
      narration: 'AutoCut 把流程拆成六個階段：收集素材、規劃故事、產生簡報、建立配音、錄製動畫，最後驗證輸出。'
    },
    {
      layout: 'metrics',
      kicker: 'EVIDENCE',
      title: '可量化、可追蹤、可重跑',
      body: '每一頁都有 layout、effect、narration 與實際秒數。',
      metrics: [
        { value: '14', label: 'built-in layouts', detail: '不同內容使用不同 DOM 結構' },
        { value: '6', label: 'visual templates', detail: '版型與配色分離' },
        { value: '1', label: 'storyboard', detail: '唯一資料來源' },
        { value: 'MP4', label: 'delivery', detail: 'H.264 + AAC' }
      ],
      effect: 'rise',
      narration: '新版 Template System 內建多種版型與視覺模板，而且每一頁的結構、動畫、旁白與實際秒數都能在 manifest 中追蹤。'
    },
    {
      layout: 'compare',
      kicker: 'BEFORE / AFTER',
      title: '不是換動畫，而是換敘事結構',
      comparison: {
        left: {
          eyebrow: 'BEFORE',
          title: '單一固定版型',
          body: '所有內容都被塞進左文右卡片。',
          items: ['相同 DOM', '預設 metrics', '動畫與模板混在一起']
        },
        right: {
          eyebrow: 'AFTER',
          title: 'Layout Registry',
          body: '每種內容由專用 renderer 呈現。',
          items: ['結構化欄位', '自動推斷 layout', 'theme / layout / effect 分離']
        }
      },
      effect: 'slide',
      narration: '過去只是同一個版型套四種進場動畫。新版改成 Layout Registry，流程、比較、時間軸、指標與程式碼都有各自的 DOM 與視覺敘事。'
    },
    {
      layout: 'architecture',
      kicker: 'ARCHITECTURE',
      title: 'Template System 分層',
      body: '保留現有影片 Pipeline，只替換 Storyboard Model 與 Deck Renderer。',
      layers: [
        { title: 'Input', items: ['JSON', 'Markdown', 'Agent Skill'] },
        { title: 'Story Model', items: ['layout', 'structured fields', 'narration'] },
        { title: 'Presentation', items: ['template', 'renderer registry', 'motion'] },
        { title: 'Media', items: ['Fish Audio', 'Playwright', 'ffmpeg'] }
      ],
      effect: 'zoom',
      narration: '整體架構分為輸入、故事模型、簡報呈現與影音輸出四層。這次只重構前兩個呈現層，不破壞原本已經打通的配音與 MP4 Pipeline。'
    },
    {
      layout: 'cards',
      kicker: 'USE CASES',
      title: '同一套 Pipeline，多種影片敘事',
      cards: [
        { tag: '01', title: '技術提案', body: '架構、風險、Roadmap 與決策建議。' },
        { tag: '02', title: '開源專案', body: '快速產生 README 導覽與 Demo 影片。' },
        { tag: '03', title: '產品更新', body: 'Feature launch、Before / After 與 KPI。' },
        { tag: '04', title: '內部分享', body: '企業風格、旁白與可重複輸出。' }
      ],
      effect: 'rise',
      narration: '多版型之後，同一套 Pipeline 可以支援技術提案、開源專案介紹、產品更新與內部分享，而不是每一頁都看起來一樣。'
    },
    {
      layout: 'timeline',
      kicker: 'ROADMAP',
      title: '從 MVP 到自動化內容工廠',
      timeline: [
        { label: 'NOW', title: 'Template System', detail: '多 layout、多 theme、auto inference' },
        { label: 'NEXT', title: 'Asset Pipeline', detail: '圖片、圖表、Logo 與字型打包' },
        { label: 'LATER', title: 'Captions', detail: '逐字稿、字幕與章節標記' },
        { label: 'SCALE', title: 'Batch Render', detail: 'CI/CD 與大量影片產出' }
      ],
      effect: 'wipe',
      narration: '這一版先完成真正的 Template System。下一步可以補上素材打包、字幕與批次渲染，讓 AutoCut 逐步成為自動化內容工廠。'
    },
    {
      layout: 'quote',
      kicker: 'DESIGN PRINCIPLE',
      title: '內容優先',
      quote: '讓內容決定版型，而不是讓版型限制內容。',
      quoteBy: 'AutoCut Template System',
      body: '關鍵句使用獨立 Quote Renderer，刻意降低資訊密度。',
      effect: 'spotlight',
      narration: '讓內容決定版型，而不是讓版型限制內容。這是 Template System 最重要的設計原則。'
    },
    {
      layout: 'code',
      kicker: 'CLI',
      title: '同一份內容切換視覺模板',
      body: 'Template Override 不會改寫 Storyboard 的內容結構。',
      bullets: ['開發階段使用 --no-tts', '正式輸出使用 --require-tts'],
      code: {
        language: 'bash',
        filename: 'render.sh',
        content: 'node bin/autocut.mjs render \\n  --input storyboard.json \\n  --template midnight \\n  --out dist/final.mp4 \\n  --no-tts',
        highlights: [3]
      },
      effect: 'zoom',
      narration: '同一份 Storyboard 可以透過 template 參數輸出不同視覺語言，不需要逐頁修改內容。'
    },
    {
      layout: 'split',
      kicker: 'DELIVERY',
      title: '保留既有 MP4 Pipeline',
      body: 'Template System 只重構 Story Model 與 Deck Renderer，Fish Audio、Playwright 與 ffmpeg 流程保持相容。',
      bullets: ['降低改版風險', 'Manifest 增加 layout / effect metadata', '可以逐步加入 Asset Pipeline'],
      effect: 'slide',
      narration: '這次重構不更動既有影音 Pipeline，因此 Fish Audio、Playwright 與 ffmpeg 的整合仍然維持相容。'
    }
  ];

  const opening = {
    layout: 'hero',
    kicker: 'AUTOCUT / VIDEO DECK',
    title,
    subtitle: '自動生成有結構、有動畫、有旁白的 MP4 簡報',
    body: 'Layout 決定內容結構，Template 決定視覺語言，Effect 只負責動態表現。',
    tags: ['Storyboard', 'Template System', 'Fish Audio', 'MP4'],
    effect: 'zoom',
    narration: `今天分享 ${title}。新版 AutoCut 不再只是同一個版型換動畫，而是把 Layout、Template 與 Effect 拆成三個獨立層次。`
  };

  const ending = {
    layout: 'ending',
    kicker: 'NEXT ACTION',
    title: '讓內容決定版型，而不是讓版型限制內容',
    body: '先建立 Storyboard，再讓 AutoCut 自動選擇或明確指定最合適的 layout。',
    cta: 'node bin/autocut.mjs render --input storyboard.json --out dist/final.mp4',
    tags: ['Agent-ready', 'Local-first', 'Reproducible'],
    effect: 'spotlight',
    narration: '總結來說，真正的模板系統應該讓內容決定版型，而不是讓固定版型限制內容。現在可以直接建立 Storyboard，並輸出有動畫與配音的 MP4。'
  };

  const selectedMiddle = middleSlides.slice(0, Math.max(0, slideCount - 2));
  const slides = [opening, ...selectedMiddle, ending].slice(0, slideCount);
  if (slides.length === slideCount && slides.at(-1) !== ending) slides[slides.length - 1] = ending;

  return normalizeStoryboard({
    title,
    slug: slugify(title),
    language,
    template,
    settings: DEFAULT_SETTINGS,
    voice: DEFAULT_VOICE,
    brand: {
      name: 'AutoCut',
      label: 'Animated Narrative Deck',
      showProgress: true,
      showSlideNumber: true
    },
    slides
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
  const { frontmatter, content } = extractDocumentFrontmatter(markdown);
  const chunks = content
    .split(/^---\s*$/m)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const slides = chunks.map((chunk, index) => parseMarkdownSlide(chunk, index));
  const title = frontmatter.title || slides[0]?.title || 'AutoCut Deck';

  return {
    title,
    slug: slugify(title),
    language: frontmatter.language || frontmatter.lang || 'zh-TW',
    template: frontmatter.template || frontmatter.theme || 'editorial',
    settings: DEFAULT_SETTINGS,
    voice: DEFAULT_VOICE,
    slides
  };
}

export function normalizeStoryboard(input) {
  if (!input || typeof input !== 'object') {
    throw new Error('Storyboard must be an object.');
  }

  const title = String(input.title || 'AutoCut Deck').trim();
  const themeInput = typeof input.theme === 'object' && !Array.isArray(input.theme) ? input.theme : {};
  const requestedTemplate = input.template || (typeof input.theme === 'string' ? input.theme : themeInput.name) || 'editorial';
  const template = resolveTemplate(requestedTemplate, themeInput);
  const settingsInput = input.settings || {};
  const voiceInput = input.voice || {};
  const rawSlides = Array.isArray(input.slides) ? input.slides : [];

  if (rawSlides.length === 0) {
    throw new Error('Storyboard requires at least one slide.');
  }

  const slideBases = rawSlides.map((slide, index) => normalizeSlideBase(slide, index));
  const slides = slideBases.map((slide, index) => {
    const explicitLayout = resolveLayoutName(slide.layout, { strict: true });
    return {
      ...slide,
      layout: explicitLayout || inferLayout(slide, index, slideBases.length)
    };
  });

  return {
    title,
    slug: input.slug || slugify(title),
    language: input.language || 'zh-TW',
    template: template.name,
    templateMeta: {
      label: template.label,
      description: template.description,
      mode: template.mode,
      art: template.art
    },
    theme: template.theme,
    brand: normalizeBrand(input.brand),
    settings: {
      width: Math.round(Number(settingsInput.width) || DEFAULT_SETTINGS.width),
      height: Math.round(Number(settingsInput.height) || DEFAULT_SETTINGS.height),
      fps: Math.round(Number(settingsInput.fps) || DEFAULT_SETTINGS.fps),
      minSlideSeconds: seconds(settingsInput.minSlideSeconds, DEFAULT_SETTINGS.minSlideSeconds),
      paddingSeconds: seconds(settingsInput.paddingSeconds, DEFAULT_SETTINGS.paddingSeconds),
      transitionMs: Math.round(Number(settingsInput.transitionMs) || DEFAULT_SETTINGS.transitionMs)
    },
    voice: {
      ...DEFAULT_VOICE,
      ...voiceInput,
      prosody: {
        ...DEFAULT_VOICE.prosody,
        ...(voiceInput.prosody || {})
      }
    },
    slides
  };
}

function normalizeSlideBase(slide, index) {
  if (!slide || typeof slide !== 'object') {
    throw new Error(`Slide ${index + 1} must be an object.`);
  }

  const title = String(slide.title || `Slide ${index + 1}`).trim();
  const bullets = normalizeStringArray(slide.bullets);
  const metrics = normalizeMetrics(slide.metrics);
  const steps = normalizeSteps(slide.steps);
  const cards = normalizeCards(slide.cards);
  const timeline = normalizeTimeline(slide.timeline);
  const layers = normalizeLayers(slide.layers || slide.architecture);
  const comparison = normalizeComparison(slide.comparison || slide.compare);
  const infographic = normalizeInfographic(slide.infographic);
  const image = normalizeImage(slide.image || slide.visual?.image);
  const code = normalizeCode(slide.code);
  const quoteData = normalizeQuote(slide.quote, slide.quoteBy || slide.attribution, slide.quoteSource || slide.source);
  const effect = normalizeEffect(slide.effect);
  const beats = normalizeBeats(slide.beats);

  const normalized = {
    id: slide.id || `slide-${String(index + 1).padStart(2, '0')}`,
    layout: slide.layout || '',
    variant: safeToken(slide.variant || 'default'),
    kicker: String(slide.kicker || `SLIDE ${String(index + 1).padStart(2, '0')}`).trim(),
    title,
    subtitle: String(slide.subtitle || '').trim(),
    body: String(slide.body || '').trim(),
    bullets,
    metrics,
    steps,
    cards,
    timeline,
    layers,
    comparison,
    infographic,
    image,
    code,
    quote: quoteData.text,
    quoteBy: quoteData.by,
    quoteSource: quoteData.source,
    statement: String(slide.statement || slide.fact || '').trim(),
    emphasis: String(slide.emphasis || '').trim(),
    cta: String(slide.cta || '').trim(),
    tags: normalizeStringArray(slide.tags),
    effect,
    beats,
    narration: '',
    duration: seconds(slide.duration, 0)
  };

  normalized.narration = String(slide.narration || autoNarration(normalized)).trim();
  return normalized;
}

function normalizeBrand(input = {}) {
  return {
    name: String(input.name || 'AutoCut').trim(),
    label: String(input.label || 'Animated Narrative Deck').trim(),
    showProgress: input.showProgress !== false,
    showSlideNumber: input.showSlideNumber !== false
  };
}

function normalizeEffect(value) {
  const effect = String(value || 'fade').trim().toLowerCase();
  if (!SUPPORTED_EFFECTS.includes(effect)) {
    throw new Error(`Unknown slide effect: ${value}. Supported effects: ${SUPPORTED_EFFECTS.join(', ')}`);
  }
  return effect;
}

function normalizeBeats(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((beat, index) => {
      if (!beat || typeof beat !== 'object') {
        throw new Error(`Beat ${index + 1} must be an object.`);
      }
      const at = Number(beat.at ?? beat.time ?? 0);
      if (!Number.isFinite(at) || at < 0) {
        throw new Error(`Beat ${index + 1} must have a non-negative numeric at value.`);
      }
      const action = String(beat.action || '').trim().toLowerCase();
      if (!SUPPORTED_BEAT_ACTIONS.includes(action)) {
        throw new Error(`Unknown beat action: ${beat.action}. Supported actions: ${SUPPORTED_BEAT_ACTIONS.join(', ')}`);
      }
      const rawTarget = beat.target == null ? null : String(beat.target).trim();
      return {
        at,
        action,
        target: rawTarget || null
      };
    })
    .sort((left, right) => left.at - right.at);
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item ?? '').trim()).filter(Boolean);
}

function normalizeMetrics(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      if (item == null) return null;
      if (typeof item !== 'object') return { value: String(item), label: `Metric ${index + 1}`, detail: '', trend: '' };
      return {
        value: String(item.value ?? item.number ?? '').trim(),
        label: String(item.label ?? item.title ?? '').trim(),
        detail: String(item.detail ?? item.body ?? '').trim(),
        trend: String(item.trend ?? '').trim()
      };
    })
    .filter((item) => item && (item.value || item.label));
}

function normalizeSteps(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      if (typeof item === 'string') return { title: item.trim(), detail: '', icon: '', index: index + 1 };
      if (!item || typeof item !== 'object') return null;
      return {
        title: String(item.title ?? item.label ?? `Step ${index + 1}`).trim(),
        detail: String(item.detail ?? item.body ?? item.description ?? '').trim(),
        icon: String(item.icon ?? '').trim(),
        index: index + 1
      };
    })
    .filter(Boolean);
}

function normalizeCards(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      if (typeof item === 'string') return { tag: String(index + 1).padStart(2, '0'), title: item.trim(), body: '', icon: '' };
      if (!item || typeof item !== 'object') return null;
      return {
        tag: String(item.tag ?? item.label ?? String(index + 1).padStart(2, '0')).trim(),
        title: String(item.title ?? '').trim(),
        body: String(item.body ?? item.detail ?? item.description ?? '').trim(),
        icon: String(item.icon ?? '').trim()
      };
    })
    .filter((item) => item && (item.title || item.body));
}

function normalizeTimeline(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      if (typeof item === 'string') return { label: String(index + 1), title: item.trim(), detail: '' };
      if (!item || typeof item !== 'object') return null;
      return {
        label: String(item.label ?? item.date ?? item.phase ?? index + 1).trim(),
        title: String(item.title ?? '').trim(),
        detail: String(item.detail ?? item.body ?? item.description ?? '').trim()
      };
    })
    .filter((item) => item && (item.title || item.detail));
}

function normalizeLayers(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      if (typeof item === 'string') return { title: item.trim(), items: [], index: index + 1 };
      if (!item || typeof item !== 'object') return null;
      return {
        title: String(item.title ?? item.label ?? `Layer ${index + 1}`).trim(),
        items: normalizeStringArray(item.items || item.components),
        description: String(item.description ?? item.body ?? '').trim(),
        index: index + 1
      };
    })
    .filter(Boolean);
}

function normalizeInfographic(value) {
  if (!value || typeof value !== 'object') return null;
  const left = normalizeDiagramNode(value.left || value.problem, 'Problem');
  const center = normalizeDiagramNode(value.center || value.method, 'Method');
  const right = normalizeDiagramNode(value.right || value.outcome, 'Result');
  if (!left && !center && !right) return null;
  return {
    left: left || normalizeDiagramNode({}, 'Problem'),
    center: center || normalizeDiagramNode({}, 'Method'),
    right: right || normalizeDiagramNode({}, 'Result'),
    takeaways: normalizeStringArray(value.takeaways || value.highlights || value.points)
  };
}

function normalizeDiagramNode(value, fallbackTitle) {
  if (typeof value === 'string') return { title: fallbackTitle, detail: value.trim(), value: '', icon: '', items: [], status: '', art: '' };
  if (!value || typeof value !== 'object') return null;
  return {
    title: String(value.title ?? value.label ?? fallbackTitle).trim(),
    detail: String(value.detail ?? value.body ?? value.description ?? '').trim(),
    value: String(value.value ?? value.number ?? '').trim(),
    icon: String(value.icon ?? '').trim(),
    items: normalizeStringArray(value.items || value.bullets || value.checklist),
    status: String(value.status ?? '').trim(),
    art: String(value.art ?? value.illustration ?? '').trim()
  };
}

function normalizeComparison(value) {
  if (!value) return null;
  const input = Array.isArray(value)
    ? { left: value[0], right: value[1] }
    : value;
  if (!input || typeof input !== 'object') return null;
  const left = normalizeComparisonSide(input.left || input.before || input.a, 'Before');
  const right = normalizeComparisonSide(input.right || input.after || input.b, 'After');
  return left || right ? { left: left || normalizeComparisonSide({}, 'Before'), right: right || normalizeComparisonSide({}, 'After') } : null;
}

function normalizeComparisonSide(value, fallbackTitle) {
  if (typeof value === 'string') return { eyebrow: '', title: fallbackTitle, body: value.trim(), items: [], badge: '' };
  if (!value || typeof value !== 'object') return null;
  return {
    eyebrow: String(value.eyebrow ?? value.label ?? '').trim(),
    title: String(value.title ?? fallbackTitle).trim(),
    body: String(value.body ?? value.detail ?? value.description ?? '').trim(),
    items: normalizeStringArray(value.items || value.bullets),
    badge: String(value.badge ?? '').trim()
  };
}

function normalizeImage(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    return { src: value.trim(), alt: '', fit: 'cover', position: 'right', caption: '', focalPoint: 'center' };
  }
  if (typeof value !== 'object') return null;
  const src = String(value.src ?? value.url ?? '').trim();
  if (!src) return null;
  const fit = ['cover', 'contain'].includes(value.fit) ? value.fit : 'cover';
  const position = ['left', 'right', 'background'].includes(value.position) ? value.position : 'right';
  return {
    src,
    alt: String(value.alt ?? '').trim(),
    fit,
    position,
    caption: String(value.caption ?? '').trim(),
    focalPoint: String(value.focalPoint ?? value.focus ?? 'center').trim()
  };
}

function normalizeCode(value) {
  if (!value) return null;
  if (typeof value === 'string') return { language: 'text', content: value, filename: '', caption: '', highlights: [] };
  if (typeof value !== 'object') return null;
  const content = String(value.content ?? value.source ?? '').replace(/^\n+|\n+$/g, '');
  if (!content) return null;
  return {
    language: String(value.language ?? value.lang ?? 'text').trim(),
    content,
    filename: String(value.filename ?? value.file ?? '').trim(),
    caption: String(value.caption ?? '').trim(),
    highlights: Array.isArray(value.highlights) ? value.highlights.map(Number).filter(Number.isFinite) : []
  };
}

function normalizeQuote(value, by, source) {
  if (value && typeof value === 'object') {
    return {
      text: String(value.text ?? value.quote ?? '').trim(),
      by: String(value.by ?? value.author ?? by ?? '').trim(),
      source: String(value.source ?? source ?? '').trim()
    };
  }
  return {
    text: String(value ?? '').trim(),
    by: String(by ?? '').trim(),
    source: String(source ?? '').trim()
  };
}

function autoNarration(slide) {
  const structured = [
    ...slide.steps.map((item) => `${item.title}${item.detail ? `，${item.detail}` : ''}`),
    ...slide.metrics.map((item) => `${item.label}${item.value ? `是 ${item.value}` : ''}`),
    ...slide.timeline.map((item) => `${item.label}，${item.title}`),
    ...slide.cards.map((item) => `${item.title}，${item.body}`)
  ];
  const comparison = slide.comparison
    ? [`${slide.comparison.left.title}，${slide.comparison.left.body}`, `${slide.comparison.right.title}，${slide.comparison.right.body}`]
    : [];
  const infographic = slide.infographic
    ? [slide.infographic.left, slide.infographic.center, slide.infographic.right]
      .flatMap((node) => [node.title, node.value, node.detail, ...node.items])
    : [];
  return [
    slide.title,
    slide.subtitle,
    slide.statement,
    slide.quote,
    slide.body,
    ...slide.bullets,
    ...structured,
    ...comparison,
    ...infographic,
    ...(slide.infographic?.takeaways || [])
  ].filter(Boolean).join('。');
}

function extractDocumentFrontmatter(markdown) {
  const normalized = String(markdown || '').replace(/^\uFEFF/, '');
  if (!normalized.startsWith('---')) return { frontmatter: {}, content: normalized };
  const match = normalized.match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/);
  if (!match) return { frontmatter: {}, content: normalized };
  return {
    frontmatter: parseSimpleFrontmatter(match[1]),
    content: normalized.slice(match[0].length)
  };
}

function parseSimpleFrontmatter(raw) {
  const result = {};
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z][\w-]*)\s*:\s*(.+)$/);
    if (!match) continue;
    result[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return result;
}

function parseMarkdownSlide(chunk, index) {
  const directives = {};
  const directivePattern = /<!--\s*([A-Za-z][\w-]*)\s*:\s*([\s\S]*?)\s*-->/g;
  let directiveMatch;
  while ((directiveMatch = directivePattern.exec(chunk))) {
    directives[directiveMatch[1]] = directiveMatch[2].trim();
  }

  const notesMatch = chunk.match(/:::notes\s*\n([\s\S]*?)\n:::/i);
  const narration = notesMatch ? notesMatch[1].trim() : '';
  const codeMatch = chunk.match(/```([\w-]*)\s*\n([\s\S]*?)\n```/);
  const blockquoteLines = [...chunk.matchAll(/^>\s?(.*)$/gm)].map((match) => match[1].trim()).filter(Boolean);
  const cleaned = chunk
    .replace(directivePattern, '')
    .replace(/:::notes\s*\n[\s\S]*?\n:::/gi, '')
    .replace(/```[\w-]*\s*\n[\s\S]*?\n```/g, '')
    .replace(/^>\s?.*$/gm, '')
    .trim();
  const lines = cleaned.split(/\r?\n/).map((line) => line.trimEnd());
  const titleLine = lines.find((line) => /^#{1,2}\s+/.test(line));
  const title = titleLine ? titleLine.replace(/^#{1,2}\s+/, '').trim() : `Slide ${index + 1}`;
  const bullets = [];
  const numbered = [];
  const paragraphs = [];

  for (const line of lines) {
    if (/^#{1,2}\s+/.test(line) || !line.trim()) continue;
    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      bullets.push(bulletMatch[1].trim());
      continue;
    }
    const numberMatch = line.match(/^\d+[.)]\s+(.+)$/);
    if (numberMatch) {
      numbered.push(numberMatch[1].trim());
      continue;
    }
    paragraphs.push(line.trim());
  }

  const layout = directives.layout || '';
  return {
    kicker: directives.kicker || `SLIDE ${String(index + 1).padStart(2, '0')}`,
    layout,
    effect: directives.effect || ['zoom', 'wipe', 'slide', 'spotlight'][index % 4],
    variant: directives.variant || 'default',
    title,
    body: paragraphs.join(' '),
    bullets,
    steps: layout === 'flow' ? numbered.map((item) => ({ title: item })) : [],
    quote: layout === 'quote' ? blockquoteLines.join(' ') : '',
    quoteBy: directives.quoteBy || directives.author || '',
    statement: directives.statement || '',
    cta: directives.cta || '',
    image: directives.image ? { src: directives.image, position: directives.imagePosition || 'right' } : null,
    code: codeMatch ? { language: codeMatch[1] || 'text', content: codeMatch[2] } : null,
    narration: narration || [title, ...paragraphs, ...bullets, ...numbered].join('。')
  };
}

function safeToken(value) {
  const token = String(value || 'default').trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  return token || 'default';
}
