#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { Command } from "commander";

const pkgValues = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf8"),
);
const { version } = pkgValues;

const cli = new Command();

cli.name("mimi").version(version);

cli
  .argument("[files...]", "Files")
  .option("-e, --entries <files...>", "Entries of files")
  .option(
    "-d, --out-dir <dir>",
    "Compile modules into an output directory.",
    "dist",
  )
  .option(
    "-o, --out-file <filename>",
    "Compile modules into a single file.",
    "index.js",
  )
  .option("-f, --format <format>", "Bundle format", "cjs")
  .option("--debug", "Output extra debugging")
  .action(async (files, opts) => {
    if (opts.debug) console.log({ files, opts });

    if (Array.isArray(files)) {
      const { rollup } = await import("rollup");
      const { default: swcPlugin } = await import("@rollup/plugin-swc");
      const { default: nodeResolvePlugin } = await import(
        "@rollup/plugin-node-resolve"
      );
      const { default: commonjsPlugin } = await import(
        "@rollup/plugin-commonjs"
      );

      console.time("bundle done in");
      const bundle = await rollup({
        input: files,
        plugins: [nodeResolvePlugin(), commonjsPlugin(), swcPlugin()],
        // treeshake: true
      });
      await bundle.write({
        dir: opts.outDir,
        format: opts.format,
      });
      console.timeEnd("bundle done in");
      await bundle.close();
    }
  });

cli.parse(process.argv);
