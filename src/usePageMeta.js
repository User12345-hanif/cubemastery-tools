import { useEffect } from 'react'

const ORIGIN = 'https://tools.cubemastery.com'
const JSONLD_ID = 'route-jsonld'

function upsertMeta(selector, attributes) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement(attributes.tag)
    document.head.appendChild(el)
  }
  for (const [name, value] of Object.entries(attributes)) {
    if (name !== 'tag') el.setAttribute(name, value)
  }
  return el
}

// Sets the page title plus route-specific description, canonical and Open
// Graph metadata. The static index.html shell intentionally ships without a
// canonical so no route can inherit a wrong one before this runs.
export function usePageMeta({ title, description, path, jsonLd }) {
  useEffect(() => {
    document.title = title

    const url = ORIGIN + path

    upsertMeta('meta[name="description"]', {
      tag: 'meta',
      name: 'description',
      content: description,
    })
    upsertMeta('link[rel="canonical"]', {
      tag: 'link',
      rel: 'canonical',
      href: url,
    })
    upsertMeta('meta[property="og:title"]', {
      tag: 'meta',
      property: 'og:title',
      content: title,
    })
    upsertMeta('meta[property="og:description"]', {
      tag: 'meta',
      property: 'og:description',
      content: description,
    })
    upsertMeta('meta[property="og:url"]', { tag: 'meta', property: 'og:url', content: url })

    let script = document.getElementById(JSONLD_ID)
    if (jsonLd) {
      if (!script) {
        script = document.createElement('script')
        script.id = JSONLD_ID
        script.type = 'application/ld+json'
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(jsonLd)
    } else if (script) {
      script.remove()
    }
  }, [title, description, path, jsonLd])
}
