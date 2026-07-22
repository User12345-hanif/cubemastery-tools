import {
  solvedCube,
  applyAlg,
  invertAlg,
  isSolved,
  isF2LSolved,
  isTopOriented,
} from '../src/cube.js'
import { OLL_CASES, PLL_CASES } from '../src/trainerData.js'

let failures = 0
const fail = (msg) => {
  failures++
  console.error(`FAIL: ${msg}`)
}

// --- Simulator sanity checks ---
const identityChecks = [
  ['R R R R', 'R x4'],
  ['U U U U', 'U x4'],
  ["R U R' U' R U R' U' R U R' U' R U R' U' R U R' U' R U R' U'", 'sexy x6'],
  ['M M M M', 'M x4'],
  ['E E E E', 'E x4'],
  ['S S S S', 'S x4'],
  ['x x x x', 'x x4'],
  ['y y y y', 'y x4'],
  ['z z z z', 'z x4'],
  ["r r' u u' f f' d d' l l' b b'", 'wide cancel'],
]

for (const [alg, label] of identityChecks) {
  const c = applyAlg(solvedCube(), alg)
  if (JSON.stringify(c) !== JSON.stringify(solvedCube())) fail(`${label} not identity`)
}

// z == F S B' as permutation
{
  const a = applyAlg(solvedCube(), 'z')
  const b = applyAlg(solvedCube(), "F S B'")
  if (JSON.stringify(a) !== JSON.stringify(b)) fail('z != F S B\'')
}

// --- Algorithm checks ---
for (const { name, alg } of OLL_CASES) {
  const c = applyAlg(solvedCube(), alg)
  if (!isF2LSolved(c)) fail(`${name}: alg does not preserve F2L (${alg})`)
  const roundtrip = applyAlg(applyAlg(solvedCube(), invertAlg(alg)), alg)
  if (!isSolved(roundtrip)) fail(`${name}: inverse roundtrip broken`)
}

for (const { name, alg } of PLL_CASES) {
  const c = applyAlg(solvedCube(), alg)
  if (!isF2LSolved(c)) fail(`${name}: alg does not preserve F2L (${alg})`)
  if (!isTopOriented(c)) fail(`${name}: alg does not preserve top orientation (${alg})`)
  const roundtrip = applyAlg(applyAlg(solvedCube(), invertAlg(alg)), alg)
  if (!isSolved(roundtrip)) fail(`${name}: inverse roundtrip broken`)
}

if (failures === 0) {
  console.log(`All checks passed: ${OLL_CASES.length} OLL + ${PLL_CASES.length} PLL cases.`)
} else {
  console.error(`${failures} check(s) failed.`)
  process.exit(1)
}
