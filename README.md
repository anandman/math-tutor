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
- Bakery story problems with fun characters
- Timed orders with patience bar
- Hint system: wrong answer gives a hint + second chance
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

Run the arithmetic, input-validation, saved-progress, and prize-shop regression tests with Node.js:

```bash
node --test tests/*.test.cjs
```

Deployed to GitHub Pages — pushes to `main` auto-deploy via `.github/workflows/pages.yml`.
