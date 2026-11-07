// Verification for prerendered output — the "Screaming Frog-compatible raw
// HTML test" from the SEO repair programme (Phase 8). Reads only the built
// dist/ files, exactly as a non-JavaScript crawler would see them, and
// checks every route's title, description, canonical, OG/Twitter tags, H1,
// navigation links, JSON-LD and distinctness. Exits non-zero on any failure.
//
// Usage: `node scripts/verify-prerender.mjs` (after `npm run build`).
import { existsSync, readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ROUTE_META, ROUTE_PATHS, canonicalFor } from '../src/routeMeta.js'
import { INITIAL_SCRAMBLE_3X3 } from '../src/scramble.js'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(rootDir, 'dist')

const EXPECTED_H1 = {
  '/': 'CubeMastery Tools',
  '/cube-solver': "Rubik's Cube Solver",
  '/scramble-generator': 'CubeMastery Scramble Generator',
  '/algorithm-trainer': 'CubeMastery Algorithm Trainer',
  '/cube-timer': 'CubeMastery Cube Timer',
  '/patterns': 'CubeMastery Pattern Generator',
}

const NAV_HREFS = ['/', '/scramble-generator', '/patterns', '/cube-timer', '/algorithm-trainer', '/cube-solver']

let failures = 0
let checks = 0
function check(label, ok, detail = '') {
  checks += 1
  if (ok) {
    console.log(`  PASS ${label}`)
  } else {
    failures += 1
    console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ''}`)
  }
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&rsquo;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/<!-- -->/g, '')
}

function tagContent(html, re) {
  const m = html.match(re)
  return m ? decodeEntities(m[1]) : null
}
function metaContent(html, key) {
  // Matches <meta name|property="key" content="..."> across line breaks.
  const m = html.match(
    new RegExp(`<meta[^>]*?(?:name|property)="${key}"[^>]*?content="([^"]*)"`, 's'),
  )
  return m ? decodeEntities(m[1]) : null
}
function stripTags(s) {
  return decodeEntities(s.replace(/<[^>]+>/g, '')).trim()
}

const md5s = new Map()

for (const route of ROUTE_PATHS) {
  const meta = ROUTE_META[route]
  const file = route === '/' ? path.join(distDir, 'index.html') : path.join(distDir, route, 'index.html')
  console.log(`\n${route} (${file})`)
  check('file exists', existsSync(file))
  if (!existsSync(file)) continue
  const html = readFileSync(file, 'utf8')
  md5s.set(route, createHash('md5').update(html).digest('hex'))

  check('title matches routeMeta', tagContent(html, /<title>(.*?)<\/title>/s) === meta.title,
    `got ${JSON.stringify(tagContent(html, /<title>(.*?)<\/title>/s))}`)
  check('meta description matches routeMeta', metaContent(html, 'description') === meta.description)
  check('canonical is self-referencing', metaContent(html, 'canonical') === null && /<link rel="canonical" href="([^"]*)"/.exec(html)?.[1] === canonicalFor(route),
    `got ${/<link rel="canonical" href="([^"]*)"/.exec(html)?.[1]}`)
  check('canonical is NOT the homepage (except root)', route === '/' || !html.includes('<link rel="canonical" href="https://cubemastery.com/"'))
  check('og:title matches', metaContent(html, 'og:title') === meta.title)
  check('og:description matches', metaContent(html, 'og:description') === meta.description)
  check('og:url matches canonical', metaContent(html, 'og:url') === canonicalFor(route))
  check('twitter:title matches', metaContent(html, 'twitter:title') === meta.title)
  check('twitter:description matches', metaContent(html, 'twitter:description') === meta.description)
  check('og:image present', metaContent(html, 'og:image') === 'https://cubemastery.com/og-image.png')

  const h1s = [...html.matchAll(/<h1[^>]*>(.*?)<\/h1>/gs)].map((m) => stripTags(m[1]))
  check('exactly one H1', h1s.length === 1, `got ${h1s.length}: ${JSON.stringify(h1s)}`)
  check('H1 text is route-specific', h1s[0] === EXPECTED_H1[route], `got ${JSON.stringify(h1s[0])}`)

  const hrefs = [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1])
  for (const nav of NAV_HREFS) {
    check(`nav link to ${nav} present in raw HTML`, hrefs.includes(nav))
  }
  check('footer link to cubemastery.com present', hrefs.includes('https://cubemastery.com/'))
  check('#root is not empty', !html.includes('<div id="root"></div>'))
  check('no homepage canonical leak', !html.includes('href="https://cubemastery.com/" rel="canonical"') || route === '/')

  const ldMatch = html.match(/<script id="route-jsonld" type="application\/ld\+json">(.*?)<\/script>/s)
  if (meta.jsonLd) {
    check('route JSON-LD present and valid', !!ldMatch)
    if (ldMatch) {
      let parsed = null
      try { parsed = JSON.parse(ldMatch[1]) } catch { /* fail below */ }
      check('route JSON-LD is FAQPage', parsed?.['@type'] === 'FAQPage')
      check('route JSON-LD matches routeMeta', JSON.stringify(parsed) === JSON.stringify(meta.jsonLd))
    }
  } else {
    check('no route JSON-LD (as designed)', !ldMatch)
  }

  // Route-specific content spot checks (deterministic first render).
  // React escapes apostrophes in rendered text (U' -> U&#x27;), so decode
  // entities before comparing against the source values.
  const decodedHtml = decodeEntities(html)
  if (route === '/scramble-generator' || route === '/cube-timer') {
    check('deterministic initial scramble present', decodedHtml.includes(INITIAL_SCRAMBLE_3X3.join(' ')) || INITIAL_SCRAMBLE_3X3.every((mv) => decodedHtml.includes(`>${mv}<`)),
      'initial scramble moves not found')
  }
  if (route === '/algorithm-trainer') {
    check('trainer shows OLL case diagram for the first case', html.includes('aria-label="Current case"') && html.includes('class="case-diagram"'))
    check('trainer shows 57 cases', /57\s*cases/.test(decodedHtml))
  }
  if (route === '/patterns') {
    check('pattern cards present', ['Checkerboard', 'Superflip', 'Cube in Cube', 'Anaconda'].every((n) => html.includes(n)))
  }
  if (route === '/') {
    check('dashboard stats section present', html.includes('Your stats'))
  }
}

// Distinctness: no two routes may share identical route-specific SEO HTML.
console.log('\nDistinctness')
const seen = new Map()
for (const [route, md5] of md5s) {
  check(`MD5 unique for ${route}`, ![...seen.values()].includes(md5), `md5 ${md5} duplicates ${seen.get(md5) ?? ''}`)
  seen.set(md5, route)
}

// Discovery files.
console.log('\nDiscovery files')
check('dist/robots.txt exists', existsSync(path.join(distDir, 'robots.txt')))
const robots = existsSync(path.join(distDir, 'robots.txt')) ? readFileSync(path.join(distDir, 'robots.txt'), 'utf8') : ''
check('robots.txt allows all + lists sitemap', robots.includes('Allow: /') && robots.includes('Sitemap: https://tools.cubemastery.com/sitemap.xml'))
check('dist/sitemap.xml exists', existsSync(path.join(distDir, 'sitemap.xml')))
const sitemap = existsSync(path.join(distDir, 'sitemap.xml')) ? readFileSync(path.join(distDir, 'sitemap.xml'), 'utf8') : ''
for (const route of ROUTE_PATHS) {
  check(`sitemap lists ${route}`, sitemap.includes(`<loc>${canonicalFor(route)}</loc>`))
}

console.log(`\n${checks - failures}/${checks} checks passed`)
if (failures > 0) {
  console.error(`verify-prerender: ${failures} FAILURE(S)`)
  process.exit(1)
}
console.log('verify-prerender: all checks passed')
