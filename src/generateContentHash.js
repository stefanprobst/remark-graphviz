import { createHash } from 'crypto'

export function generateContentHash(value) {
  const hash = createHash('md4')
  hash.update(value, 'utf-8')
  return hash.digest('hex').substr(0, 9999)
}
