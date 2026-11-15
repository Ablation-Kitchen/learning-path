/**
 * The Learning Path check shipped inside the `learning-path` skill (plugins/learning-tracker/skills/learning-path/).
 * It runs the app's own loading pipeline (`loadPath`), so a file it accepts is a file the app
 * accepts, and adds a per-week pacing table for the author to review.
 *
 * Bundled into one dependency-free file by `npm run build:skill-validator`; see
 * scripts/build-skill-validator.ts.
 */
import { blockRange, dueDayOf, pathLength } from "../path/helpers.js";
import { loadPath } from "../path/load.js";
import type { Issue, LearningPath, TaskKind } from "../path/types.js";

export interface Report {
  ok: boolean;
  text: string;
}

const KINDS: TaskKind[] = ["material", "exercise", "checkpoint", "reflection"];

export function checkPath(text: string, filename: string): Report {
  const source = /\.json$/i.test(filename) ? "json" : "yaml";
  const result = loadPath(text, { source });
  if (!result.ok) {
    const lines = result.issues.map((i) => `  ${where(filename, i)}  ${i.rule}: ${i.message}`);
    const n = result.issues.length;
    return {
      ok: false,
      text: [`${filename}: INVALID, ${n} problem${n === 1 ? "" : "s"}`, ...lines].join("\n"),
    };
  }
  return { ok: true, text: summary(result.path, filename, result.hash) };
}

function where(filename: string, i: Issue): string {
  if (i.line === undefined) return `${filename} ${i.pointer || "/"}`;
  return `${filename}:${i.line}:${i.column ?? 1} ${i.pointer || "/"}`;
}

function summary(path: LearningPath, filename: string, hash: string): string {
  const tasks = path.blocks.flatMap((b, blockIndex) =>
    b.tasks.map((task) => ({ task, blockIndex })),
  );
  const days = pathLength(path);
  const weeks = Math.ceil(days / 7);
  const out = [
    `${filename}: VALID`,
    `  "${path.title}" (id ${path.id})`,
    `  ${path.blocks.length} blocks · ${tasks.length} tasks · ${days} days (${weeks} weeks)` +
      (path.startWeekday ? ` · designed to start on a ${path.startWeekday}` : ""),
    `  hash ${hash.slice(0, 12)}`,
    "",
    "  blocks",
    ...path.blocks.map((b, i) => {
      const r = blockRange(b);
      return `  ${String(i + 1).padStart(2)}  days ${r.first}–${r.last}  ${b.tasks.length} tasks  ${b.title}`;
    }),
  ];
  const rows = [["week", "days", "tasks", ...KINDS, "optional", "multi-day"]];
  for (let w = 1; w <= weeks; w++) {
    const inWeek = tasks.filter(({ task }) => Math.ceil(task.day / 7) === w);
    rows.push([
      String(w),
      `${7 * w - 6}–${7 * w}`,
      String(inWeek.length),
      ...KINDS.map((k) => String(inWeek.filter(({ task }) => task.kind === k).length)),
      String(inWeek.filter(({ task }) => task.optional).length),
      String(inWeek.filter(({ task }) => dueDayOf(task) > task.day).length),
    ]);
  }
  out.push("", ...table(rows));

  const warnings: string[] = [];
  if (path.weekRhythm?.length === 7) {
    for (const { task } of tasks) {
      if (path.weekRhythm[(task.day - 1) % 7] === "") {
        warnings.push(`task "${task.id}" starts on day ${task.day}, a rest day in weekRhythm`);
      }
    }
  }
  for (let w = 1; w <= weeks; w++) {
    if (!tasks.some(({ task }) => Math.ceil(task.day / 7) === w)) {
      warnings.push(`week ${w} has no tasks starting in it`);
    }
  }
  if (warnings.length > 0) out.push("", "  warnings (allowed, but check they're intended)");
  out.push(...warnings.map((w) => `  - ${w}`));
  return out.join("\n");
}

/** Left-aligned columns, two spaces apart, each as wide as its widest cell. */
function table(rows: string[][]): string[] {
  const widths = rows[0]!.map((_, c) => Math.max(...rows.map((r) => r[c]!.length)));
  return rows.map((r) => `  ${r.map((cell, c) => cell.padEnd(widths[c]!)).join("  ")}`.trimEnd());
}
