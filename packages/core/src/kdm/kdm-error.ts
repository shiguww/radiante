import { CTRError } from "libctr";
import type { CTRMemory } from "libctr";
import type { RadianteKDM, RadianteKDMPartialHeader } from "#kdm/kdm";
import type { RadianteKDMPointer } from "#kdm/common/primitive/kdm-pointer";

import type {
  RadianteKDMEntity,
  RadianteKDMEntityConstructor
} from "#kdm/common/kdm-entity";

type RadianteKDMErrorCode =
  | typeof RadianteKDMError.ERR_BUILD
  | typeof RadianteKDMError.ERR_PARSE
  | typeof RadianteKDMError.ERR_UNKNOWN
  | typeof RadianteKDMError.ERR_EMPTY_ARRAY
  | typeof RadianteKDMError.ERR_UNKNOWN_TYPE
  | typeof RadianteKDMError.ERR_INVALID_STATE
  | typeof RadianteKDMError.ERR_UNKNOWN_ARRAY
  | typeof RadianteKDMError.ERR_UNKNOWN_TABLE
  | typeof RadianteKDMError.ERR_UNKNOWN_ENTITY
  | typeof RadianteKDMError.ERR_NOT_A_KDM_FILE
  | typeof RadianteKDMError.ERR_INVALID_HEADER
  | typeof RadianteKDMError.ERR_MALFORMED_FILE
  | typeof RadianteKDMError.ERR_INVALID_POINTER
  | typeof RadianteKDMError.ERR_UNKNOWN_TYPE_ID
  | typeof RadianteKDMError.ERR_INVALID_CONSTANT
  | typeof RadianteKDMError.ERR_INVALID_TABLE_COUNT
  | typeof RadianteKDMError.ERR_INVALID_PARAMETER_TYPE
  | typeof RadianteKDMError.ERR_UNEXPECTED_END_OF_FILE
  | typeof RadianteKDMError.ERR_INVALID_PARAMETER_COUNT
  | typeof RadianteKDMError.ERR_INVALID_STRUCT_DEFINITION
  | typeof RadianteKDMError.ERR_INVALID_STRUCT_DEFINITION_COUNT;

class RadianteKDMError extends CTRError {
  public static readonly ERR_BUILD = "kdm.err_build";
  public static readonly ERR_PARSE = "kdm.err_parse";
  public static readonly ERR_UNKNOWN = "kdm.err_unknown";
  public static readonly ERR_EMPTY_ARRAY = "kdm.err_empty_array";
  public static readonly ERR_UNKNOWN_TYPE = "kdm.err_unknown_type";
  public static readonly ERR_INVALID_STATE = "kdm.err_invalid_state";
  public static readonly ERR_UNKNOWN_ARRAY = "kdm.err_unknown_array";
  public static readonly ERR_UNKNOWN_TABLE = "kdm.err_unknown_table";
  public static readonly ERR_UNKNOWN_ENTITY = "kdm.err_unknown_entity";
  public static readonly ERR_NOT_A_KDM_FILE = "kdm.err_not_a_kdm_file";
  public static readonly ERR_INVALID_HEADER = "kdm.err_invalid_header";
  public static readonly ERR_MALFORMED_FILE = "kdm.err_malformed_file";
  public static readonly ERR_INVALID_POINTER = "kdm.err_invalid_pointer";
  public static readonly ERR_UNKNOWN_TYPE_ID = "kdm.err_unknown_type_id";
  public static readonly ERR_INVALID_CONSTANT = "kdm.err_invalid_constant";

  public static readonly ERR_INVALID_TABLE_COUNT =
    "kdm.err_invalid_table_count";

  public static readonly ERR_INVALID_PARAMETER_TYPE =
    "kdm.err_invalid_parameter_type";

  public static readonly ERR_UNEXPECTED_END_OF_FILE =
    "kdm.err_unexpected_end_of_file";

  public static readonly ERR_INVALID_PARAMETER_COUNT =
    "kdm.err_invalid_parameter_count";

  public static readonly ERR_INVALID_STRUCT_DEFINITION =
    "kdm.err_invalid_struct_definition";

  public static readonly ERR_INVALID_STRUCT_DEFINITION_COUNT =
    "kdm.err_invalid_struct_definition_count";

  public override readonly code: RadianteKDMErrorCode;

  public constructor(
    code?: null | RadianteKDMErrorCode,
    message?: string,
    cause?: unknown
  ) {
    super(null, message, cause);
    this.code = code || RadianteKDMError.ERR_UNKNOWN;
  }
}

//#region
type RadianteKDMTypeErrorCode =
  | typeof RadianteKDMError.ERR_UNKNOWN_TYPE
  | typeof RadianteKDMError.ERR_INVALID_PARAMETER_TYPE;

abstract class RadianteKDMTypeError extends RadianteKDMError {
  public readonly type: RadianteKDMEntityConstructor;
  public override readonly code: RadianteKDMTypeErrorCode;

  public constructor(
    code: RadianteKDMTypeErrorCode,
    type: RadianteKDMEntityConstructor,
    message?: string,
    cause?: unknown
  ) {
    super(null, message, cause);

    this.code = code;
    this.type = type;
  }
}

class RadianteKDMUnknownTypeError extends RadianteKDMTypeError {
  public override readonly code: typeof RadianteKDMError.ERR_UNKNOWN_TYPE;

  public constructor(
    type: RadianteKDMEntityConstructor,
    message?: string,
    cause?: unknown
  ) {
    super(RadianteKDMError.ERR_UNKNOWN_TYPE, type, message, cause);
    this.code = RadianteKDMError.ERR_UNKNOWN_TYPE;
  }
}

class RadianteKDMInvalidParameterTypeError extends RadianteKDMTypeError {
  public override readonly code: typeof RadianteKDMError.ERR_INVALID_PARAMETER_TYPE;

  public constructor(
    type: RadianteKDMEntityConstructor,
    message?: string,
    cause?: unknown
  ) {
    super(RadianteKDMError.ERR_INVALID_PARAMETER_TYPE, type, message, cause);
    this.code = RadianteKDMError.ERR_INVALID_PARAMETER_TYPE;
  }
}
//#endregion

//#region
type RadianteKDMArrayErrorCode =
  | typeof RadianteKDMError.ERR_EMPTY_ARRAY
  | typeof RadianteKDMError.ERR_UNKNOWN_ARRAY;

abstract class RadianteKDMArrayError extends RadianteKDMError {
  public readonly array: RadianteKDMEntity[];
  public override readonly code: RadianteKDMArrayErrorCode;

  public constructor(
    code: RadianteKDMArrayErrorCode,
    array: RadianteKDMEntity[],
    message?: string,
    cause?: unknown
  ) {
    super(null, message, cause);

    this.code = code;
    this.array = array;
  }
}

class RadianteKDMEmptyArrayError extends RadianteKDMArrayError {
  public override readonly code: typeof RadianteKDMError.ERR_EMPTY_ARRAY;

  public constructor(
    array: RadianteKDMEntity[],
    message?: string,
    cause?: unknown
  ) {
    super(RadianteKDMError.ERR_EMPTY_ARRAY, array, message, cause);
    this.code = RadianteKDMError.ERR_EMPTY_ARRAY;
  }
}

class RadianteKDMUnknownArrayError extends RadianteKDMArrayError {
  public override readonly code: typeof RadianteKDMError.ERR_UNKNOWN_ARRAY;

  public constructor(
    array: RadianteKDMEntity[],
    message?: string,
    cause?: unknown
  ) {
    super(RadianteKDMError.ERR_UNKNOWN_ARRAY, array, message, cause);
    this.code = RadianteKDMError.ERR_UNKNOWN_ARRAY;
  }
}
//#endregion

//#region
type RadianteKDMFormatErrorCode =
  | typeof RadianteKDMError.ERR_BUILD
  | typeof RadianteKDMError.ERR_PARSE;

class RadianteKDMFormatError extends RadianteKDMError {
  public readonly buffer: CTRMemory;
  public readonly instance: RadianteKDM;
  public override readonly code: RadianteKDMFormatErrorCode;

  public constructor(
    code: RadianteKDMFormatErrorCode,
    buffer: CTRMemory,
    instance: RadianteKDM,
    message?: string,
    cause?: unknown
  ) {
    super(null, message, cause);

    this.code = code;
    this.buffer = buffer;
    this.instance = instance;
  }
}
//#endregion

//#region
type RadianteKDMTypeIDErrorCode =
  | typeof RadianteKDMError.ERR_UNKNOWN_TYPE_ID
  | typeof RadianteKDMError.ERR_INVALID_STRUCT_DEFINITION;

abstract class RadianteKDMTypeIDError extends RadianteKDMError {
  public readonly typeid: number;
  public override readonly code: RadianteKDMTypeIDErrorCode;

  public constructor(
    code: RadianteKDMTypeIDErrorCode,
    typeid: number,
    message?: string,
    cause?: unknown
  ) {
    super(null, message, cause);

    this.code = code;
    this.typeid = typeid;
  }
}

class RadianteKDMUnknownTypeIDError extends RadianteKDMTypeIDError {
  public override readonly code: typeof RadianteKDMError.ERR_UNKNOWN_TYPE_ID;

  public constructor(typeid: number, message?: string, cause?: unknown) {
    super(RadianteKDMError.ERR_UNKNOWN_TYPE_ID, typeid, message, cause);
    this.code = RadianteKDMError.ERR_UNKNOWN_TYPE_ID;
  }
}

class RadianteKDMInvalidStructDefinitionError extends RadianteKDMTypeIDError {
  public override readonly code: typeof RadianteKDMError.ERR_INVALID_STRUCT_DEFINITION;

  public constructor(typeid: number, message?: string, cause?: unknown) {
    super(
      RadianteKDMError.ERR_INVALID_STRUCT_DEFINITION,
      typeid,
      message,
      cause
    );

    this.code = RadianteKDMError.ERR_INVALID_STRUCT_DEFINITION;
  }
}
//#endregion

//#region
type RadianteKDMInvalidCountErrorCode =
  | typeof RadianteKDMError.ERR_INVALID_TABLE_COUNT
  | typeof RadianteKDMError.ERR_INVALID_PARAMETER_COUNT
  | typeof RadianteKDMError.ERR_INVALID_STRUCT_DEFINITION_COUNT;

class RadianteKDMInvalidCountError extends RadianteKDMError {
  public readonly count: number;
  public readonly expected: number;
  public override readonly code: RadianteKDMInvalidCountErrorCode;

  public constructor(
    code: RadianteKDMInvalidCountErrorCode,
    count: number,
    expected: number,
    message?: string,
    cause?: unknown
  ) {
    super(null, message, cause);

    this.code = code;
    this.count = count;
    this.expected = expected;
  }
}
//#endregion

class RadianteKDMInvalidStateError extends RadianteKDMError {
  public readonly input: unknown;
  public readonly state: unknown;
  public readonly path: (string | number)[];
  public override readonly code: typeof RadianteKDMError.ERR_INVALID_STATE;

  public constructor(
    path: (string | number)[],
    input: unknown,
    state: unknown,
    message?: string,
    cause?: unknown
  ) {
    super(null, message, cause);

    this.path = path;
    this.input = input;
    this.state = state;
    this.code = RadianteKDMError.ERR_INVALID_STATE;
  }
}

class RadianteKDMUnknownTableError extends RadianteKDMError {
  public readonly table: string;
  public override readonly code: typeof RadianteKDMError.ERR_UNKNOWN_TABLE;

  public constructor(table: string, message?: string, cause?: unknown) {
    super(null, message, cause);

    this.table = table;
    this.code = RadianteKDMError.ERR_UNKNOWN_TABLE;
  }
}

class RadianteKDMUnknownEntityError extends RadianteKDMError {
  public readonly entity: RadianteKDMEntity | RadianteKDMEntity[];
  public override readonly code: typeof RadianteKDMError.ERR_UNKNOWN_ENTITY;

  public constructor(
    entity: RadianteKDMEntity | RadianteKDMEntity[],
    message?: string,
    cause?: unknown
  ) {
    super(null, message, cause);

    this.entity = entity;
    this.code = RadianteKDMError.ERR_UNKNOWN_ENTITY;
  }
}

class RadianteKDMInvalidHeaderError extends RadianteKDMError {
  public readonly header: RadianteKDMPartialHeader;
  public override readonly code: typeof RadianteKDMError.ERR_INVALID_HEADER;

  public constructor(
    header: RadianteKDMPartialHeader,
    message?: string,
    cause?: unknown
  ) {
    super(null, message, cause);

    this.header = header;
    this.code = RadianteKDMError.ERR_INVALID_HEADER;
  }
}

class RadianteKDMInvalidPointerError extends RadianteKDMError {
  public readonly pointer: RadianteKDMPointer;
  public override readonly code: typeof RadianteKDMError.ERR_INVALID_POINTER;

  public constructor(
    pointer: RadianteKDMPointer,
    message?: string,
    cause?: unknown
  ) {
    super(null, message, cause);

    this.pointer = pointer;
    this.code = RadianteKDMError.ERR_INVALID_POINTER;
  }
}

class RadianteKDMInvalidConstantError extends RadianteKDMError {
  public readonly constant: number;
  public readonly expected: number;
  public override readonly code: typeof RadianteKDMError.ERR_INVALID_CONSTANT;

  public constructor(
    constant: number,
    expected: number,
    message?: string,
    cause?: unknown
  ) {
    super(null, message, cause);

    this.constant = constant;
    this.expected = expected;
    this.code = RadianteKDMError.ERR_INVALID_CONSTANT;
  }
}

export {
  RadianteKDMError,
  RadianteKDMError as KDMError,
  RadianteKDMTypeError,
  RadianteKDMTypeError as KDMTypeError,
  RadianteKDMArrayError,
  RadianteKDMArrayError as KDMArrayError,
  RadianteKDMTypeIDError,
  RadianteKDMTypeIDError as KDMTypeIDError,
  RadianteKDMFormatError,
  RadianteKDMFormatError as KDMFormatError,
  RadianteKDMEmptyArrayError,
  RadianteKDMEmptyArrayError as KDMEmptyArrayError,
  RadianteKDMUnknownTypeError,
  RadianteKDMUnknownTypeError as KDMUnknownTypeError,
  RadianteKDMInvalidCountError,
  RadianteKDMInvalidCountError as KDMInvalidCountError,
  RadianteKDMInvalidStateError,
  RadianteKDMInvalidStateError as KDMInvalidStateError,
  RadianteKDMUnknownArrayError,
  RadianteKDMUnknownArrayError as KDMUnknownArrayError,
  RadianteKDMUnknownTableError,
  RadianteKDMUnknownTableError as KDMUnknownTableError,
  RadianteKDMInvalidHeaderError,
  RadianteKDMInvalidHeaderError as KDMInvalidHeaderError,
  RadianteKDMUnknownEntityError,
  RadianteKDMUnknownEntityError as KDMUnknownEntityError,
  RadianteKDMUnknownTypeIDError,
  RadianteKDMUnknownTypeIDError as KDMUnknownTypeIDError,
  RadianteKDMInvalidPointerError,
  RadianteKDMInvalidPointerError as KDMInvalidPointerError,
  RadianteKDMInvalidConstantError,
  RadianteKDMInvalidConstantError as KDMInvalidConstantError,
  RadianteKDMInvalidParameterTypeError,
  RadianteKDMInvalidParameterTypeError as KDMInvalidParameterTypeError,
  RadianteKDMInvalidStructDefinitionError,
  RadianteKDMInvalidStructDefinitionError as KDMInvalidStructDefinitionError
};

export type {
  RadianteKDMErrorCode,
  RadianteKDMErrorCode as KDMErrorCode,
  RadianteKDMTypeErrorCode,
  RadianteKDMTypeErrorCode as KDMTypeErrorCode,
  RadianteKDMArrayErrorCode,
  RadianteKDMArrayErrorCode as KDMArrayErrorCode,
  RadianteKDMFormatErrorCode,
  RadianteKDMFormatErrorCode as KDMFormatErrorCode,
  RadianteKDMTypeIDErrorCode,
  RadianteKDMTypeIDErrorCode as KDMTypeIDErrorCode,
  RadianteKDMInvalidCountErrorCode,
  RadianteKDMInvalidCountErrorCode as KDMInvalidCountErrorCode
};
