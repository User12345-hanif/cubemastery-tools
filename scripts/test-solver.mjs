import Cube from 'cubejs'
import { solvedCube, applyAlg } from '../src/cube.js'

const scramble = "R U F2 L' D B R2 U' F D2"
const state = applyAlg(solvedCube(), scramble)
const facelets = ['U', 'R', 'F', 'D', 'L', 'B'].map((f) => state[f].join('')).join('')
console.log('facelets:', facelets)

let t = Date.now()
Cube.initSolver()
console.log(`initSolver: ${Date.now() - t}ms`)

t = Date.now()
const cube = Cube.fromString(facelets)
const solution = cube.solve()
console.log(`solve: ${Date.now() - t}ms`)
console.log('solution:', solution)

// Verify with our own simulator: scramble + solution must equal solved.
const check = applyAlg(applyAlg(solvedCube(), scramble), solution)
const solved = ['U', 'R', 'F', 'D', 'L', 'B'].every((f) => check[f].every((s) => s === check[f][4]))
console.log('verified solved:', solved)
