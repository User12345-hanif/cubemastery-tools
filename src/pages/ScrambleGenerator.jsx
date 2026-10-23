import { useCallback, useEffect, useRef, useState } from 'react'
import { PUZZLES, PUZZLE_IDS, generateScramble } from '../scramble'
import { useCopy } from '../useCopy'
import { Toast } from '../Toast'
import { RefreshIcon, CopyIcon, CheckIcon } from '../icons'
import { formatTime } from '../format'
import { usePageMeta } from '../usePageMeta'
import { SCRAMBLE_FAQ_JSONLD } from '../scrambleFaq'

const HISTORY_KEY = 'cubemastery-scramble-history'
const HISTORY_LIMIT = 10

function loadHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.slice(0, HISTORY_LIMIT) : []
  } catch {
    return []
  }
}

function ScrambleGenerator() {
  const [puzzle, setPuzzle] = useState('3x3')
  const [moves, setMoves] = useState(() => generateScramble('3x3'))
  const [history, setHistory] = useState(loadHistory)
  const { copiedId, copy, reset } = useCopy()
  const copied = copiedId !== null

  const [timerRunning, setTimerRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const timerStart = useRef(0)

  usePageMeta({
    title: 'CubeMastery Scramble Generator \u2013 WCA-Style 2x2, 3x3, 4x4 & 5x5 Scrambles',
    description:
      "Free WCA-style Rubik's Cube scramble generator for 2x2, 3x3, 4x4 and 5x5 with a built-in solve timer and scramble history. Generate and copy competition-quality scrambles instantly.",
    path: '/scramble-generator',
    jsonLd: SCRAMBLE_FAQ_JSONLD,
  })

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    } catch {
      // Storage unavailable (private mode / quota) - history stays in memory
    }
  }, [history])

  useEffect(() => {
    if (!timerRunning) return undefined
    const id = setInterval(() => setElapsed(Date.now() - timerStart.current), 33)
    return () => clearInterval(id)
  }, [timerRunning])

  const handleGenerate = useCallback(
    (puzzleId) => {
      const scramble = generateScramble(puzzleId)
      setMoves(scramble)
      reset()
      setHistory((prev) =>
        [
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            puzzle: puzzleId,
            scramble: scramble.join(' '),
          },
          ...prev,
        ].slice(0, HISTORY_LIMIT),
      )
    },
    [reset],
  )

  const handlePuzzleChange = useCallback(
    (puzzleId) => {
      setPuzzle(puzzleId)
      handleGenerate(puzzleId)
    },
    [handleGenerate],
  )

  const handleHistorySelect = useCallback(
    (entry) => {
      setPuzzle(entry.puzzle)
      setMoves(entry.scramble.split(' '))
      reset()
    },
    [reset],
  )

  const toggleTimer = useCallback(() => {
    setTimerRunning((running) => {
      if (!running) {
        timerStart.current = Date.now()
        setElapsed(0)
        return true
      }
      setElapsed(Date.now() - timerStart.current)
      return false
    })
  }, [])

  const resetTimer = useCallback(() => {
    setTimerRunning(false)
    setElapsed(0)
  }, [])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code !== 'Space' || event.repeat) return
      const target = event.target
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }
      event.preventDefault()
      if (timerRunning) {
        toggleTimer()
      } else {
        handleGenerate(puzzle)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [timerRunning, toggleTimer, handleGenerate, puzzle])

  const isLongScramble = moves.length > 24

  return (
    <main className="main">
      <h1 className="title">
        CubeMastery <span className="title-accent">Scramble Generator</span>
      </h1>
      <p className="subtitle">
        Official WCA-style scrambles for 2&times;2, 3&times;3, 4&times;4 and 5&times;5 cubes
        &mdash; with a built-in timer for your practice sessions.
      </p>

      <div className="puzzle-picker" role="group" aria-label="Puzzle type">
        {PUZZLE_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={`puzzle-btn${id === puzzle ? ' is-active' : ''}`}
            aria-pressed={id === puzzle}
            onClick={() => handlePuzzleChange(id)}
          >
            {PUZZLES[id].label}
          </button>
        ))}
      </div>

      <section className="scramble-card" aria-label="Current scramble">
        <div className="scramble-meta">
          <span className="badge">{PUZZLES[puzzle].name}</span>
          <span className="move-count">{moves.length} moves</span>
        </div>

        <p
          className={`scramble-text${isLongScramble ? ' scramble-text--long' : ''}`}
          aria-live="polite"
        >
          {moves.map((move, i) => (
            <span className="move" key={`${move}-${i}`}>
              {move}
            </span>
          ))}
        </p>

        <div className="actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleGenerate(puzzle)}
          >
            <RefreshIcon />
            Generate New Scramble
          </button>

          <button
            type="button"
            className={`btn btn-secondary${copied ? ' is-copied' : ''}`}
            onClick={() => copy(moves.join(' '))}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? 'Copied!' : 'Copy Scramble'}
          </button>
        </div>

        <p className="shortcut-hint">
          Press <kbd>Space</kbd> for a new scramble
        </p>
      </section>

      <section className="timer-card" aria-label="Solve timer">
        <h2 className="section-heading">Timer</h2>
        <p
          className={`timer-display${timerRunning ? ' is-running' : ''}`}
          role="timer"
          aria-live="off"
        >
          {formatTime(elapsed)}
        </p>
        <div className="actions">
          <button
            type="button"
            className={`btn ${timerRunning ? 'btn-danger' : 'btn-primary'}`}
            onClick={toggleTimer}
          >
            {timerRunning ? 'Stop' : 'Start'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={resetTimer}
            disabled={timerRunning || elapsed === 0}
          >
            Reset
          </button>
        </div>
        <p className="shortcut-hint">
          While the timer is running, <kbd>Space</kbd> stops it
        </p>
      </section>

      {history.length > 0 && (
        <section className="history" aria-label="Scramble history">
          <div className="history-header">
            <h2 className="section-heading">Recent scrambles</h2>
            <button type="button" className="link-btn" onClick={() => setHistory([])}>
              Clear
            </button>
          </div>
          <ol className="history-list">
            {history.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  className="history-item"
                  onClick={() => handleHistorySelect(entry)}
                  title="Load this scramble"
                >
                  <span className="history-badge">
                    {PUZZLES[entry.puzzle]?.label ?? entry.puzzle}
                  </span>
                  <span className="history-scramble">{entry.scramble}</span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="seo-content">
        <article>
          <h2>What is a Rubik&rsquo;s Cube scramble?</h2>
          <p>
            A scramble is a sequence of moves, written in standard cube notation, that takes a
            solved cube to a randomized state. Each letter refers to a face of the cube&mdash;U
            (up), D (down), R (right), L (left), F (front) and B (back). A letter on its own
            means a 90&deg; clockwise turn, an apostrophe (&rsquo;) means counter-clockwise, and
            a 2 means a half turn. On bigger cubes, moves like Rw or Uw turn two layers at once.
          </p>
        </article>

        <article>
          <h2>How to use a scramble generator?</h2>
          <p>
            Pick your puzzle size, then hold the cube with the white face up and the green face
            toward you. Apply the moves from left to right exactly as written. Once the cube is
            scrambled, start the timer, solve, and stop the timer when you finish. Generate a
            new scramble for every solve so your practice reflects a realistic range of
            positions&mdash;pressing the spacebar gives you a fresh scramble instantly.
          </p>
        </article>

        <article>
          <h2>Why use WCA scrambles?</h2>
          <p>
            The World Cube Association (WCA) defines the scrambling standards used in official
            speedcubing competitions. Practicing with WCA-style scrambles means every solve
            starts from a fair, unbiased position with no wasted or redundant moves, so your
            times at home are directly comparable to competition results&mdash;and to times
            posted by other cubers around the world.
          </p>
        </article>
      </section>

      <Toast visible={copied}>Scramble copied to clipboard</Toast>
    </main>
  )
}

export default ScrambleGenerator
