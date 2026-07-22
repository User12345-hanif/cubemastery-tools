import { useCallback, useEffect, useMemo, useState } from 'react'
import { warmUpSolver, solveFacelets } from '../solver'
import { useCopy } from '../useCopy'
import { Toast } from '../Toast'
import { CopyIcon, CheckIcon } from '../icons'

const FACE_ORDER = ['U', 'R', 'F', 'D', 'L', 'B'] // Kociemba facelet order

const COLOR_OF_FACE = {
  U: { hex: '#f2f4f8', label: 'White' },
  R: { hex: '#d94141', label: 'Red' },
  F: { hex: '#2fa84f', label: 'Green' },
  D: { hex: '#ffd21e', label: 'Yellow' },
  L: { hex: '#f08c2e', label: 'Orange' },
  B: { hex: '#3a7bd5', label: 'Blue' },
}

const FACE_LABEL = { U: 'top', D: 'bottom', L: 'left', R: 'right', F: 'front', B: 'back' }

function emptyFaces() {
  const faces = {}
  for (const f of FACE_ORDER) {
    faces[f] = Array(9).fill(null)
    faces[f][4] = f // fixed center
  }
  return faces
}

function describeMove(move) {
  const face = FACE_LABEL[move[0]]
  const mod = move.slice(1)
  if (mod === '2') return `Turn the ${face} face 180\u00b0`
  if (mod === "'") return `Turn the ${face} face 90\u00b0 counter-clockwise`
  return `Turn the ${face} face 90\u00b0 clockwise`
}

function FaceGrid({ face, stickers, selectedColor, onPaint }) {
  return (
    <div className={`face-grid face-${face}`}>
      {stickers.map((sticker, i) => (
        <button
          key={i}
          type="button"
          className={`sticker${i === 4 ? ' is-center' : ''}${sticker ? '' : ' is-empty'}`}
          style={sticker ? { background: COLOR_OF_FACE[sticker].hex } : undefined}
          disabled={i === 4}
          aria-label={
            i === 4
              ? `${FACE_LABEL[face]} center (fixed ${COLOR_OF_FACE[face].label})`
              : `${FACE_LABEL[face]} face sticker ${i + 1}${sticker ? `, ${COLOR_OF_FACE[sticker].label}` : ', empty'}`
          }
          onClick={() => onPaint(face, i, selectedColor)}
        />
      ))}
    </div>
  )
}

function CubeSolver() {
  const [faces, setFaces] = useState(emptyFaces)
  const [selectedColor, setSelectedColor] = useState('U')
  const [solverReady, setSolverReady] = useState(false)
  const [solving, setSolving] = useState(false)
  const [solution, setSolution] = useState(null)
  const [error, setError] = useState(null)
  const { copiedId, copy } = useCopy()

  useEffect(() => {
    document.title = "CubeMastery Cube Solver \u2013 Solve Any Rubik's Cube"
  }, [])

  useEffect(() => warmUpSolver(() => setSolverReady(true)), [])

  const counts = useMemo(() => {
    const result = Object.fromEntries(FACE_ORDER.map((f) => [f, 0]))
    for (const f of FACE_ORDER) {
      for (const sticker of faces[f]) if (sticker) result[sticker]++
    }
    return result
  }, [faces])

  const filled = FACE_ORDER.every((f) => faces[f].every(Boolean))

  const handlePaint = useCallback((face, idx, color) => {
    setFaces((prev) => {
      const next = { ...prev, [face]: [...prev[face]] }
      // Clicking with the same color again clears the sticker.
      next[face][idx] = prev[face][idx] === color ? null : color
      return next
    })
    setSolution(null)
    setError(null)
  }, [])

  const handleReset = useCallback(() => {
    setFaces(emptyFaces())
    setSolution(null)
    setError(null)
  }, [])

  const handleSolve = useCallback(async () => {
    setError(null)
    setSolution(null)
    if (!filled) {
      setError('Fill in every sticker before solving. Click a color, then click the stickers.')
      return
    }
    const wrong = FACE_ORDER.find((f) => counts[f] !== 9)
    if (wrong) {
      setError(
        `Each color must appear exactly 9 times (${COLOR_OF_FACE[wrong].label} appears ${counts[wrong]} times).`,
      )
      return
    }
    const facelets = FACE_ORDER.map((f) => faces[f].join('')).join('')
    setSolving(true)
    try {
      const result = await solveFacelets(facelets)
      setSolution(result)
    } catch (err) {
      setError(
        err.message.includes('timed out')
          ? err.message
          : 'This combination of colors is not a solvable cube. Double-check each face against your cube.',
      )
    } finally {
      setSolving(false)
    }
  }, [faces, filled, counts])

  const moves = solution ? solution.split(/\s+/).filter(Boolean) : []

  return (
    <main className="main">
      <h1 className="title">
        CubeMastery <span className="title-accent">Cube Solver</span>
      </h1>
      <p className="subtitle">
        Copy your scrambled cube onto the net below and get a step-by-step solution. Hold your
        cube with the white center facing up and the green center facing you.
      </p>

      <section className="scramble-card solver-card" aria-label="Cube color input">
        <div className="palette" role="group" aria-label="Sticker colors">
          {FACE_ORDER.map((f) => (
            <button
              key={f}
              type="button"
              className={`palette-swatch${selectedColor === f ? ' is-selected' : ''}`}
              style={{ background: COLOR_OF_FACE[f].hex }}
              aria-label={`Paint with ${COLOR_OF_FACE[f].label} (${counts[f]}/9 used)`}
              aria-pressed={selectedColor === f}
              onClick={() => setSelectedColor(f)}
            >
              <span className="palette-count">{counts[f]}</span>
            </button>
          ))}
        </div>
        <p className="solver-hint">
          Pick a color, then click stickers to paint them. Click again with the same color to
          clear. Centers are fixed.
        </p>

        <div className="solver-net" aria-label="Cube net">
          <div className="net-u">
            <FaceGrid face="U" stickers={faces.U} selectedColor={selectedColor} onPaint={handlePaint} />
          </div>
          <div className="net-middle">
            {['L', 'F', 'R', 'B'].map((f) => (
              <FaceGrid
                key={f}
                face={f}
                stickers={faces[f]}
                selectedColor={selectedColor}
                onPaint={handlePaint}
              />
            ))}
          </div>
          <div className="net-d">
            <FaceGrid face="D" stickers={faces.D} selectedColor={selectedColor} onPaint={handlePaint} />
          </div>
        </div>

        <div className="actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSolve}
            disabled={solving}
          >
            {solving ? 'Solving\u2026' : 'Solve Cube'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleReset}>
            Reset Colors
          </button>
        </div>

        {!solverReady && (
          <p className="shortcut-hint solver-status">Preparing solver in the background&hellip;</p>
        )}
        {error && (
          <p className="solver-error" role="alert">
            {error}
          </p>
        )}
      </section>

      {solution !== null && (
        <section className="scramble-card solution-card" aria-label="Solution">
          <div className="scramble-meta">
            <span className="badge">Solution</span>
            <span className="move-count">
              {moves.length === 0 ? 'Already solved' : `${moves.length} moves`}
            </span>
          </div>

          {moves.length === 0 ? (
            <p className="solver-solved-msg">
              This cube is already solved &mdash; nothing to do!
            </p>
          ) : (
            <>
              <div className="pattern-alg solution-alg">
                <code className="pattern-alg-text">{solution}</code>
                <button
                  type="button"
                  className={`btn btn-secondary btn-compact${copiedId ? ' is-copied' : ''}`}
                  onClick={() => copy(solution, 'solution')}
                >
                  {copiedId ? <CheckIcon /> : <CopyIcon />}
                  {copiedId ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <ol className="step-list">
                {moves.map((move, i) => (
                  <li key={`${move}-${i}`} className="step-item">
                    <span className="step-num">{i + 1}</span>
                    <span className="step-move">{move}</span>
                    <span className="step-desc">{describeMove(move)}</span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </section>
      )}

      <Toast visible={copiedId !== null}>Solution copied to clipboard</Toast>
    </main>
  )
}

export default CubeSolver
