/**
 * Neutral app-icon preview tile.
 *
 * Scope correction #1: the Apple springboard 11:21468 is NOT reproduced.
 * Its only branding value was one 60x60 instance of `app-icon` (11:21514);
 * its cost was redistributing Apple's wallpaper, App Store icon and dock.
 * This is a Studio preview surface, not a product screen — it shows the real
 * assets.appIcon slot at its Figma-intrinsic 60x60 plus a 120px inspection size.
 */
import { useBrand } from '../brand/BrandContext'
import { resolveAsset } from '../brand/AssetResolver'
import { FIXED } from '../brand/TokenResolver'

/** iOS squircle approximation: 22.37% of the tile edge. */
const R = 0.2237

function Tile({ size, src, node }: { size: number; src: string; node: string }) {
  return (
    <div
      data-figma-node={node}
      style={{
        width: size, height: size, borderRadius: size * R, overflow: 'hidden',
        boxShadow: '0 4px 8px rgba(0,0,0,0.05), 0 3px 7px -3px rgba(0,0,0,0.08)',
        background: FIXED.surface, flex: 'none',
      }}
    >
      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    </div>
  )
}

export default function AppIconTile() {
  const { config } = useBrand()
  const icon = resolveAsset(config.assets.appIcon)

  return (
    <div style={{
      position: 'absolute', inset: 0, background: FIXED.neutral100,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <Tile size={120} src={icon.src} node={icon.figmaNodeId} />
        <div style={{ fontSize: 17, lineHeight: '22px', fontWeight: 600, letterSpacing: -0.408, color: FIXED.textHigh }}>
          {config.displayName || 'Без названия'}
        </div>
        <div style={{ fontSize: 12, lineHeight: '16px', color: FIXED.textMedium }}>120 × 120 — preview</div>
      </div>

      <div style={{ width: 240, height: 1, background: FIXED.divider }} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <Tile size={60} src={icon.src} node={icon.figmaNodeId} />
        <div style={{ fontSize: 12, lineHeight: '16px', textAlign: 'center', color: FIXED.textMedium }}>
          60 × 60 — intrinsic size<br />Figma <code>{icon.figmaNodeId}</code>
        </div>
      </div>
    </div>
  )
}
