// Add chrome storage api
const get = jest.fn();
const set = jest.fn();
const has = jest.fn();
const remove = jest.fn();
const QUOTA_BYTES = 10;
const getBytesInUse = jest.fn();
const clear = jest.fn();
global.chrome = {
  storage: {
    local: {
      set,
      get,
      remove,
      QUOTA_BYTES,
      getBytesInUse,
      clear,
    },
    session: {
      set,
      get,
      has,
      remove,
    },
  },
} as any;
