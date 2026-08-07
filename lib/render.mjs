import { basename, dirname, join, resolve } from 'node:path';
import { writeDeckHtml } from './deck-html.mjs';
import { concatAudio, createSilentAudio, muxVideoAudio, padAudioToDuration, probeDuration } from './audio.mjs';
import { generateFishSpeech, getFishApiKey } from './fish-audio.mjs';
import { renderAnimatedVideo } from './video.mjs';
import { ensureDir, writeJson } from './utils.mjs';

export async function renderProject(storyboard, options = {}) {
  const outputMp4 = resolve(process.cwd(), options.out || 'dist/autocut.mp4');
  const workdir = resolve(process.cwd(), options.workdir || dirname(outputMp4));
  const assetsDir = join(workdir, 'assets');
  const audioDir = join(assetsDir, 'audio');
  const htmlPath = options.html ? resolve(process.cwd(), options.html) : join(workdir, 'deck.html');
  const rawWebm = join(workdir, 'deck.webm');
  const narrationPath = join(workdir, 'narration.mp3');
  const manifestPath = join(workdir, 'manifest.json');

  await ensureDir(workdir);
  await ensureDir(assetsDir);
  await ensureDir(audioDir);

  if (!options.html) {
    await writeDeckHtml(storyboard, htmlPath);
  }

  const ttsMode = options.noTts ? 'off' : options.requireTts ? 'required' : 'auto';
  const hasFishKey = Boolean(getFishApiKey());
  const useTts = ttsMode !== 'off' && hasFishKey;

  if (ttsMode === 'required' && !hasFishKey) {
    throw new Error('TTS is required but no Fish Audio API key was found. Set FISH_API_KEY.');
  }

  const audioPlan = [];
  const slideDurations = [];

  for (let index = 0; index < storyboard.slides.length; index += 1) {
    const slide = storyboard.slides[index];
    const baseName = `slide-${String(index + 1).padStart(2, '0')}`;
    const rawAudioPath = join(audioDir, `${baseName}.raw.mp3`);
    const finalAudioPath = join(audioDir, `${baseName}.mp3`);
    const fallbackDuration = Math.max(
      storyboard.settings.minSlideSeconds,
      Number(slide.duration || 0) || 0
    );

    let rawDuration = fallbackDuration;
    let source = 'silent';

    if (useTts) {
      await generateFishSpeech(slide.narration, rawAudioPath, {
        ...storyboard.voice,
        referenceId: options.voice || storyboard.voice.referenceId,
        model: options.model || storyboard.voice.model,
        prosody: {
          ...storyboard.voice.prosody,
          ...(options.speed ? { speed: Number(options.speed) } : {})
        }
      });
      rawDuration = await probeDuration(rawAudioPath);
      source = 'fish-audio';
    } else {
      await createSilentAudio(rawAudioPath, fallbackDuration);
      rawDuration = fallbackDuration;
    }

    const targetDuration = Math.max(
      fallbackDuration,
      rawDuration + Number(storyboard.settings.paddingSeconds || 0)
    );
    await padAudioToDuration(rawAudioPath, finalAudioPath, targetDuration);

    audioPlan.push({
      slide: slide.id,
      source,
      narration: slide.narration,
      rawAudio: relative(workdir, rawAudioPath),
      audio: relative(workdir, finalAudioPath),
      rawDuration: round(rawDuration),
      duration: round(targetDuration)
    });
    slideDurations.push(targetDuration);
  }

  await concatAudio(audioPlan.map((item) => resolve(workdir, item.audio)), narrationPath);

  if (!options.audioOnly) {
    await renderAnimatedVideo(storyboard, htmlPath, slideDurations, rawWebm, {
      width: options.width,
      height: options.height
    });
    await muxVideoAudio(rawWebm, narrationPath, outputMp4);
  }

  const manifest = {
    title: storyboard.title,
    output: options.audioOnly ? null : relative(process.cwd(), outputMp4),
    workdir: relative(process.cwd(), workdir),
    html: relative(process.cwd(), htmlPath),
    rawVideo: options.audioOnly ? null : relative(process.cwd(), rawWebm),
    narration: relative(process.cwd(), narrationPath),
    tts: {
      mode: ttsMode,
      used: useTts,
      provider: useTts ? 'fish-audio' : 'silent-fallback',
      model: options.model || storyboard.voice.model
    },
    slides: audioPlan,
    totalSeconds: round(slideDurations.reduce((sum, duration) => sum + duration, 0)),
    generatedAt: new Date().toISOString()
  };

  await writeJson(manifestPath, manifest);
  return manifest;
}

function round(value) {
  return Math.round(Number(value) * 1000) / 1000;
}

function relative(from, to) {
  const path = to.startsWith(from) ? to.slice(from.length).replace(/^[/\\]/, '') : to;
  return path || basename(to);
}
