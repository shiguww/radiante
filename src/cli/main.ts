import path from "node:path";
import winston from "winston";
import fs from "node:fs/promises";
import process from "node:process";
import { Command } from "commander";
import { promisify } from "node:util";
import { RadianteProject } from "radiante";
import { existsSync as exists } from "node:fs";
import { input, confirm } from "@inquirer/prompts";

import {
  RADIANTE_COMMIT,
  RADIANTE_ROLLUP,
  RADIANTE_VERSION,
  RADIANTE_DIRECTORY,
  RADIANTE_LOG_DIRECTORY,
  RADIANTE_BUILD_DATETIME,
  RADIANTE_TEMPORARY_DIRECTORY
} from "#constants";

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
  await fs.mkdir(RADIANTE_DIRECTORY, { recursive: true });
  await fs.mkdir(RADIANTE_LOG_DIRECTORY, { recursive: true });
  await fs.mkdir(RADIANTE_TEMPORARY_DIRECTORY, { recursive: true });
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
  await promisify(logger.end)();

  process.exit(code);
}

function isNoisy(): boolean {
  return logger.transports.every((t) => t.level !== "quiet");
}

main();
