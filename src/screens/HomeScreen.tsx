import { useBrand } from '../brand/BrandContext'
import { resolveAsset } from '../brand/AssetResolver'
import wallpaper from '../assets/home-screen/wallpaper.png'
import dock from '../assets/home-screen/dock.svg'
import dockPhone from '../assets/home-screen/dock-phone.png'
import dockSafari from '../assets/home-screen/dock-safari.png'
import dockContacts from '../assets/home-screen/dock-contacts.png'
import dockMusic from '../assets/home-screen/dock-music.png'
import appStore from '../assets/home-screen/app-store.svg'
import appStoreGlyph from '../assets/home-screen/app-store-glyph.svg'
import { StatusBar } from './chrome'
import type { ScreenProps } from '../registry/types'

export default function HomeScreen({ onNavigate }: ScreenProps) {
  const { config } = useBrand()
  const appIcon = resolveAsset(config.assets.appIcon)
  return (
    <div className="bs-home-screen">
      <img className="bs-home-screen__wallpaper" src={wallpaper} alt="" />
      <StatusBar time="9:41" light />
      <div className="bs-home-app is-store"><img src={appStore} alt="" /><img className="is-store-glyph" src={appStoreGlyph} alt="" /><span>App Store</span></div>
      <button className="bs-home-app is-brand" type="button" onClick={() => onNavigate?.('splash')} aria-label={`Открыть ${config.displayName || 'приложение'}`}>
        <img src={appIcon.src} style={{ objectFit: appIcon.style.objectFit }} alt="" />
        <span>{config.displayName || 'Без названия'}</span>
      </button>
      <div className="bs-home-screen__dots"><i /><i /><i /></div>
      <img className="bs-home-screen__dock" src={dock} alt="" />
      <img className="bs-home-screen__dock-icon is-phone" src={dockPhone} alt="" />
      <img className="bs-home-screen__dock-icon is-safari" src={dockSafari} alt="" />
      <img className="bs-home-screen__dock-icon is-contacts" src={dockContacts} alt="" />
      <img className="bs-home-screen__dock-icon is-music" src={dockMusic} alt="" />
    </div>
  )
}
