import { CTRError } from "libctr";
import type { CTRMemory } from "libctr";
import type { RadianteKDM } from "#kdm/kdm";
import type { RadianteKDMPointer } from "#kdm/common/primitive/kdm-pointer";

import type {
  RadianteKDMEntity,
  RadianteKDMEntityConstructor
} from "#kdm/common/kdm-entity";

type RadianteKDMErrorCode =
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
  | typeof RadianteKDMError.ERR_INVALID_PARAMETER_COUNT
  | typeof RadianteKDMError.ERR_INVALID_STRUCT_DEFINITION
  | typeof RadianteKDMError.ERR_INVALID_STRUCT_DEFINITION_COUNT;

interface RadianteKDMErrorMetadata {
  count?: number;
  table?: string;
  input?: unknown;
  state?: unknown;
  typeid?: number;
  buffer?: CTRMemory;
  instance?: RadianteKDM;
  path?: (string | number)[];
  array?: RadianteKDMEntity[];
  pointer?: RadianteKDMPointer;
  type?: RadianteKDMEntityConstructor;
  entity?: RadianteKDMEntity | RadianteKDMEntity[];
}

abstract class RadianteKDMError<
  C extends RadianteKDMErrorCode = RadianteKDMErrorCode,
  M extends RadianteKDMErrorMetadata = RadianteKDMErrorMetadata
> extends CTRError<C, M> {
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

  public static readonly ERR_INVALID_PARAMETER_COUNT =
    "kdm.err_invalid_parameter_count";

  public static readonly ERR_INVALID_STRUCT_DEFINITION =
    "kdm.err_invalid_struct_definition";

  public static readonly ERR_INVALID_STRUCT_DEFINITION_COUNT =
    "kdm.err_invalid_struct_definition_count";
}

interface RadianteKDMFormatErrorMetadata extends RadianteKDMErrorMetadata {
  buffer: CTRMemory;
  instance: RadianteKDM;
}

class RadianteKDMFormatError<
  C extends RadianteKDMErrorCode = RadianteKDMErrorCode,
  M extends RadianteKDMFormatErrorMetadata = RadianteKDMFormatErrorMetadata
> extends RadianteKDMError<C, M> {}

interface RadianteKDMEmptyArrayErrorMetadata
  extends Pick<Required<RadianteKDMErrorMetadata>, "array"> {}

class RadianteKDMEmptyArrayError extends RadianteKDMError<
  typeof RadianteKDMError.ERR_EMPTY_ARRAY,
  RadianteKDMEmptyArrayErrorMetadata
> {
  public constructor(
    metadata: RadianteKDMEmptyArrayErrorMetadata,
    message?: string,
    cause?: unknown
  ) {
    super(RadianteKDMError.ERR_EMPTY_ARRAY, metadata, message, cause);
  }
}

interface RadianteKDMInvalidHeaderErrorMetadata
  extends Pick<Required<RadianteKDMErrorMetadata>, "buffer" | "instance"> {}

class RadianteKDMInvalidHeaderError extends RadianteKDMError<
  typeof RadianteKDMError.ERR_INVALID_HEADER,
  RadianteKDMInvalidHeaderErrorMetadata
> {
  public constructor(
    metadata: RadianteKDMInvalidHeaderErrorMetadata,
    message?: string,
    cause?: unknown
  ) {
    super(RadianteKDMError.ERR_INVALID_HEADER, metadata, message, cause);
  }
}

interface RadianteKDMInvalidPointerErrorMetadata
  extends Pick<Required<RadianteKDMErrorMetadata>, "pointer" | "instance"> {}

class RadianteKDMInvalidPointerError extends RadianteKDMError<
  typeof RadianteKDMError.ERR_INVALID_POINTER,
  RadianteKDMInvalidPointerErrorMetadata
> {
  public constructor(
    metadata: RadianteKDMInvalidPointerErrorMetadata,
    message?: string,
    cause?: unknown
  ) {
    super(RadianteKDMError.ERR_INVALID_POINTER, metadata, message, cause);
  }
}

interface RadianteKDMUnknownTypeErrorMetadata
  extends Pick<Required<RadianteKDMErrorMetadata>, "type" | "instance"> {}

class RadianteKDMUnknownTypeError extends RadianteKDMError<
  typeof RadianteKDMError.ERR_UNKNOWN_TYPE,
  RadianteKDMUnknownTypeErrorMetadata
> {
  public constructor(
    metadata: RadianteKDMUnknownTypeErrorMetadata,
    message?: string,
    cause?: unknown
  ) {
    super(RadianteKDMError.ERR_UNKNOWN_TYPE, metadata, message, cause);
  }
}

interface RadianteKDMInvalidStateErrorMetadata
  extends Pick<
    Required<RadianteKDMErrorMetadata>,
    "path" | "input" | "state"
  > {}

class RadianteKDMInvalidStateError extends RadianteKDMError<
  typeof RadianteKDMError.ERR_INVALID_STATE,
  RadianteKDMInvalidStateErrorMetadata
> {
  public constructor(
    metadata: RadianteKDMInvalidStateErrorMetadata,
    message?: string,
    cause?: unknown
  ) {
    super(RadianteKDMError.ERR_INVALID_STATE, metadata, message, cause);
  }
}

interface RadianteKDMUnknownArrayErrorMetadata
  extends Pick<Required<RadianteKDMErrorMetadata>, "array" | "instance"> {}

class RadianteKDMUnknownArrayError extends RadianteKDMError<
  typeof RadianteKDMError.ERR_UNKNOWN_ARRAY,
  RadianteKDMUnknownArrayErrorMetadata
> {
  public constructor(
    metadata: RadianteKDMUnknownArrayErrorMetadata,
    message?: string,
    cause?: unknown
  ) {
    super(RadianteKDMError.ERR_UNKNOWN_ARRAY, metadata, message, cause);
  }
}

interface RadianteKDMUnknownTableErrorMetadata
  extends Pick<Required<RadianteKDMErrorMetadata>, "table" | "instance"> {}

class RadianteKDMUnknownTableError extends RadianteKDMError<
  typeof RadianteKDMError.ERR_UNKNOWN_TABLE,
  RadianteKDMUnknownTableErrorMetadata
> {
  public constructor(
    metadata: RadianteKDMUnknownTableErrorMetadata,
    message?: string,
    cause?: unknown
  ) {
    super(RadianteKDMError.ERR_UNKNOWN_TABLE, metadata, message, cause);
  }
}

interface RadianteKDMUnknownEntityErrorMetadata
  extends Pick<Required<RadianteKDMErrorMetadata>, "entity" | "instance"> {}

class RadianteKDMUnknownEntityError extends RadianteKDMError<
  typeof RadianteKDMError.ERR_UNKNOWN_ENTITY,
  RadianteKDMUnknownEntityErrorMetadata
> {
  public constructor(
    metadata: RadianteKDMUnknownEntityErrorMetadata,
    message?: string,
    cause?: unknown
  ) {
    super(RadianteKDMError.ERR_UNKNOWN_ENTITY, metadata, message, cause);
  }
}

interface RadianteKDMUnknownTypeIDErrorMetadata
  extends Pick<Required<RadianteKDMErrorMetadata>, "typeid" | "instance"> {}

class RadianteKDMUnknownTypeIDError extends RadianteKDMError<
  typeof RadianteKDMError.ERR_UNKNOWN_TYPE_ID,
  RadianteKDMUnknownTypeIDErrorMetadata
> {
  public constructor(
    metadata: RadianteKDMUnknownTypeIDErrorMetadata,
    message?: string,
    cause?: unknown
  ) {
    super(RadianteKDMError.ERR_UNKNOWN_TYPE_ID, metadata, message, cause);
  }
}

interface RadianteKDMInvalidParameterTypeErrorMetadata
  extends Pick<Required<RadianteKDMErrorMetadata>, "type" | "instance"> {}

class RadianteKDMInvalidParameterTypeError extends RadianteKDMError<
  typeof RadianteKDMError.ERR_INVALID_PARAMETER_TYPE,
  RadianteKDMInvalidParameterTypeErrorMetadata
> {
  public constructor(
    metadata: RadianteKDMInvalidParameterTypeErrorMetadata,
    message?: string,
    cause?: unknown
  ) {
    super(
      RadianteKDMError.ERR_INVALID_PARAMETER_TYPE,
      metadata,
      message,
      cause
    );
  }
}

interface RadianteKDMInvalidStructDefinitionErrorMetadata
  extends Pick<Required<RadianteKDMErrorMetadata>, "typeid" | "instance"> {}

class RadianteKDMInvalidStructDefinitionError extends RadianteKDMError<
  typeof RadianteKDMError.ERR_INVALID_STRUCT_DEFINITION,
  RadianteKDMInvalidStructDefinitionErrorMetadata
> {
  public constructor(
    metadata: RadianteKDMInvalidStructDefinitionErrorMetadata,
    message?: string,
    cause?: unknown
  ) {
    super(
      RadianteKDMError.ERR_INVALID_STRUCT_DEFINITION,
      metadata,
      message,
      cause
    );
  }
}

export {
  RadianteKDMError,
  RadianteKDMError as KDMError,
  RadianteKDMFormatError,
  RadianteKDMFormatError as KDMFormatError,
  RadianteKDMEmptyArrayError,
  RadianteKDMEmptyArrayError as KDMEmptyArrayError,
  RadianteKDMUnknownTypeError,
  RadianteKDMUnknownTypeError as KDMUnknownTypeError,
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
  RadianteKDMInvalidParameterTypeError,
  RadianteKDMInvalidParameterTypeError as KDMInvalidParameterTypeError,
  RadianteKDMInvalidStructDefinitionError,
  RadianteKDMInvalidStructDefinitionError as KDMInvalidStructDefinitionError
};

export type {
  RadianteKDMErrorCode,
  RadianteKDMErrorCode as KDMErrorCode,
  RadianteKDMErrorMetadata,
  RadianteKDMErrorMetadata as KDMErrorMetadata,
  RadianteKDMFormatErrorMetadata,
  RadianteKDMFormatErrorMetadata as KDMFormatErrorMetadata,
  RadianteKDMEmptyArrayErrorMetadata,
  RadianteKDMEmptyArrayErrorMetadata as KDMEmptyArrayMetadata,
  RadianteKDMUnknownTypeErrorMetadata,
  RadianteKDMUnknownTypeErrorMetadata as KDMUnknownTypeMetadata,
  RadianteKDMInvalidStateErrorMetadata,
  RadianteKDMInvalidStateErrorMetadata as KDMInvalidStateMetadata,
  RadianteKDMUnknownArrayErrorMetadata,
  RadianteKDMUnknownArrayErrorMetadata as KDMUnknownArrayMetadata,
  RadianteKDMUnknownTableErrorMetadata,
  RadianteKDMUnknownTableErrorMetadata as KDMUnknownTableMetadata,
  RadianteKDMInvalidHeaderErrorMetadata,
  RadianteKDMInvalidHeaderErrorMetadata as KDMInvalidHeaderErrorMetadata,
  RadianteKDMUnknownEntityErrorMetadata,
  RadianteKDMUnknownEntityErrorMetadata as KDMUnknownEntityErrorMetadata,
  RadianteKDMUnknownTypeIDErrorMetadata,
  RadianteKDMUnknownTypeIDErrorMetadata as KDMUnknownTypeIDErrorMetadata,
  RadianteKDMInvalidPointerErrorMetadata,
  RadianteKDMInvalidPointerErrorMetadata as KDMInvalidPointerErrorMetadata,
  RadianteKDMInvalidParameterTypeErrorMetadata,
  RadianteKDMInvalidParameterTypeErrorMetadata as KDMInvalidParameterTypeErrorMetadata,
  RadianteKDMInvalidStructDefinitionErrorMetadata,
  RadianteKDMInvalidStructDefinitionErrorMetadata as KDMInvalidStructDefinitionErrorMetadata
};
