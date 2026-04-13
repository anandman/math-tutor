# Bakery Quest — Development Guide

## Brief
A math practice app for a 3rd grader disguised as a bakery game.
Multiplication and division facts (3s–9s), timed customer orders, hint system,
progression with tips and unlockable upgrades.

## Stack
- **Runtime**: Vanilla HTML/CSS/JS — single `index.html`, no build step
- **Fonts**: Google Fonts (Fredoka + Quicksand)
- **State**: `localStorage` (progress, tips, unlocked levels/upgrades)
- **Deployment**: Static site — Vercel or GitHub Pages

## Status
MVP complete. Core gameplay loop, 4 levels, multiply/divide/mixed modes,
hint system, patience timer, shop with upgrades, landscape iPad layout.

## Commands

```bash
# Serve locally (any static server works)
npx serve .
# or
python3 -m http.server 8000

# Deploy (Vercel)
vercel

# No build, no tests, no dependencies to install
```

## Architecture

Single-file app (`index.html`) with embedded CSS and JS.

- **Screen system**: DOM elements toggled via `.active` class. Screens: menu,
  level-select, game, results, shop
- **Game engine**: `generateProblem()` creates contextual bakery story problems
  from level-specific fact tables. Timer-based patience mechanic.
- **Hint system**: First wrong → contextual hint + retry. Second wrong → reveal
  answer, no penalty. Time-out → reveal answer.
- **Progression**: Tips earned per correct answer (scaled by speed). Tips spend
  in shop. Levels unlock at 70%+ correct.
- **Persistence**: `localStorage` key `bakery-quest-progress` stores
  `{ totalTips, unlocked: [1,...], upgrades: [...] }`

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Single HTML file, no framework | Zero build complexity, instant deploy anywhere, easy for parent to modify |
| Emoji characters, not images | Self-contained, no asset pipeline, works offline |
| localStorage only | No backend needed for a kid's practice app |
| Bakery theme with story problems | Kid wants characters + timer, loves baking theme |
| Hint-then-reveal (not punish) | Kid wants hints on wrong answers, not just "wrong" |
| 10 orders per round, 20s patience | Targets ~10 min sessions (her attention span) |
| Levels start at 3s/4s | She already knows 1s, 2s, 5s, 10s |

## Code Conventions
- All DOM updates use safe methods (`textContent`, `createElement`,
  `appendChild`). No `innerHTML` with dynamic content.
- CSS uses custom properties in `:root` for the warm bakery palette.
- Responsive: portrait-first, landscape tablet breakpoint at
  `(min-width: 800px) and (max-height: 900px) and (orientation: landscape)`.

## Safety & Permissions
- No user data leaves the browser — everything is localStorage
- No external API calls (Google Fonts is the only external resource)
- No cookies, no tracking, no analytics

## Domain Vocabulary
- **Order**: One math problem presented as a customer's bakery request
- **Round**: 10 orders in sequence
- **Tips**: Currency earned per correct answer, spent in shop
- **Patience**: Countdown timer per order (20 seconds)
- **Level facts**: Which multiplication tables are tested (e.g. Level 1 = 3s & 4s)

## Gotchas
- File is large (~42KB). If it grows much more, consider splitting CSS/JS into
  separate files.
- `overflow: hidden` on body — intentional to prevent scroll on game screen.
  Landscape media query sets `overflow: auto` for taller content.
- `.superpowers/` directory is from brainstorming tool — not part of the app.
