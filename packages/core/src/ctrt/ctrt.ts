import { PNG } from "pngjs";
import {
  CTRMemory,
  CTRMemoryOOBError,
  CTRBinarySerializable,
  CTREventEmitterDefaultEventMap
} from "libctr";

import {
  RadianteCTRTError,
  RadianteCTRTFormatError,
  RadianteCTRTUnrecognizedTypeError
} from "#ctrt/ctrt-error";

type RadianteCTRTType = "RGB565" | "RGB888";

interface RadianteCTRTPixel {
  a: number;
  r: number;
  g: number;
  b: number;
}

interface RadianteCTRTToPNGOptions {
  write?: boolean;
}

class RadianteCTRT extends CTRBinarySerializable<
  never,
  CTREventEmitterDefaultEventMap,
  undefined,
  undefined,
  RadianteCTRTFormatError,
  RadianteCTRTFormatError
> {
  private static readonly MAGIC = [0x43, 0x54, 0x52, 0x54];

  private static readonly TYPE_RGB565 = 8;
  private static readonly TYPE_RGB888 = 9;

  private _type: number = RadianteCTRT.TYPE_RGB888;
  public readonly pixels: RadianteCTRTPixel[][] = [];

  public get type(): RadianteCTRTType {
    switch (this._type) {
      case RadianteCTRT.TYPE_RGB565:
        return "RGB565";
      case RadianteCTRT.TYPE_RGB888:
        return "RGB888";
      default:
        throw new RadianteCTRTUnrecognizedTypeError(this, this._type);
    }
  }

  public set type(type: RadianteCTRTType) {
    switch (type) {
      case "RGB565":
        this._type = RadianteCTRT.TYPE_RGB565;
        break;
      case "RGB888":
        this._type = RadianteCTRT.TYPE_RGB888;
        break;
      default:
        throw new RadianteCTRTUnrecognizedTypeError(this, type);
    }
  }

  public get depth(): number {
    switch (this.type) {
      case "RGB565":
        return 16;
      case "RGB888":
        return 32;
      default:
        return NaN;
    }
  }

  public get width(): number {
    return this.pixels[0]?.length || 0;
  }

  public get height(): number {
    return this.pixels.length;
  }

  protected override _sizeof(): number {
    return (
      RadianteCTRT.MAGIC.length +
      CTRMemory.U64_SIZE +
      2 * CTRMemory.U16_SIZE +
      this.width * this.height * (this.depth / CTRMemory.BITS)
    );
  }

  private _buildRGB565(buffer: CTRMemory): void {
    this.pixels.forEach((row) =>
      row.forEach((px) => {
        const r = Math.min(31, Math.round(px.r * 31));
        const g = Math.min(63, Math.round(px.g * 63));
        const b = Math.min(31, Math.round(px.b * 31));

        buffer.u16((r << 11) | (g << 5) | b);
      })
    );
  }

  private _buildRGB888(buffer: CTRMemory): void {
    this.pixels.forEach((row) =>
      row.forEach((px) => {
        const r = Math.min(255, Math.round(px.r * 255));
        const g = Math.min(255, Math.round(px.g * 255));
        const b = Math.min(255, Math.round(px.b * 255));

        buffer.u8(r);
        buffer.u8(g);
        buffer.u8(b);
      })
    );
  }

  protected override _build(buffer: CTRMemory): void {
    buffer.endianness = "LE";

    if (this.type === "RGB565") {
      this._buildRGB565(buffer);
    } else if (this.type === "RGB888") {
      this._buildRGB888(buffer);
    }

    buffer.raw(RadianteCTRT.MAGIC);
    buffer.u16(this.width);
    buffer.u16(this.height);
    buffer.u64(this._type);
  }

  private _parseRGB565(buffer: CTRMemory, width: number, height: number): void {
    for (let i = 0; i < height; i += 1) {
      const row: RadianteCTRTPixel[] = [];

      for (let j = 0; j < width; j += 1) {
        const rgb565 = buffer.u16();

        const b = (rgb565 & 0x1f) / 31;
        const g = ((rgb565 >> 5) & 0x3f) / 63;
        const r = ((rgb565 >> 11) & 0x1f) / 31;

        row.push({ r, g, b, a: 1 });
      }

      this.pixels.push(row);
    }
  }

  private _parseRGB888(buffer: CTRMemory, width: number, height: number): void {
    for (let i = 0; i < height; i += 1) {
      const row: RadianteCTRTPixel[] = [];

      for (let j = 0; j < width; j += 1) {
        const r = buffer.u8() / 255;
        const g = buffer.u8() / 255;
        const b = buffer.u8() / 255;

        row.push({ r, g, b, a: 1 });
      }

      this.pixels.push(row);
    }
  }

  protected override _parse(buffer: CTRMemory): void {
    buffer.endianness = "LE";

    if (buffer.length < 16) {
      throw new RadianteCTRTError(RadianteCTRTError.ERR_BUFFER_TOO_SMALL, this);
    }

    buffer.seek(-16);

    if (!buffer.raw({ count: 4 }).equals(RadianteCTRT.MAGIC)) {
      throw new RadianteCTRTError(RadianteCTRTError.ERR_NOT_A_CTRT_FILE, this);
    }

    const width = buffer.u16();
    const height = buffer.u16();
    this._type = Number(buffer.u64());

    buffer.seek(0);

    if (this.type === "RGB565") {
      this._parseRGB565(buffer, width, height);
    } else if (this.type === "RGB888") {
      this._parseRGB888(buffer, width, height);
    }
  }

  protected override _builderr(
    err: unknown,
    buffer: CTRMemory
  ): RadianteCTRTFormatError {
    return new RadianteCTRTFormatError(
      RadianteCTRTError.ERR_BUILD,
      buffer,
      this,
      undefined,
      err
    );
  }

  protected override _parseerr(
    err: unknown,
    buffer: CTRMemory
  ): RadianteCTRTFormatError {
    return new RadianteCTRTFormatError(
      RadianteCTRTError.ERR_PARSE,
      buffer,
      this,
      undefined,
      err instanceof CTRMemoryOOBError
        ? new RadianteCTRTError(
            RadianteCTRTError.ERR_UNEXPECTED_END_OF_FILE,
            this,
            undefined,
            err
          )
        : err
    );
  }

  public toPNG(): PNG;
  public toPNG(options: RadianteCTRTToPNGOptions & { write: false }): PNG;
  public toPNG(options: RadianteCTRTToPNGOptions & { write: true }): Buffer;
  public toPNG(options?: RadianteCTRTToPNGOptions): PNG | Buffer;

  public toPNG(options?: RadianteCTRTToPNGOptions): PNG | Buffer {
    const write = Boolean(options?.write);
    const buffer = new CTRMemory();

    this.pixels.forEach((row) =>
      row.forEach((px) => {
        const r = Math.min(255, Math.round(px.r * 255));
        const g = Math.min(255, Math.round(px.g * 255));
        const b = Math.min(255, Math.round(px.b * 255));
        const a = Math.min(255, Math.round(px.a * 255));

        buffer.u8(r);
        buffer.u8(g);
        buffer.u8(b);
        buffer.u8(a);
      })
    );

    const image = new PNG({
      width: this.width,
      height: this.height
    });

    image.data = buffer.steal();

    if (write) {
      return PNG.sync.write(image);
    }

    return image;
  }

  public fromPNG(image: PNG): RadianteCTRT {
    const texture = new RadianteCTRT();
    const buffer = new CTRMemory(image.data);

    for (let i = 0; i < image.height; i += 1) {
      const row: RadianteCTRTPixel[] = [];

      for (let j = 0; j < image.width; j += 1) {
        const r = buffer.u8() / 255;
        const g = buffer.u8() / 255;
        const b = buffer.u8() / 255;
        const a = buffer.u8() / 255;

        row.push({ r, g, b, a });
      }

      texture.pixels.push(row);
    }

    return texture;
  }
}

export { RadianteCTRT, RadianteCTRT as CTRT };

export type {
  RadianteCTRTType,
  RadianteCTRTType as CTRTType,
  RadianteCTRTPixel,
  RadianteCTRTPixel as CTRTPixel
};
