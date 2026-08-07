import { writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { ensureDir } from './utils.mjs';

const FISH_TTS_URL = 'https://api.fish.audio/v1/tts';

export function getFishApiKey(env = process.env) {
  return env.FISH_API_KEY || env.FISH_AUDIO_API_KEY || env.FISH_STUDIO_API_KEY || '';
}

export function getFishReferenceId(env = process.env) {
  return env.FISH_REFERENCE_ID || env.FISH_AUDIO_REFERENCE_ID || env.FISH_STUDIO_REFERENCE_ID || '';
}

export async function generateFishSpeech(text, outputPath, options = {}) {
  const apiKey = options.apiKey || getFishApiKey();
  if (!apiKey) {
    throw new Error('Missing Fish Audio API key. Set FISH_API_KEY, FISH_AUDIO_API_KEY, or FISH_STUDIO_API_KEY.');
  }

  const model = options.model || 's2.1-pro-free';
  const format = options.format || 'mp3';
  const referenceId = options.referenceId || getFishReferenceId() || null;
  const body = {
    text: String(text || '').trim(),
    format,
    latency: options.latency || 'balanced',
    normalize: options.normalize !== false,
    prosody: {
      speed: Number(options.prosody?.speed ?? 1.0),
      volume: Number(options.prosody?.volume ?? 0)
    }
  };

  if (!body.text) {
    throw new Error('Fish Audio TTS text cannot be empty.');
  }
  if (referenceId) {
    body.reference_id = referenceId;
  }
  if (Number.isFinite(Number(options.temperature))) {
    body.temperature = Number(options.temperature);
  }
  if (Number.isFinite(Number(options.topP))) {
    body.top_p = Number(options.topP);
  }

  const response = await fetchWithRetry(FISH_TTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      model
    },
    body: JSON.stringify(body)
  }, Number(options.retries ?? 2));

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Fish Audio TTS failed: HTTP ${response.status} ${response.statusText} ${errorText}`.trim());
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length === 0) {
    throw new Error('Fish Audio returned an empty audio response.');
  }

  await ensureDir(dirname(outputPath));
  await writeFile(outputPath, buffer);
  return outputPath;
}

export async function testFishAudio(outputPath, options = {}) {
  return generateFishSpeech(options.text || 'AutoCut Fish Audio test. 這是一段測試配音。', outputPath, options);
}

async function fetchWithRetry(url, options, retries) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, options);
      if (response.status < 500 || attempt === retries) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
    }
    await delay(550 * (attempt + 1));
  }
  throw lastError;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
