import path from "node:path";

export function parseFlags(argv: string[]): Record<string, string> {
  const flags: Record<string, string> = {};
  for (const arg of argv) {
    const m = /^--([^=]+)(?:=(.*))?$/.exec(arg);
    if (m) flags[m[1]] = m[2] ?? "true";
  }
  return flags;
}

/** Where rounds, pairs and the progress page live: outside the repo unless overridden. */
export function defaultOut(): string {
  return process.env.GAUNTLET_OUT ?? path.resolve(process.cwd(), ".gauntlet");
}
