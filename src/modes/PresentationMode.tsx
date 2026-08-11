import { useState } from 'react'
import { SLIDES } from '../registry/SlideRegistry'
import { getScreen } from '../registry/ScreenRegistry'
import { PhonePlate } from '../render/PhonePlate'
import { ScreenRenderer } from '../render/ScreenRenderer'
import { useBrand } from '../brand/BrandContext'
import { resolveAsset } from '../brand/AssetResolver'

export default function PresentationMode() {
  const [index, setIndex] = useState(0)
  const slide = SLIDES[index]
  const { config } = useBrand()
  const icon = resolveAsset(config.assets.appIcon)

  return (
    <div className="bs-pres">
      <div className="bs-pres__nav">
        {SLIDES.map((s, i) => (
          <button key={s.figmaNodeId} className={'bs-chip' + (i === index ? ' is-active' : '')} onClick={() => setIndex(i)}>
            <span>{s.badge === null ? 'Обложка' : `${s.badge}. ${s.title}`}</span>
            <code>{s.figmaNodeId}</code>
          </button>
        ))}
      </div>

      <div className="bs-slide">
        {slide.layout === 'cover' ? (
          <div className="bs-slide__cover">
            <div className="bs-slide__cover-screens">
              {slide.screenRefs.map((id) => (
                <PhonePlate key={id} scale={0.42} label={getScreen(id).title}>
                  <ScreenRenderer screenId={id} interactive={false} />
                </PhonePlate>
              ))}
            </div>
            <div className="bs-slide__cover-text">
              <img className="bs-slide__cover-icon" src={icon.src} alt="" />
              <h1>{config.displayName || 'Без названия'}</h1>
              <p>{slide.subtitle}</p>
              <div className="bs-slide__contacts">+7 495 928 92 20 &nbsp;&nbsp; welcome@e-queo.com</div>
            </div>
          </div>
        ) : (
          <>
            <header className="bs-slide__header">
              <span className="bs-slide__badge">{slide.badge}</span>
              <div>
                <h2>{slide.title}</h2>
                <p>{slide.subtitle}</p>
              </div>
            </header>
            <div className="bs-slide__row">
              {slide.screenRefs.map((id) => (
                <PhonePlate key={id} scale={0.62} label={`${getScreen(id).title} · ${getScreen(id).figmaNodeId}`}>
                  <ScreenRenderer screenId={id} interactive={false} />
                </PhonePlate>
              ))}
            </div>
          </>
        )}

        {slide.omitted.length > 0 && (
          <footer className="bs-slide__omitted">
            <strong>Вне MVP на этом слайде:</strong>
            {slide.omitted.map((o) => (
              <div key={o.figmaNodeId}><code>{o.figmaNodeId}</code> {o.name} — {o.reason}</div>
            ))}
          </footer>
        )}
      </div>

      <div className="bs-pres__pager">
        <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>← Назад</button>
        <span>{index + 1} / {SLIDES.length}</span>
        <button onClick={() => setIndex((i) => Math.min(SLIDES.length - 1, i + 1))} disabled={index === SLIDES.length - 1}>Вперёд →</button>
      </div>
    </div>
  )
}
