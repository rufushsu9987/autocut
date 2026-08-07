#!/usr/bin/env node
import { main } from '../lib/cli.mjs';

main(process.argv.slice(2)).catch((error) => {
  const message = error?.stack || error?.message || String(error);
  console.error(`\n[autocut] ${message}`);
  process.exitCode = 1;
});
