import { Command } from 'commander';
import { rollup } from 'rollup';
const cli = new Command();

cli.name('mimi');

cli
  .option('-e, --entries <files...>', 'Entries of files')
  .option('-f, --format <format>', 'Bundle format')
  .option('--debug', 'output extra debugging')
  .action(async (opts) => {
    if (opts.debug) console.log(opts);

    if (opts.entries) {
      const bundle = await rollup({
        input: opts.entries,
      })
      await bundle.write({
        dir: 'dist',
        format: opts.format || 'cjs'
      });
      await bundle.close()
    }
  })

cli.parse(process.argv);