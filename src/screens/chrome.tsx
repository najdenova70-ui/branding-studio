/**
 * Fixed iOS chrome reproduced from Figma. Nothing here is brandable.
 * Sources: `Navbar / iOS /iOS - Status Bar - iPhone X - White`,
 * `iOS / Home Indicator / 1. iPhone X · Default`, `Navigation Bar`.
 */
import { FIXED } from '../brand/TokenResolver'
import wifiWhite from '../assets/presentation/wifi-white.svg'
import wifiBlack from '../assets/presentation/wifi-black.svg'

export function StatusBar({ time = '17:57', light = false }: { time?: string; light?: boolean }) {
  const c = light ? '#FFFFFF' : FIXED.textHigh
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 375, height: 44,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px 0 24px', color: c, fontSize: 15, fontWeight: 600, letterSpacing: -0.24,
    }}>
      <span>{time}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <svg width="17" height="11" viewBox="0 0 17 11" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={i * 4.5} y={8 - i * 2.4} width="3" height={3 + i * 2.4} rx="0.8" fill={c} />
          ))}
        </svg>
        <img src={light ? wifiWhite : wifiBlack} width={light ? 17.5 : 15.3} height={light ? 12.6 : 11} alt="" />
        <svg width="25" height="12" viewBox="0 0 25 12" aria-hidden>
          <rect x="0.5" y="0.5" width="21" height="11" rx="3" fill="none" stroke={c} opacity="0.4" />
          <rect x="2" y="2" width="18" height="8" rx="1.7" fill={c} />
          <path d="M23 4v4a2.2 2.2 0 0 0 0-4Z" fill={c} opacity="0.5" />
        </svg>
      </span>
    </div>
  )
}

export function HomeIndicator({ top = 778, light = false }: { top?: number; light?: boolean }) {
  return (
    <div style={{ position: 'absolute', top, left: 0, width: 375, height: 34 }}>
      <div style={{
        position: 'absolute', left: 120.5, top: 21, width: 134, height: 5, borderRadius: 3,
        background: light ? '#FFFFFF' : '#000000',
      }} />
    </div>
  )
}

export function ChevronLeft({ color = FIXED.navbarElement }: { color?: string }) {
  return (
    <svg width="12" height="20" viewBox="0 0 12 20" aria-hidden>
      <path d="M10 1 2 10l8 9" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ChevronRight({ color = '#C4C4C6' }: { color?: string }) {
  return (
    <svg width="9" height="15" viewBox="0 0 9 15" aria-hidden>
      <path d="M1 1l6.5 6.5L1 14" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** `Navigation Bar` — 375x96 (44 status bar + 52 title row). */
export function NavigationBar({
  title, onBack, showBack = true, trailing,
}: { title?: string; onBack?: () => void; showBack?: boolean; trailing?: React.ReactNode }) {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: 375, height: 96, background: FIXED.surface }}>
      <StatusBar />
      <div style={{ position: 'absolute', top: 44, left: 0, width: 375, height: 52 }}>
        {showBack && (
          <button onClick={onBack} aria-label="Назад" style={{
            position: 'absolute', left: 16, top: 16, width: 24, height: 20,
            background: 'none', border: 'none', padding: 0, cursor: onBack ? 'pointer' : 'default',
          }}>
            <ChevronLeft />
          </button>
        )}
        {title && (
          <div style={{
            position: 'absolute', left: 0, top: 15, width: 375, textAlign: 'center',
            fontSize: 17, fontWeight: 600, letterSpacing: -0.408, color: FIXED.textHigh,
          }}>{title}</div>
        )}
        {trailing}
      </div>
    </div>
  )
}
