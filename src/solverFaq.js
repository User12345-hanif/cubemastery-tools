// Single source of truth for the solver FAQ: the visible FAQ on the solver
// page (CubeSolver.jsx) and the FAQPage JSON-LD for that route (routeMeta.js).
// Extracted verbatim from CubeSolver.jsx (live main, acdf998) — do not edit
// the wording here without checking both consumers.
export const SOLVER_FAQ = [
  {
    q: "Is this Rubik's Cube solver free?",
    a: 'Yes. The solver is free to use, with no sign-up, no download and no usage limit. It runs entirely in your browser.',
  },
  {
    q: 'Do I need to know cube notation to use the solver?',
    a: 'No. Every move in the solution is explained in plain words, such as "Turn the right face 90° clockwise", so you can follow along without knowing notation.',
  },
  {
    q: 'Does the solver work for 2x2 or 4x4 cubes?',
    a: "No — this solver is for the standard 3x3 Rubik's Cube only. Each face must have exactly 9 stickers of each color.",
  },
  {
    q: 'What if my cube state is impossible?',
    a: 'The solver will tell you the combination of colors is not a solvable cube. Double-check each face against your real cube.',
  },
  {
    q: 'Is my cube data uploaded anywhere?',
    a: 'No. The solver runs in your browser (a web worker on your own device), so the colors you enter never leave your device.',
  },
]

export const SOLVER_FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: SOLVER_FAQ.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}
