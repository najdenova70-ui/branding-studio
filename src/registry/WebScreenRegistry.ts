import homeWide from '../assets/web-screens/home-wide.webp'
import courseDetail from '../assets/web-screens/course-detail.webp'
import type { AssetPath } from '../brand/BrandConfig'

export type WebScreenId = 'authorization' | 'home' | 'course'

export interface WebScreenDefinition {
  id: WebScreenId
  label: string
  size: string
  width: number
  height: number
  figmaNodeId: string
  assetPaths: readonly AssetPath[]
  kind: 'authorization' | 'static'
  src?: string
}

export const WEB_SCREENS: readonly WebScreenDefinition[] = [
  {
    id: 'authorization', label: 'Авторизация', size: '1280 × 720', width: 1280, height: 720,
    figmaNodeId: '8470:8952', assetPaths: ['web.authorization.background', 'web.authorization.logo'], kind: 'authorization',
  },
  {
    id: 'home', label: 'Главная', size: '1312 × 760', width: 1312, height: 760,
    figmaNodeId: '4206:201963', assetPaths: ['background.webHomeBanner'], kind: 'static', src: homeWide,
  },
  {
    id: 'course', label: 'Креативное мышление', size: '1335 × 812', width: 1335, height: 812,
    figmaNodeId: '8444:23884', assetPaths: [], kind: 'static', src: courseDetail,
  },
]

export function getWebScreen(id: WebScreenId): WebScreenDefinition {
  return WEB_SCREENS.find((screen) => screen.id === id) ?? WEB_SCREENS[0]
}
