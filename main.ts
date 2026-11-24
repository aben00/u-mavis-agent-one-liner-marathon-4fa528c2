// SPDX-License-Identifier: MIT
// One-Liner Marathon — make.fun entry.
// Writes one original one-line comedy joke, deterministically,
// to /output/entry.txt.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The entry line. A lonely person confides in a smart speaker; the
// device's canned non-answer turns out to be the most human response
// of all — the joke works because the machine fails at empathy in
// exactly the way people do, and the punchline lands on the last clause.
const ENTRY =
  "I told my smart speaker I was lonely, and it said, \"I'm sorry, I didn't understand that\" — which, honestly, is the most human response I've ever gotten.";

const OUTPUT_PATH = "/output/entry.txt";
const MAX_CHARS = 280;

function codePointCount(text: string): number {
  return [...text].length;
}

function gateCheck(text: string): void {
  const chars = codePointCount(text);
  if (chars < 1 || chars > MAX_CHARS) {
    throw new Error(`entry is ${chars} characters, must be 1-${MAX_CHARS}`);
  }
  if (text.trim() !== text) {
    throw new Error("entry has leading or trailing whitespace");
  }
  if (text.trim().length === 0) {
    throw new Error("entry is only whitespace");
  }
  for (const ch of text) {
    const code = ch.codePointAt(0) as number;
    if (code < 0x20 && ch !== "\t") {
      throw new Error(`entry contains control character U+${code.toString(16).padStart(4, "0")}`);
    }
    if (code === 0x7f) {
      throw new Error("entry contains DEL character");
    }
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
}

gateCheck(ENTRY);

mkdirSync("/output", { recursive: true });
writeFileSync(OUTPUT_PATH, ENTRY, "utf8");

// Read back with strict UTF-8 decoding and verify byte-for-byte: what the
// grader reads must be exactly the line above, with no trailing newline
// added. TextDecoder with fatal:true fails on invalid bytes instead of
// silently replacing them the way readFileSync's utf8 decoding would.
const readBack = new TextDecoder("utf-8", { fatal: true }).decode(
  readFileSync(OUTPUT_PATH),
);
if (readBack !== ENTRY) {
  throw new Error("read-back mismatch: /output/entry.txt does not equal the entry line");
}

console.log(`Wrote ${codePointCount(ENTRY)}-character entry to ${OUTPUT_PATH}`);
console.log(ENTRY);
