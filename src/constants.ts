import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { env, platform } from "node:process";

declare const _RADIANTE_ROLLUP: true | undefined;
declare const _RADIANTE_COMMIT: null | string | undefined;
declare const _RADIANTE_VERSION: null | string | undefined;
declare const _RADIANTE_BUILD_DATETIME: string | undefined;

const RADIANTE_ROLLUP = typeof _RADIANTE_ROLLUP !== "undefined";

const RADIANTE_COMMIT =
  typeof _RADIANTE_COMMIT !== "undefined" ? _RADIANTE_COMMIT : null;

const RADIANTE_VERSION =
  typeof _RADIANTE_VERSION !== "undefined" ? _RADIANTE_VERSION : null;

const RADIANTE_BUILD_DATETIME =
  typeof _RADIANTE_BUILD_DATETIME !== "undefined"
    ? _RADIANTE_BUILD_DATETIME
    : new Date().toISOString();

const RADIANTE_DIRECTORY =
  platform === "win32"
    ? resolve(env.LOCALAPPDATA || join(homedir(), "AppData", "Local"), "radiante")
    : resolve(homedir(), ".radiante");

const RADIANTE_LOG_DIRECTORY = resolve(RADIANTE_DIRECTORY, "log");
const RADIANTE_TEMPORARY_DIRECTORY = resolve(RADIANTE_DIRECTORY, "tmp");

export {
  RADIANTE_COMMIT,
  RADIANTE_ROLLUP,
  RADIANTE_VERSION,
  RADIANTE_DIRECTORY,
  RADIANTE_LOG_DIRECTORY,
  RADIANTE_BUILD_DATETIME,
  RADIANTE_TEMPORARY_DIRECTORY
};
