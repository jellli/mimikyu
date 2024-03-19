#!/usr/bin/env node
import { Command } from "commander";
import { rollup } from "rollup";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { swc } from "rollup-plugin-swc3";
import { version } from "../package.json";

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

    if (Array.isArray(opts.entries) || Array.isArray(files)) {
      console.time("bundle done in");
      const bundle = await rollup({
        input: opts.entries || files,
        plugins: [
          nodeResolve({
            preferBuiltins: true,
            extensions: [
              ".mjs",
              ".cjs",
              ".js",
              "ts",
              ".json",
              ".node",
              ".jsx",
              "tsx",
            ],
          }),
          json(),
          swc({
            exclude: "node_modules",
            jsc: {
              baseUrl: __dirname,
            },
          }),
          commonjs(),
        ],
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
