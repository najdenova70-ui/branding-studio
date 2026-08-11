/**
 * Navigation Drawer — Figma `Navigation Drawer iOS` 6135:23134.
 *
 * Phase-4 resolution (U1): the drawer header 6135:23171 stacks four layers.
 * The topmost is an opaque, full-bleed instance of `Background / Navigation`
 * 11:18482 — the annotated brandable component — which fully occludes the
 * stock photo, the blurred shadow and the legacy 6135:22084 artwork beneath.
 * Only that topmost layer is bound here. Layers 1-3 are intentionally absent.
 */
import { useBrand } from '../brand/BrandContext'
import { resolveAsset, } from '../brand/AssetResolver'
import { FIXED } from '../brand/TokenResolver'
import { StatusBar, HomeIndicator } from './chrome'
import type { ScreenProps } from '../registry/types'

const MENU = [
  'Главная', 'Программы обучения', 'Задания', 'Курсы и брифы', 'Видеоканал',
  'Тесты и опросы', 'База знаний', 'Сообщения', 'Мои результаты', 'Моя команда',
  'Рейтинги', 'Магазин подарков', 'Настройки',
]

export default function NavigationDrawer({ onNavigate }: ScreenProps) {
  const { config } = useBrand()
  const header = resolveAsset(config.assets.background.navigationDrawer)

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#8A8A8E' }}>
      {/* Peek of the underlying screen at x=304 (Figma instance 1027 at 304,0) */}
      <div style={{ position: 'absolute', left: 304, top: 0, width: 375, height: 812, background: FIXED.surface }} />

      {/* Drawer panel — 304 wide */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 304, height: 812, background: FIXED.surface, overflow: 'hidden' }}>
        {/* Background / Navigation — 304x175 at y=44, Scale fit */}
        <div style={{ position: 'absolute', left: 0, top: 44, width: 304, height: 175, overflow: 'hidden' }}>
          <img src={header.src} style={header.style} data-figma-node={header.figmaNodeId} alt="" />

          {/* Frame 14480 at (16, 73) — avatar + identity, sits above the header image */}
          <div style={{ position: 'absolute', left: 16, top: 29, width: 272 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(255,255,255,0.22)', border: '2px solid rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF', fontSize: 22, fontWeight: 600,
            }}>ИР</div>
            <div style={{ marginTop: 16, fontSize: 17, lineHeight: '22px', fontWeight: 600, letterSpacing: -0.408, color: '#FFFFFF' }}>
              Иванов Роман
            </div>
            <div style={{ marginTop: 2, display: 'flex', gap: 16, color: '#FFFFFF', fontSize: 13, lineHeight: '18px' }}>
              <span>♦ 3 место</span>
              <span>◎ 1200 баллов</span>
            </div>
          </div>
        </div>

        {/* Frame 1 — 13 x `menu / iOS / list item` (304x48) from y=219 */}
        <div style={{ position: 'absolute', left: 0, top: 219, width: 304 }}>
          {MENU.map((label, i) => (
            <button
              key={label}
              onClick={() => onNavigate?.(i === 0 ? 'profile' : 'profile')}
              style={{
                position: 'relative', display: 'block', width: 304, height: 48, textAlign: 'left',
                background: 'none', border: 'none', padding: '0 16px', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <span style={{
                position: 'absolute', left: 16, top: 14, width: 20, height: 20, borderRadius: 4,
                border: `1.6px solid ${FIXED.navbarElement}`, opacity: 0.75,
              }} />
              <span style={{
                position: 'absolute', left: 52, top: 13, fontSize: 15, lineHeight: '20px',
                letterSpacing: -0.24, color: FIXED.textHigh,
              }}>{label}</span>
              {i === 1 && (
                <span style={{
                  position: 'absolute', right: 16, top: 15, height: 18, padding: '0 8px', borderRadius: 9,
                  background: '#D8FE5C', color: '#1A1A1A', fontSize: 11, lineHeight: '18px', fontWeight: 600,
                }}>NEW</span>
              )}
            </button>
          ))}
        </div>

        {/* Footer list item at y=764 */}
        <button
          onClick={() => onNavigate?.('splash')}
          style={{
            position: 'absolute', left: 0, top: 764, width: 304, height: 48, textAlign: 'left',
            background: 'none', border: 'none', padding: '0 16px', cursor: 'pointer', fontFamily: 'inherit',
            borderTop: `1px solid ${FIXED.divider}`,
          }}
        >
          <span style={{ position: 'absolute', left: 52, top: 13, fontSize: 15, lineHeight: '20px', letterSpacing: -0.24, color: FIXED.textHigh }}>
            Выйти
          </span>
        </button>
      </div>

      <StatusBar />
      <HomeIndicator />
    </div>
  )
}
