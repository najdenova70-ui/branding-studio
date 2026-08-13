import homeWide from '../assets/web-screens/home-wide.webp'
import courseDetail from '../assets/web-screens/course-detail.webp'
import { resolveAsset } from '../brand/AssetResolver'
import { useBrand } from '../brand/BrandContext'

const WEB_SCREENS = [
  { id: 'home', label: 'Главная', size: '1312 × 760', width: 1312, height: 760, src: homeWide, figmaNodeId: '4206:201963' },
  { id: 'course', label: 'Основы веб-разработки', size: '1280 × 768', width: 1280, height: 768, src: courseDetail, figmaNodeId: '6785:27550' },
] as const

export type WebScreenId = (typeof WEB_SCREENS)[number]['id']

export default function WebMode({ selectedId, onSelectedId }: {
  selectedId: WebScreenId
  onSelectedId: (id: WebScreenId) => void
}) {
  const { config } = useBrand()
  const banner = resolveAsset(config.assets.background.webHomeBanner)
  const selected = WEB_SCREENS.find((screen) => screen.id === selectedId) ?? WEB_SCREENS[0]

  return (
    <div className="bs-web-mode">
      <div className="bs-web-mode__tabs" aria-label="Веб-экраны">
        {WEB_SCREENS.map((screen) => (
          <button key={screen.id} type="button" className={selected.id === screen.id ? 'is-active' : ''} onClick={() => onSelectedId(screen.id)}>
            <strong>{screen.label}</strong><span>{screen.size}</span>
          </button>
        ))}
      </div>
      <div className="bs-web-mode__stage">
        <div className="bs-web-mode__canvas" style={{ aspectRatio: `${selected.width} / ${selected.height}`, maxWidth: selected.width }} data-figma-node={selected.figmaNodeId}>
          <img src={selected.src} alt={`Веб-экран «${selected.label}»`} />
          {selected.id === 'home' && (
            <>
              <div className="bs-web-home-banner">
                <img src={banner.src} style={banner.style} alt="" />
                <div className="bs-web-home-banner__shade" />
                <div className="bs-web-home-banner__copy">
                  <strong>Добро пожаловать<br />на учебный портал Эквио</strong>
                  <span>Откройте для себя интересные курсы<br />и гибко обучайтесь в любое время и в<br />любом месте!</span>
                  <button type="button">Перейти к курсам</button>
                </div>
                <i className="is-left">‹</i><i className="is-right">›</i>
              </div>
              <button className="bs-web-course-hotspot" type="button" onClick={() => onSelectedId('course')} aria-label="Открыть курс «Основы веб-разработки»" />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
