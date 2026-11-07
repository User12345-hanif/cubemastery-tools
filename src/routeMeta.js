// Single source of truth for route metadata.
//
// The six entries below are the ONLY place route titles, descriptions and
// JSON-LD are defined. Both consumers read from here:
//   - src/pages/*.jsx call usePageMeta(ROUTE_META[path]) at runtime, so the
//     rendered (client-side) metadata is exactly this data.
//   - scripts/prerender.mjs injects the same data into the prerendered HTML
//     served to crawlers, so raw and rendered metadata can never drift apart.
//
// Titles and descriptions are the verified values from the 7 Nov 2026 audit
// (live bundle, acdf998) — copied verbatim, no new claims. Do not invent
// functionality or keyword claims here.
import { SCRAMBLE_FAQ_JSONLD } from './scrambleFaq.js'
import { SOLVER_FAQ_JSONLD } from './solverFaq.js'

const ORIGIN = 'https://tools.cubemastery.com'

export const ROUTE_META = {
  '/': {
    title: "CubeMastery Tools – Free Speedcubing Tools: Scrambles, Timer & Trainers",
    description:
      "Free online speedcubing tools from CubeMastery: a Rubik's Cube solver, WCA scramble generator, cube timer, OLL and PLL algorithm trainer and pattern generator.",
    path: '/',
  },
  '/cube-solver': {
    title: "Rubik's Cube Solver – Free Online 3x3 Solver | CubeMastery",
    description:
      "Free Rubik's Cube solver online. Paint your scrambled 3x3 cube onto the net and get a short step-by-step solution in your browser — no sign-up, no download.",
    path: '/cube-solver',
    jsonLd: SOLVER_FAQ_JSONLD,
  },
  '/scramble-generator': {
    title: 'CubeMastery Scramble Generator – WCA-Style 2x2, 3x3, 4x4 & 5x5 Scrambles',
    description:
      "Free WCA-style Rubik's Cube scramble generator for 2x2, 3x3, 4x4 and 5x5 with a built-in solve timer and scramble history. Generate and copy competition-quality scrambles instantly.",
    path: '/scramble-generator',
    jsonLd: SCRAMBLE_FAQ_JSONLD,
  },
  '/algorithm-trainer': {
    title: 'CubeMastery Algorithm Trainer – Learn OLL & PLL',
    description:
      'Drill OLL and PLL algorithms with focused practice: pick a case or train at random to build recognition speed and muscle memory for speedcubing.',
    path: '/algorithm-trainer',
  },
  '/cube-timer': {
    title: 'CubeMastery Cube Timer – Speedcubing Timer with Inspection',
    description:
      'Free online speedcubing timer with WCA-style inspection time, scramble display and a session history with averages. Time your Rubik\'s Cube solves right in your browser.',
    path: '/cube-timer',
  },
  '/patterns': {
    title: "CubeMastery Pattern Generator – Rubik's Cube Patterns & Algorithms",
    description:
      'Create classic Rubik\'s Cube patterns — Checkerboard, Superflip, Cube in Cube, Anaconda and more — with the exact algorithm for every pattern.',
    path: '/patterns',
  },
}

export const ROUTE_PATHS = Object.keys(ROUTE_META)

export function canonicalFor(path) {
  return ORIGIN + path
}

export function ogImageFor() {
  // One shared OG image for all tools routes (see Phase 2 of the SEO repair
  // programme — the file must exist at cubemastery.com/og-image.png).
  return 'https://cubemastery.com/og-image.png'
}
