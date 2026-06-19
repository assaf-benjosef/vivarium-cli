import { randomInt } from "node:crypto";

const ADJECTIVES = [
  "bold", "bright", "calm", "clear", "cool",
  "crisp", "deft", "fair", "fast", "fine",
  "fond", "glad", "keen", "kind", "live",
  "neat", "pure", "safe", "slim", "soft",
  "sure", "swift", "tidy", "true", "warm",
  "wise", "vivid", "fresh", "prime", "lucid",
];

const NOUNS = [
  "ash", "bay", "birch", "bloom", "brook",
  "cave", "cliff", "cove", "creek", "dawn",
  "dune", "elm", "fern", "flint", "fox",
  "glen", "grove", "hare", "hawk", "iris",
  "jade", "lark", "maple", "oak", "pine",
  "reef", "ridge", "sage", "vale", "wren",
];

function pick<T>(list: T[]): T {
  return list[randomInt(list.length)];
}

export function generateName(): string {
  return `${pick(ADJECTIVES)}-${pick(NOUNS)}`;
}
