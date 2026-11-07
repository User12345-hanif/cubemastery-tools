import { NavLink, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import ScrambleGenerator from './pages/ScrambleGenerator'
import PatternGenerator from './pages/PatternGenerator'
import CubeTimer from './pages/CubeTimer'
import AlgorithmTrainer from './pages/AlgorithmTrainer'
import CubeSolver from './pages/CubeSolver'
import './App.css'

const navLinkClass = ({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`

// NOTE: App is the router-independent shell (header, routes, footer). The
// router lives outside it so the same tree can render under a BrowserRouter
// in the browser (main.jsx) and under a StaticRouter for prerendering
// (entry-server.jsx). Do not add a router back in here.
function App() {
  return (
    <div className="app">
        <header className="header">
          <div className="header-inner">
            <NavLink to="/" className="brand" aria-label="CubeMastery home">
              <span className="brand-mark" aria-hidden="true">
                <span /><span /><span /><span /><span /><span /><span /><span /><span />
              </span>
              <span className="brand-name">CubeMastery</span>
            </NavLink>

            <nav className="nav" aria-label="Tools">
              <NavLink to="/scramble-generator" className={navLinkClass}>
                Scramble Generator
              </NavLink>
              <NavLink to="/patterns" className={navLinkClass}>
                Pattern Generator
              </NavLink>
              <NavLink to="/cube-timer" className={navLinkClass}>
                Cube Timer
              </NavLink>
              <NavLink to="/algorithm-trainer" className={navLinkClass}>
                Algorithm Trainer
              </NavLink>
              <NavLink to="/cube-solver" className={navLinkClass}>
                Cube Solver
              </NavLink>
            </nav>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scramble-generator" element={<ScrambleGenerator />} />
          <Route path="/patterns" element={<PatternGenerator />} />
          <Route path="/cube-timer" element={<CubeTimer />} />
          <Route path="/algorithm-trainer" element={<AlgorithmTrainer />} />
          <Route path="/cube-solver" element={<CubeSolver />} />
        </Routes>

        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} CubeMastery &mdash; tools for speedcubers</p>
          <p>
            <a href="https://cubemastery.com/">
              Learn to solve a Rubik&rsquo;s Cube at CubeMastery
            </a>
          </p>
        </footer>
    </div>
  )
}

export default App
