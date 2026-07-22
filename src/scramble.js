const AXIS = { U: 0, D: 0, R: 1, L: 1, F: 2, B: 2 }

const ALL_FACES = ['U', 'D', 'R', 'L', 'F', 'B']

const outerMoves = (faces) => faces.map((f) => ({ notation: f, axis: AXIS[f] }))
const wideMoves = (faces) => faces.map((f) => ({ notation: `${f}w`, axis: AXIS[f] }))

export const PUZZLES = {
  '2x2': {
    id: '2x2',
    label: '2\u00d72',
    name: '2\u00d72\u00d72',
    length: 10,
    moves: outerMoves(['R', 'U', 'F']),
  },
  '3x3': {
    id: '3x3',
    label: '3\u00d73',
    name: '3\u00d73\u00d73',
    length: 20,
    moves: outerMoves(ALL_FACES),
  },
  '4x4': {
    id: '4x4',
    label: '4\u00d74',
    name: '4\u00d74\u00d74',
    length: 44,
    moves: [...outerMoves(ALL_FACES), ...wideMoves(['R', 'U', 'F'])],
  },
  '5x5': {
    id: '5x5',
    label: '5\u00d75',
    name: '5\u00d75\u00d75',
    length: 60,
    moves: [...outerMoves(ALL_FACES), ...wideMoves(ALL_FACES)],
  },
}

export const PUZZLE_IDS = Object.keys(PUZZLES)

const MODIFIERS = ['', "'", '2']

/**
 * WCA-style random-move scramble.
 *
 * Rules enforced:
 * - No two consecutive moves of the same layer (e.g. "R R'" or "Rw Rw2").
 * - Within a run of consecutive moves on the same axis, a layer may not
 *   repeat (prevents redundant sequences like "R L R" or "Rw R Rw").
 */
export function generateScramble(puzzleId) {
  const { length, moves } = PUZZLES[puzzleId]
  const scramble = []
  let runAxis = null
  let runLayers = []

  while (scramble.length < length) {
    const move = moves[Math.floor(Math.random() * moves.length)]

    if (move.axis === runAxis) {
      if (runLayers.includes(move.notation)) continue
    } else {
      runAxis = move.axis
      runLayers = []
    }

    runLayers.push(move.notation)
    const modifier = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)]
    scramble.push(move.notation + modifier)
  }

  return scramble
}
