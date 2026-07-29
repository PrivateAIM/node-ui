// Sanitize with regex!
const DATA_STORE_NAME_PATTERN = /^[a-zA-Z0-9._~-]+$/;
const UUID_PATTERN =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function isValidDataStoreName(name: string): boolean {
  return DATA_STORE_NAME_PATTERN.test(name) && !UUID_PATTERN.test(name);
}

// Derive a valid default data store name from a project name
export function generateDataStoreName(projectName: string): string {
  const sanitized = projectName
    .trim()
    .replace(/[^a-zA-Z0-9._~-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!sanitized) {
    return "datastore";
  }

  return UUID_PATTERN.test(sanitized) ? `${sanitized}-datastore` : sanitized;
}

// Words for generating pseduo random data store name suggestions
const ADJECTIVES = [
  "able",
  "agile",
  "amber",
  "bold",
  "brave",
  "bright",
  "calm",
  "clever",
  "cosmic",
  "crisp",
  "daring",
  "eager",
  "fancy",
  "gentle",
  "golden",
  "happy",
  "humble",
  "jolly",
  "keen",
  "lively",
  "lucid",
  "mellow",
  "mighty",
  "nimble",
  "noble",
  "polished",
  "proud",
  "quick",
  "quiet",
  "silver",
  "swift",
  "witty"
] as const;

const NOUNS = [
  "badger",
  "bison",
  "crane",
  "dolphin",
  "falcon",
  "finch",
  "fox",
  "gazelle",
  "heron",
  "ibex",
  "jaguar",
  "koala",
  "lemur",
  "lynx",
  "marmot",
  "marten",
  "mole",
  "narwhal",
  "otter",
  "owl",
  "panda",
  "pelican",
  "puffin",
  "quokka",
  "rabbit",
  "raven",
  "salmon",
  "seal",
  "sparrow",
  "tern",
  "walrus",
  "wren"
] as const;

function randomItem(items: readonly string[]): string {
  return items[Math.floor(Math.random() * items.length)]!;
}

const HEX_SUFFIX_LENGTH = 4;

function randomHexSuffix(length: number = HEX_SUFFIX_LENGTH): string {
  return Array.from({ length }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

export function generateRandomDataStoreName(projectName: string): string {
  return `${generateDataStoreName(projectName)}-${randomItem(ADJECTIVES)}-${randomItem(NOUNS)}-${randomHexSuffix()}`;
}
