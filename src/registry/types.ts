export type ScreenId = 'home' | 'appIconTile' | 'splash' | 'login' | 'profile' | 'drawer' | 'test' | 'mainBanner' | 'mainContent'

export interface ScreenProps {
  onNavigate?: (to: ScreenId) => void
}

/** BrandConfig fields a screen actually consumes — from the validated audit. */
export type BrandField =
  | 'assets.appIcon'
  | 'assets.logo.largeWhiteRu'
  | 'assets.background.authPhone'
  | 'assets.background.mainBanner'
  | 'assets.background.navigationDrawer'
  | 'colors.primary'
  | 'colors.additional'
  | 'colors.inactive'
  | 'colors.secondary'
  | 'colors.authorizationButton'
  | 'colors.authorizationButtonText'
  | 'colors.authorizationTextHighEmphasis'
  | 'colors.authorizationTextMediumEmphasis'
  | 'colors.progressBar'
  | 'colors.progressBarBackground'

export interface ScreenEntry {
  id: ScreenId
  title: string
  /** Traceability to Figma. `null` for the Studio-only preview surface. */
  figmaNodeId: string | null
  figmaName: string
  width: number
  height: number
  brandFields: BrandField[]
  component: React.ComponentType<ScreenProps>
}
