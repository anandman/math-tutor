# Bakery Quest

A math practice app for kids, themed as a bakery game. Practice whole-number
arithmetic, decimals, and fractions through timed customer orders.

Serves customers, earns tips, unlocks upgrades.

## Features

- Addition & subtraction: levels within 10, 20, and 100, with no negative answers
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
- Progress saved in browser (localStorage)
- Works on iPad landscape and mobile

## Development

```bash
# Serve locally
npx serve .
```

No build step or app dependencies. Just a single `index.html`.

Run the arithmetic, visual-pathway, input-validation, saved-progress, round, and prize-shop tests with Node.js:

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
