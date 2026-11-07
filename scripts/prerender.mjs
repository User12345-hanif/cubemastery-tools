// Build-time prerendering for tools.cubemastery.com.
//
// Usage (via package.json): `npm run build` runs the client build, the SSR
// build (src/entry-server.jsx -> dist-ssr/), then this script. It can also
// run standalone after those two builds: `node scripts/prerender.mjs`.
//
// For each of the six routes it renders the same React tree the client
// renders (via renderToString under a StaticRouter), then writes a complete
// HTML file whose <head> carries that route's title, description,
// self-referencing canonical and OG/Twitter tags — all from src/routeMeta.js,
// the same single source the runtime usePageMeta hook reads. The client
// bundle then hydrates the prerendered markup (see src/main.jsx) instead of
// rendering from an empty #root.
//
// No route changes, no URL changes, no framework change. dist/ is a build
// artifact (gitignored); Vercel serves dist/<route>/index.html for each
// route — via the explicit per-route rewrites in vercel.json (and static
// files are served before the SPA catch-all rewrite in any case).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ROUTE_META, ROUTE_PATHS, canonicalFor, ogImageFor } from '../src/routeMeta.js'
import { render } from '../dist-ssr/entry-server.js'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(rootDir, 'dist')
const templatePath = path.join(distDir, 'index.html')

const template = readFileSync(templatePath, 'utf8')

// Sanity checks on the client-build template: fail loudly rather than emit
// a subtly wrong page.
const HUB = ROUTE_META['/']
for (const needle of [
  '<div id="root"></div>',
  `<title>${HUB.title}</title>`,
  HUB.description,
  '<script type="module"',
]) {
  if (!template.includes(needle)) {
    throw new Error(`prerender: template ${templatePath} is missing expected content: ${needle.slice(0, 80)}`)
  }
}

function escapeAttr(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

for (const route of ROUTE_PATHS) {
  const meta = ROUTE_META[route]
  const canonical = canonicalFor(route)

  // 1. Render the route's React tree to an HTML string. Effects do not run
  //    here, so this is deterministic (see the hydration-safety notes in
  //    src/pages/*.jsx — random state and localStorage load after mount).
  const appHtml = render(route)

  // 2. Head: swap the hub title/description for this route's values. The
  //    hub strings appear in <title> + og:title + twitter:title, and in
  //    meta description + og:description + twitter:description, so one
  //    replacement each covers all three tags.
  let html = template
    .split(HUB.title)
    .join(escapeAttr(meta.title))
    .split(HUB.description)
    .join(escapeAttr(meta.description))
    // og:url points at the hub in the template; point it at this route.
    .split('content="https://tools.cubemastery.com/"')
    .join(`content="${canonical}"`)

  // 3. Canonical link (self-referencing — never the homepage) + route
  //    JSON-LD, inserted before the client module script. The runtime
  //    usePageMeta hook upserts these same elements on hydration, so there
  //    is exactly one of each after the app mounts.
  const headExtras = [
    `    <link rel="canonical" href="${canonical}" />`,
    ...(meta.jsonLd
      ? [
          `    <script id="route-jsonld" type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>`,
        ]
      : []),
  ].join('\n')
  const scriptAnchor = '    <script type="module"'
  if (!html.includes(scriptAnchor)) throw new Error('prerender: module script anchor missing')
  html = html.replace(scriptAnchor, `${headExtras}\n${scriptAnchor}`)

  // 4. App markup inside #root.
  html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)

  // 5. Write dist/<route>/index.html ('/' overwrites the template itself).
  const outPath =
    route === '/'
      ? path.join(distDir, 'index.html')
      : path.join(distDir, route, 'index.html')
  mkdirSync(path.dirname(outPath), { recursive: true })
  writeFileSync(outPath, html)
  console.log(
    `prerendered ${route} -> ${path.relative(rootDir, outPath)} (${html.length} bytes, title: ${meta.title})`,
  )
}

console.log(`prerender: ${ROUTE_PATHS.length} routes written. OG image: ${ogImageFor()}`)
