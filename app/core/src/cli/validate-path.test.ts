import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { SKILL_VALIDATOR, bundleSkillValidator } from "../../scripts/build-skill-validator.js";
import { checkPath } from "./validate-path.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE = path.resolve(here, "../../../paths/eval-infra-17-weeks.yaml");
const SKILL_DIR = path.dirname(path.dirname(SKILL_VALIDATOR));

const run = (file: string) =>
  spawnSync(process.execPath, [SKILL_VALIDATOR, file], { encoding: "utf8" });

describe("the learning-path skill validator", () => {
  it("is the current bundle of the app's loader (rerun npm run build:skill-validator)", async () => {
    expect(readFileSync(SKILL_VALIDATOR, "utf8")).toBe(await bundleSkillValidator());
  }, 30_000);

  it("accepts the sample path and prints its summary", () => {
    const r = run(SAMPLE);
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toContain("eval-infra-17-weeks.yaml: VALID");
    expect(r.stdout).toContain("6 blocks · 123 tasks · 118 days (17 weeks)");
  });

  it("rejects a broken file with located problems and exit code 1", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "lp-"));
    const file = path.join(dir, "broken.yaml");
    writeFileSync(
      file,
      [
        "schemaVersion: 1",
        "id: broken",
        "title: t",
        "description: d",
        "blocks:",
        "  - title: b",
        "    goal: g",
        "    tasks:",
        "      - { id: a, day: 3, dueDay: 2, kind: material, title: x }",
        "      - { id: a, day: 4, kind: exercise, title: y }",
      ].join("\n"),
    );
    const r = run(file);
    expect(r.status).toBe(1);
    expect(r.stdout).toContain("broken.yaml: INVALID, 2 problems");
    expect(r.stdout).toMatch(/broken\.yaml:9:\d+ \/blocks\/0\/tasks\/0\/dueDay {2}due-before-day/);
    expect(r.stdout).toMatch(/broken\.yaml:10:\d+ \/blocks\/0\/tasks\/1\/id {2}duplicate-task-id/);
  });

  it("the worked example in references/format.md is valid", () => {
    const md = readFileSync(path.join(SKILL_DIR, "references/format.md"), "utf8");
    const yaml = /```yaml\n([\s\S]*?)```/.exec(md)![1]!;
    const report = checkPath(yaml, "example.yaml");
    expect(report.text).toContain("example.yaml: VALID");
    expect(report.ok).toBe(true);
  });

  it("warns about a Task on a rest day and a week without Tasks", () => {
    const yaml = [
      "schemaVersion: 1",
      "id: gaps",
      "title: t",
      "description: d",
      'weekRhythm: ["Study", "", "", "", "", "", ""]',
      "blocks:",
      "  - title: b",
      "    goal: g",
      "    tasks:",
      "      - { id: a, day: 1, kind: material, title: x }",
      "      - { id: b, day: 16, kind: material, title: y }",
    ].join("\n");
    const report = checkPath(yaml, "gaps.yaml");
    expect(report.ok).toBe(true);
    expect(report.text).toContain('task "b" starts on day 16, a rest day in weekRhythm');
    expect(report.text).toContain("week 2 has no tasks starting in it");
  });
});
