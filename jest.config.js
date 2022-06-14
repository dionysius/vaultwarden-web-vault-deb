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

    "<rootDir>/libs/angular/jest.config.js",
    "<rootDir>/libs/common/jest.config.js",
    "<rootDir>/libs/electron/jest.config.js",
    "<rootDir>/libs/node/jest.config.js",
  ],
};
