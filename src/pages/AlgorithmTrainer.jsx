import { useCallback, useEffect, useMemo, useState } from 'react'
import { OLL_CASES, PLL_CASES } from '../trainerData'
import { caseState } from '../cube'
import { RefreshIcon } from '../icons'

const SCORE_KEY = 'cubemastery-trainer-score'

const CATEGORIES = {
  OLL: { label: 'OLL', cases: OLL_CASES },
  PLL: { label: 'PLL', cases: PLL_CASES },
}

const EMPTY_SCORE = { OLL: { correct: 0, incorrect: 0 }, PLL: { correct: 0, incorrect: 0 } }

function loadScore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SCORE_KEY) ?? 'null')
    if (parsed?.OLL && parsed?.PLL) return parsed
  } catch {
    // fall through
  }
  return structuredClone(EMPTY_SCORE)
}

function randomCase(cases, excludeId) {
  const pool = cases.filter((c) => c.id !== excludeId)
  return pool[Math.floor(Math.random() * pool.length)]
}

const STICKER_COLORS = {
  U: '#ffd21e',
  F: '#2fa84f',
  R: '#d94141',
  B: '#3a7bd5',
  L: '#f08c2e',
  D: '#f2f4f8',
}
const OFF_COLOR = '#252c40'
const YELLOW = STICKER_COLORS.U

/**
 * Top-down case diagram. The 3x3 grid is the U face; thin bars around it are
 * the last-layer stickers of the side faces. For OLL only yellow/not-yellow
 * matters; for PLL the side bars show actual sticker colors.
 */
function CaseDiagram({ state, category }) {
  const cellAt = (i) => 16 + (i % 3) * 42
  const rowAt = (i) => 16 + Math.floor(i / 3) * 42

  const topColor = (sticker) =>
    category === 'OLL' ? (sticker === 'U' ? YELLOW : OFF_COLOR) : YELLOW
  const sideColor = (sticker) =>
    category === 'OLL' ? (sticker === 'U' ? YELLOW : OFF_COLOR) : STICKER_COLORS[sticker]

  // Sticker order around the top, matching a bird's-eye view.
  const back = [state.B[2], state.B[1], state.B[0]]
  const right = [state.R[2], state.R[1], state.R[0]]
  const front = [state.F[0], state.F[1], state.F[2]]
  const left = [state.L[0], state.L[1], state.L[2]]

  return (
    <svg viewBox="0 0 154 154" className="case-diagram" role="img" aria-label="Cube case diagram">
      {state.U.map((sticker, i) => (
        <rect
          key={`u${i}`}
          x={cellAt(i)}
          y={rowAt(i)}
          width="38"
          height="38"
          rx="4"
          fill={topColor(sticker)}
        />
      ))}
      {back.map((sticker, i) => (
        <rect key={`b${i}`} x={16 + i * 42} y="2" width="38" height="9" rx="2.5" fill={sideColor(sticker)} />
      ))}
      {front.map((sticker, i) => (
        <rect key={`f${i}`} x={16 + i * 42} y="143" width="38" height="9" rx="2.5" fill={sideColor(sticker)} />
      ))}
      {left.map((sticker, i) => (
        <rect key={`l${i}`} x="2" y={16 + i * 42} width="9" height="38" rx="2.5" fill={sideColor(sticker)} />
      ))}
      {right.map((sticker, i) => (
        <rect key={`r${i}`} x="143" y={16 + i * 42} width="9" height="38" rx="2.5" fill={sideColor(sticker)} />
      ))}
    </svg>
  )
}

function AlgorithmTrainer() {
  const [category, setCategory] = useState('OLL')
  const [currentCase, setCurrentCase] = useState(() => randomCase(OLL_CASES))
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(loadScore)

  useEffect(() => {
    document.title = 'CubeMastery Algorithm Trainer \u2013 Learn OLL & PLL'
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(SCORE_KEY, JSON.stringify(score))
    } catch {
      // Storage unavailable - score stays in memory
    }
  }, [score])

  const diagramState = useMemo(() => caseState(currentCase.alg), [currentCase])

  const nextCase = useCallback(
    (cat, excludeId) => {
      setCurrentCase(randomCase(CATEGORIES[cat].cases, excludeId))
      setRevealed(false)
    },
    [],
  )

  const handleCategoryChange = useCallback(
    (cat) => {
      if (cat === category) return
      setCategory(cat)
      nextCase(cat, null)
    },
    [category, nextCase],
  )

  const recordResult = useCallback(
    (correct) => {
      setScore((prev) => ({
        ...prev,
        [category]: {
          correct: prev[category].correct + (correct ? 1 : 0),
          incorrect: prev[category].incorrect + (correct ? 0 : 1),
        },
      }))
      nextCase(category, currentCase.id)
    },
    [category, currentCase.id, nextCase],
  )

  const catScore = score[category]
  const attempts = catScore.correct + catScore.incorrect
  const accuracy = attempts > 0 ? Math.round((catScore.correct / attempts) * 100) : null

  return (
    <main className="main">
      <h1 className="title">
        CubeMastery <span className="title-accent">Algorithm Trainer</span>
      </h1>
      <p className="subtitle">
        Test your OLL and PLL recognition. Look at the case, recall the algorithm from memory,
        then reveal the answer and score yourself honestly.
      </p>

      <div className="puzzle-picker" role="group" aria-label="Algorithm category">
        {Object.keys(CATEGORIES).map((cat) => (
          <button
            key={cat}
            type="button"
            className={`puzzle-btn${cat === category ? ' is-active' : ''}`}
            aria-pressed={cat === category}
            onClick={() => handleCategoryChange(cat)}
          >
            {CATEGORIES[cat].label}
          </button>
        ))}
      </div>

      <section className="scramble-card trainer-card" aria-label="Current case">
        <div className="scramble-meta">
          <span className="badge">{category}</span>
          <span className="move-count">
            {CATEGORIES[category].cases.length} cases
          </span>
        </div>

        <CaseDiagram state={diagramState} category={category} />

        {revealed ? (
          <div className="trainer-answer">
            <p className="case-name">
              {currentCase.name}
              {currentCase.nickname && (
                <span className="case-nickname"> &middot; {currentCase.nickname}</span>
              )}
            </p>
            <p className="trainer-alg">{currentCase.alg}</p>
            <p className="trainer-question">Did you know it?</p>
            <div className="actions">
              <button
                type="button"
                className="btn btn-success"
                onClick={() => recordResult(true)}
              >
                Correct
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => recordResult(false)}
              >
                Incorrect
              </button>
            </div>
          </div>
        ) : (
          <div className="actions trainer-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setRevealed(true)}
            >
              Reveal Algorithm
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => nextCase(category, currentCase.id)}
            >
              <RefreshIcon />
              Next Case
            </button>
          </div>
        )}
      </section>

      <section className="stats" aria-label="Training score">
        <div className="stats-grid stats-grid--three">
          <div className="stat-card">
            <span className="stat-label">Correct</span>
            <span className="stat-value stat-best">{catScore.correct}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Incorrect</span>
            <span className="stat-value stat-worst">{catScore.incorrect}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Accuracy</span>
            <span className="stat-value">{accuracy === null ? '\u2014' : `${accuracy}%`}</span>
          </div>
        </div>
        {attempts > 0 && (
          <div className="trainer-reset">
            <button
              type="button"
              className="link-btn"
              onClick={() =>
                setScore((prev) => ({ ...prev, [category]: { correct: 0, incorrect: 0 } }))
              }
            >
              Reset {category} score
            </button>
          </div>
        )}
      </section>
    </main>
  )
}

export default AlgorithmTrainer
