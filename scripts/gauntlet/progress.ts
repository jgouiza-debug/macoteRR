/**
 * The gauntlet's ledger and progress page.
 *
 *   tsx scripts/gauntlet/progress.ts record --piece=O1 --round=1 --pick=ours|bar --gap="…" [--violations="a|b"] [--out=DIR]
 *   tsx scripts/gauntlet/progress.ts status --piece=O1 --status=won|parked|descoped|running|pending [--note="…"]
 *   tsx scripts/gauntlet/progress.ts render [--out=DIR]      → out/progress/index.html
 *
 * The page embeds the latest round's phone shots (ours and bar) per piece so it stands alone as
 * an Artifact. The soft cap of 6 rounds is stated on the page: a deliberate deviation from the
 * skill's "never a fixed round count", chosen so an unattended loop cannot burn the whole budget
 * on one piece; the user, not the loop, calls for more rounds on a parked piece.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PIECES } from "./pieces";
import { defaultOut, parseFlags } from "./common";

type Round = { n: number; pick: "ours" | "bar" | null; gap: string; violations: string[]; at: string; ours?: string; bar?: string };
type PieceState = { status: "pending" | "running" | "won" | "parked" | "descoped" | "checklist-pass" | "checklist-fail"; note?: string; rounds: Round[] };
type State = { pieces: Record<string, PieceState>; updatedAt: string };

function statePath(out: string) {
  return path.join(out, "state.json");
}
function load(out: string): State {
  const p = statePath(out);
  if (!existsSync(p)) return { pieces: {}, updatedAt: new Date().toISOString() };
  return JSON.parse(readFileSync(p, "utf8")) as State;
}
function save(out: string, state: State) {
  mkdirSync(out, { recursive: true });
  state.updatedAt = new Date().toISOString();
  writeFileSync(statePath(out), JSON.stringify(state, null, 2));
}
function pieceState(state: State, id: string): PieceState {
  return (state.pieces[id] ??= { status: "pending", rounds: [] });
}

function dataUri(file: string | undefined): string | null {
  if (!file || !existsSync(file)) return null;
  const ext = path.extname(file).toLowerCase() === ".png" ? "png" : "jpeg";
  return `data:image/${ext};base64,${readFileSync(file).toString("base64")}`;
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function render(out: string) {
  const state = load(out);
  const rows: string[] = [];
  const cards: string[] = [];
  const counts = { won: 0, parked: 0, descoped: 0, running: 0, pending: 0, checklist: 0 };
  for (const piece of PIECES) {
    const ps = pieceState(state, piece.id);
    const last = ps.rounds[ps.rounds.length - 1];
    const status = ps.status;
    if (status === "won") counts.won++;
    else if (status === "parked") counts.parked++;
    else if (status === "descoped") counts.descoped++;
    else if (status === "running") counts.running++;
    else if (status.startsWith("checklist")) counts.checklist++;
    else counts.pending++;
    rows.push(
      `<tr><td><b>${piece.id}</b></td><td>${esc(piece.title)}</td><td>${esc(piece.bar)}</td><td class="s-${status}">${status}</td><td>${ps.rounds.length}</td><td>${esc(last?.gap ?? "")}</td><td>${(last?.violations ?? []).map(esc).join("<br>")}</td></tr>`,
    );
    const ours = dataUri(last?.ours);
    const bar = dataUri(last?.bar);
    const history = ps.rounds.map((r) => `<li>r${r.n}: <b>${r.pick ?? "—"}</b> — ${esc(r.gap)}${r.violations.length ? ` <span class="viol">[${r.violations.map(esc).join("; ")}]</span>` : ""}</li>`).join("");
    cards.push(`<section class="card"><h3>${piece.id} · ${esc(piece.title)} <span class="s-${status}">${status}</span></h3>
<p class="win"><b>Wins only if:</b> ${esc(piece.win)}</p>${ps.note ? `<p class="note">${esc(ps.note)}</p>` : ""}
<div class="pair">${ours ? `<figure><img src="${ours}" alt="ours"><figcaption>ours (r${last?.n})</figcaption></figure>` : "<figure class='empty'>ours: not captured</figure>"}${bar ? `<figure><img src="${bar}" alt="bar"><figcaption>bar: ${esc(piece.bar)}</figcaption></figure>` : "<figure class='empty'>bar: not captured</figure>"}</div>
<ol class="history">${history}</ol></section>`);
  }
  const html = `<title>MaCote gauntlet</title>
<style>
:root{--ink:#1a1a1a;--paper:#fff;--chalk:#f6f4ef;--moss:#3d6b4f;--ember:#b4432c;--ultra:#2b3ea8;color-scheme:light}
body{background:var(--chalk);color:var(--ink);font:14px/1.45 system-ui,sans-serif;margin:0;padding:24px}
h1{font-size:22px;margin:0 0 4px}h3{font-size:15px;margin:0 0 6px}
.summary{display:flex;gap:14px;flex-wrap:wrap;margin:10px 0 18px}.summary span{background:var(--paper);border:1px solid #ddd;border-radius:999px;padding:4px 12px}
table{border-collapse:collapse;width:100%;background:var(--paper);font-size:13px}th,td{border-bottom:1px solid #e6e2d8;padding:6px 8px;text-align:left;vertical-align:top}
.s-won{color:var(--moss);font-weight:700}.s-parked{color:var(--ember);font-weight:700}.s-descoped,.s-pending{color:#777}.s-running{color:var(--ultra);font-weight:700}.s-checklist-pass{color:var(--moss)}.s-checklist-fail{color:var(--ember)}
.card{background:var(--paper);border:1px solid #e6e2d8;border-radius:12px;padding:14px;margin:14px 0}
.pair{display:flex;gap:12px;flex-wrap:wrap}.pair figure{margin:0;flex:1 1 280px;max-width:420px}.pair img{width:100%;border:1px solid #ddd;border-radius:8px}.pair figcaption{font-size:12px;color:#555;margin-top:4px}.pair .empty{color:#999;font-size:12px}
.win{font-size:13px;color:#444}.note{font-size:13px;color:var(--ember)}.history{font-size:12.5px;color:#333}.viol{color:var(--ember)}
.dev{font-size:12px;color:#666;margin:6px 0 14px}
</style>
<h1>MaCote gauntlet loop — bar: Duolingo web</h1>
<p class="dev">Builder + separate blind critic per piece; a piece is done only on a blind win with zero guardrail violations. <b>Deliberate deviation from the skill:</b> a soft cap of 6 rounds per piece, after which it is parked and the user calls for more rounds. Updated ${esc(state.updatedAt)}.</p>
<div class="summary"><span>won ${counts.won}</span><span>parked ${counts.parked}</span><span>running ${counts.running}</span><span>pending ${counts.pending}</span><span>descoped ${counts.descoped}</span><span>checklist ${counts.checklist}</span></div>
<div style="overflow-x:auto"><table><thead><tr><th>#</th><th>Piece</th><th>Duolingo bar</th><th>Status</th><th>Rounds</th><th>Latest gap</th><th>Violations</th></tr></thead><tbody>${rows.join("")}</tbody></table></div>
${cards.join("\n")}`;
  const dir = path.join(out, "progress");
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "index.html"), html);
  console.log(`${path.join(dir, "index.html")} (${(html.length / 1024 / 1024).toFixed(1)} MB)`);
}

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const flags = parseFlags(rest);
  const out = flags.out ?? defaultOut();
  const state = load(out);
  if (cmd === "record") {
    const ps = pieceState(state, flags.piece!);
    const n = Number(flags.round);
    const pick = flags.pick === "ours" || flags.pick === "bar" ? flags.pick : null;
    const round: Round = { n, pick, gap: flags.gap ?? "", violations: (flags.violations ?? "").split("|").filter(Boolean), at: new Date().toISOString(), ours: flags.ours, bar: flags.bar };
    ps.rounds = [...ps.rounds.filter((r) => r.n !== n), round].sort((a, b) => a.n - b.n);
    if (ps.status === "pending") ps.status = "running";
    save(out, state);
    console.log(`${flags.piece} r${n}: ${pick ?? "—"} — ${round.gap}`);
  } else if (cmd === "status") {
    const ps = pieceState(state, flags.piece!);
    ps.status = flags.status as PieceState["status"];
    if (flags.note !== undefined) ps.note = flags.note;
    save(out, state);
    console.log(`${flags.piece}: ${ps.status}`);
  } else if (cmd === "render") {
    render(out);
  } else {
    console.error("usage: progress.ts record|status|render …");
    process.exit(2);
  }
}

main();
