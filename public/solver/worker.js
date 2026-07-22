/* Classic worker: cubejs's lib files attach a global `Cube` when loaded
   via importScripts, avoiding ESM/CJS interop issues entirely. */
/* global importScripts, Cube */
importScripts('cube.js', 'solve.js')

self.postMessage({ type: 'loaded' })

// Pruning-table generation takes a few seconds; running it here keeps the
// main thread responsive. Messages sent meanwhile are queued until done.
Cube.initSolver()

self.onmessage = function (event) {
  var id = event.data.id
  try {
    var cube = Cube.fromString(event.data.facelets)
    var solution = cube.solve()
    if (typeof solution !== 'string') throw new Error('No solution found')
    self.postMessage({ id: id, solution: solution.trim() })
  } catch (err) {
    self.postMessage({ id: id, error: (err && err.message) || 'This cube state is not solvable.' })
  }
}

self.postMessage({ type: 'ready' })
