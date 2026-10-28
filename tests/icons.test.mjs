import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { icon, iconify } from "../src/icons.js";

const textSymbols = /[✳✶✦↗↘↙←→↑↓↵⌕✓○Ⅱ▷×]/u;

test("interface symbols render as accessible decorative vectors, independent of platform fonts", () => {
  const symbols = "✳✶✦↗↘↙←→↑↓↵⌕✓○Ⅱ▷×";
  const rendered = iconify(symbols);
  assert.equal(textSymbols.test(rendered), false);
  assert.equal((rendered.match(/<svg /g) || []).length, [...symbols].length);
  assert.equal(
    (rendered.match(/aria-hidden="true"/g) || []).length,
    [...symbols].length,
  );
  assert.equal(iconify("Иван Kurukin · 2026"), "Иван Kurukin · 2026");
  assert.equal(iconify(rendered), rendered);
  assert.match(icon("pause"), /icon-pause/);
  assert.match(icon("play"), /icon-play/);
});

test("static pages cannot fall back to iOS emoji for interface icons", () => {
  for (const file of [
    "index.html",
    "public/profile.html",
    "public/references.html",
  ]) {
    assert.equal(
      textSymbols.test(
        readFileSync(new URL("../" + file, import.meta.url), "utf8"),
      ),
      false,
      file,
    );
  }
});

test("standalone profile links with decorative icons retain accessible names", () => {
  const html = readFileSync(
    new URL("../public/profile.html", import.meta.url),
    "utf8",
  );
  for (const [, attributes, inner] of html.matchAll(
    /<a\b([^>]*)>([\s\S]*?)<\/a>/g,
  )) {
    const text = inner
      .replace(/<svg\b[\s\S]*?<\/svg>/g, "")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (!text) assert.match(attributes, /aria-label="[^\"]+"/);
  }
});
