# Bakery Quest

A math practice app with a bakery to make your own. Learn through examples,
interactive tools, and practice; earn tips to decorate and care for Sprinkle.

[Play Bakery Quest](https://anandman.github.io/math-tutor/)

## Three places to explore

- **Math Pathways:** choose grades 1–4 freely, then a pathway and skill. Explore
  a worked example, try with guidance, and practice independently. Suggestions
  use recorded practice; they never lock a child into a grade.
- **Bakery Challenges:** ten mixed tasks for opening the bakery, preparing orders,
  or designing the bakery. Each grade has its own mix. Challenge results are
  tracked separately from focused skill practice.
- **My Bakery:** spend earned tips on 23 cosmetic prizes, arrange six display
  spots, change the room, and adopt, dress, play with, or tuck in Sprinkle the cat.

## Math pathways

145 skills across eight pathways, with grade labels as entry points:

| Pathway | Progression from grade 1 through grade 4 |
|---|---|
| Place Value | Count through 120; tens/ones → hundreds and exchanges → rounding and arithmetic within 1,000 → place values through 1,000,000 |
| Number Strategies | Equal equations and making ten → regrouping, arrays and parity → unknown factors/divisors and partial products → larger arithmetic, remainders, factors and patterns |
| Word Problems | Joining, separating, parts and comparisons → two-step stories and matching equations → both division meanings and two-step plans → multiplicative comparisons, multistep plans and remainder interpretation |
| Time & Money | Hours/half hours → five-minute clocks, a.m./p.m. and U.S. money → minutes and elapsed time → time/unit conversions and multistep money problems |
| Fraction & Decimal Models | Halves/quarters → thirds and equal-area shares → fraction number lines and equivalence → further equivalence, mixed numbers, whole-number multiplication and hundredths |
| Shapes & Space | Names, composition and construction → sides, solids and equal shares → overlapping shape families and quadrilaterals → lines, angles, symmetry and right triangles |
| Measurement | Compare, estimate and repeat units → rulers and number-line lengths → area/perimeter construction → conversions, angle construction and floor designs |
| Data & Graphs | Read/build picture charts → bars and whole-unit plots → scaled graphs and two-step questions → fractional plots and comparing total measurements |

Tools include place-value counters and exchanges, clock hands, coin/bill choices,
fraction shading and number lines, polygon construction, symmetry grids,
protractors, rectangle designs, and graph/plot builders. Alternative correct
constructions and equivalent numerical answers are accepted where appropriate.

Every skill has a worked example, guided activity, hints, and a ten-question round.
Eight independent correct answers suggest a next step. Pathway rounds and
challenges begin untimed. An unsuccessful pathway task shows an explanation and
solved model, and waits until the learner chooses to continue.

An optional eight-question starting check samples a pathway and suggests where
to begin. It is not a formal assessment and never restricts access.

## Fact & number practice

Available from Math Pathways:

- Addition/subtraction with a missing result, second number, or first number.
  Each form has independent 10 → 20 → 100 progression and reporting.
- Multiplication/division facts in four levels, plus mixed practice.
- Fractions/decimals: compare → add/subtract → multiply/divide, with three levels
  per operation. Later operations remain optional extensions beyond grade 4.
- Each track starts available; 7/10 unlocks the next level in that track.
- Choose 20, 40, or 60 seconds, or no timer. Pathways preserve that preference.
- First wrong answer gives a hint and retry. Timeouts are distinct from errors.
- Home is always available during a round; quitting keeps tips already earned.

## My Report Card

Only activities actually attempted on the current device appear. Untried subjects
and skills are not scored. Grade labels describe activities, not a child's overall
placement. The report separates:

- Independent answers, answers with in-app help/retries, review needs and timeouts.
- Focused practice and **Bakery challenge** application entries.
- Worked examples/guided learning, shown as **not scored** activities.
- Earlier history where detailed timing/help information was not recorded.

Guided learning and challenge results do not earn independent pathway readiness.
Parent suggestions use recent answers, with small samples labeled “Getting
started.” The app cannot detect assistance given outside it. Reports describe
practice, not school or STAR grades.

Open the report from Home, Math Pathways, or round results. Use **Print / save PDF**
or **Save text copy** to share it. Reports and all other progress stay on the
current device unless you choose to share a saved copy. No profiles or accounts.

See [Grade 1–4 coverage](docs/GRADE-COVERAGE.md) for detail and standards sources.

## Development

Single `index.html` with embedded CSS/JS, safe DOM/SVG rendering, and localStorage.
No build step or app dependencies. Google Fonts is the only external resource.

```bash
python3 -m http.server 8000
node --test tests/*.test.cjs
```

Tests cover mathematical correctness, model rendering, construction validators,
saved progress, input validation, scoring, reports, challenges, and prizes.
Pushes to `main` deploy to GitHub Pages via `.github/workflows/pages.yml`.
