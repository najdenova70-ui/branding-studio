/**
 * Auth splash — Figma `iPhone - 25` 3098:54515 (twin of `iPhone - 01` 11:21459).
 * Brandable: background.authPhone (Scale), logo.largeWhiteRu,
 *            brand.onAuthBackground, brand.authProgress.
 */
import { useBrand } from '../brand/BrandContext'
import { resolveAsset } from '../brand/AssetResolver'
import { StatusBar, HomeIndicator } from './chrome'
import type { ScreenProps } from '../registry/types'

export default function AuthSplash({ onNavigate }: ScreenProps) {
  const { config } = useBrand()
  const bg = resolveAsset(config.assets.background.authPhone)
  const logo = resolveAsset(config.assets.logo.largeWhiteRu)

  return (
    <div
      style={{ position: 'absolute', inset: 0, background: '#0B0C14', cursor: 'pointer' }}
      onClick={() => onNavigate?.('login')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onNavigate?.('login')}
    >
      {/* Figma instance 0:59 renders 375x813 — one px taller than the component. */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 375, height: 813 }}>
        <img src={bg.src} style={bg.style} data-figma-node={bg.figmaNodeId} alt="" />
      </div>

      {/* `cover` frame 0:60 at (87.5, 68), 200x150 */}
      <div style={{ position: 'absolute', left: 87.5, top: 68, width: 200, height: 150 }}>
        <img
          src={logo.src}
          data-figma-node={logo.figmaNodeId}
          alt={config.displayName}
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        />
      </div>

      <StatusBar light />

      {/* Spinner — Figma `Spinner-IOS / Size 4: Large` inside Ellipse 18 (167, 683) 42x42 */}
      <div style={{ position: 'absolute', left: 167, top: 683, width: 42, height: 42 }}>
        <div
          className="bs-spinner"
          style={{
            width: 42, height: 42, borderRadius: '50%',
            // Figma даёт для подложки отдельный стиль progressBarBackground #FFFFFF26.
            border: '3px solid var(--c-progressBarBackground)',
            borderTopColor: 'var(--c-progressBar)',
          }}
        />
      </div>

      {/* Label 0:102 at (130, 756) 114x16 */}
      <div style={{
        position: 'absolute', left: 130, top: 756, width: 114, height: 16,
        textAlign: 'center', fontSize: 13, lineHeight: '16px',
        color: 'var(--brand-on-auth-background)', opacity: 0.6,
      }}>
        v 5.8.0 (11) by ekvio
      </div>

      <HomeIndicator light />
    </div>
  )
}
