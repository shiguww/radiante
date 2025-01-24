import { RadianteKDMInvalidStateError } from "#kdm/kdm-error";
import type { RadianteKDMEntity } from "#kdm/common/kdm-entity";

function _validateAt(
  input: unknown,
  state: unknown,
  path: (string | number)[],
  element: RadianteKDMEntity
): null | RadianteKDMInvalidStateError {
  const err = element.validate(state);

  if (err !== null) {
    if (err instanceof RadianteKDMInvalidStateError) {
      err.path.unshift(...path);
      Object.defineProperty(err, "input", { value: input });

      return err;
    }

    return new RadianteKDMInvalidStateError(path, input, state, undefined, err);
  }

  return null;
}

function _validateArray(
  input: unknown,
  state: unknown,
  path: (string | number)[],
  element: RadianteKDMEntity
): null | RadianteKDMInvalidStateError {
  if (!Array.isArray(input)) {
    return new RadianteKDMInvalidStateError(path, input, state);
  }

  for (let i = 0; i < input.length; i += 1) {
    const err = _validateAt(
      input,
      Reflect.get(input, i),
      [...path, i],
      element
    );

    if (err !== null) {
      return err;
    }
  }

  return null;
}

export { _validateAt, _validateArray };
