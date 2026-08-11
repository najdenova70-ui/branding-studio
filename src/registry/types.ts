export type ScreenId = 'appIconTile' | 'splash' | 'login' | 'profile' | 'drawer' | 'test'

export interface ScreenProps {
  onNavigate?: (to: ScreenId) => void
}

/** BrandConfig fields a screen actually consumes — from the validated audit. */
export type BrandField =
  | 'assets.appIcon'
  | 'assets.logo.largeWhiteRu'
  | 'assets.background.authPhone'
  | 'assets.background.navigationDrawer'
  | 'colors.primary'
  | 'colors.onPrimary'
  | 'colors.onAuthBackground'
  | 'colors.authProgress'

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
