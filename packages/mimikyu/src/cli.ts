#!/usr/bin/env node
import path from 'path';
import fs from 'fs';
import { Command } from 'commander';

const pkgValues = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'));
const { version } = pkgValues;

const cli = new Command();

cli.name('mimi').version(version);

cli
  .argument('[files...]', 'files')
  .option('-e, --entries <files...>', 'Entries of files')
  .option('-f, --format <format>', 'Bundle format')
  .option('--debug', 'output extra debugging')
  .action(async (files, opts) => {
    if (opts.debug) console.log({ files, opts });

    if (Array.isArray(files)) {
      const { rollup } = await import('rollup');
      const { default: swc } = await import('@rollup/plugin-swc');
      const bundle = await rollup({
        input: files,
        plugins: [swc()]
      })
      await bundle.write({
        dir: 'dist',
        format: opts.format || 'cjs'
      });
      await bundle.close()
    }
  })

cli.parse(process.argv);