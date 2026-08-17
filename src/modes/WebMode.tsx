import { resolveAsset } from '../brand/AssetResolver'
import { useBrand } from '../brand/BrandContext'
import { getWebScreen, WEB_SCREENS, type WebScreenId } from '../registry/WebScreenRegistry'
import WebAuthorization from '../screens/WebAuthorization'

export default function WebMode({ selectedId, onSelectedId }: {
  selectedId: WebScreenId
  onSelectedId: (id: WebScreenId) => void
}) {
  const { config } = useBrand()
  const banner = resolveAsset(config.assets.background.webHomeBanner)
  const selected = getWebScreen(selectedId)

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
          {selected.kind === 'authorization'
            ? <WebAuthorization />
            : <img src={selected.src} alt={`Веб-экран «${selected.label}»`} />}
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
              <button className="bs-web-course-hotspot" type="button" onClick={() => onSelectedId('course')} aria-label="Открыть экран курса" />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
