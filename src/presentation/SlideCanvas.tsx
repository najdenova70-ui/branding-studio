import { useBrand } from '../brand/BrandContext'
import { resolveAsset } from '../brand/AssetResolver'
import homeIcon from '../assets/presentation/home-solid.svg'
import phoneIcon from '../assets/presentation/phone-solid.svg'
import pattern from '../assets/presentation/slide-pattern.svg'
import type { ScreenId } from '../registry/types'
import type { SlideEntry } from '../registry/SlideRegistry'
import { ScreenRenderer } from '../render/ScreenRenderer'

function Device({ screen, className = '' }: { screen: ScreenId; className?: string }) {
  return (
    <div className={`bs-slide-device ${className}`}>
      <div className="bs-slide-device__screen"><ScreenRenderer screenId={screen} interactive={false} /></div>
    </div>
  )
}

function SlideHeader({ slide }: { slide: SlideEntry }) {
  const iconKind = slide.order === 2 ? 'phone' : 'home'
  const icon = iconKind === 'phone' ? phoneIcon : homeIcon
  return (
    <header className="bs-slide-design__header">
      <span className={`bs-slide-design__icon is-${iconKind}`}><img src={icon} alt="" /></span>
      <span className="bs-slide-design__heading"><strong>{slide.title}</strong><small>{slide.subtitle}</small></span>
    </header>
  )
}

export default function SlideCanvas({ slide, exportSize = false }: { slide: SlideEntry; exportSize?: boolean }) {
  const { config } = useBrand()
  const appIcon = resolveAsset(config.assets.appIcon)

  if (slide.layout === 'cover') {
    return (
      <div className={`bs-slide-design bs-slide-design--cover${exportSize ? ' is-export-size' : ''}`} data-slide-id={slide.figmaNodeId}>
        <img className="bs-slide-design__app-icon" src={appIcon.src} alt="" />
        <div className="bs-slide-design__cover-copy">
          <span className="bs-slide-design__tag">Параметризация</span>
          <h1>{config.displayName}</h1>
          <p>{slide.subtitle}</p>
        </div>
        <div className="bs-slide-design__contacts"><span>+7 495 928 92 20</span><span>welcome@e-queo.com</span></div>
        <Device screen={slide.screenRefs[0]} className="bs-slide-device--cover-back" />
        <Device screen={slide.screenRefs[1]} className="bs-slide-device--cover-front" />
      </div>
    )
  }

  return (
    <div className={`bs-slide-design bs-slide-design--content${exportSize ? ' is-export-size' : ''}`} data-slide-id={slide.figmaNodeId}>
      <img className="bs-slide-design__pattern" src={pattern} alt="" />
      <SlideHeader slide={slide} />
      <div className={`bs-slide-design__screens bs-slide-design__screens--${slide.order}`}>
        {slide.screenRefs.map((screen) => <Device key={screen} screen={screen} />)}
      </div>
      <span className="bs-slide-design__page">{String(slide.order - 1).padStart(2, '0')}/09</span>
    </div>
  )
}
