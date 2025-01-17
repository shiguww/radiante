import fs from "node:fs";
import { defineConfig } from "rollup";
import json from "@rollup/plugin-json";
import cjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import { execSync } from "node:child_process";
import typescript from "@rollup/plugin-typescript";
import noderesolve from "@rollup/plugin-node-resolve";

const version = async () => JSON.parse(fs.readFileSync("package.json")).version;

const commit = async () =>
  execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();

export default defineConfig([
  {
    external: [
      "pngjs",
      "libctr",
      "winston",
      "commander",
      "@radiante/core",
      "@inquirer/prompts"
    ],
    input: "index.ts",
    output: { format: "cjs", file: "build/radiante.js" },
    plugins: [
      json(),
      replace({
        preventAssignment: true,
        values: {
          _RADIANTE_ROLLUP: true,
          _RADIANTE_BUILD_DATETIME: `"${new Date().toISOString()}"`,
          _RADIANTE_COMMIT: `"${await commit().catch(() => null)}"`,
          _RADIANTE_VERSION: `"${await version().catch(() => null)}"`
        }
      }),
      typescript(),
      noderesolve({ preferBuiltins: true }),
      cjs()
    ]
  }
]);
