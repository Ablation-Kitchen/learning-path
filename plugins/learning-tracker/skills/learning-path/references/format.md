# Learning Path format

The file is YAML (`.yaml` or `.yml`). The checker and the app accept nothing beyond the fields below: any unknown property is an error.

## Path (top level)

| Field | Required | Value |
|---|---|---|
| `schemaVersion` | yes | Always `1`. |
| `id` | yes | Kebab-case slug, `^[a-z0-9]+(-[a-z0-9]+)*$`. Stable identity: a reloaded file is matched to the learner's runs by it. Also the file name: `<id>.yaml`. |
| `version` | no | Free-form label shown to the learner, e.g. `"2026-11-09"` or `"1.2"`. Quote it. |
| `title` | yes | Path title. |
| `description` | yes | Markdown introduction: how to use the path, assumptions (hours a week, budget), standing advice. Use a `\|` block. |
| `startWeekday` | no | `monday` … `sunday`. The weekday the rhythm assumes day 1 falls on; the start-date picker suggests the next one. |
| `weekRhythm` | no | Exactly 7 labels for the days of a path week, indexed by `(day − 1) mod 7`. `""` = no label (a rest day). Weekday-neutral: `"Study"`, not `"Monday"`. |
| `resources` | no | Core resources used across the whole path: `{ title, url?, note? }`. |
| `blocks` | yes | At least one Block, in day order. |

## Block

| Field | Required | Value |
|---|---|---|
| `title` | yes | e.g. `"Weeks 4–6: The platform layer"`. |
| `goal` | yes | One line, shown beside the Block's days: what the learner can do at the end. |
| `description` | no | Markdown: sub-topics, framing. |
| `tasks` | yes | At least one Task. |

A Block has no stored dates: its range is its earliest `day` through its latest due day (`dueDay`, or `day` when absent).

## Task

| Field | Required | Value |
|---|---|---|
| `id` | yes | Kebab-case, unique across the whole path. See **Ids**. |
| `day` | yes | Integer ≥ 1: the day the Task first appears. |
| `dueDay` | no | Integer ≥ `day`: the last day to work on it; the Task is overdue only after this day. Defaults to `day`. Use it for work spread over several sessions. |
| `kind` | yes | `material`, `exercise`, `checkpoint` or `reflection`. See **Kinds**. |
| `optional` | no | `true` if it can be skipped when falling behind. Optional Tasks don't count towards "required done". Defaults to `false`. |
| `title` | yes | Short. For a checkpoint, the statement itself. |
| `description` | no | Markdown details or instructions (any kind). For a reflection, the prompt. |
| `links` | no | `{ title, url? }` resources for this Task. `url` must start with `http://` or `https://`; leave it out for an offline resource. |
| `noteTemplate` | no | Markdown that pre-fills the Task's Note, e.g. a table to fill in. |

**Order within a day** is the order in the file. Tasks don't need to be sorted by day inside a Block, but keeping them in day order makes the file readable; group them under `# Week n` comments.

## Kinds

- **material**: read, watch or skim. One session at most; a long book gets several Tasks or a `dueDay` span.
- **exercise**: hands-on work that produces something. Usually spans build sessions (`day` → `dueDay`).
- **checkpoint**: a self-assessment the learner ticks when it's true. The title is the statement, first person: `"I can explain why decode is memory-bound"`. Put them at the end of a Block, on or before its last day.
- **reflection**: a prompt to write a Note; the prompt goes in `description`. The weekly review is a reflection.

## Ids

- Meaningful, not positional: `kv-cache-exercise`, not `w03-ex1`. The Task can then move to another day without its id lying.
- **Recurring Tasks** (one copy per week) are the one exception: `<series>-week-<n>`, with `n` the week the copy was written for, e.g. `learnings-week-1` … `learnings-week-17`. Never renumber a copy after it moves.
- When editing a path that's in use, existing ids are frozen. A new Task gets a new id; a removed Task's id is never reused.

## Rules the app enforces

The checker reports each as `rule: message`. A file with any problem is rejected whole.

| Rule | Meaning |
|---|---|
| `yaml-syntax` | The YAML doesn't parse. |
| `schema` | A field is missing, unknown, of the wrong type, or breaks a pattern/enum above. |
| `duplicate-task-id` | Two Tasks share an id. |
| `day-out-of-range` | `day` < 1. |
| `due-before-day` | `dueDay` < `day`. |
| `blocks-overlap` | A Block starts on or before the previous Block's last due day. Blocks are in order and disjoint; gaps between them are fine. A multi-day exercise at the end of a Block counts towards that Block's range. |
| `week-rhythm-length` | `weekRhythm` doesn't have exactly 7 entries. |

`kind` and `startWeekday` are lowercased before checking, so `Material` passes. Comments and formatting never matter to the app.

## Example

A complete, valid two-week path (in a real path, Blocks span several weeks):

```yaml
schemaVersion: 1
id: sql-foundations
version: "2026-11-14"
title: "SQL Foundations in Two Weeks"
startWeekday: monday
weekRhythm: ["Study", "Practice", "Study", "Practice", "Practice", "Review", ""]
description: |
  Two weeks from "I can write a SELECT" to "I can model and query a small app's data".

  **Assumptions:** one hour each weekday plus a Saturday review; PostgreSQL installed locally.
resources:
  - title: "PostgreSQL documentation"
    url: "https://www.postgresql.org/docs/current/"
    note: "The tutorial and the SELECT reference."
blocks:
  - title: "Week 1: Querying"
    goal: "Answer any question about a single schema with joins, grouping and subqueries."
    tasks:
      - id: postgres-tutorial-queries
        day: 1
        kind: material
        title: "Read: the PostgreSQL tutorial, chapter 2 (The SQL Language)"
        links:
          - title: "PostgreSQL tutorial: The SQL Language"
            url: "https://www.postgresql.org/docs/current/tutorial-sql.html"
      - id: sample-db-queries
        day: 2
        dueDay: 5
        kind: exercise
        title: "Answer 20 questions about a sample database"
        description: "Load a sample dataset and write one query per question. Commit the queries."
      - id: joins-and-grouping
        day: 3
        kind: material
        title: "Read: joins and aggregate functions"
      - id: learnings-week-1
        day: 6
        kind: reflection
        title: "Week 1 review"
        description: "Write 3 sentences on what you learned, and one query you're proud of."
      - id: can-write-join-group
        day: 6
        kind: checkpoint
        title: "I can write a query with two joins and a GROUP BY without looking anything up"
  - title: "Week 2: Modelling"
    goal: "Design a normalised schema for a small app and query it."
    tasks:
      - id: normalisation-basics
        day: 8
        kind: material
        title: "Read: normal forms, first to third"
      - id: model-a-booking-app
        day: 9
        dueDay: 12
        kind: exercise
        title: "Design and build the schema for a room-booking app"
        noteTemplate: |
          | Table | Purpose | Key decisions |
          | --- | --- | --- |
          |  |  |  |
      - id: indexes-optional
        day: 10
        kind: material
        optional: true
        title: "Read: how indexes work (B-trees)"
      - id: learnings-week-2
        day: 13
        kind: reflection
        title: "Week 2 review"
        description: "Write 3 sentences on what you learned, and what you'd model differently now."
      - id: can-normalise
        day: 13
        kind: checkpoint
        title: "I can take a messy spreadsheet and turn it into third normal form"
```
