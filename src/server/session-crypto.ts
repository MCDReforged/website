import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from 'node:crypto'

// AES-256-GCM sealed cookie payload: `<iv>.<ciphertext>.<authTag>`, all base64url.

const IV_LENGTH = 12

function deriveKey(secret: string): Buffer {
  return createHash('sha256').update(secret, 'utf8').digest()
}

export function seal(secret: string, data: unknown): string {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv('aes-256-gcm', deriveKey(secret), iv)
  const ciphertext = Buffer.concat([
    cipher.update(Buffer.from(JSON.stringify(data), 'utf8')),
    cipher.final(),
  ])
  return [iv, ciphertext, cipher.getAuthTag()].map(b => b.toString('base64url')).join('.')
}

export function unseal<T>(secret: string, value: string): T | null {
  try {
    const parts = value.split('.')
    if (parts.length !== 3) {
      return null
    }
    const [iv, ciphertext, tag] = parts
    const decipher = createDecipheriv('aes-256-gcm', deriveKey(secret), Buffer.from(iv, 'base64url'))
    decipher.setAuthTag(Buffer.from(tag, 'base64url'))
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(ciphertext, 'base64url')),
      decipher.final(),
    ])
    return JSON.parse(plaintext.toString('utf8')) as T
  } catch {
    return null
  }
}

export function isEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}

/** Self check: `node -e "import('./src/server/session-crypto.ts').then(m => m.demo())"` */
export function demo(): void {
  const assert = (cond: unknown, msg: string) => {
    if (!cond) {
      throw new Error('session-crypto demo failed: ' + msg)
    }
  }

  const secret = 'test-secret'
  const payload = { token: 'gho_abc', login: 'alex3236', nested: { n: 42 } }

  const sealed = seal(secret, payload)
  assert(sealed !== seal(secret, payload), 'seal must be randomized by the iv')
  assert(JSON.stringify(unseal(secret, sealed)) === JSON.stringify(payload), 'round trip')

  const [iv, , tag] = sealed.split('.')
  const tampered = [iv, Buffer.from('{"token":"evil"}').toString('base64url'), tag].join('.')
  assert(unseal(secret, tampered) === null, 'tampered ciphertext must be rejected')
  assert(unseal('other-secret', sealed) === null, 'wrong secret must be rejected')
  assert(unseal(secret, 'garbage') === null, 'garbage must be rejected')

  assert(isEqualString('abc', 'abc'), 'equal strings')
  assert(!isEqualString('abc', 'abd'), 'different strings')

  console.log('session-crypto demo passed')
}
