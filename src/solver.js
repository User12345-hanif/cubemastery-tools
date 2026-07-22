/**
 * Client for the cube solver. Primary path: a classic web worker running
 * cubejs (vendored in public/solver/), so the multi-second pruning-table
 * initialization happens off the main thread. Fallback: if the worker never
 * starts (some embedded browsers), the same scripts are loaded on the main
 * thread via <script> tags.
 */

const BASE = import.meta.env.BASE_URL + 'solver/'
const SOLVE_TIMEOUT_MS = 30000
const WORKER_BEACON_TIMEOUT_MS = 4000

let worker = null
let workerDead = false
let seq = 0
const pending = new Map()
const readyListeners = new Set()
let ready = false
let beaconTimer = null

let CubeMain = null
let mainInitPromise = null

function notifyReady() {
  ready = true
  readyListeners.forEach((fn) => fn())
  readyListeners.clear()
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = resolve
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(script)
  })
}

function ensureMainThreadSolver() {
  if (!mainInitPromise) {
    mainInitPromise = (async () => {
      await loadScript(BASE + 'cube.js')
      await loadScript(BASE + 'solve.js')
      // Yield so the UI can paint before the blocking initialization.
      await new Promise((resolve) => setTimeout(resolve, 80))
      window.Cube.initSolver()
      CubeMain = window.Cube
      notifyReady()
      return CubeMain
    })()
  }
  return mainInitPromise
}

function abandonWorker() {
  if (workerDead) return
  workerDead = true
  worker?.terminate()
  worker = null
  const entries = [...pending.values()]
  pending.clear()
  ensureMainThreadSolver()
  for (const entry of entries) {
    clearTimeout(entry.timeout)
    solveFacelets(entry.facelets).then(entry.resolve, entry.reject)
  }
}

function handleMessage(event) {
  const data = event.data
  if (data?.type === 'loaded') {
    clearTimeout(beaconTimer)
    return
  }
  if (data?.type === 'ready') {
    notifyReady()
    return
  }
  const entry = pending.get(data.id)
  if (!entry) return
  pending.delete(data.id)
  clearTimeout(entry.timeout)
  if (data.error) entry.reject(new Error(data.error))
  else entry.resolve(data.solution)
}

function getWorker() {
  if (workerDead) return null
  if (!worker) {
    try {
      worker = new Worker(BASE + 'worker.js')
    } catch {
      abandonWorker()
      return null
    }
    worker.onmessage = handleMessage
    worker.onerror = abandonWorker
    // If the worker script never even starts, fall back to the main thread.
    beaconTimer = setTimeout(abandonWorker, WORKER_BEACON_TIMEOUT_MS)
  }
  return worker
}

/** Start loading solver tables in the background. */
export function warmUpSolver(onReady) {
  getWorker()
  if (ready) onReady?.()
  else if (onReady) readyListeners.add(onReady)
  return () => readyListeners.delete(onReady)
}

/** Solve a cube given a 54-char Kociemba facelet string (URFDLB order). */
export function solveFacelets(facelets) {
  const w = getWorker()
  if (!w) {
    return ensureMainThreadSolver().then(
      (Cube) =>
        new Promise((resolve, reject) => {
          // Yield so the "Solving..." state can render before the sync search.
          setTimeout(() => {
            try {
              const solution = Cube.fromString(facelets).solve()
              if (typeof solution !== 'string') throw new Error('No solution found')
              resolve(solution.trim())
            } catch (err) {
              reject(err instanceof Error ? err : new Error(String(err)))
            }
          }, 60)
        }),
    )
  }
  const id = ++seq
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pending.delete(id)
      reject(new Error('Solver timed out. Please check your cube colors and try again.'))
      abandonWorker()
    }, SOLVE_TIMEOUT_MS)
    pending.set(id, { resolve, reject, timeout, facelets })
    w.postMessage({ id, facelets })
  })
}
