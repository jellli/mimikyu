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
      const { default: swcPlugin } = await import('@rollup/plugin-swc');
      const { default: nodeResolvePlugin } = await import('@rollup/plugin-node-resolve');
      const { default: commonjsPlugin } = await import('@rollup/plugin-commonjs');

      const bundle = await rollup({
        input: files,
        plugins: [
          nodeResolvePlugin(),
          commonjsPlugin(),
          swcPlugin(),
        ]
      })
      await bundle.write({
        dir: 'dist',
        format: opts.format || 'cjs'
      });
      await bundle.close()
    }
  })

cli.parse(process.argv);