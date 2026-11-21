# Bakery Quest

A math practice app with a bakery to make your own. Learn through examples,
interactive tools, and practice; earn tips to decorate and care for Sprinkle.

[Play Bakery Quest](https://anandman.github.io/math-tutor/)

## Three places to explore

- **Math Pathways:** choose Kindergarten through grade 5 freely, then a pathway and skill. Explore
  a worked example, try with guidance, and practice independently. Suggestions
  use recorded practice; they never lock a child into a grade.
- **Bakery Challenges:** ten mixed tasks for opening the bakery, preparing orders,
  or designing the bakery. Each grade has its own mix. Challenge results are
  tracked separately from focused skill practice.
- **My Bakery:** spend earned tips on 23 cosmetic prizes, arrange six display
  spots, change the room, and adopt, dress, play with, or tuck in Sprinkle the cat.

## Math pathways

218 skills span Kindergarten through grade 5, with grade labels as entry points.
Kindergarten offers six relevant pathways; grades 1–5 offer all eight.

| Pathway | Progression from Kindergarten through grade 5 |
|---|---|
| Place Value | Count objects and build teen numbers → tens/ones and hundreds → rounding/arithmetic → places through 1,000,000 → decimals through thousandths and powers of ten |
| Number Strategies | Small addition/subtraction and making ten → equal equations, regrouping and arrays → factors, division and larger arithmetic → expressions and decimal operations |
| Word Problems | Picture stories within ten → varied unknowns and comparisons → multistep plans and remainder interpretation → fractional sharing, recipe operations and reasonableness |
| Time & Money | Begins in grade 1: hours/half hours → minutes, U.S. money and elapsed time → unit conversions → decimal budgets and measurement/time applications |
| Fraction & Decimal Models | Begins in grade 1: halves/quarters → thirds → number lines and equivalence → mixed numbers and hundredths → unlike denominators, fraction products and unit-fraction division |
| Shapes & Space | Names, positions, flat/solid shapes and composition → sides/shares → shape families → lines, angles and symmetry → first-quadrant coordinates and shape hierarchies |
| Measurement | Compare size/weight → repeat units and use rulers → area/perimeter → angles and conversions → volume, missing dimensions and combined prisms |
| Data & Graphs | Sort/count objects → picture charts and bars → scaled graphs → fractional plots → operations on fractional data and coordinate patterns |

Tools include place-value counters and exchanges, clock hands, coin/bill choices,
fraction shading and number lines, polygon construction, symmetry grids,
protractors, rectangle designs, and graph/plot builders. Alternative correct
constructions and equivalent numerical answers are accepted where appropriate.

Every skill has a worked example, guided activity, hints, and a ten-question round.
Eight independent correct answers suggest a next step. Pathway rounds and
challenges begin untimed. An unsuccessful pathway task shows an explanation and
solved model, and waits until the learner chooses to continue.

An optional starting check samples two activities per available grade (10 or 12
questions) and suggests where to begin. It is not a formal assessment and never restricts access.

## Fact & number practice

Available from Math Pathways:

- Addition/subtraction with a missing result, second number, or first number.
  Each form has independent 10 → 20 → 100 progression and reporting.
- Multiplication/division facts in four levels, plus mixed practice.
- Fractions/decimals: compare → add/subtract → multiply/divide, with three levels
  per operation. General fraction-by-fraction division remains an optional extension beyond grade 5.
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

See [Kindergarten–grade 5 coverage](docs/GRADE-COVERAGE.md) for detail and standards sources.

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
