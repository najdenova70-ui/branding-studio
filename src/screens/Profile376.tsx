/**
 * Profile — Figma `376` 6135:62217.
 * Chosen over `iPhone - 21` because it is the only MVP screen binding BOTH
 * `primary` (#334057) and `Text on Primary / High Emphasis` (#FFFFFF).
 * Two brand-primary surfaces: the profile card (6135:31188) and the four
 * row icon tiles inside Group 748 (6135:31203).
 */
import { useBrand } from '../brand/BrandContext'
import { FIXED } from '../brand/TokenResolver'
import { NavigationBar, HomeIndicator, ChevronRight } from './chrome'
import type { ScreenProps } from '../registry/types'

const ROWS = [
  { label: 'Избранное', sub: '1 материал', glyph: 'bookmark' },
  { label: 'Информация о вас', sub: null, glyph: 'info' },
  { label: 'Загрузки', sub: null, glyph: 'download' },
  { label: 'Настройки', sub: null, glyph: 'settings' },
] as const

function RowGlyph({ kind }: { kind: (typeof ROWS)[number]['glyph'] }) {
  const s = { fill: 'none', stroke: 'var(--brand-on-primary)', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
      {kind === 'bookmark' && <path d="M5 3h10v14l-5-4-5 4z" {...s} />}
      {kind === 'info' && <><circle cx="10" cy="10" r="7.5" {...s} /><path d="M10 9v5M10 6.2v.1" {...s} /></>}
      {kind === 'download' && <><path d="M10 3v9M6.5 8.5 10 12l3.5-3.5" {...s} /><path d="M4 15h12" {...s} /></>}
      {kind === 'settings' && <><circle cx="10" cy="10" r="2.8" {...s} /><path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4" {...s} /></>}
    </svg>
  )
}

export default function Profile376({ onNavigate }: ScreenProps) {
  const { config } = useBrand()

  return (
    <div style={{ position: 'absolute', inset: 0, background: FIXED.neutral100 }}>
      <NavigationBar
        title="Профиль"
        onBack={() => onNavigate?.('login')}
        trailing={
          <button
            onClick={() => onNavigate?.('drawer')}
            aria-label="Меню"
            style={{ position: 'absolute', right: 16, top: 16, width: 22, height: 20, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden>
              {[0, 7, 14].map((y) => <rect key={y} x="0" y={y} width="22" height="2" rx="1" fill={FIXED.navbarElement} />)}
            </svg>
          </button>
        }
      />

      {/* Cards / iOS / Profile — 6135:31188 at (17, 112) 340x151 */}
      <div style={{
        position: 'absolute', left: 17, top: 112, width: 340, height: 151, borderRadius: 12,
        background: 'var(--brand-primary)',
      }}>
        <div style={{
          position: 'absolute', left: 138, top: 24, width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(255,255,255,0.22)', border: '2px solid rgba(255,255,255,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--brand-on-primary)', fontSize: 22, fontWeight: 600,
        }}>
          ИР
        </div>
        <div style={{
          position: 'absolute', left: 0, top: 105, width: 340, textAlign: 'center',
          fontSize: 17, lineHeight: '22px', fontWeight: 600, letterSpacing: -0.408,
          color: 'var(--brand-on-primary)',
        }}>
          Иванов Роман
        </div>
      </div>

      {/* Group 748 — 6135:31203 at (18, 279) 339x253, four ~63px rows */}
      <div style={{
        position: 'absolute', left: 18, top: 279, width: 339, height: 253,
        background: FIXED.surface, borderRadius: 12, overflow: 'hidden',
      }}>
        {ROWS.map((r, i) => (
          <div key={r.label} style={{ position: 'relative', height: 63 }}>
            <div style={{
              position: 'absolute', left: 16, top: 15, width: 32, height: 32, borderRadius: 8,
              background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <RowGlyph kind={r.glyph} />
            </div>
            <div style={{ position: 'absolute', left: 62, top: r.sub ? 12 : 21 }}>
              <div style={{ fontSize: 17, lineHeight: '22px', letterSpacing: -0.408, color: FIXED.textHigh }}>{r.label}</div>
              {r.sub && <div style={{ fontSize: 13, lineHeight: '18px', letterSpacing: -0.078, color: FIXED.textMedium }}>{r.sub}</div>}
            </div>
            <div style={{ position: 'absolute', right: 16, top: 24 }}><ChevronRight /></div>
            {i < ROWS.length - 1 && (
              <div style={{ position: 'absolute', left: 62, right: 0, bottom: 0, height: 1, background: FIXED.divider }} />
            )}
          </div>
        ))}
      </div>

      <HomeIndicator top={779.5} />
      <span hidden>{config.brandId}</span>
    </div>
  )
}
