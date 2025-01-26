import { assert } from "#utils";
import { CTRMemory } from "libctr";
import { RadianteKSMContext } from "#ksm/ksm-context";
import { RadianteKSMFunctionDefinition } from "#ksm/ksm-function-definition";
import { RadianteKSMFunctionInstruction } from "#ksm/instructions/ksm-function-instruction";

class RadianteKSMGetArgsInstruction extends RadianteKSMFunctionInstruction {
  public fn: null | RadianteKSMFunctionDefinition;

  public constructor(fn?: null | RadianteKSMFunctionDefinition) {
    super();
    this.fn = fn || null;
  }

  protected _build(buffer: CTRMemory): void {
    throw new Error("Method not implemented.");
  }

  protected _parse(buffer: CTRMemory, ctx: RadianteKSMContext): void {
    assert(!ctx.const);

    const fn = ctx.symbols.get(buffer.u32());
    assert(fn instanceof RadianteKSMFunctionDefinition);

    this.fn = fn;

    const args = [];
    let value = buffer.u32();

    while (value !== 0x08) {
      const arg = ctx.symbols.get(value);
      args.push(arg);

      value = buffer.u32();
    }
  }
}

export {
  RadianteKSMGetArgsInstruction,
  RadianteKSMGetArgsInstruction as KSMGetArgsInstruction
};
