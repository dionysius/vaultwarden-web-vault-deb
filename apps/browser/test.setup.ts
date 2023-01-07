// Add chrome storage api
const QUOTA_BYTES = 10;
const storage = {
  local: {
    set: jest.fn(),
    get: jest.fn(),
    remove: jest.fn(),
    QUOTA_BYTES,
    getBytesInUse: jest.fn(),
    clear: jest.fn(),
  },
  session: {
    set: jest.fn(),
    get: jest.fn(),
    has: jest.fn(),
    remove: jest.fn(),
  },
};

const runtime = {
  onMessage: {
    addListener: jest.fn(),
  },
  sendMessage: jest.fn(),
  getManifest: jest.fn(),
};

const contextMenus = {
  create: jest.fn(),
  removeAll: jest.fn(),
};

// set chrome
global.chrome = {
  storage,
  runtime,
  contextMenus,
} as any;
