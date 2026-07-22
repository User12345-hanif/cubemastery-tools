import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { formatTime } from '../format'

const ScrambleIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4m-4 4a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const PatternIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
)

const TimerIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M12 9v4l2.5 2.5M9 2h6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const TrainerIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M13 2L4.5 13.5H11L9.5 22 19 9.5h-6.5L13 2z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
)

const SolverIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M10 3h4v3.5a1.5 1.5 0 0 0 3 0V6h4v4h-2.5a1.5 1.5 0 0 0 0 3H21v4h-4v2.5a1.5 1.5 0 0 1-3 0V17h-4v-4H7.5a1.5 1.5 0 0 1 0-3H10V3z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      transform="translate(-3.5 1)"
    />
  </svg>
)

const TOOLS = [
  {
    to: '/scramble-generator',
    icon: <ScrambleIcon />,
    title: 'Scramble Generator',
    description:
      'WCA-style scrambles for 2\u00d72 through 5\u00d75 with a built-in practice timer and history.',
  },
  {
    to: '/patterns',
    icon: <PatternIcon />,
    title: 'Pattern Generator',
    description:
      'Classic cube patterns like the Checkerboard and Cube in Cube, with copy-ready algorithms.',
  },
  {
    to: '/cube-timer',
    icon: <TimerIcon />,
    title: 'Cube Timer',
    description:
      'Competition-style timer with inspection, hold-to-start, and Ao5 / Ao12 session stats.',
  },
  {
    to: '/algorithm-trainer',
    icon: <TrainerIcon />,
    title: 'Algorithm Trainer',
    description:
      'Drill all 57 OLL and 21 PLL cases with generated diagrams and progress tracking.',
  },
  {
    to: '/cube-solver',
    icon: <SolverIcon />,
    title: 'Cube Solver',
    description:
      'Paint in your scrambled cube and get a short step-by-step solution instantly.',
  },
]

const FEATURES = [
  {
    title: 'WCA-style everything',
    description:
      'Scrambles, inspection rules and averages follow World Cube Association conventions, so practice mirrors competition.',
  },
  {
    title: 'Free, no account needed',
    description:
      'Every tool is free to use instantly. No signup, no paywall, no ads interrupting your session.',
  },
  {
    title: 'Your data stays local',
    description:
      'Solves, scores and preferences are stored in your browser only \u2014 nothing is sent to a server.',
  },
  {
    title: 'Built for speed',
    description:
      'Keyboard-first controls: Space to scramble, hold-to-start timing, instant page switches.',
  },
  {
    title: 'Verified algorithms',
    description:
      'Every trainer case diagram is generated from its algorithm by a cube simulator, so they always match.',
  },
  {
    title: 'Works on any device',
    description:
      'Fully responsive dark interface with touch support for timing solves on your phone.',
  },
]

function useLocalStats() {
  return useMemo(() => {
    let solves = []
    let trainer = { OLL: { correct: 0, incorrect: 0 }, PLL: { correct: 0, incorrect: 0 } }
    try {
      const s = JSON.parse(localStorage.getItem('cubemastery-timer-solves') ?? '[]')
      if (Array.isArray(s)) solves = s
      const t = JSON.parse(localStorage.getItem('cubemastery-trainer-score') ?? 'null')
      if (t?.OLL && t?.PLL) trainer = t
    } catch {
      // Storage unavailable - show empty stats
    }
    const finite = solves
      .filter((s) => s.penalty !== 'DNF')
      .map((s) => s.ms + (s.penalty === '+2' ? 2000 : 0))
    const attempts =
      trainer.OLL.correct + trainer.OLL.incorrect + trainer.PLL.correct + trainer.PLL.incorrect
    const correct = trainer.OLL.correct + trainer.PLL.correct
    return {
      solveCount: solves.length,
      best: finite.length > 0 ? formatTime(Math.min(...finite)) : '\u2014',
      attempts,
      accuracy: attempts > 0 ? `${Math.round((correct / attempts) * 100)}%` : '\u2014',
    }
  }, [])
}

function Dashboard() {
  useEffect(() => {
    document.title = "CubeMastery Tools \u2013 Free Speedcubing Tools: Scrambles, Timer & Trainers"
  }, [])

  const stats = useLocalStats()

  return (
    <main className="main">
      <section className="hero">
        <h1 className="title">
          CubeMastery <span className="title-accent">Tools</span>
        </h1>
        <p className="subtitle">
          Everything you need to get faster at the Rubik&rsquo;s Cube: competition-quality
          scrambles, a WCA-style timer, algorithm trainers and classic patterns &mdash; free, fast
          and right in your browser.
        </p>
        <div className="actions hero-actions">
          <Link to="/scramble-generator" className="btn btn-primary">
            Get a Scramble
          </Link>
          <Link to="/cube-timer" className="btn btn-secondary">
            Start Timing
          </Link>
        </div>
      </section>

      <section className="tool-grid" aria-label="Tools">
        {TOOLS.map((tool) =>
          tool.to ? (
            <Link key={tool.title} to={tool.to} className="tool-card">
              <span className="tool-icon">{tool.icon}</span>
              <h2 className="tool-title">{tool.title}</h2>
              <p className="tool-desc">{tool.description}</p>
              <span className="tool-open" aria-hidden="true">
                Open tool &rarr;
              </span>
            </Link>
          ) : (
            <div key={tool.title} className="tool-card is-disabled" aria-disabled="true">
              <span className="coming-soon-badge">Coming soon</span>
              <span className="tool-icon">{tool.icon}</span>
              <h2 className="tool-title">{tool.title}</h2>
              <p className="tool-desc">{tool.description}</p>
            </div>
          ),
        )}
      </section>

      <section className="stats dashboard-stats" aria-label="Your statistics">
        <h2 className="section-heading">Your stats</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Solves timed</span>
            <span className="stat-value">{stats.solveCount}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Best solve</span>
            <span className="stat-value stat-best">{stats.best}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Cases drilled</span>
            <span className="stat-value">{stats.attempts}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Trainer accuracy</span>
            <span className="stat-value">{stats.accuracy}</span>
          </div>
        </div>
        <p className="stats-note">
          Stats come from your own sessions and are stored only in this browser.
        </p>
      </section>

      <section className="features" aria-label="Features">
        <h2 className="features-heading">Why cubers use CubeMastery</h2>
        <div className="features-grid">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Dashboard
