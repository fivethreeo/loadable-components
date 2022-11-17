const Uninitialized = -1;
const Pending = 0;
const Resolved = 1;
const Rejected = 2;

const REACT_LAZY_TYPE = Symbol.for("react.lazy");

function lazyInitializer(payload) {
  if (payload._status === Uninitialized) {
    const thenable = payload._ctor.requireAsync();
    // Transition to the next state.
    // This might throw either because it's missing or throws. If so, we treat it
    // as still uninitialized and try again next time. Which is the same as what
    // happens if the ctor or any wrappers processing the ctor throws. This might
    // end up fixing it if the resolution was a concurrency bug.
    thenable.then(
      (moduleObject) => {
        if (payload._status === Pending || payload._status === Uninitialized) {
          // Transition to the next state.
          const resolved = payload;
          resolved._status = Resolved;
          resolved._result = moduleObject;
        }
      },
      (error) => {
        if (payload._status === Pending || payload._status === Uninitialized) {
          // Transition to the next state.
          const rejected = payload;
          rejected._status = Rejected;
          rejected._result = error;
        }
      }
    );
    if (payload._status === Uninitialized) {
      // In case, we're still uninitialized, then we're waiting for the thenable
      // to resolve. Set it as pending in the meantime.
      const pending = payload;
      pending._status = Pending;
      pending._result = thenable;
    }
  }
  if (payload._status === Resolved) {
    const moduleObject = payload._result;
    return payload._ctor.onResolve(moduleObject.default);
  } else {
    throw payload._result;
  }
}

export function lazyReact(ctor) {

    const payload = {
    // We use these fields to store the result.
    _status: Uninitialized,
    _result: ctor.requireAsync,
    _ctor: ctor
  };

  const lazyType = {
    $$typeof: REACT_LAZY_TYPE,
    _payload: payload,
    _init: lazyInitializer
  };

  return lazyType;
}
