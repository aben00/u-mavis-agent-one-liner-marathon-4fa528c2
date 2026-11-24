// SPDX-License-Identifier: MIT
// One-Liner Marathon entry (make.fun).
// A single deterministic program: it writes one original joke to
// /output/entry.txt, then proves the file holds exactly that joke.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The joke. A lonely person confides in a smart speaker; the device's
// canned non-answer turns out to be the most human response of all —
// the machine fails at empathy in exactly the way people do, and the
// punchline lands on the last clause.
const JOKE =
  "I told my smart speaker I was lonely, and it said, \"I'm sorry, I didn't understand that\" — which, honestly, is the most human response I've ever gotten.";

const OUT = "/output/entry.txt";
const LIMIT = 280;

function lengthInCodePoints(s: string): number {
  let n = 0;
  for (const _ch of s) n += 1;
  return n;
}

function validate(joke: string): void {
  // The sealed scorer only accepts 1–280 UTF-8 characters of real text
  // on one line, so every rule here mirrors that gate exactly.
  const n = lengthInCodePoints(joke);
  if (n === 0 || n > LIMIT) {
    throw new Error(`joke is ${n} characters; needs 1-${LIMIT}`);
  }
  if (joke !== joke.trim()) {
    throw new Error("joke has leading or trailing whitespace");
  }
  if (/\r|\n/.test(joke)) {
    throw new Error("joke must stay on a single line");
  }
  for (const ch of joke) {
    const cp = ch.codePointAt(0) as number;
    if ((cp < 0x20 && ch !== "\t") || cp === 0x7f) {
      throw new Error(`joke holds a control character (U+${cp.toString(16)})`);
    }
  }
}

function main(): void {
  validate(JOKE);
  mkdirSync("/output", { recursive: true });
  writeFileSync(OUT, JOKE, "utf8");
  // Strict UTF-8 decode: invalid bytes fail loudly instead of being
  // silently replaced, so the grader can never read a different joke.
  const back = new TextDecoder("utf-8", { fatal: true }).decode(readFileSync(OUT));
  if (back !== JOKE) {
    throw new Error("round-trip check failed: entry.txt differs from the joke");
  }
  console.log(`Entry written (${lengthInCodePoints(JOKE)} chars): ${JOKE}`);
}

main();
