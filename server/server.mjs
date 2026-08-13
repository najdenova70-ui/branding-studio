import { createServer } from 'node:http'
import { createHash, randomBytes } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const port = Number(process.env.PORT || 8080)
const storeFile = process.env.SHARE_STORE_FILE || '/data/shares.json'
const ttlDays = Math.max(1, Math.min(365, Number(process.env.SHARE_TTL_DAYS || 30)))
const maxRecords = Math.max(100, Math.min(20_000, Number(process.env.SHARE_MAX_RECORDS || 2000)))
const maxBody = 12 * 1024 * 1024
const allowedOrigins = new Set((process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean))
let shares = new Map()
let persistQueue = Promise.resolve()

async function loadStore() {
  try {
    const records = JSON.parse(await readFile(storeFile, 'utf8'))
    shares = new Map(Object.entries(records))
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
  cleanup()
}

function cleanup() {
  const now = Date.now()
  for (const [id, value] of shares) if (Date.parse(value.expiresAt) <= now) shares.delete(id)
}

function persist() {
  const records = Object.fromEntries(shares)
  persistQueue = persistQueue.then(async () => {
    await mkdir(dirname(storeFile), { recursive: true })
    const temporary = `${storeFile}.tmp`
    await writeFile(temporary, JSON.stringify(records), { encoding: 'utf8', mode: 0o600 })
    await rename(temporary, storeFile)
  })
  return persistQueue
}

function json(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' })
  response.end(JSON.stringify(body))
}

async function body(request) {
  let value = ''
  for await (const chunk of request) {
    value += chunk
    if (Buffer.byteLength(value) > maxBody) throw new Error('too-large')
  }
  return JSON.parse(value || '{}')
}

function validBrand(brand) {
  const slots = [
    [brand?.assets?.appIcon, 'data:image/png'],
    [brand?.assets?.logo?.largeWhiteRu, 'data:image/svg+xml'],
    [brand?.assets?.background?.authPhone, 'data:image/png'],
    [brand?.assets?.background?.navigationDrawer, 'data:image/png'],
    [brand?.assets?.background?.mainBanner, 'data:image/png'],
    [brand?.assets?.background?.webHomeBanner, 'data:image/png'],
  ]
  return brand?.schemaVersion === '2.1-tokens'
    && typeof brand.brandId === 'string' && typeof brand.displayName === 'string'
    && slots.every(([slot, mime]) => slot && typeof slot.src === 'string' && slot.src.startsWith(mime) && slot.src.length <= maxBody)
    && brand.colors && typeof brand.colors === 'object'
    && Object.entries(brand.colors).every(([key, value]) => key.length <= 80 && typeof value === 'string' && /^#[0-9A-Fa-f]{3,8}$/.test(value))
}

await loadStore()

createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/api/health') return json(response, 200, { status: 'ok', shares: shares.size })
  if (request.method === 'POST' && request.url === '/api/shares') {
    const origin = request.headers.origin
    const sameOrigin = !origin || (() => { try { return new URL(origin).host === request.headers.host } catch { return false } })()
    if (origin && (allowedOrigins.size > 0 ? !allowedOrigins.has(origin) : !sameOrigin)) return json(response, 403, { error: 'Origin запрещён.' })
    try {
      const input = await body(request)
      if (!validBrand(input.brand)) return json(response, 400, { error: 'Некорректная конфигурация бренда.' })
      const payloadSize = Buffer.byteLength(JSON.stringify(input.brand))
      if (payloadSize > maxBody) return json(response, 413, { error: 'Бренд содержит слишком большие изображения.' })
      cleanup()
      while (shares.size >= maxRecords) {
        const oldest = [...shares.entries()].sort((left, right) => Date.parse(left[1].createdAt) - Date.parse(right[1].createdAt))[0]
        if (!oldest) break
        shares.delete(oldest[0])
      }
      const id = randomBytes(12).toString('base64url')
      const createdAt = new Date().toISOString()
      const expiresAt = new Date(Date.now() + ttlDays * 86_400_000).toISOString()
      const brand = structuredClone(input.brand)
      const record = { id, brand, createdAt, expiresAt, checksum: createHash('sha256').update(JSON.stringify(brand)).digest('hex') }
      shares.set(id, record)
      await persist()
      return json(response, 201, record)
    } catch (error) {
      return json(response, error?.message === 'too-large' ? 413 : 400, { error: 'Не удалось сохранить демонстрацию.' })
    }
  }
  const match = request.url?.match(/^\/api\/shares\/([a-zA-Z0-9_-]+)$/)
  if (request.method === 'GET' && match) {
    cleanup()
    const record = shares.get(match[1])
    if (!record) return json(response, 404, { error: 'Ссылка не найдена или срок её действия истёк.' })
    return json(response, 200, record)
  }
  return json(response, 404, { error: 'Not found' })
}).listen(port, '0.0.0.0', () => process.stdout.write(`Share API listening on ${port}\n`))
