import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { generateScramble } from '../scramble'
import { formatTime } from '../format'

const SOLVES_KEY = 'cubemastery-timer-solves'
const INSPECTION_KEY = 'cubemastery-timer-inspection'
const HOLD_MS = 550
const INSPECTION_S = 15
const SOLVES_LIMIT = 200

function loadSolves() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SOLVES_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.slice(0, SOLVES_LIMIT) : []
  } catch {
    return []
  }
}

function loadInspectionPref() {
  try {
    return localStorage.getItem(INSPECTION_KEY) !== 'off'
  } catch {
    return true
  }
}

const effectiveMs = (solve) =>
  solve.penalty === 'DNF' ? Infinity : solve.ms + (solve.penalty === '+2' ? 2000 : 0)

/** WCA average: drop best and worst, mean the rest. Two or more DNFs -> DNF. */
function computeAverage(solves, n) {
  if (solves.length < n) return null
  const times = solves.slice(0, n).map(effectiveMs)
  if (times.filter((t) => !Number.isFinite(t)).length > 1) return Infinity
  const sorted = [...times].sort((a, b) => a - b)
  const middle = sorted.slice(1, n - 1)
  return middle.reduce((sum, t) => sum + t, 0) / middle.length
}

function formatStat(value) {
  if (value === null) return '\u2014'
  if (!Number.isFinite(value)) return 'DNF'
  return formatTime(value)
}

function formatSolve(solve) {
  if (solve.penalty === 'DNF') return 'DNF'
  return formatTime(effectiveMs(solve)) + (solve.penalty === '+2' ? '+' : '')
}

const HINTS = {
  idleInspection: 'Press Space to start inspection',
  idle: 'Hold Space, release when green',
  inspection: 'Inspect the cube \u2014 hold Space, release when green',
  holding: 'Keep holding\u2026',
  ready: 'Release to start!',
  running: 'Press Space to stop',
}

function CubeTimer() {
  const [mode, setMode] = useState('idle')
  const [display, setDisplay] = useState(0)
  const [inspectionLeft, setInspectionLeft] = useState(INSPECTION_S)
  const [solves, setSolves] = useState(loadSolves)
  const [inspectionOn, setInspectionOn] = useState(loadInspectionPref)
  const [scramble, setScramble] = useState(() => generateScramble('3x3').join(' '))

  const startRef = useRef(0)
  const inspectionStart = useRef(0)
  const holdTimeout = useRef(null)
  const cameFromInspection = useRef(false)
  const pendingPenalty = useRef(null)
  const ignoreNextRelease = useRef(false)

  useEffect(() => {
    document.title = 'CubeMastery Cube Timer \u2013 Speedcubing Timer with Inspection'
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(SOLVES_KEY, JSON.stringify(solves))
    } catch {
      // Storage unavailable - history stays in memory
    }
  }, [solves])

  useEffect(() => {
    try {
      localStorage.setItem(INSPECTION_KEY, inspectionOn ? 'on' : 'off')
    } catch {
      // Storage unavailable
    }
  }, [inspectionOn])

  useEffect(() => () => clearTimeout(holdTimeout.current), [])

  useEffect(() => {
    if (mode !== 'running') return undefined
    const id = setInterval(() => setDisplay(Date.now() - startRef.current), 10)
    return () => clearInterval(id)
  }, [mode])

  const inInspectionPhase =
    cameFromInspection.current && (mode === 'inspection' || mode === 'holding' || mode === 'ready')

  useEffect(() => {
    if (!inInspectionPhase) return undefined
    const id = setInterval(
      () => setInspectionLeft(INSPECTION_S - (Date.now() - inspectionStart.current) / 1000),
      100,
    )
    return () => clearInterval(id)
  }, [inInspectionPhase])

  const beginHold = useCallback((fromInspection) => {
    cameFromInspection.current = fromInspection
    setMode('holding')
    clearTimeout(holdTimeout.current)
    holdTimeout.current = setTimeout(() => setMode('ready'), HOLD_MS)
  }, [])

  const pressStart = useCallback(() => {
    if (mode === 'running') {
      const ms = Date.now() - startRef.current
      setDisplay(ms)
      ignoreNextRelease.current = true
      setSolves((prev) =>
        [
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            ms,
            penalty: pendingPenalty.current,
            date: Date.now(),
          },
          ...prev,
        ].slice(0, SOLVES_LIMIT),
      )
      setScramble(generateScramble('3x3').join(' '))
      cameFromInspection.current = false
      setMode('idle')
      return
    }
    if (mode === 'idle' && !inspectionOn) beginHold(false)
    else if (mode === 'inspection') beginHold(true)
    // idle with inspection on: inspection starts on release
  }, [mode, inspectionOn, beginHold])

  const pressEnd = useCallback(() => {
    if (ignoreNextRelease.current) {
      ignoreNextRelease.current = false
      return
    }
    if (mode === 'holding') {
      clearTimeout(holdTimeout.current)
      setMode(cameFromInspection.current ? 'inspection' : 'idle')
      return
    }
    if (mode === 'ready') {
      let penalty = null
      if (cameFromInspection.current) {
        const inspected = (Date.now() - inspectionStart.current) / 1000
        if (inspected > INSPECTION_S + 2) penalty = 'DNF'
        else if (inspected > INSPECTION_S) penalty = '+2'
      }
      pendingPenalty.current = penalty
      startRef.current = Date.now()
      setDisplay(0)
      setMode('running')
      return
    }
    if (mode === 'idle' && inspectionOn) {
      inspectionStart.current = Date.now()
      cameFromInspection.current = true
      setInspectionLeft(INSPECTION_S)
      setMode('inspection')
    }
  }, [mode, inspectionOn])

  useEffect(() => {
    const isTyping = (target) =>
      target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
    const onKeyDown = (event) => {
      if (event.code !== 'Space' || isTyping(event.target)) return
      event.preventDefault()
      if (event.repeat) return
      pressStart()
    }
    const onKeyUp = (event) => {
      if (event.code !== 'Space' || isTyping(event.target)) return
      event.preventDefault()
      pressEnd()
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [pressStart, pressEnd])

  const stats = useMemo(() => {
    const finite = solves.map(effectiveMs).filter(Number.isFinite)
    return {
      ao5: computeAverage(solves, 5),
      ao12: computeAverage(solves, 12),
      best: finite.length > 0 ? Math.min(...finite) : null,
      worst: finite.length > 0 ? Math.max(...finite) : null,
    }
  }, [solves])

  const showInspectionCountdown = mode === 'inspection'
  const overInspection = inspectionLeft <= 0

  let displayText
  if (showInspectionCountdown) {
    if (inspectionLeft <= -2) displayText = 'DNF'
    else if (overInspection) displayText = '+2'
    else displayText = String(Math.ceil(inspectionLeft))
  } else {
    displayText = formatTime(display)
  }

  const stateClass =
    mode === 'holding'
      ? ' is-holding'
      : mode === 'ready'
        ? ' is-ready'
        : mode === 'running'
          ? ' is-running'
          : showInspectionCountdown
            ? ' is-inspection'
            : ''

  const hint =
    mode === 'idle' && inspectionOn ? HINTS.idleInspection : HINTS[mode] ?? HINTS.idle

  return (
    <main className="main">
      <h1 className="title">
        CubeMastery <span className="title-accent">Cube Timer</span>
      </h1>
      <p className="subtitle">
        A WCA-style speedcubing timer with 15-second inspection, hold-to-start, and automatic
        session statistics.
      </p>

      <p className="timer-scramble" aria-label="Scramble for this solve">
        {scramble}
      </p>

      <section
        className="scramble-card timer-zone"
        aria-label="Timer"
        onPointerDown={(e) => {
          if (e.pointerType !== 'mouse' || e.button === 0) pressStart()
        }}
        onPointerUp={pressEnd}
        onPointerCancel={pressEnd}
      >
        <p className={`timer-page-display${stateClass}`} role="timer" aria-live="off">
          {displayText}
        </p>
        <p className="shortcut-hint timer-hint">{hint}</p>
        <p className="shortcut-hint">
          <kbd>Space</kbd> or tap the timer area
        </p>
      </section>

      <div className="timer-settings">
        <button
          type="button"
          className="toggle-row"
          role="switch"
          aria-checked={inspectionOn}
          disabled={mode !== 'idle'}
          onClick={() => setInspectionOn((on) => !on)}
        >
          <span className={`switch${inspectionOn ? ' is-on' : ''}`} aria-hidden="true" />
          15s inspection
        </button>
      </div>

      <section className="stats" aria-label="Session statistics">
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Ao5</span>
            <span className="stat-value">{formatStat(stats.ao5)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Ao12</span>
            <span className="stat-value">{formatStat(stats.ao12)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Best</span>
            <span className="stat-value stat-best">{formatStat(stats.best)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Worst</span>
            <span className="stat-value">{formatStat(stats.worst)}</span>
          </div>
        </div>
      </section>

      {solves.length > 0 && (
        <section className="history" aria-label="Solve history">
          <div className="history-header">
            <h2 className="section-heading">
              Solves <span className="solve-count">({solves.length})</span>
            </h2>
            <button type="button" className="link-btn" onClick={() => setSolves([])}>
              Clear history
            </button>
          </div>
          <ol className="solve-list">
            {solves.map((solve, i) => (
              <li key={solve.id} className="solve-chip">
                <span className="solve-index">{solves.length - i}.</span> {formatSolve(solve)}
              </li>
            ))}
          </ol>
        </section>
      )}
    </main>
  )
}

export default CubeTimer
