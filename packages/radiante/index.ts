import path from "node:path";
import winston from "winston";
import fs from "node:fs/promises";
import { homedir } from "node:os";
import process from "node:process";
import { Command } from "commander";
import { promisify } from "node:util";
import { join, resolve } from "node:path";
import { env, platform } from "node:process";
import { existsSync as exists } from "node:fs";
import { RadianteProject } from "@radiante/core";
import { input, confirm } from "@inquirer/prompts";

declare const _RADIANTE_ROLLUP: true | undefined;
declare const _RADIANTE_COMMIT: null | string | undefined;
declare const _RADIANTE_VERSION: null | string | undefined;
declare const _RADIANTE_BUILD_DATETIME: string | undefined;

const _RADIANTE_DIRECTORY =
  platform === "win32"
    ? resolve(
        env.LOCALAPPDATA || join(homedir(), "AppData", "Local"),
        "radiante"
      )
    : resolve(homedir(), ".radiante");

const RADIANTE_LOG_DIRECTORY = resolve(_RADIANTE_DIRECTORY, "log");

const RADIANTE_ROLLUP = typeof _RADIANTE_ROLLUP !== "undefined";

const RADIANTE_COMMIT =
  typeof _RADIANTE_COMMIT !== "undefined" ? _RADIANTE_COMMIT : null;

const RADIANTE_VERSION =
  typeof _RADIANTE_VERSION !== "undefined" ? _RADIANTE_VERSION : null;

const RADIANTE_BUILD_DATETIME =
  typeof _RADIANTE_BUILD_DATETIME !== "undefined"
    ? _RADIANTE_BUILD_DATETIME
    : new Date().toISOString();

interface RadianteCommandOptions extends Record<string, unknown> {}

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      level: "verbose",
      filename: path.resolve(
        RADIANTE_LOG_DIRECTORY,
        new Date().toISOString().replace(/-|:/g, "_")
      ),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(
          ({ timestamp, level, message }) =>
            `[${timestamp}] ${level}: ${message}`
        )
      )
    }),
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.printf(
          ({ level, message }) => `radiante (${level}): ${message}`
        )
      )
    })
  ]
});

const program = new Command("radiante")
  .version(
    RADIANTE_ROLLUP
      ? `${RADIANTE_VERSION} (${RADIANTE_COMMIT} @ ${new Date(RADIANTE_BUILD_DATETIME).toDateString()})`
      : "undetermined"
  )
  .option("-q, --quiet")
  .option("-v, --verbose")
  .hook("preAction", (command) => {
    const options = command.opts();

    logger.transports
      .filter((t) => t instanceof winston.transports.Console)
      .forEach((t) => {
        if (options.verbose) {
          t.level = "verbose";
        } else if (options.quiet) {
          t.level = "quiet";
        }
      });
  });

program
  .command("create")
  .option("--dry-run")
  .option("-n --name <name>")
  .option("-r, --romfs <romfs>")
  .option("-d, --directory <directory>")
  .action(createCommand);

async function main(): Promise<void> {
  await _main().catch(logger.error);
}

async function _main(): Promise<void> {
  //#region
  await fs.mkdir(_RADIANTE_DIRECTORY, { recursive: true });
  await fs.mkdir(RADIANTE_LOG_DIRECTORY, { recursive: true });
  //#endregion

  await program.parseAsync(process.argv);
}

async function createCommand(options: RadianteCommandOptions): Promise<void> {
  const dryRun = Boolean(options.dryRun);
  const romfs = typeof options.romfs === "string" ? options.romfs : null;

  const name =
    typeof options.name === "string"
      ? options.name
      : await input({
          message: "Project name",
          validate: (str) => str.length !== 0
        });

  const directory =
    typeof options.directory === "string"
      ? options.directory
      : name.replace(/\s/g, "_");

  if (isNoisy() && !dryRun && exists(directory)) {
    if (
      !(await confirm({
        default: true,
        message: `Directory '${directory}' already exists, use it anyway?`
      }))
    ) {
      await exit(0);
    }
  }

  const project = new RadianteProject()
    .on("create.romfs.read.start", () => void logger.info(`reading romfs...`))
    .on(
      "create.romfs.node.read.start",
      (node) => void logger.verbose(`reading ${node.url}`)
    )
    .on(
      "create.romfs.node.process.start",
      (node) => void logger.verbose(`processing ${node.url}`)
    )
    .on(
      "create.romfs.node.unexpected",
      (node) => void logger.warn(`ignoring unexpected ${node.kind} ${node.url}`)
    );

  await project.create({ name, romfs });

  if (dryRun) {
    logger.info(`\n${project.root.tree()}`);
    return;
  }

  await project.root.toDirectory(directory, { recursive: true });

  logger.verbose(`\n${project.root.tree()}`);
  logger.info(`created project "${name}" in '${directory}'`);
}

async function exit(code: number): Promise<never> {
  await promisify(process.stdout.write.bind(process.stdout))("");
  await promisify(process.stderr.write.bind(process.stderr))("");
  await promisify(logger.end.bind(logger))();

  process.exit(code);
}

function isNoisy(): boolean {
  return logger.transports.every((t) => t.level !== "quiet");
}

main();
