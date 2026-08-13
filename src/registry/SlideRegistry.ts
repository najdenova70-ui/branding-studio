/**
 * SlideRegistry — declarative mirror of the audited `Презентация` page
 * (11:93829), slides 01-03. Slides are generated from this data plus the
 * ScreenRegistry; no branded screenshots are stored anywhere.
 */
import type { ScreenId } from './types'

export type SlideLayout = 'cover' | 'screens-row'

export interface SlideEntry {
  figmaNodeId: string
  /** Canvas order on the Figma page. */
  order: number
  /** Visible badge in Figma; the cover has none. */
  badge: number | null
  title: string
  subtitle: string
  layout: SlideLayout
  screenRefs: ScreenId[]
  /** Screens present on the Figma slide but outside the validated MVP. */
  omitted: { figmaNodeId: string; name: string; reason: string }[]
}

export const SLIDES: SlideEntry[] = [
  {
    figmaNodeId: '8408:34319',
    order: 1,
    badge: null,
    title: 'Эквио',
    subtitle: 'Мобильная платформа для обучения и бизнес-коммуникации',
    layout: 'cover',
    screenRefs: ['home', 'splash'],
    omitted: [],
  },
  {
    figmaNodeId: '8408:34336',
    order: 2,
    badge: 1,
    title: 'Начальный экран и боковое меню',
    subtitle: 'Экраны регистрации и авторизации в приложении, брендированные с использованием фирменной символики, цветов и графики',
    layout: 'screens-row',
    screenRefs: ['splash', 'login', 'drawer'],
    omitted: [
      { figmaNodeId: '3210:8780', name: 'iPhone - 28 — Помощь со входом', reason: 'Not in the validated MVP screen set.' },
    ],
  },
  {
    figmaNodeId: '8408:32457',
    order: 3,
    badge: 2,
    title: 'Главная и профиль',
    subtitle: 'Стартовая страница с ключевой информацией и персональными данными',
    layout: 'screens-row',
    screenRefs: ['mainBanner', 'mainContent', 'profile'],
    omitted: [],
  },
]
