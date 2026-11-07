// Server entry for prerendering (build-time only — never shipped to browsers).
// Renders the same <App /> tree as the client, but under a StaticRouter so
// each route renders its own content to an HTML string. Effects (including
// usePageMeta and all localStorage / random-state code) do not run during
// renderToString, so the output is fully deterministic; scripts/prerender.mjs
// supplies the route head metadata from the same src/routeMeta.js source the
// client uses at runtime.
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import App from './App.jsx'

export function render(url) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  )
}
