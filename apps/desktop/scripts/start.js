/* eslint-disable @typescript-eslint/no-var-requires */
const concurrently = require("concurrently");
const rimraf = require("rimraf");

const args = process.argv.splice(2);

rimraf.sync("build");

concurrently(
  [
    {
      name: "Main",
      command: "npm run build:main:watch",
      prefixColor: "yellow",
    },
    {
      name: "Rend",
      command: "npm run build:renderer:watch",
      prefixColor: "cyan",
    },
    {
      name: "Elec",
      command: `npx wait-on ./build/main.js && npx electron --inspect=5858 ${args.join(
        " "
      )} ./build --watch`,
      prefixColor: "green",
    },
  ],
  {
    prefix: "name",
    outputStream: process.stdout,
    killOthers: ["success", "failure"],
  }
);
