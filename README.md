# Bakery Quest

A math practice app for kids, themed as a bakery game. Practice whole-number
arithmetic, decimals, and fractions through timed customer orders.

Serves customers, earns tips, unlocks upgrades.

## Features

- Addition & subtraction: levels within 10, 20, and 100, with no negative answers
- Choose a missing result, second number, or first number, with matching stories and hints
- Each equation form has its own 10 → 20 → 100 unlocks, adaptive practice, and report entries
- Multiplication & division: four levels of fact practice
- Decimals & fractions: compare first, then add/subtract, then multiply/divide
- Topic and skill pickers, with three increasingly challenging levels per new skill
- Every skill starts unlocked; score 7/10 to unlock its next level
- Decimal and fraction keypad entry, with equivalent fraction answers accepted
- Shapes & Space, Measurement, and Data & Graphs: 38 visual skills across grades 1–4
- Jump into any grade/skill, or take an optional eight-question starting-point check
- Worked examples, guided tries, on-demand hints, and hands-on bar-graph building
- Per-skill progress and next-step suggestions based on independent answers
- Visual pathways begin untimed; existing arithmetic timing preferences are preserved
- Bakery story problems with fun characters
- Choose 20, 40, or 60 seconds per order, or practice with no timer
- Prominent Home button during rounds; leaving keeps tips already earned
- Hint system: wrong answer gives a hint + second chance
- Timeouts do not count as incorrect answers in adaptive fact practice
- 23 collectible prizes: shelf decorations, room colors, a cat, and pet accessories
- Arrange six display spots, swap decorations, or put them away for later
- Adopt Sprinkle the cat, dress it up, play with its toys, and tuck it in for a nap
- All prizes are cosmetic; arranging and playing are free, with purchases saved
- My Report Card shows only practiced math topics and skills, with activity grade labels
- Independent answers, helped answers, review needs, and timeouts shown separately
- Parent-friendly next steps, recent practice comparisons, and print/PDF or text export
- Earlier practice retained separately when detailed help/timing records are unavailable
- Progress saved in browser (localStorage)
- Works on iPad landscape and mobile

## Development

```bash
# Serve locally
npx serve .
```

No build step or app dependencies. Just a single `index.html`.

Run the arithmetic, visual-pathway, input-validation, saved-progress, report-card, round, and prize-shop tests with Node.js:

```bash
node --test tests/*.test.cjs
```

Deployed to GitHub Pages — pushes to `main` auto-deploy via `.github/workflows/pages.yml`.

## Visual learning pathways

Choose a topic, a grade, then a skill. Every grade is accessible immediately.
Each skill offers a worked example, an optional guided try, and a ten-order round.
Eight independent correct answers suggest moving forward; hints and time do not
block access to other grades. Progress and rewards stay on the current device.

| Path | Foundations / Grade 1 | Grade 2 | Grade 3 | Grade 4 |
|---|---|---|---|---|
| Shapes & Space | Shape names, composing shapes, fair shares | Sides/corners, solids, equal shares, tiled trays | Shape families and fractions of shapes | Lines, angle types, symmetry |
| Measurement | Compare/order lengths; repeated units | Read rulers, start beyond zero, choose units | Area, perimeter, grams/liters | Protractors, unit conversions, missing sides, combined areas |
| Data & Graphs | Picture charts and comparisons | Bar graphs, build a graph, whole-unit line plots | Scaled graphs and fractional line plots | Eighth-unit plots, ranges, total fractional lengths |

The optional starting check samples two skills per grade and suggests a place to
begin; it does not assign a formal assessment level or restrict skill access.
Grade labels organize selected practice skills, not an entire grade curriculum.
Content is guided by the Common Core [grade 2 geometry](https://www.thecorestandards.org/Math/Content/2/G/),
[grade 2 measurement/data](https://www.thecorestandards.org/Math/Content/2/MD/),
[grade 3 measurement/data](https://www.thecorestandards.org/Math/Content/3/MD/),
[grade 4 measurement/data](https://www.thecorestandards.org/Math/Content/4/MD/),
and [grade 4 geometry](https://www.thecorestandards.org/Math/Content/4/G/) standards.

## My Report Card

Open **My Report Card** from the home screen or after a round. Only math topics
and skills actually practiced on that device appear. Untried topics are not
scored, and grade labels describe the activities, not an overall grade placement.

New practice records correct first tries, correct answers after a hint/chart/retry,
questions to review, and timeouts separately. Timeouts do not count as incorrect
answers. Feedback uses recent practice and suggests a next step; small samples
show “Getting started.” This is a practice report, not a school or STAR grade.
The app cannot detect help given outside the app.

Show the report to a parent, use **Print / save PDF**, or **Save text copy**.
Reports stay on the device unless you choose to share a saved copy. Existing
practice is preserved as earlier history; missing help/timing details are not
guessed. Guided examples and the optional starting check are not scored.

Addition and subtraction reports distinguish **Missing result**, **Missing second
number**, and **Missing first number**, then list practiced ranges in numeric
order. Existing addition/subtraction records remain under Missing result; no
credit is transferred to the new forms. Earn 7/10 in a form to unlock its next range.

See [Math coverage and next checks, grades 1–4](docs/GRADE-COVERAGE.md) for the
current practice coverage and recommended additions, with links to the standards.
