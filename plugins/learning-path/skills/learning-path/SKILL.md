---
name: learning-path
description: Author a Learning Path YAML file for the Learning Tracker app (a study plan of Blocks and Tasks, each Task on an explicit day). Use when asked to create, generate or design a learning path, study plan or curriculum for the tracker; to convert an existing plan, syllabus or course outline into one; or to edit or extend an existing path file.
allowed-tools: Bash(node ${CLAUDE_SKILL_DIR}/scripts/validate.mjs *)
---

# Learning Path authoring

A **Learning Path** is one YAML file the Learning Tracker app loads and turns into a daily tracker: Blocks (multi-week phases with a goal) holding Tasks, each Task placed on an explicit **day** of the run (day 1 = the learner's start date). The app never schedules anything itself, so the **placement** you write is the schedule the learner lives with.

The checker `scripts/validate.mjs` in this skill's folder (`${CLAUDE_SKILL_DIR}/scripts/validate.mjs`) is the app's own loader, bundled: a file it calls VALID is a file the app accepts. It needs only Node 18+.

## Steps

### 1. Brief

Establish these, from the request and any source material first, then by asking the user for what's still missing:

- **Outcome**: what the learner can do at the end, in one sentence.
- **Starting point**: what they already know.
- **Length**: number of weeks.
- **Rhythm**: which days of the week they study, how long a session is, and what each day is for. This becomes `weekRhythm` and `startWeekday`; the session length sizes every Task.
- **Constraints**: budget (paid courses, GPU time), preferred language or tools, materials they already own.
- **Source**: an existing plan to convert, or a path file to edit (read it whole).

Offer a default for anything the user leaves open. For the rhythm: start Monday, one-hour sessions, `["Study", "Build", "Study", "Build", "Build", "Review", ""]` (reading on Monday and Wednesday, hands-on work Tuesday, Thursday and Friday, a Saturday review, Sunday off). Done when every item has a value; restate the brief in a short list, defaults marked as such.

### 2. Outline

Read [`references/format.md`](references/format.md) now: it defines Blocks, the four Task kinds, ids and every rule the app enforces, and shows a worked example.

Draft the Blocks: one per distinct goal, each 2–4 weeks long (a path of four weeks or less may be a single Block). Each **goal** is phrased as a capability ("Be able to explain, with numbers, why…"). Under each Block, list the topic of every week and the hands-on exercise that proves the goal. Show the outline to the user and revise until they approve it; for an edit to an existing path, outline only the change.

### 3. Resources

Choose free or in-budget materials for each week, preferring current ones. **Every `url` you write is one you have opened and confirmed is the resource named**: fetch it with your web tool and check the page shows that resource.

- A section that only renders with JavaScript (an interactive tour, a single-page app) links the nearest page that does show, with the section named in the link title: `"A Tour of Go: Concurrency"` → `https://go.dev/tour/`.
- A page that says it's outdated or unmaintained can still be used; say so in the Task's description.
- A resource you cannot confirm keeps its title and loses its `url`: the app treats a link without a URL as an offline resource (a book, a chapter).

Done when every URL in your notes is confirmed or dropped.

### 4. Write the file

Read [`references/placement.md`](references/placement.md), then write the YAML to [`references/format.md`](references/format.md), putting every Task on a day.

Name the file `<path id>.yaml`. When editing an existing path, every Task id that already exists stays exactly as it is: progress and Notes hang on Task ids, so a renamed id orphans the learner's work.

### 5. Validate

```sh
node ${CLAUDE_SKILL_DIR}/scripts/validate.mjs <file>.yaml
```

- **INVALID**: fix every listed problem (each has `file:line:column`, a JSON Pointer and a rule) and run it again. Schema problems are reported first; the app's own rules (duplicate ids, overlapping Blocks…) appear once the schema passes, so a second round of problems is normal.
- **VALID**: read the summary. The week table counts Tasks *starting* each week, not sessions: a 3-session exercise is one `exercise` and one `multi-day`, and checkpoints share the review session. Check each week against the session budget in placement.md by hand. The checker warns about a Task starting on a rest day (an empty `weekRhythm` label) and a week with no Task starting in it; fix each warning or tell the user why it's intended.

Done when the checker prints VALID and every week fits its session budget.

### 6. Deliver

Save the file where the user asked (or the current folder), then tell them how to load it:

- **Self-hosted app**: copy it into the app's `app/paths/` folder; it appears in the path picker on first run or under **New enrollment** in the app menu.
- **Any instance**: on the same screen, **Choose a .yaml file** uploads it.
- **Edited path already in use**: replacing the file in `app/paths/` makes the app show "The path file has changed — review reload"; the learner previews added, removed and moved Tasks before applying.

Report the summary line from the checker (Blocks, Tasks, days, weeks) and any warning you left in on purpose.
