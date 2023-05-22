const { pathsToModuleNameMapper } = require("ts-jest");

const { compilerOptions } = require("./tsconfig");

const sharedConfig = require("../../libs/shared/jest.config.angular");

/** @type {import('jest').Config} */
module.exports = {
  ...sharedConfig,
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["../../apps/web/test.setup.ts"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions?.paths || {}, {
    prefix: "<rootDir>/",
  }),
};
