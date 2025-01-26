import type { RadianteKSM } from "#ksm/ksm";
import type { RadianteKSMFunctionDefinition } from "#ksm/ksm-function-definition";

class RadianteKSMContext {
  public const: boolean;
  public opcode: null | number;
  public readonly instance: RadianteKSM;
  public readonly symbols: Map<number, unknown>;

  public constructor(instance: RadianteKSM) {
    this.const = false;
    this.opcode = null;
    this.instance = instance;
    this.symbols = new Map();
  }

  public scope(fn: RadianteKSMFunctionDefinition): RadianteKSMContext {
    const clone = this._clone();

    for (const variable of fn.variables) {
      clone.symbols.set(variable.id, variable);
    }

    return clone;
  }

  private _clone(): RadianteKSMContext {
    const clone = new RadianteKSMContext(this.instance);

    clone.const = this.const;
    clone.opcode = this.opcode;

    for (const [key, value] of this.symbols.entries()) {
      clone.symbols.set(key, value);
    }

    return clone;
  }
}

export { RadianteKSMContext, RadianteKSMContext as KSMContext };
