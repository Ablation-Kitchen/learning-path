/** Entry point of the bundled skill validator: `node validate.mjs <file>...`. */
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { checkPath } from "../src/cli/validate-path.js";

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("usage: node validate.mjs <path-file.yaml> [more files...]");
  process.exit(2);
}
let allValid = true;
for (const file of files) {
  let text: string;
  try {
    text = readFileSync(file, "utf8");
  } catch (e) {
    console.error(`${file}: cannot read (${(e as Error).message})`);
    allValid = false;
    continue;
  }
  const report = checkPath(text, basename(file));
  console.log(report.text);
  allValid &&= report.ok;
}
process.exit(allValid ? 0 : 1);
