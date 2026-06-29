import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
assert.match(html, /url=dashboard\.html/);
assert.match(html, /href="dashboard\.html"/);
console.log("github pages entry: ok");
