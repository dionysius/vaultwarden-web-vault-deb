const { pathsToModuleNameMapper } = require("ts-jest");

const { compilerOptions } = require("./tsconfig");

module.exports = {
  collectCoverage: true,
  coverageReporters: ["html", "lcov"],
  coverageDirectory: "coverage",
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions?.paths || {}, {
    prefix: "<rootDir>/",
  }),
  projects: [
    "<rootDir>/apps/browser/jest.config.js",
    "<rootDir>/apps/cli/jest.config.js",
    "<rootDir>/apps/desktop/jest.config.js",
    "<rootDir>/apps/web/jest.config.js",
    "<rootDir>/bitwarden_license/bit-web/jest.config.js",

    "<rootDir>/libs/angular/jest.config.js",
    "<rootDir>/libs/common/jest.config.js",
    "<rootDir>/libs/components/jest.config.js",
    "<rootDir>/libs/node/jest.config.js",
  ],

  // Workaround for a memory leak that crashes tests in CI:
  // https://github.com/facebook/jest/issues/9430#issuecomment-1149882002
  // Also anecdotally improves performance when run locally
  maxWorkers: 3,
  globals: {
    "ts-jest": {
      // Further workaround for memory leak, recommended here:
      // https://github.com/kulshekhar/ts-jest/issues/1967#issuecomment-697494014
      // Makes tests run faster and reduces size/rate of leak, but loses typechecking on test code
      // See https://bitwarden.atlassian.net/browse/EC-497 for more info
      isolatedModules: true,
    },
  },
};
