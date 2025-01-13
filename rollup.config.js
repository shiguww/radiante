import fs from "node:fs";
import { defineConfig } from "rollup";
import json from "@rollup/plugin-json";
import cjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import { execSync } from "node:child_process";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

const version = async () => JSON.parse(fs.readFileSync("package.json")).version;

const commit = async () =>
  execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();

const plugins = [
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
  resolve(),
  cjs()
];

export default defineConfig([
  {
    plugins,
    input: "src/cli/main.ts",
    external: ["pngjs", "libctr", "radiante"],
    output: { format: "cjs", file: "build/cli.cjs" }
  },
  {
    plugins,
    input: "src/cli/main.ts",
    output: { format: "cjs", file: "build/radiante.cjs" }
  }
]);
