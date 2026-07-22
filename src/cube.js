/**
 * Minimal 3x3 facelet simulator.
 *
 * Facelet layout follows the standard unfolded net: each face is a 9-element
 * array in row-major order as drawn in the net (U above F, D below F,
 * L-F-R-B left to right). Row 0 of U touches B; row 0 of F touches U, etc.
 *
 * Move tables list cycles of [face, index]; the content of each position
 * moves to the next position in the cycle (clockwise quarter turn).
 */

const FACES = ['U', 'R', 'F', 'D', 'L', 'B']

// Own-face rotation for a clockwise quarter turn in net orientation.
const own = (f) => [
  [[f, 0], [f, 2], [f, 8], [f, 6]],
  [[f, 1], [f, 5], [f, 7], [f, 3]],
]

const BASE_MOVES = {
  U: [
    ...own('U'),
    [['F', 0], ['L', 0], ['B', 0], ['R', 0]],
    [['F', 1], ['L', 1], ['B', 1], ['R', 1]],
    [['F', 2], ['L', 2], ['B', 2], ['R', 2]],
  ],
  D: [
    ...own('D'),
    [['F', 6], ['R', 6], ['B', 6], ['L', 6]],
    [['F', 7], ['R', 7], ['B', 7], ['L', 7]],
    [['F', 8], ['R', 8], ['B', 8], ['L', 8]],
  ],
  R: [
    ...own('R'),
    [['F', 2], ['U', 2], ['B', 6], ['D', 2]],
    [['F', 5], ['U', 5], ['B', 3], ['D', 5]],
    [['F', 8], ['U', 8], ['B', 0], ['D', 8]],
  ],
  L: [
    ...own('L'),
    [['F', 0], ['D', 0], ['B', 8], ['U', 0]],
    [['F', 3], ['D', 3], ['B', 5], ['U', 3]],
    [['F', 6], ['D', 6], ['B', 2], ['U', 6]],
  ],
  F: [
    ...own('F'),
    [['U', 6], ['R', 0], ['D', 2], ['L', 8]],
    [['U', 7], ['R', 3], ['D', 1], ['L', 5]],
    [['U', 8], ['R', 6], ['D', 0], ['L', 2]],
  ],
  B: [
    ...own('B'),
    [['U', 0], ['L', 6], ['D', 8], ['R', 2]],
    [['U', 1], ['L', 3], ['D', 7], ['R', 5]],
    [['U', 2], ['L', 0], ['D', 6], ['R', 8]],
  ],
  // Slices: M follows L, E follows D, S follows F.
  M: [
    [['F', 1], ['D', 1], ['B', 7], ['U', 1]],
    [['F', 4], ['D', 4], ['B', 4], ['U', 4]],
    [['F', 7], ['D', 7], ['B', 1], ['U', 7]],
  ],
  E: [
    [['F', 3], ['R', 3], ['B', 3], ['L', 3]],
    [['F', 4], ['R', 4], ['B', 4], ['L', 4]],
    [['F', 5], ['R', 5], ['B', 5], ['L', 5]],
  ],
  S: [
    [['U', 3], ['R', 1], ['D', 5], ['L', 7]],
    [['L', 1], ['U', 5], ['R', 7], ['D', 3]],
    [['U', 4], ['R', 4], ['D', 4], ['L', 4]],
  ],
}

// Wide moves and rotations as sequences of [base, quarter-turns].
const COMPOSED = {
  r: [['R', 1], ['M', 3]],
  l: [['L', 1], ['M', 1]],
  u: [['U', 1], ['E', 3]],
  d: [['D', 1], ['E', 1]],
  f: [['F', 1], ['S', 1]],
  b: [['B', 1], ['S', 3]],
  x: [['R', 1], ['M', 3], ['L', 3]],
  y: [['U', 1], ['E', 3], ['D', 3]],
  z: [['F', 1], ['S', 1], ['B', 3]],
}

export function solvedCube() {
  const cube = {}
  for (const f of FACES) cube[f] = Array(9).fill(f)
  return cube
}

function applyBase(cube, base) {
  for (const cycle of BASE_MOVES[base]) {
    const last = cycle[cycle.length - 1]
    let carry = cube[last[0]][last[1]]
    for (const [face, idx] of cycle) {
      const tmp = cube[face][idx]
      cube[face][idx] = carry
      carry = tmp
    }
  }
}

function applyBaseTimes(cube, base, times) {
  for (let i = 0; i < ((times % 4) + 4) % 4; i++) applyBase(cube, base)
}

const TOKEN_RE = /^([UDLRFB]w|[UDLRFBMES]|[xyzrludfb])(2'|2|')?$/

export function parseAlg(alg) {
  return alg
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const match = TOKEN_RE.exec(token)
      if (!match) throw new Error(`Bad move token: "${token}"`)
      let base = match[1]
      if (base.endsWith('w')) base = base[0].toLowerCase()
      const suffix = match[2] ?? ''
      const times = suffix === '2' || suffix === "2'" ? 2 : suffix === "'" ? 3 : 1
      return { base, times }
    })
}

export function applyAlg(cube, alg) {
  for (const { base, times } of parseAlg(alg)) {
    if (BASE_MOVES[base]) {
      applyBaseTimes(cube, base, times)
    } else {
      for (let i = 0; i < times; i++) {
        for (const [b, t] of COMPOSED[base]) applyBaseTimes(cube, b, t)
      }
    }
  }
  return cube
}

export function invertAlg(alg) {
  return parseAlg(alg)
    .reverse()
    .map(({ base, times }) => {
      const inv = (4 - times) % 4
      return base + (inv === 2 ? '2' : inv === 3 ? "'" : '')
    })
    .join(' ')
}

/** State the cube must be in for `alg` to solve it. */
export function caseState(alg) {
  return applyAlg(solvedCube(), invertAlg(alg))
}

const faceUniform = (cube, f) => cube[f].every((s) => s === cube[f][4])

/** Solved up to whole-cube rotation. */
export function isSolved(cube) {
  return FACES.every((f) => faceUniform(cube, f))
}

/** First two layers intact (relative to centers), any last layer state. */
export function isF2LSolved(cube) {
  if (!faceUniform(cube, 'D')) return false
  return ['F', 'R', 'B', 'L'].every((f) =>
    [3, 4, 5, 6, 7, 8].every((i) => cube[f][i] === cube[f][4]),
  )
}

export function isTopOriented(cube) {
  return faceUniform(cube, 'U')
}
