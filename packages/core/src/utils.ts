import os from "node:os";
import fs from "node:fs/promises";
import { resolve } from "node:path";
import { CTRError } from "libctr";

let tmpdir = os.tmpdir();

export const assert: (
  condition: unknown,
  err?: string | CTRError,
  message?: string
) => asserts condition = (
  condition: unknown,
  err?: string | CTRError,
  message?: string
): asserts condition => {
  if (!Boolean(condition)) {
    throw err instanceof Error ? err : new CTRError(err, message || err, err);
  }
};

export const setTemporaryDirectory = (dirpath: string): void =>
  void (tmpdir = resolve(dirpath));

export const createTemporaryDirectory = async (): Promise<string> => {
  const directory = resolve(tmpdir, `.radiante-${Date.now()}`);
  await fs.mkdir(directory, { recursive: true });
  return directory;
};

export const _lexicographicalSorting = (a: string, b: string): -1 | 0 | 1 => {
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
};
