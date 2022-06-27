const { pathsToModuleNameMapper } = require("ts-jest");

const { compilerOptions } = require("./tsconfig");

module.exports = {
  collectCoverage: true,
  coverageReporters: ["html", "lcov"],
  coverageDirectory: "coverage",
  setupFilesAfterEnv: ["<rootDir>/test.setup.ts"],
  preset: "jest-preset-angular",
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions?.paths || {}, {
    prefix: "<rootDir>/",
  }),
};
