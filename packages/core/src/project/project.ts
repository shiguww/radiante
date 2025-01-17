import path from "node:path";
import fs from "node:fs/promises";
import { CTRT } from "#ctrt/ctrt";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as nwtex from "#nw-texture/nw-texture";
import { RADIANTE_TEMPORARY_DIRECTORY } from "#constants";
import { isLocale, isLocaleCode, normalizeLocale } from "#locale/locale";

import type {
  CTRVFSFile,
  CTRVFSNode,
  CTRDARCNode,
  CTRDARCList,
  CTRDARCHeader
} from "libctr";

import {
  blz,
  DARC,
  CTRVFS,
  readROM,
  CTRROMListener,
  CTREventEmitter,
  CTREventEmitterDefaultEventMap
} from "libctr";

interface RadianteProjectFileInfo {
  hash: string;
  path: string[];
  datetime: string;
}

interface RadianteProjectCreateOptions {
  name: string;
  write?: boolean;
  exefs?: null | string;
  romfs?: null | string;
}

class RadianteProject extends CTREventEmitter<
  CTREventEmitterDefaultEventMap &
    Record<`create.romfs.file.darc.node`, [CTRDARCNode, CTRVFSFile]> &
    Record<`create.romfs.file.darc.list`, [CTRDARCList, CTRVFSFile]> &
    Record<`create.romfs.file.darc.header`, [CTRDARCHeader, CTRVFSFile]> &
    Record<`create.${"exefs" | "romfs"}.node.process.start`, [CTRVFSNode]> &
    Record<`create.romfs.file.blz.decode.${"end" | "start"}`, [CTRVFSFile]> &
    Record<`create.romfs.file.nwtex.decode.${"end" | "start"}`, [CTRVFSFile]> &
    Record<`create.${"exefs" | "romfs"}.node.unexpected`, [CTRVFSNode]> &
    Record<
      `create.${"exefs" | "romfs"}.node.${"read" | "process"}.${"end" | "start"}`,
      [CTRVFSNode]
    > &
    Record<
      `create.${"rom" | "exefs" | "romfs"}.read.${"end" | "start"}`,
      [null]
    >
> {
  public static readonly DATA_DIRECTORY = "font";
  public static readonly FONT_DIRECTORY = "font";
  public static readonly SOUND_DIRECTORY = "sound";
  public static readonly EFFECT_DIRECTORY = "effect";
  public static readonly LOCALE_DIRECTORY = "locale";
  public static readonly SHADER_DIRECTORY = "shader";
  public static readonly SCRIPT_DIRECTORY = "script";
  public static readonly GRAPHIC_DIRECTORY = "graphic";
  public static readonly RADIANTE_DIRECTORY = ".radiante";

  private _root: CTRVFS;
  private _directory: null | string;
  private readonly _fileinfo: Map<string, RadianteProjectFileInfo>;

  public constructor() {
    super();

    this._directory = null;
    this._root = new CTRVFS();
    this._fileinfo = new Map();
  }

  public get root(): CTRVFS {
    return this._root;
  }

  public join(...paths: string[]): string {
    return path.join(...paths);
  }

  public async create(options: RadianteProjectCreateOptions): Promise<this> {
    await this._create(options);
    return this;
  }

  private async _create(options: RadianteProjectCreateOptions): Promise<void> {
    this._directory = await createTemporaryDirectory();
    this.emit("create.rom.read.start", null);

    const { exefs, romfs } = await readROM({
      ...options,
      listener: new CTRROMListener()
        .on("exefs.end", () => void this.emit("create.exefs.read.end", null))
        .on(
          "exefs.start",
          () => void this.emit("create.exefs.read.start", null)
        )
        .on(
          "exefs.node.end",
          (node) => void this.emit("create.exefs.node.read.end", node)
        )
        .on(
          "exefs.node.start",
          (node) => void this.emit("create.exefs.node.read.start", node)
        )
        .on("romfs.end", () => void this.emit("create.romfs.read.end", null))
        .on(
          "romfs.start",
          () => void this.emit("create.romfs.read.start", null)
        )
        .on(
          "romfs.node.end",
          (node) => void this.emit("create.romfs.node.read.end", node)
        )
        .on(
          "romfs.node.start",
          (node) => void this.emit("create.romfs.node.read.start", node)
        )
    });

    this.emit("create.rom.read.end", null);

    if (exefs !== null) {
    }

    if (romfs !== null) {
      await this._createROMFS(romfs);
    }

    await this._createFileInfo();
    this._root = await CTRVFS.fromDirectory(this._directory);

    await fs.rm(this._directory, { recursive: true });
    this._directory = null;
  }

  private _resolve(...paths: string[]): string {
    assert(this._directory !== null);
    return path.resolve(this._directory, ...paths);
  }

  private _relative(other: string): string {
    assert(this._directory !== null);
    return path.relative(this._directory, other);
  }

  private _decodeBLZ(file: CTRVFSFile): void {
    this.emit("create.romfs.file.blz.decode.start", file);
    file.data = blz.decode(file.data);
    this.emit("create.romfs.file.blz.decode.end", file);
  }

  private async _createARZ(
    directory: string,
    node: CTRVFSNode
  ): Promise<boolean> {
    if (node.isDirectory() || node.extname !== ".arz") {
      this.emit("create.romfs.node.unexpected", node);
      return false;
    }

    this._decodeBLZ(node);

    const archive = new DARC()
      .on(
        "parse.list",
        (list) => void this.emit("create.romfs.file.darc.list", list, node)
      )
      .on(
        "parse.node",
        (darc) => void this.emit("create.romfs.file.darc.node", darc, node)
      )
      .on(
        "parse.header",
        (header) =>
          void this.emit("create.romfs.file.darc.header", header, node)
      );

    archive.parse(node.data);

    for (const file of archive.root.files) {
      await this._createFile(directory, file);
    }

    return true;
  }

  private async _createKDM(
    directory: string,
    node: CTRVFSNode,
    name?: string
  ): Promise<boolean> {
    if (
      node.isDirectory() ||
      node.extname !== ".bin" ||
      !node.name.startsWith("kdm_")
    ) {
      this.emit("create.romfs.node.unexpected", node);
      return false;
    }

    await this._createFile(directory, node, name);
    return true;
  }

  private async _createKSM(
    directory: string,
    node: CTRVFSNode,
    name?: string
  ): Promise<boolean> {
    if (node.isDirectory() || node.extname !== ".bin") {
      this.emit("create.romfs.node.unexpected", node);
      return false;
    }

    await this._createFile(directory, node, name);
    return true;
  }

  private async _createCSID(
    directory: string,
    node: CTRVFSNode,
    name?: string
  ): Promise<boolean> {
    if (node.isDirectory() || node.extname !== ".csid") {
      this.emit("create.romfs.node.unexpected", node);
      return false;
    }

    await this._createFile(directory, node, name);
    return true;
  }

  private async _createCTRT(
    directory: string,
    node: CTRVFSNode,
    name?: string
  ): Promise<boolean> {
    if (node.isDirectory() || node.extname !== "") {
      this.emit("create.romfs.node.unexpected", node);
      return false;
    }

    try {
      node.data = new CTRT().parse(node.data).toPNG({ write: true });
      await this._createFile(directory, node, name);
    } catch {
      await this._createFile(directory, node, name?.replace(/\.png$/, ""));
    }

    return true;
  }

  private async _createFile(
    directory: string,
    file: CTRVFSFile,
    name?: string
  ): Promise<void> {
    const filepath = this._resolve(directory, name || file.name);

    await fs.mkdir(path.dirname(filepath), { recursive: true });
    await fs.writeFile(filepath, file.data.buffer);

    this._fileinfo.set(this._relative(filepath), {
      datetime: new Date().toISOString(),
      path: this._relative(filepath).split(path.sep),
      hash: createHash("sha256").update(file.data.buffer).digest("hex")
    });
  }

  private async _createMSBT(
    directory: string,
    node: CTRVFSNode,
    name?: string
  ): Promise<boolean> {
    if (node.isDirectory() || node.extname !== ".msbt") {
      this.emit("create.romfs.node.unexpected", node);
      return false;
    }

    await this._createFile(directory, node, name);
    return true;
  }

  private async _createBCFNZ(
    directory: string,
    node: CTRVFSNode,
    name?: string
  ): Promise<boolean> {
    if (node.isDirectory() || node.extname !== ".bcfnz") {
      this.emit("create.romfs.node.unexpected", node);
      return false;
    }

    this._decodeBLZ(node);

    await this._createFile(
      directory,
      node,
      name || node.name.replace(/bcfnz$/, "bcfnt")
    );

    return true;
  }

  private async _createBCSAR(
    directory: string,
    node: CTRVFSNode,
    name?: string
  ): Promise<boolean> {
    if (node.isDirectory() || node.extname !== ".bcsar") {
      this.emit("create.romfs.node.unexpected", node);
      return false;
    }

    await this._createFile(directory, node, name);
    return true;
  }

  private async _createBCSDR(
    directory: string,
    node: CTRVFSNode,
    name?: string
  ): Promise<boolean> {
    if (node.isDirectory() || node.extname !== ".bcsdr") {
      this.emit("create.romfs.node.unexpected", node);
      return false;
    }

    await this._createFile(directory, node, name);
    return true;
  }

  private async _createBCSTM(
    directory: string,
    node: CTRVFSNode,
    name?: string
  ): Promise<boolean> {
    if (node.isDirectory() || node.extname !== ".bcstm") {
      this.emit("create.romfs.node.unexpected", node);
      return false;
    }

    await this._createFile(directory, node, name);
    return true;
  }

  private async _createBCREZ(
    directory: string,
    node: CTRVFSNode,
    name?: string
  ): Promise<boolean> {
    if (node.isDirectory() || node.extname !== ".bcrez") {
      this.emit("create.romfs.node.unexpected", node);
      return false;
    }

    this._decodeBLZ(node);
    await this._createFile(directory, node, name || `${node.stemname}.bcres`);

    return true;
  }

  private async _createBCTEZ(
    directory: string,
    node: CTRVFSNode,
    name?: string
  ): Promise<boolean> {
    if (node.isDirectory() || node.extname !== ".bctez") {
      this.emit("create.romfs.node.unexpected", node);
      return false;
    }

    this._decodeBLZ(node);
    await this._createFile(directory, node, name || `${node.stemname}.bctex`);

    return true;
  }

  private async _createNWTex(
    directory: string,
    node: CTRVFSNode
  ): Promise<boolean> {
    if (node.isDirectory() || node.extname !== ".bin" || node.parent === null) {
      this.emit("create.romfs.node.unexpected", node);
      return false;
    }

    const data = node.data;

    const info = node.parent.find(
      (n): n is CTRVFSFile =>
        n.isFile() &&
        n.extname === ".bin" &&
        n.stemname === `${node.stemname}_info`
    )?.data;

    if (info === undefined) {
      throw "project.err_missing_nwtex_info";
    }

    this.emit("create.romfs.file.nwtex.decode.start", node);

    const { files } = nwtex.decode(
      data,
      info,
      new nwtex.NWTextureListener()
        .on(
          "decode.file.end",
          (file) => void this.emit("create.romfs.file.blz.decode.end", file)
        )
        .on(
          "decode.file.start",
          (file) => void this.emit("create.romfs.file.blz.decode.start", file)
        )
    );

    this.emit("create.romfs.file.nwtex.decode.end", node);

    for (const file of files) {
      await this._createFile(directory, file, file.name);
    }

    return true;
  }

  private async _createROMFS(romfs: CTRVFS): Promise<void> {
    for (const node of romfs.nodes) {
      if (node.isFile()) {
        await this._processShader(node);
        continue;
      }

      if (node.name === "Data") {
        await this._processData(node);
        continue;
      }

      if (node.name === "Font") {
        await this._processFonts(node);
        continue;
      }

      if (node.name === "Lang") {
        await this._processLangs(node);
        continue;
      }

      if (node.name === "Effect") {
        await this._processEffects(node);
        continue;
      }

      if (node.name === "Script") {
        await this._processScripts(node);
        continue;
      }

      if (node.name === "sound") {
        await this._processSounds(node);
        continue;
      }

      if (node.name === "messages") {
        await this._processMessages(node);
        continue;
      }

      if (node.name === "collision") {
        await this._processCollisions(node);
        continue;
      }

      if (node.name === "Graphics") {
        await this._processGraphics(node);
        continue;
      }

      if (node.name === "NWTexture") {
        await this._processNWTextures(node);
        continue;
      }

      this.emit("create.romfs.node.unexpected", node);
    }
  }

  private async _processData(node: CTRVFSNode): Promise<void> {
    this.emit("create.romfs.node.process.start", node);

    if (node.isFile() || node.name !== "Data") {
      return void this.emit("create.romfs.node.unexpected", node);
    }

    for (const child of node.nodes) {
      this.emit("create.romfs.node.process.start", child);

      if (child.name === "TitleData.bin") {
        if (
          await this._createTitleData(
            this._resolve(RadianteProject.DATA_DIRECTORY),
            child
          )
        ) {
          this.emit("create.romfs.node.process.end", child);
        }

        continue;
      }
      if (child.name === "EventCamera.bin") {
        if (
          await this._createEventCamera(
            this._resolve(RadianteProject.DATA_DIRECTORY),
            child
          )
        ) {
          this.emit("create.romfs.node.process.end", child);
        }

        continue;
      }

      if (child.name.startsWith("kdm_")) {
        if (
          await this._createKDM(
            this._resolve(RadianteProject.DATA_DIRECTORY),
            child
          )
        ) {
          this.emit("create.romfs.node.process.end", child);
        }

        continue;
      }

      this.emit("create.romfs.node.unexpected", child);
    }

    this.emit("create.romfs.node.process.end", node);
  }

  private async _processFonts(node: CTRVFSNode): Promise<void> {
    this.emit("create.romfs.node.process.start", node);

    if (node.isFile() || node.name !== "Font") {
      return void this.emit("create.romfs.node.unexpected", node);
    }

    for (const child of node.nodes) {
      this.emit("create.romfs.node.process.start", child);

      if (await this._createBCFNZ(RadianteProject.FONT_DIRECTORY, child)) {
        this.emit("create.romfs.node.process.end", child);
      }
    }

    this.emit("create.romfs.node.process.end", node);
  }

  private async _processLangs(node: CTRVFSNode): Promise<void> {
    await this._processNWTexDirectory(node, "Lang", "lang");
  }

  private async _processShader(node: CTRVFSNode): Promise<void> {
    this.emit("create.romfs.node.process.start", node);

    if (node.isDirectory()) {
      return void this.emit("create.romfs.node.unexpected", node);
    }

    if (
      node.name !== "nwgfx_DefaultShader.bcsdr" &&
      node.name !== "nwgfx_ParticleDefaultShader.bcsdr"
    ) {
      return void this.emit("create.romfs.node.unexpected", node);
    }

    if (await this._createBCSDR(RadianteProject.SHADER_DIRECTORY, node)) {
      this.emit("create.romfs.node.process.end", node);
    }
  }

  private async _processSounds(node: CTRVFSNode): Promise<void> {
    this.emit("create.romfs.node.process.start", node);

    if (node.isFile() || node.name !== "sound") {
      return void this.emit("create.romfs.node.unexpected", node);
    }

    for (const child of node.nodes) {
      if (child.name === "554g_sound.csid") {
        if (
          await this._createCSID(
            this._resolve(RadianteProject.SOUND_DIRECTORY),
            node,
            "sound.csid"
          )
        ) {
          this.emit("create.romfs.node.process.end", child);
        }

        continue;
      }

      if (child.name === "554G_sound.bcsar") {
        if (
          await this._createBCSAR(
            this._resolve(RadianteProject.SOUND_DIRECTORY),
            node,
            "sound.bcsar"
          )
        ) {
          this.emit("create.romfs.node.process.end", child);
        }

        continue;
      }

      if (child.isDirectory() && child.name === "stream") {
        for (const node of child.nodes) {
          this.emit("create.romfs.node.process.start", node);

          if (
            await this._createBCSTM(
              this._resolve(RadianteProject.SOUND_DIRECTORY),
              node
            )
          ) {
            this.emit("create.romfs.node.process.end", node);
          }
        }
      }

      continue;
    }

    this.emit("create.romfs.node.process.end", node);
  }

  private async _processScript(
    directory: string,
    node: CTRVFSNode
  ): Promise<void> {
    this.emit("create.romfs.node.process.start", node);

    if (node.isFile()) {
      if (await this._createKSM(directory, node)) {
        this.emit("create.romfs.node.process.end", node);
      }

      return;
    }

    directory = path.resolve(directory, node.name.toLowerCase());
    
    for (const child of node.nodes) {
      await this._processScript(
        child.isDirectory()
          ? path.resolve(directory, child.name.toLowerCase())
          : directory,
        child
      );
    }

    this.emit("create.romfs.node.process.end", node);
  }

  private async _createFileInfo(): Promise<void> {
    const filepath = this._resolve(
      RadianteProject.RADIANTE_DIRECTORY,
      "fileinfo.json"
    );

    await fs.mkdir(path.dirname(filepath), {
      recursive: true
    });

    await fs.writeFile(
      filepath,
      JSON.stringify(Array.from(this._fileinfo.values()), undefined, 4),
      "utf8"
    );
  }

  private async _processEffects(node: CTRVFSNode): Promise<void> {
    this.emit("create.romfs.node.process.start", node);

    if (node.isFile() || node.name !== "Effect") {
      return void this.emit("create.romfs.node.unexpected", node);
    }

    for (const child of node.nodes) {
      this.emit("create.romfs.node.process.start", child);

      if (child.isFile()) {
        this.emit("create.romfs.node.unexpected", child);
        continue;
      }

      const effect = child.name;

      for (const node of child.nodes) {
        this.emit("create.romfs.node.process.start", node);

        if (node.isDirectory()) {
          this.emit("create.romfs.node.unexpected", node);
          continue;
        }

        if (node.name === "effect.arz") {
          if (
            await this._createARZ(
              this._resolve(RadianteProject.EFFECT_DIRECTORY, effect),
              node
            )
          ) {
            this.emit("create.romfs.node.process.end", node);
          }

          continue;
        }

        if (!isLocaleCode(node.stemname)) {
          this.emit("create.romfs.node.unexpected", node);
          continue;
        }

        const locale = normalizeLocale(node.stemname);

        if (
          await this._createBCTEZ(
            this._resolve(RadianteProject.LOCALE_DIRECTORY, locale),
            node,
            "effect.bctex"
          )
        ) {
          this.emit("create.romfs.node.process.end", node);
        }
      }

      this.emit("create.romfs.node.process.end", child);
    }

    this.emit("create.romfs.node.process.end", node);
  }

  private async _processGraphic(
    directory: string,
    node: CTRVFSNode
  ): Promise<void> {
    this.emit("create.romfs.node.process.start", node);

    if (node.isFile()) {
      if (node.extname === "" && (await this._createCTRT(directory, node))) {
        return void this.emit("create.romfs.node.process.end", node);
      }

      if (
        node.extname === ".bcrez" &&
        (await this._createBCREZ(directory, node))
      ) {
        return void this.emit("create.romfs.node.process.end", node);
      }

      return void this.emit("create.romfs.node.unexpected", node);
    }

    directory = path.resolve(directory, node.name.toLowerCase());

    for (const child of node.nodes) {
      await this._processGraphic(
        child.isDirectory()
          ? path.resolve(directory, child.name.toLowerCase())
          : directory,
        child
      );
    }

    this.emit("create.romfs.node.process.end", node);
  }

  private async _processScripts(node: CTRVFSNode): Promise<void> {
    this.emit("create.romfs.node.process.start", node);

    if (node.isFile() || node.name !== "Script") {
      return void this.emit("create.romfs.node.unexpected", node);
    }

    for (const child of node.nodes) {
      await this._processScript(
        this._resolve(RadianteProject.SCRIPT_DIRECTORY),
        child
      );
    }

    this.emit("create.romfs.node.process.end", node);
  }

  private async _processGraphics(node: CTRVFSNode): Promise<void> {
    this.emit("create.romfs.node.process.start", node);

    if (node.isFile() || node.name !== "Graphics") {
      return void this.emit("create.romfs.node.unexpected", node);
    }

    for (const child of node.nodes) {
      await this._processGraphic(
        this._resolve(RadianteProject.GRAPHIC_DIRECTORY),
        child
      );
    }

    this.emit("create.romfs.node.process.end", node);
  }

  private async _createTitleData(
    directory: string,
    node: CTRVFSNode,
    name?: string
  ): Promise<boolean> {
    if (node.isDirectory() || node.name !== "TitleData.bin") {
      this.emit("create.romfs.node.unexpected", node);
      return false;
    }

    await this._createFile(directory, node, name);
    return true;
  }

  private async _processMessages(node: CTRVFSNode): Promise<void> {
    this.emit("create.romfs.node.process.start", node);

    if (node.isFile() || node.name !== "messages") {
      return void this.emit("create.romfs.node.unexpected", node);
    }

    for (const child of node.nodes) {
      this.emit("create.romfs.node.process.start", child);

      if (child.isFile() || !isLocale(child.name)) {
        this.emit("create.romfs.node.unexpected", child);
        continue;
      }

      const locale = normalizeLocale(child.name);

      for (const node of child.nodes) {
        this.emit("create.romfs.node.process.start", node);

        if (
          await this._createMSBT(
            this.join(RadianteProject.LOCALE_DIRECTORY, locale, "messages"),
            node
          )
        ) {
          this.emit("create.romfs.node.process.end", node);
        }
      }

      this.emit("create.romfs.node.process.end", child);
    }

    this.emit("create.romfs.node.process.end", node);
  }

  private async _createEventCamera(
    directory: string,
    node: CTRVFSNode,
    name?: string
  ): Promise<boolean> {
    if (node.isDirectory() || node.name !== "EventCamera.bin") {
      this.emit("create.romfs.node.unexpected", node);
      return false;
    }

    await this._createFile(directory, node, name);
    return true;
  }

  private async _processCollisions(node: CTRVFSNode): Promise<void> {
    this.emit("create.romfs.node.process.start", node);

    if (node.isFile() || node.name !== "collision") {
      return void this.emit("create.romfs.node.unexpected", node);
    }

    for (const child of node.nodes) {
      this.emit("create.romfs.node.process.start", child);

      if (child.isDirectory()) {
        this.emit("create.romfs.node.unexpected", child);
        continue;
      }

      if (
        child.extname !== ".csb" &&
        child.extname !== ".ctb" &&
        !child.name.endsWith(".cam.bin")
      ) {
        void this.emit("create.romfs.node.unexpected", child);
        continue;
      }

      await this._createFile(
        this.join(
          "collision",
          child.name
            .replace(/\.csb$/, "")
            .replace(/\.ctb$/, "")
            .replace(/\.cam\.bin$/, "")
        ),
        child
      );

      this.emit("create.romfs.node.process.end", child);
    }

    this.emit("create.romfs.node.process.end", node);
  }

  private async _processNWTextures(node: CTRVFSNode): Promise<void> {
    await this._processNWTexDirectory(node, "NWTexture", "nwtex");
  }

  private async _processNWTexDirectory(
    node: CTRVFSNode,
    dirname: string,
    outdirname: string
  ): Promise<void> {
    this.emit("create.romfs.node.process.start", node);

    if (node.isFile() || node.name !== dirname) {
      return void this.emit("create.romfs.node.unexpected", node);
    }

    for (const child of node.nodes) {
      if (child.isDirectory()) {
        this.emit("create.romfs.node.unexpected", child);
        continue;
      }

      if (!isLocaleCode(child.stemname)) {
        if (!child.stemname.endsWith("_info")) {
          this.emit("create.romfs.node.unexpected", child);
        }

        continue;
      }

      this.emit("create.romfs.node.process.start", child);
      const locale = normalizeLocale(child.stemname);

      if (
        await this._createNWTex(
          this.join(RadianteProject.LOCALE_DIRECTORY, locale, outdirname),
          child
        )
      ) {
        this.emit("create.romfs.node.process.end", child);
      }
    }

    this.emit("create.romfs.node.process.end", node);
  }
}

async function createTemporaryDirectory(): Promise<string> {
  return await fs.mkdtemp(
    path.resolve(RADIANTE_TEMPORARY_DIRECTORY, `tmp-${Date.now()}-`)
  );
}

export { RadianteProject, RadianteProject as Project };

export type {
  RadianteProjectFileInfo,
  RadianteProjectFileInfo as ProjectFileInfo,
  RadianteProjectCreateOptions,
  RadianteProjectCreateOptions as ProjectCreateOptions
};
