import {
  blz,
  CTRVFS,
  CTRMemory,
  CTREventEmitter,
  CTRVFSDirectory
} from "libctr";

import type {
  CTRVFSFile,
  CTRVFSNode,
  CTRMemoryArray,
  CTREventEmitterDefaultEventMap
} from "libctr";

type RadianteNWTextureVFSFileAttributes = {
  unknown: number;
};

type RadianteNWTextureVFS = CTRVFS<{}, RadianteNWTextureVFSFileAttributes>;
type RadianteNWTextureVFSNode = CTRVFSNode<{}, RadianteNWTextureVFSFileAttributes>;
type RadianteNWTextureVFSFile = CTRVFSFile<{}, RadianteNWTextureVFSFileAttributes>;

type RadianteNWTextureVFSDirectory = CTRVFSDirectory<
  {},
  RadianteNWTextureVFSFileAttributes
>;

interface RadianteNWTextureOutput {
  data: CTRMemory;
  info: CTRMemory;
}

interface RadianteNWTextureItem {
  length: number;
  unknown: number;
  dataOffset: number;
  nameOffset: number;
}

const RADIANTE_NWTEX_TERMINATOR = "\0";
const RADIANTE_NWTEX_ENCODING = "utf8";
const RADIANTE_NWTEX_ITEM_SIZE = CTRMemory.U32_SIZE * 4;

class RadianteNWTextureListener extends CTREventEmitter<
  CTREventEmitterDefaultEventMap &
    Record<
      `${"decode" | "encode"}.file.${"end" | "start"}`,
      [RadianteNWTextureVFSFile]
    >
> {}

function decode(
  data: CTRMemoryArray,
  info: CTRMemoryArray,
  listener?: RadianteNWTextureListener
): RadianteNWTextureVFS {
  data = new CTRMemory(data);
  info = new CTRMemory(info);

  return _decode(data, info, listener);
}

function _decode(
  data: CTRMemory,
  info: CTRMemory,
  listener?: RadianteNWTextureListener
): RadianteNWTextureVFS {
  const count = info.u32();
  const nameStart = CTRMemory.U32_SIZE + count * RADIANTE_NWTEX_ITEM_SIZE;

  const items: RadianteNWTextureItem[] = [];
  const root = new CTRVFS<{}, RadianteNWTextureVFSFileAttributes>("nwtex");

  for (let i = 0; i < count; i += 1) {
    const nameOffset = info.u32();
    const dataOffset = info.u32();
    const unknown = info.u32();
    const length = info.u32();

    items.push({ length, unknown, dataOffset, nameOffset });
  }

  for (const item of items) {
    if (data.offset !== item.dataOffset) {
      throw "nwtexture::malformed_data";
    }

    if (info.offset !== nameStart + item.nameOffset) {
      throw "nwtexture::malformed_info";
    }

    const file = root.file(
      `${info.string({
        encoding: RADIANTE_NWTEX_ENCODING,
        terminator: RADIANTE_NWTEX_TERMINATOR
      })}.bcres`,
      data.raw({ count: item.length }),
      { unknown: item.unknown }
    );

    listener?.emit("decode.file.start", file);
    file.data = blz.decode(file.data);
    listener?.emit("decode.file.end", file);
  }

  return root;
}

function encode(
  files: RadianteNWTextureVFSDirectory | RadianteNWTextureVFSFile[],
  listener?: RadianteNWTextureListener
): RadianteNWTextureOutput {
  files = files instanceof CTRVFSDirectory ? files.files : files;

  const data = new CTRMemory();
  const info = new CTRMemory();
  _encode(files, data, info, listener);

  return { data, info };
}

function _encode(
  files: RadianteNWTextureVFSFile[],
  data: CTRMemory,
  info: CTRMemory,
  listener?: RadianteNWTextureListener
): void {
  let dataOffset = 0;
  let nameOffset = 0;

  const names: string[] = [];
  const items: RadianteNWTextureItem[] = [];

  for (const file of files) {
    listener?.emit("encode.file.start", file);
    const compressed = blz.encode(file.data);

    const unknown = file.attributes?.unknown || 0;
    const name = file.stemname + RADIANTE_NWTEX_TERMINATOR;

    items.push({
      unknown,
      dataOffset,
      nameOffset,
      length: compressed.length
    });

    names.push(name);
    data.raw(compressed);

    dataOffset += length;
    nameOffset += CTRMemory.bytelength(name, RADIANTE_NWTEX_ENCODING);
    listener?.emit("encode.file.end", file);
  }

  info.u32(items.length);

  for (const item of items) {
    info.u32(item.nameOffset);
    info.u32(item.dataOffset);
    info.u32(item.unknown);
    info.u32(item.length);
  }

  for (const name of names) {
    info.raw(name, { encoding: RADIANTE_NWTEX_ENCODING });
  }
}

export {
  decode,
  encode,
  RadianteNWTextureListener,
  RadianteNWTextureListener as NWTextureListener
};

export type {
  RadianteNWTextureVFS,
  RadianteNWTextureVFS as NWTextureVFS,
  RadianteNWTextureVFSFile,
  RadianteNWTextureVFSFile as NWTextureVFSFile,
  RadianteNWTextureVFSNode,
  RadianteNWTextureVFSNode as NWTextureVFSNode,
  RadianteNWTextureVFSDirectory,
  RadianteNWTextureVFSDirectory as NWTextureVFSDirectory,
  RadianteNWTextureVFSFileAttributes,
  RadianteNWTextureVFSFileAttributes as NWTextureVFSFileAttributes
};
