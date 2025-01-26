import { CTRMemory } from "libctr";
import { RadianteKSMFunctionInstruction } from "#ksm/instructions/ksm-function-instruction";

class RadianteKSMUnknownFunctionInstruction extends RadianteKSMFunctionInstruction {
  protected _build(buffer: CTRMemory): void {
    throw new Error("Method not implemented.");
  }

  protected _parse(buffer: CTRMemory): void {
    let value = buffer.u32();

    while (value !== 0x11) {
      value = buffer.u32();
    }
  }
}

export {
  RadianteKSMUnknownFunctionInstruction,
  RadianteKSMUnknownFunctionInstruction as KSMUnknownFunctionInstruction
};
