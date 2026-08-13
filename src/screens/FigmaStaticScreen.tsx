import mainBanner from '../assets/figma-screens/main-banner.webp'
import mainContent from '../assets/figma-screens/main-content.webp'
import { resolveAsset } from '../brand/AssetResolver'
import { useBrand } from '../brand/BrandContext'
import type { ScreenId } from '../registry/types'

const SOURCES: Partial<Record<ScreenId, string>> = {
  mainBanner,
  mainContent,
}

export default function FigmaStaticScreen({ screenId }: { screenId: 'mainBanner' | 'mainContent' }) {
  return <img className="bs-figma-static-screen" src={SOURCES[screenId]} alt="" />
}

export function MainBannerScreen() {
  const { config } = useBrand()
  const banner = resolveAsset(config.assets.background.mainBanner)
  return (
    <>
      <FigmaStaticScreen screenId="mainBanner" />
      <div className="bs-main-banner">
        <img src={banner.src} style={banner.style} alt="" />
        <div className="bs-main-banner__copy">
          <strong>Добро пожаловать на<br />учебный портал Эквио</strong>
          <span>Откройте для себя интересные курсы и<br />гибко обучайтесь в любое время<br />Откройте для себя интересные кур</span>
          <button type="button">Посмотреть</button>
        </div>
      </div>
    </>
  )
}
export function MainContentScreen() { return <FigmaStaticScreen screenId="mainContent" /> }
