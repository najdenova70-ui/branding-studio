/**
 * NavigationGraph — only edges traceable to a real affordance in the Figma
 * screens. No invented product navigation.
 */
import type { ScreenId } from './types'

export interface NavEdge {
  from: ScreenId
  to: ScreenId
  trigger: string
  /** The Figma affordance this edge comes from. */
  source: string
}

export const EDGES: NavEdge[] = [
  { from: 'splash', to: 'login', trigger: 'После загрузки', source: 'Spinner-IOS 0:105' },
  { from: 'login', to: 'profile', trigger: 'Войти по логину и паролю', source: 'Buttons / Button - Primary 0:422' },
  { from: 'login', to: 'splash', trigger: 'Назад', source: 'Navbar 0:257' },
  { from: 'profile', to: 'drawer', trigger: 'Меню', source: 'Navigation Bar 6135:31167' },
  { from: 'drawer', to: 'profile', trigger: 'menu / iOS / list item', source: 'Frame 1 6135:23175' },
  { from: 'drawer', to: 'splash', trigger: 'Выйти', source: 'footer list item 6135:23189' },
]

/** The demo flow: Splash -> Login -> Profile -> Drawer. */
export const PRIMARY_FLOW: ScreenId[] = ['splash', 'login', 'profile', 'drawer']

/**
 * `test` and `appIconTile` are reachable from the screen selector only —
 * no reliable product navigation path exists to either in the audited Figma.
 */
export const SELECTOR_ONLY: ScreenId[] = ['test', 'appIconTile']

export function edgesFrom(id: ScreenId): NavEdge[] {
  return EDGES.filter((e) => e.from === id)
}
