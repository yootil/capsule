let storageImpl: Storage;

const globalContext = (window);

// @ts-ignore
if (globalContext && globalContext.localStorage) {
  // @ts-ignore
  storageImpl = globalContext.localStorage;
} else {
  // Todo
  storageImpl = null;
}

export default storageImpl;