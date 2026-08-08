import { dirname, resolve } from 'node:path';
import { createStoryboard, loadStoryboard, normalizeStoryboard } from './storyboard.mjs';
import { renderProject } from './render.mjs';
import { testFishAudio, getFishApiKey } from './fish-audio.mjs';
import { listLayouts, listTemplates } from './templates.mjs';
import { commandExists, ensureDir, parseNumberFlag, writeJson } from './utils.mjs';

export async function main(argv) {
  const [command = 'help', ...rest] = argv;
  const { flags, positional } = parseArgs(rest);

  switch (command) {
    case 'create':
    case 'init':
      await commandCreate(positional, flags);
      break;
    case 'render':
      await commandRender(flags);
      break;
    case 'templates':
    case 'layouts':
      commandTemplates(flags);
      break;
    case 'doctor':
      await commandDoctor(flags);
      break;
    case 'fish-test':
      await commandFishTest(flags);
      break;
    case 'help':
    case '--help':
    case '-h':
      printHelp();
      break;
    default:
      throw new Error(`Unknown command: ${command}\nRun \`autocut help\`.`);
  }
}

async function commandCreate(positional, flags) {
  const topic = positional.join(' ').trim() || flags.topic || 'AI Agent 技術提案';
  const out = resolve(process.cwd(), flags.out || 'storyboard.json');
  const storyboard = createStoryboard(topic, {
    slides: parseNumberFlag(flags.slides, 7),
    language: flags.language || flags.lang || 'zh-TW',
    template: flags.template || 'editorial'
  });
  await writeJson(out, storyboard);
  console.log(`Created ${storyboard.template} storyboard with ${storyboard.slides.length} varied layouts: ${out}`);
}

async function commandRender(flags) {
  const input = flags.input || flags.i;
  if (!input) {
    throw new Error('Missing --input <storyboard.json|deck.md>.');
  }

  let storyboard = await loadStoryboard(resolve(process.cwd(), input));
  if (flags.template) {
    const { theme: _theme, templateMeta: _templateMeta, ...portableStoryboard } = storyboard;
    storyboard = normalizeStoryboard({ ...portableStoryboard, template: flags.template, theme: {} });
  }

  const manifest = await renderProject(storyboard, {
    out: flags.out || flags.o || 'dist/autocut.mp4',
    workdir: flags.workdir,
    html: flags.html,
    noTts: Boolean(flags['no-tts']),
    requireTts: Boolean(flags['require-tts']),
    audioOnly: Boolean(flags['audio-only']),
    voice: flags.voice || flags.reference || flags.referenceId,
    model: flags.model,
    speed: flags.speed,
    width: parseNumberFlag(flags.width, storyboard.settings.width),
    height: parseNumberFlag(flags.height, storyboard.settings.height)
  });

  console.log(JSON.stringify(manifest, null, 2));
}

function commandTemplates(flags) {
  const payload = {
    templates: listTemplates(),
    layouts: listLayouts()
  };

  if (flags.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log('AutoCut visual templates');
  for (const template of payload.templates) {
    console.log(`- ${template.name.padEnd(10)} ${template.label} [${template.mode}]`);
    console.log(`  ${template.description}`);
  }

  console.log('\nAutoCut structural layouts');
  for (const layout of payload.layouts) {
    console.log(`- ${layout.name.padEnd(13)} ${layout.label}`);
    console.log(`  ${layout.description}`);
  }
}

async function commandDoctor(flags) {
  const checks = {
    node: process.versions.node,
    ffmpeg: await commandExists('ffmpeg'),
    ffprobe: await commandExists('ffprobe'),
    fishApiKey: Boolean(getFishApiKey()),
    playwrightPackage: false,
    templates: listTemplates().length,
    layouts: listLayouts().length
  };

  try {
    await import('playwright');
    checks.playwrightPackage = true;
  } catch {
    checks.playwrightPackage = false;
  }

  if (flags.json) {
    console.log(JSON.stringify(checks, null, 2));
    return;
  }

  console.log('AutoCut doctor');
  console.log(`- Node.js: ${checks.node}`);
  console.log(`- ffmpeg: ${checks.ffmpeg ? 'ok' : 'missing'}`);
  console.log(`- ffprobe: ${checks.ffprobe ? 'ok' : 'missing'}`);
  console.log(`- Playwright package: ${checks.playwrightPackage ? 'ok' : 'missing'}`);
  console.log(`- Fish API key: ${checks.fishApiKey ? 'configured' : 'not configured'}`);
  console.log(`- Template System: ${checks.templates} templates / ${checks.layouts} layouts`);

  if (!checks.ffmpeg || !checks.ffprobe) {
    console.log('\nInstall ffmpeg before rendering MP4. macOS: brew install ffmpeg');
  }
  if (!checks.playwrightPackage) {
    console.log('Install dependencies and browser runtime: npm install && npm run setup:browser');
  }
}

async function commandFishTest(flags) {
  const out = resolve(process.cwd(), flags.out || 'dist/fish-test.mp3');
  await ensureDir(dirname(out));
  await testFishAudio(out, {
    text: flags.text,
    model: flags.model,
    referenceId: flags.voice || flags.reference || flags.referenceId,
    prosody: {
      speed: flags.speed ? Number(flags.speed) : 1.0,
      volume: flags.volume ? Number(flags.volume) : 0
    }
  });
  console.log(`Generated Fish Audio sample: ${out}`);
}

function parseArgs(args) {
  const flags = {};
  const positional = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith('-')) {
      positional.push(arg);
      continue;
    }

    const normalized = arg.replace(/^--?/, '');
    if (normalized.startsWith('no-')) {
      flags[normalized] = true;
      continue;
    }

    const [key, inlineValue] = normalized.split('=', 2);
    if (inlineValue !== undefined) {
      flags[key] = inlineValue;
      continue;
    }

    const next = args[index + 1];
    if (!next || next.startsWith('-')) {
      flags[key] = true;
    } else {
      flags[key] = next;
      index += 1;
    }
  }

  return { flags, positional };
}

function printHelp() {
  console.log(`AutoCut — animated MP4 presentation generator

Usage:
  autocut create "AI Agent 技術提案" --slides 7 --template midnight --out storyboard.json
  autocut templates
  autocut render --input storyboard.json --out dist/demo.mp4
  autocut render --input storyboard.json --template corporate --out dist/corporate.mp4
  autocut render --input examples/brief.md --out dist/brief.mp4 --require-tts
  autocut fish-test --out dist/fish-test.mp3
  autocut doctor

Template System:
  --template <name>         editorial, claude-editorial, corporate, midnight, aurora, paper, terminal
  autocut templates        list visual templates and structural layouts

Environment:
  FISH_API_KEY              Fish Audio API key, canonical name
  FISH_AUDIO_API_KEY        compatibility alias
  FISH_STUDIO_API_KEY       compatibility alias for Fish Studio wording
  FISH_REFERENCE_ID         optional voice model id

Render flags:
  --no-tts                  skip Fish Audio and create silent narration
  --require-tts             fail when Fish API key is missing
  --voice <reference_id>    Fish Audio voice model id
  --model <model>           default: s2.1-pro-free
  --audio-only              generate narration files and manifest only
  --workdir <dir>           intermediate output directory
  --html <file>             record an existing compatible AutoCut HTML deck
`);
}
