import { copyFile, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ensureDir } from './utils.mjs';

export async function renderAnimatedVideo(storyboard, htmlPath, slideDurations, outputWebmPath, options = {}) {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch (error) {
    throw new Error('Playwright is not installed. Run `npm install` and `npm run setup:browser` first.');
  }

  const width = Number(options.width || storyboard.settings.width || 1920);
  const height = Number(options.height || storyboard.settings.height || 1080);
  const videoDir = join(dirname(outputWebmPath), '.playwright-video');
  await rm(videoDir, { recursive: true, force: true });
  await ensureDir(videoDir);
  await ensureDir(dirname(outputWebmPath));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: videoDir,
      size: { width, height }
    }
  });

  const page = await context.newPage();
  const video = page.video();
  try {
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts?.ready);

    for (let index = 0; index < storyboard.slides.length; index += 1) {
      await page.evaluate((slideIndex) => window.__autocut.show(slideIndex), index);
      await page.waitForTimeout(Math.round((slideDurations[index] || storyboard.settings.minSlideSeconds) * 1000));
    }
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }

  if (!video) {
    throw new Error('Playwright did not create a video recording.');
  }
  const recordedPath = await video.path();
  await copyFile(recordedPath, outputWebmPath);
  return outputWebmPath;
}
