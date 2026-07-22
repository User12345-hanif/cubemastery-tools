import { useCallback, useEffect, useRef, useState } from 'react'

function copyText(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text)
  }
  // Fallback for non-secure contexts / older browsers
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
  return Promise.resolve()
}

/**
 * Clipboard helper with transient "copied" feedback. `copiedId` holds the
 * id passed to `copy` for `resetMs` milliseconds, then reverts to null.
 */
export function useCopy(resetMs = 2000) {
  const [copiedId, setCopiedId] = useState(null)
  const timeout = useRef(null)

  useEffect(() => () => clearTimeout(timeout.current), [])

  const copy = useCallback(
    async (text, id = 'default') => {
      await copyText(text)
      setCopiedId(id)
      clearTimeout(timeout.current)
      timeout.current = setTimeout(() => setCopiedId(null), resetMs)
    },
    [resetMs],
  )

  const reset = useCallback(() => {
    setCopiedId(null)
    clearTimeout(timeout.current)
  }, [])

  return { copiedId, copy, reset }
}
