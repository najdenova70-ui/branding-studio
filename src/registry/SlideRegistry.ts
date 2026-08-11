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
    figmaNodeId: '11:104896',
    order: 1,
    badge: null,
    title: 'Эквио',
    subtitle: 'Мобильная платформа для обучения и бизнес-коммуникации',
    layout: 'cover',
    screenRefs: ['appIconTile', 'splash'],
    omitted: [
      {
        figmaNodeId: '11:21468',
        name: 'Home (Apple springboard)',
        reason: 'Excluded by scope correction #1 — replaced by the neutral app-icon tile.',
      },
    ],
  },
  {
    figmaNodeId: '11:108085',
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
    figmaNodeId: '11:108182',
    order: 3,
    badge: 2,
    title: 'Прогресс и Профиль',
    subtitle: 'После авторизации пользователь видит главный экран приложения и информацию о себе',
    layout: 'screens-row',
    screenRefs: ['profile'],
    omitted: [
      { figmaNodeId: '6137:110093', name: '1027 — главная с баннером', reason: 'Replaced by scope correction #2 — brand-primary surface unverified.' },
      { figmaNodeId: '6135:32247', name: '1026 — главная без баннера', reason: 'Not in the validated MVP screen set.' },
    ],
  },
]
