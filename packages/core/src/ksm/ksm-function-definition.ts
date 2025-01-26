import { assert } from "#utils";
import { CTRMemory } from "libctr";
import { RadianteKSMLabel } from "#ksm/ksm-label";
import { RadianteKSMEntity } from "#ksm/ksm-entity";
import { RadianteKSMVariable } from "#ksm/ksm-variable";
import { RadianteKSMContext } from "./ksm-context";

class RadianteKSMFunctionDefinition extends RadianteKSMEntity {
  public id: number;
  public public: boolean;
  public unknown0: number;
  public codeStart: number;
  public codeEnd: number;
  public unknown1: number;
  public unknown2: number;
  public name: null | string;
  public readonly labels: RadianteKSMLabel[];
  public readonly variables: RadianteKSMVariable[];

  public constructor() {
    super();

    this.id = 0;
    this.name = null;
    this.labels = [];
    this.codeEnd = 0;
    this.unknown0 = 0;
    this.unknown1 = 0;
    this.unknown2 = 0;
    this.codeStart = 0;
    this.public = false;
    this.variables = [];
  }

  protected _build(buffer: CTRMemory): void {
    throw new Error("Method not implemented.");
  }

  protected _parse(buffer: CTRMemory, ctx: RadianteKSMContext): void {
    const unknown = buffer.u32();
    this.id = buffer.u32();

    this.public = Boolean(buffer.u32());
    this.unknown0 = buffer.u32();
    this.codeStart = buffer.u32();
    this.codeEnd = buffer.u32();
    this.unknown1 = buffer.u32();
    this.unknown2 = buffer.u32();

    this.name =
      unknown === CTRMemory.U32_MAX
        ? buffer.string({ count: buffer.u32() * 4, encoding: "utf8" })
        : null;

    if (this.name === null) {
      assert(unknown === 0, "");
    }

    const variableCount = buffer.u32();

    for (let i = 0; i < variableCount; i += 1) {
      const variable = new RadianteKSMVariable().parse(buffer, ctx);

      /*
      if (variable.name === null) {
        assert((variable.id & 0xff) === 0, "");
        variable.alias = `var_${(variable.id >> 8) & 0xFF}`;
      }
      */

      this.variables.push(variable);
    }

    const tableCount = buffer.u32();
    assert(tableCount === 0, "");

    const labelCount = buffer.u32();

    for (let i = 0; i < labelCount; i += 1) {
      this.labels.push(new RadianteKSMLabel().parse(buffer, ctx));
    }
  }
}

export {
  RadianteKSMFunctionDefinition,
  RadianteKSMFunctionDefinition as KSMFunctionDefinition
};
