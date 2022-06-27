const { pathsToModuleNameMapper } = require("ts-jest");

const { compilerOptions } = require("../shared/tsconfig.libs");

module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testMatch: ["**/+(*.)+(spec).+(ts)"],
  setupFilesAfterEnv: ["<rootDir>/spec/test.setup.ts"],
  collectCoverage: true,
  coverageReporters: ["html", "lcov"],
  coverageDirectory: "coverage",
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions?.paths || {}, {
    prefix: "<rootDir>/",
  }),
};
