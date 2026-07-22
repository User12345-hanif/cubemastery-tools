import { useEffect, useMemo, useState } from 'react'
import { PATTERNS } from '../patterns'
import { useCopy } from '../useCopy'
import { Toast } from '../Toast'
import { CopyIcon, CheckIcon, SearchIcon } from '../icons'

function PatternGenerator() {
  const [query, setQuery] = useState('')
  const { copiedId, copy } = useCopy()

  useEffect(() => {
    document.title = "CubeMastery Pattern Generator \u2013 Rubik's Cube Patterns & Algorithms"
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return PATTERNS
    return PATTERNS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.algorithm.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <main className="main">
      <h1 className="title">
        CubeMastery <span className="title-accent">Pattern Generator</span>
      </h1>
      <p className="subtitle">
        Beautiful Rubik&rsquo;s Cube patterns with ready-to-use algorithms. Start from a solved
        cube, apply the moves left to right, and reverse them to get back to solved.
      </p>

      <div className="search-box">
        <SearchIcon />
        <input
          type="search"
          className="search-input"
          placeholder="Search patterns&hellip;"
          aria-label="Search patterns"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="pattern-list" aria-live="polite">
        {filtered.map((pattern) => {
          const isCopied = copiedId === pattern.id
          return (
            <article className="pattern-card" key={pattern.id}>
              <div className="pattern-head">
                <h2 className="pattern-name">{pattern.name}</h2>
                <span className="move-count">
                  {pattern.algorithm.split(' ').length} moves
                </span>
              </div>

              <p className="pattern-desc">{pattern.description}</p>

              <div className="pattern-alg">
                <code className="pattern-alg-text">{pattern.algorithm}</code>
                <button
                  type="button"
                  className={`btn btn-secondary btn-compact${isCopied ? ' is-copied' : ''}`}
                  onClick={() => copy(pattern.algorithm, pattern.id)}
                >
                  {isCopied ? <CheckIcon /> : <CopyIcon />}
                  {isCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </article>
          )
        })}

        {filtered.length === 0 && (
          <p className="empty-state">
            No patterns match &ldquo;{query}&rdquo;. Try a different search.
          </p>
        )}
      </div>

      <Toast visible={copiedId !== null}>Algorithm copied to clipboard</Toast>
    </main>
  )
}

export default PatternGenerator
