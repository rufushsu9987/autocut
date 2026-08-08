const SYSTEM_SANS = 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const SYSTEM_SERIF = 'Iowan Old Style, Baskerville, "Times New Roman", serif';
const SYSTEM_MONO = '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace';

export const LAYOUT_DEFINITIONS = Object.freeze({
  hero: {
    label: 'Hero / Cover',
    description: 'Full-frame opening with oversized title and a strong visual hook.'
  },
  section: {
    label: 'Section Divider',
    description: 'Minimal chapter divider that resets the story rhythm.'
  },
  split: {
    label: 'Split',
    description: 'Copy on the left and a visual, image, metrics, or abstract composition on the right.'
  },
  'visual-left': {
    label: 'Visual Left',
    description: 'Mirrored split layout with visual content on the left.'
  },
  flow: {
    label: 'Flow',
    description: 'Horizontal or wrapped process steps with directional continuity.'
  },
  infographic: {
    label: 'Infographic',
    description: 'Simple problem-to-method-to-result diagram with compact takeaways.'
  },
  metrics: {
    label: 'Metrics',
    description: 'KPI and evidence cards with one dominant number per block.'
  },
  compare: {
    label: 'Compare',
    description: 'Before / after or option A / option B contrast.'
  },
  quote: {
    label: 'Quote',
    description: 'Large quote or customer insight with attribution.'
  },
  timeline: {
    label: 'Timeline',
    description: 'Chronological milestones, phases, or roadmap events.'
  },
  cards: {
    label: 'Cards',
    description: 'A modular two-to-four card grid for capabilities or categories.'
  },
  statement: {
    label: 'Statement / Fact',
    description: 'One dominant idea, number, or claim with minimal supporting copy.'
  },
  code: {
    label: 'Code',
    description: 'Developer-oriented code panel with concise explanation.'
  },
  architecture: {
    label: 'Architecture',
    description: 'Layered system architecture or platform stack.'
  },
  ending: {
    label: 'Ending',
    description: 'Closing summary, call to action, or contact slide.'
  }
});

export const LAYOUT_ALIASES = Object.freeze({
  cover: 'hero',
  title: 'hero',
  center: 'statement',
  fact: 'statement',
  default: 'split',
  'image-right': 'split',
  'image-left': 'visual-left',
  comparison: 'compare',
  roadmap: 'timeline',
  process: 'flow',
  diagram: 'infographic',
  grid: 'cards',
  layers: 'architecture',
  end: 'ending'
});

export const TEMPLATE_DEFINITIONS = Object.freeze({
  editorial: {
    label: 'Editorial Warm',
    description: 'Warm, premium editorial styling for business and strategy decks.',
    mode: 'light',
    art: 'editorial',
    theme: {
      background: '#f4ede2',
      backgroundAlt: '#ebe0d1',
      foreground: '#201916',
      muted: '#71645b',
      accent: '#c96f43',
      accent2: '#8b5d45',
      panel: '#fffaf2',
      panelStrong: '#ffffff',
      line: 'rgba(32, 25, 22, 0.12)',
      shadow: '0 28px 90px rgba(55, 39, 29, 0.16)',
      headingFont: SYSTEM_SERIF,
      bodyFont: SYSTEM_SANS,
      monoFont: SYSTEM_MONO,
      radius: '34px'
    }
  },
  'claude-editorial': {
    label: 'Claude Editorial',
    description: 'Warm ivory, charcoal typography, terracotta emphasis, and content-aware editorial layouts.',
    mode: 'light',
    art: 'editorial',
    theme: {
      background: '#F7F3EC',
      backgroundAlt: '#F1D9CD',
      foreground: '#211F1B',
      muted: '#6F6962',
      accent: '#D97757',
      accent2: '#5E8065',
      panel: '#FFFDF9',
      panelStrong: '#FFFDF9',
      line: 'rgba(33, 31, 27, 0.12)',
      shadow: '0 28px 90px rgba(33, 31, 27, 0.12)',
      headingFont: '"Iowan Old Style", "Palatino Linotype", Georgia, serif',
      bodyFont: SYSTEM_SANS,
      monoFont: SYSTEM_MONO,
      radius: '10px'
    }
  },
  corporate: {
    label: 'Corporate Blue',
    description: 'Clean enterprise styling for architecture reviews and executive reports.',
    mode: 'light',
    art: 'bands',
    theme: {
      background: '#eef4fb',
      backgroundAlt: '#dfeaf7',
      foreground: '#10233f',
      muted: '#5f7088',
      accent: '#1769d2',
      accent2: '#08a3a8',
      panel: '#f8fbff',
      panelStrong: '#ffffff',
      line: 'rgba(16, 35, 63, 0.12)',
      shadow: '0 28px 80px rgba(33, 73, 122, 0.17)',
      headingFont: SYSTEM_SANS,
      bodyFont: SYSTEM_SANS,
      monoFont: SYSTEM_MONO,
      radius: '28px'
    }
  },
  midnight: {
    label: 'Midnight Tech',
    description: 'Dark technical theme with electric blue and cyan highlights.',
    mode: 'dark',
    art: 'halo',
    theme: {
      background: '#08101d',
      backgroundAlt: '#111c2e',
      foreground: '#f4f8ff',
      muted: '#9ba9bd',
      accent: '#5b8cff',
      accent2: '#36d6cf',
      panel: '#111c2d',
      panelStrong: '#17243a',
      line: 'rgba(196, 216, 255, 0.14)',
      shadow: '0 32px 100px rgba(0, 0, 0, 0.42)',
      headingFont: SYSTEM_SANS,
      bodyFont: SYSTEM_SANS,
      monoFont: SYSTEM_MONO,
      radius: '30px'
    }
  },
  aurora: {
    label: 'Aurora AI',
    description: 'High-energy gradient styling for AI, product, and launch videos.',
    mode: 'dark',
    art: 'aurora',
    theme: {
      background: '#100d24',
      backgroundAlt: '#1d1740',
      foreground: '#fbf9ff',
      muted: '#b9b2cf',
      accent: '#8d6bff',
      accent2: '#30d6c9',
      panel: 'rgba(31, 25, 63, 0.82)',
      panelStrong: 'rgba(44, 34, 88, 0.9)',
      line: 'rgba(221, 211, 255, 0.16)',
      shadow: '0 34px 110px rgba(3, 1, 16, 0.5)',
      headingFont: SYSTEM_SANS,
      bodyFont: SYSTEM_SANS,
      monoFont: SYSTEM_MONO,
      radius: '38px'
    }
  },
  paper: {
    label: 'Paper Grid',
    description: 'Minimal white-paper aesthetic for research and analysis.',
    mode: 'light',
    art: 'grid',
    theme: {
      background: '#f8f8f5',
      backgroundAlt: '#efefe9',
      foreground: '#171717',
      muted: '#66655f',
      accent: '#d33f31',
      accent2: '#2b6a66',
      panel: '#fbfbf8',
      panelStrong: '#ffffff',
      line: 'rgba(23, 23, 23, 0.13)',
      shadow: '0 22px 70px rgba(20, 20, 18, 0.12)',
      headingFont: SYSTEM_SERIF,
      bodyFont: SYSTEM_SANS,
      monoFont: SYSTEM_MONO,
      radius: '10px'
    }
  },
  terminal: {
    label: 'Terminal Green',
    description: 'Monospace developer styling for CLI, DevOps, and security demos.',
    mode: 'dark',
    art: 'terminal',
    theme: {
      background: '#07100b',
      backgroundAlt: '#0d1a12',
      foreground: '#dcffe6',
      muted: '#85a990',
      accent: '#59f38c',
      accent2: '#f2c94c',
      panel: '#0c1710',
      panelStrong: '#122019',
      line: 'rgba(113, 255, 156, 0.18)',
      shadow: '0 30px 90px rgba(0, 0, 0, 0.5)',
      headingFont: SYSTEM_MONO,
      bodyFont: SYSTEM_MONO,
      monoFont: SYSTEM_MONO,
      radius: '16px'
    }
  }
});

const THEME_KEYS = Object.freeze([
  'background',
  'backgroundAlt',
  'foreground',
  'muted',
  'accent',
  'accent2',
  'panel',
  'panelStrong',
  'line',
  'shadow',
  'headingFont',
  'bodyFont',
  'monoFont',
  'radius'
]);

export function listLayouts() {
  return Object.entries(LAYOUT_DEFINITIONS).map(([name, definition]) => ({ name, ...definition }));
}

export function listTemplates() {
  return Object.entries(TEMPLATE_DEFINITIONS).map(([name, definition]) => ({
    name,
    label: definition.label,
    description: definition.description,
    mode: definition.mode
  }));
}

export function resolveLayoutName(value, options = {}) {
  const requested = String(value || '').trim().toLowerCase();
  if (!requested) return null;
  const resolved = LAYOUT_ALIASES[requested] || requested;
  if (LAYOUT_DEFINITIONS[resolved]) return resolved;
  if (options.strict !== false) {
    throw new Error(`Unknown slide layout: ${value}. Supported layouts: ${Object.keys(LAYOUT_DEFINITIONS).join(', ')}`);
  }
  return null;
}

export function resolveTemplate(templateName, overrides = {}) {
  const requested = String(templateName || 'editorial').trim().toLowerCase();
  const definition = TEMPLATE_DEFINITIONS[requested];
  if (!definition) {
    throw new Error(`Unknown template: ${templateName}. Supported templates: ${Object.keys(TEMPLATE_DEFINITIONS).join(', ')}`);
  }

  const safeOverrides = {};
  for (const key of THEME_KEYS) {
    if (overrides[key] == null) continue;
    const value = String(overrides[key]).trim();
    if (isSafeCssValue(value)) safeOverrides[key] = value;
  }

  return {
    name: requested,
    label: definition.label,
    description: definition.description,
    mode: definition.mode,
    art: definition.art,
    theme: {
      ...definition.theme,
      ...safeOverrides
    }
  };
}

export function inferLayout(slide, index, total) {
  if (index === 0) return 'hero';
  if (slide.infographic) return 'infographic';
  if (slide.quote) return 'quote';
  if (slide.comparison) return 'compare';
  if (slide.timeline?.length) return 'timeline';
  if (slide.layers?.length) return 'architecture';
  if (slide.code?.content) return 'code';
  if (slide.steps?.length) return 'flow';
  if (slide.metrics?.length) return 'metrics';
  if (slide.cards?.length) return 'cards';
  if (index === total - 1 && (slide.cta || /thank|thanks|next|結論|下一步|謝謝|行動/i.test(slide.title || ''))) return 'ending';
  if (slide.statement || (!slide.image && !slide.bullets?.length && String(slide.body || '').length <= 90)) return 'statement';
  if (slide.image?.position === 'left') return 'visual-left';
  return 'split';
}

function isSafeCssValue(value) {
  return value.length <= 240 && !/[;{}<>]/.test(value);
}
