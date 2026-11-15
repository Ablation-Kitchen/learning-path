# Placement: putting Tasks on days

The app shows each day's Tasks on Today, flags anything past its due day as overdue, and never moves a Task by itself. A path the learner can't keep up with turns into a wall of overdue Tasks, so placement is the core of the work.

## Day arithmetic

Path week `w`, weekday slot `k` (1 = the rhythm's first day, i.e. `startWeekday`):

```
day = 7 × (w − 1) + k
```

Week 1 is days 1–7, week 2 is days 8–14, and so on. With `weekRhythm: ["Study", "Build", "Study", "Build", "Build", "Review", ""]`, slots 1 and 3 are study days, 2, 4 and 5 build days, 6 the review, 7 rest: in week 3, the study days are 15 and 17, the build days 16, 18 and 19, the review 20.

## Rules of thumb

- **Size by session length.** Estimate each Task in minutes (a 45-minute session holds roughly 20 pages of technical reading or one 40-minute talk). The required Tasks starting on a day must fit one session; a longer reading gets its own day or a `dueDay` span over that week's study days.
- **Match the rhythm.** Reading goes on study days, exercises start on build days, reflections and checkpoints go on the review day. Nothing starts on a rest day (the checker warns when something does).
- **Spread exercises with `dueDay`.** An exercise that takes three build sessions starts on the first and is due on the third: `day: 16, dueDay: 19`. It shows as "day 2 of 4 · due fri" in the meantime. Overlapping spans are fine when each runs on different sessions.
- **Respect the session budget.** A week's **load** is: one session per required `material` Task (more if it spans days) + the sessions each required exercise needs that week + one review session (the reflection and that day's checkpoints share it). Keep the load at about 80% of the week's study days, i.e. one free session in a six-session week, so the learner can catch up. A capstone week may run full; say so to the user.
- **Optional Tasks ride on top.** Extra readings and "pick two of four" choices become `optional: true` Tasks; required Tasks alone must still reach the Block's goal. Optional Tasks don't count towards the load and the learner skips them first when behind, so keep them short and put them on lighter days.
- **Weekly review.** One `reflection` per week on the review day, as a recurring series (`learnings-week-n`), so every week ends with a Note.
- **Close each Block with checkpoints.** Two to five first-person statements of the Block's goal, on its last review day. They are how the learner knows the Block is done.
- **Blocks don't overlap.** The next Block's first Task starts after the previous Block's last due day. When a Block ends on a Saturday review, the next starts on Monday of the following week.
- **End on a review.** Each Block, and the path, ends on its last review day. Days after it (a final rest day) stay empty; the path's length is its last due day.

## Converting an existing plan

A plan usually gives topics per week or per group of weeks; the exact days and spans are yours to choose. Keep every item of the source (readings, exercises, checks, advice), put advice that isn't a Task into the path or Block `description`, and tell the user where you made a placement call they might want to change.
