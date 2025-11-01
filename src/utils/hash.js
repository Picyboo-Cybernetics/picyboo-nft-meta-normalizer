import { createHash } from 'crypto'

export function createContentHash (payload) {
  const hash = createHash('sha256')
  hash.update(JSON.stringify(payload))
  return hash.digest('hex')
}
