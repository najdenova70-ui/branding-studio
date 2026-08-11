/** Общие элементы управления цветом. Используются Brand Colors и Advanced tokens. */
import { useBrand } from '../brand/BrandContext'

/** #RRGGBBAA -> #RRGGBB для <input type="color">. */
export function rgbPart(v: string): string {
  const h = v.trim().replace(/^#/, '')
  if (h.length === 3) return '#' + h.split('').map((c) => c + c).join('')
  if (h.length >= 6) return '#' + h.slice(0, 6).toUpperCase()
  return '#000000'
}

export function alphaPart(v: string): string {
  const h = v.trim().replace(/^#/, '')
  return h.length === 8 ? h.slice(6, 8).toUpperCase() : ''
}

export function Swatch({ color, size = 'md' }: { color: string; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={`bs-swatch bs-swatch--${size}`}>
      <span style={{ background: color }} />
    </span>
  )
}

/** Значение токена с защитой от нестрокового state. */
export function useTokenValue(tokenId: string, fallback: string): string {
  const { config } = useBrand()
  const raw = config.colors[tokenId]
  return typeof raw === 'string' && raw.length > 0 ? raw : fallback
}

export function ColorEditor({ tokenId, fallback }: { tokenId: string; fallback: string }) {
  const { setColor, resetColor } = useBrand()
  const value = useTokenValue(tokenId, fallback)
  const dirty = value.toUpperCase() !== fallback.toUpperCase()

  return (
    <div className="bs-color">
      <input
        type="color"
        aria-label={`${tokenId} — палитра`}
        value={rgbPart(value)}
        onChange={(e) => setColor(tokenId, e.target.value.toUpperCase() + alphaPart(value))}
      />
      <input
        type="text"
        aria-label={`${tokenId} — HEX`}
        value={value.toUpperCase()}
        spellCheck={false}
        onChange={(e) => {
          const v = e.target.value.toUpperCase()
          if (/^#[0-9A-F]{0,8}$/.test(v)) setColor(tokenId, v)
        }}
      />
      <button className="bs-link" onClick={() => resetColor(tokenId)} disabled={!dirty}>Сброс</button>
    </div>
  )
}
