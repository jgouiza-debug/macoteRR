/**
 * Maps a round's BLIND critic verdicts back to ours/bar with each piece's pair.json and writes
 * them to the ledger (state.json), then re-renders the progress page.
 *
 *   npx tsx scripts/gauntlet/record-verdicts.ts --round=0 --file=verdicts.json [--out=DIR]
 *
 * verdicts.json: { "verdicts": [{ "id", "pick": "A"|"B", "confidence", "gapA", "gapB",
 *                                  "violationsA": [], "violationsB": [], "notes" }] }
 *
 * A piece is "won" only on a blind pick of ours with zero guardrail violations on our side.
 * After the soft cap (6 rounds) without a win it is "parked" for the user to call more rounds.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { defaultOut, parseFlags } from "./common";
import { load, pieceState, render, save, type Round } from "./progress";

export const SOFT_CAP = 6;

type Verdict = {
  id: string;
  pick: "A" | "B";
  confidence: number;
  gapA: string;
  gapB: string;
  violationsA: string[];
  violationsB: string[];
  notes?: string;
};
type Pair = { a: "ours" | "bar"; b: "ours" | "bar"; files: Record<string, string> };

function main() {
  const flags = parseFlags(process.argv.slice(2));
  const round = Number(flags.round);
  if (!Number.isFinite(round)) throw new Error("--round=N is required");
  if (!flags.file) throw new Error("--file=verdicts.json is required");
  const out = flags.out ?? defaultOut();
  const { verdicts } = JSON.parse(readFileSync(flags.file, "utf8")) as { verdicts: Verdict[] };
  const state = load(out);
  const lines: string[] = [];
  for (const v of verdicts) {
    const pairPath = path.join(out, "rounds", v.id, `r${round}`, "pair", "pair.json");
    if (!existsSync(pairPath)) {
      lines.push(`${v.id}: no pair.json for r${round}, skipped`);
      continue;
    }
    const pair = JSON.parse(readFileSync(pairPath, "utf8")) as Pair;
    const oursLetter = pair.a === "ours" ? "A" : "B";
    const pick: Round["pick"] = v.pick === oursLetter ? "ours" : "bar";
    const gap = oursLetter === "A" ? v.gapA : v.gapB;
    const violations = oursLetter === "A" ? v.violationsA : v.violationsB;
    const barGap = oursLetter === "A" ? v.gapB : v.gapA;
    const ps = pieceState(state, v.id);
    const entry: Round = {
      n: round,
      pick,
      gap: `${gap}${barGap ? ` ‖ bar's gap: ${barGap}` : ""}${v.notes ? ` ‖ ${v.notes}` : ""} (confidence ${v.confidence}/5)`,
      violations,
      at: new Date().toISOString(),
      ours: pair.files[`${oursLetter.toLowerCase()}-phone`],
      bar: pair.files[`${oursLetter === "A" ? "b" : "a"}-phone`],
    };
    ps.rounds = [...ps.rounds.filter((r) => r.n !== round), entry].sort((a, b) => a.n - b.n);
    const won = pick === "ours" && violations.length === 0;
    if (won) ps.status = "won";
    else if (round >= SOFT_CAP) {
      ps.status = "parked";
      ps.note = `soft cap of ${SOFT_CAP} rounds reached without a blind win`;
    } else ps.status = "running";
    lines.push(`${v.id} r${round}: ${pick}${violations.length ? ` (${violations.length} violation${violations.length > 1 ? "s" : ""})` : ""} → ${ps.status}`);
  }
  save(out, state);
  render(out);
  console.log(lines.join("\n"));
}

main();
