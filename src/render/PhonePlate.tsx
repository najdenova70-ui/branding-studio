/**
 * PhonePlate — shared device plate, derived from the Figma presentation
 * wrapper `Group 437` / `Group 438` (Rectangle 309 backing -> Group 436 ->
 * screen -> Rectangle 308 overlay). One component, used by both modes.
 */
import type { ReactNode } from 'react'

export function PhonePlate({
  children, scale = 1, width = 375, height = 812, label, onClick, active = false,
}: {
  children: ReactNode
  scale?: number
  width?: number
  height?: number
  label?: string
  onClick?: () => void
  active?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div
        onClick={onClick}
        style={{
          width: width * scale,
          height: height * scale,
          cursor: onClick ? 'pointer' : 'default',
          flex: 'none',
        }}
      >
        <div style={{
          width, height, transform: `scale(${scale})`, transformOrigin: 'top left',
          position: 'relative', borderRadius: 34, overflow: 'hidden', background: '#FFFFFF',
          boxShadow: active
            ? '0 0 0 2px var(--brand-primary), 0 25px 50px -12px rgba(0,0,0,0.18)'
            : '0 4px 8px rgba(0,0,0,0.05), 0 25px 50px -12px rgba(0,0,0,0.18)',
        }}>
          {children}
        </div>
      </div>
      {label && (
        <div style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', maxWidth: width * scale }}>{label}</div>
      )}
    </div>
  )
}
