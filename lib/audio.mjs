import { dirname, join } from 'node:path';
import { ensureDir, run, shellQuote } from './utils.mjs';

export async function probeDuration(inputPath) {
  const result = await run('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    inputPath
  ]);
  const duration = Number.parseFloat(result.stdout.trim());
  if (!Number.isFinite(duration)) {
    throw new Error(`Unable to read media duration for ${inputPath}`);
  }
  return duration;
}

export async function createSilentAudio(outputPath, durationSeconds) {
  await ensureDir(dirname(outputPath));
  await run('ffmpeg', [
    '-y',
    '-f', 'lavfi',
    '-i', 'anullsrc=r=44100:cl=stereo',
    '-t', String(Math.max(0.2, durationSeconds)),
    '-q:a', '9',
    '-acodec', 'libmp3lame',
    outputPath
  ]);
  return outputPath;
}

export async function padAudioToDuration(inputPath, outputPath, durationSeconds) {
  await ensureDir(dirname(outputPath));
  await run('ffmpeg', [
    '-y',
    '-i', inputPath,
    '-af', 'apad',
    '-t', String(Math.max(0.2, durationSeconds)),
    '-c:a', 'libmp3lame',
    '-ar', '44100',
    outputPath
  ]);
  return outputPath;
}

export async function concatAudio(inputPaths, outputPath) {
  await ensureDir(dirname(outputPath));
  const listPath = join(dirname(outputPath), 'audio-concat.txt');
  const list = inputPaths.map((path) => `file ${shellQuote(path)}`).join('\n');
  await import('node:fs/promises').then(({ writeFile }) => writeFile(listPath, `${list}\n`, 'utf8'));
  await run('ffmpeg', [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', listPath,
    '-c:a', 'libmp3lame',
    '-ar', '44100',
    outputPath
  ]);
  return outputPath;
}

export async function muxVideoAudio(videoPath, audioPath, outputPath) {
  await ensureDir(dirname(outputPath));
  await run('ffmpeg', [
    '-y',
    '-i', videoPath,
    '-i', audioPath,
    '-map', '0:v:0',
    '-map', '1:a:0',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'medium',
    '-crf', '20',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    outputPath
  ]);
  return outputPath;
}
