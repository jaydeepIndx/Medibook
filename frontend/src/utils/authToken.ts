export function isWellFormedToken(token: string): boolean {
  const parts = token.split('.')
  return parts.length === 3 && parts.every((part) => part.length > 0)
}

export function getTokenExpirationTime(token: string): number | null {
  try {
    if (!isWellFormedToken(token)) return null

    const payload = token.split('.')[1]
    if (!payload) return null

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const claims = JSON.parse(atob(paddedBase64)) as { exp?: unknown }

    return typeof claims.exp === 'number' ? claims.exp * 1000 : null
  } catch {
    return null
  }
}
