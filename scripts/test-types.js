const concurrently = require("concurrently");
const path = require("path");
const fs = require("fs");

function getFiles(dir) {
  results = [];
  fs.readdirSync(dir).forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = getFiles(path.join(__dirname, "..", "libs")).filter((file) => {
  const name = path.basename(file);
  return name === "tsconfig.spec.json";
});

concurrently(
  files.map((file) => ({
    name: path.basename(path.dirname(file)),
    command: `npx tsc --noEmit --project ${file}`,
  })),
);
