import { CheckIcon } from './icons'

export function Toast({ visible, children }) {
  return (
    <div className={`toast${visible ? ' is-visible' : ''}`} role="status" aria-live="polite">
      <CheckIcon />
      {children}
    </div>
  )
}
