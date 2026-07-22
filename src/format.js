export function formatTime(ms) {
  const centis = Math.floor(ms / 10) % 100
  const seconds = Math.floor(ms / 1000) % 60
  const minutes = Math.floor(ms / 60000)
  const cs = String(centis).padStart(2, '0')
  return minutes > 0
    ? `${minutes}:${String(seconds).padStart(2, '0')}.${cs}`
    : `${seconds}.${cs}`
}
