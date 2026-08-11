/**
 * Figma Color Styles — источник истины.
 *
 * Файл vYi7Zq7m0g88GfMRiKHBeT, 33 локальных Paint Style. Имена и HEX
 * прочитаны напрямую из Figma и совпадают 1:1 — не переименовывать,
 * не нормализовать, не объединять по одинаковому HEX.
 * Прозрачность стиля входит в HEX восьмым-девятым разрядом (#RRGGBBAA).
 *
 * Локальных переменных в файле нет. Всё, что раньше читалось через
 * get_variable_defs, приходит из подключённой библиотеки и источником
 * истины для брендирования НЕ является.
 */

/**
 * Editable Brand Styles — четыре первые группы. Это стили, которые дизайнер
 * штатно меняет при брендировании.
 * Figma Reference Styles — группа `reference`: только просмотр и контроль,
 * редактирование запрещено на уровне контекста.
 */
export type StyleGroup = 'primaryBrand' | 'authorization' | 'navigation' | 'productStates' | 'reference'

export const EDITABLE_GROUPS: StyleGroup[] = ['primaryBrand', 'authorization', 'navigation', 'productStates']

export interface FigmaColorStyle {
  /** Имя стиля в Figma, 1:1. */
  name: string
  /** CSS-безопасный ключ: --c-<key>. Совпадает с name, если тот безопасен. */
  key: string
  /** HEX из Figma, с альфой если у стиля есть прозрачность. */
  hex: string
  group: StyleGroup
  /** Описание стиля из Figma. Пусто, если в Figma его нет. */
  description: string
  /** Влияет ли стиль на прототип прямо сейчас. */
  wired: boolean
  /** Figma прямо просит не менять этот цвет. */
  locked?: boolean
  /** Не сплошная заливка — редактор HEX недоступен. */
  gradient?: boolean
}

export const GROUP_LABELS: Record<StyleGroup, string> = {
  primaryBrand: 'Primary brand colors',
  authorization: 'Authorization',
  navigation: 'Navigation',
  productStates: 'Product states',
  reference: 'Figma Reference Styles',
}

export const FIGMA_STYLES: FigmaColorStyle[] = [
  // ── Primary brand colors ────────────────────────────────────────────────
  {
    name: 'primary', key: 'primary', hex: '#334057', group: 'primaryBrand', wired: true,
    description: 'Этот цвет используется для плашки на главной странице',
  },
  {
    name: 'additional', key: 'additional', hex: '#334057', group: 'primaryBrand', wired: false,
    description: 'Этот цвет используется для выбора варианта ответа в тесте или опросе. В большинстве случаев красится в такой же цвет как и primary',
  },
  {
    name: 'inactive', key: 'inactive', hex: '#33405714', group: 'primaryBrand', wired: false,
    description: 'Используется в качестве подложки для отображения неактивного элемента и отображается под текстом в опросах и тестах',
  },
  {
    name: 'accent', key: 'accent', hex: '#334057', group: 'primaryBrand', wired: false,
    description: 'В большинстве случаев красится в такой же цвет как и primary, хоть и этот цвет почти нигде не встречается',
  },
  {
    name: 'highlight', key: 'highlight', hex: '#33405714', group: 'primaryBrand', wired: false,
    description: 'Используется для выделения юзера в рейтинге, а также для всех выделений элементов. В большинстве случаев красится в такой же цвет как и primary',
  },
  {
    name: 'secondary', key: 'secondary', hex: '#334057', group: 'primaryBrand', wired: false,
    description: 'Этот цвет используется для кнопок',
  },
  {
    name: 'secondaryDisabled', key: 'secondaryDisabled', hex: '#3841524D', group: 'primaryBrand', wired: false,
    description: 'Этот цвет используется для неактивных кнопок и должен быть равен цвету secondary',
  },

  // ── Authorization ───────────────────────────────────────────────────────
  {
    name: 'authorizationButton', key: 'authorizationButton', hex: '#334057', group: 'authorization', wired: false,
    description: 'Этот цвет отвечает за цвет кнопок, сейчас красим его в цвет secondary (исключения — сборки с дизайном кнопок на странице авторизации поверх фона)',
  },
  {
    name: 'authorizationButtonText', key: 'authorizationButtonText', hex: '#FFFFFF', group: 'authorization', wired: true,
    description: 'Отвечает за цвет текста на кнопках (относится только к кнопкам в старых сборках, где кнопки используются на странице авторизации поверх фона)',
  },
  {
    name: 'authorizationButtonOutline', key: 'authorizationButtonOutline', hex: '#FFFFFF', group: 'authorization', wired: false,
    description: 'Отвечает за цвет обводки кнопок (относится только к кнопкам в старых сборках, где кнопки используются на странице авторизации поверх фона)',
  },
  {
    name: 'authorizationButtonTextDisabled', key: 'authorizationButtonTextDisabled', hex: '#FFFFFF66', group: 'authorization', wired: false,
    description: 'Отвечает за неактивный цвет текста на кнопках (относится только к кнопкам в старых сборках, где кнопки используются на странице авторизации поверх фона)',
  },

  // ── Navigation ──────────────────────────────────────────────────────────
  {
    name: 'navBarElementActive', key: 'navBarElementActive', hex: '#334057', group: 'navigation', wired: false,
    description: 'Отвечает за цвет активных элементов на навбаре, а также ползунок видеоплеера',
  },
  {
    name: 'navBarTabActive', key: 'navBarTabActive', hex: '#334057', group: 'navigation', wired: false,
    description: 'Отвечает за цвет табов в навбаре, зачастую он равен цвету primary или secondary',
  },

  // ── Product states ──────────────────────────────────────────────────────
  {
    name: 'notStarted', key: 'notStarted', hex: '#F9A207', group: 'productStates', wired: false,
    description: 'Отвечает за цвет уведомлений',
  },
  {
    name: 'favoriteActive', key: 'favoriteActive', hex: '#F9A207', group: 'productStates', wired: false,
    description: 'Отвечает за цвет флажка добавления в избранное, цвет равен notStarted',
  },

  // ── Остальные Figma Styles (не брендируемые в быстром редакторе) ─────────
  {
    name: 'wrong', key: 'wrong', hex: '#FD4A5C', group: 'reference', wired: false,
    description: 'Этот цвет отвечает за непройденные материалы, а также за неверный вариант ответа',
  },
  {
    name: 'correct', key: 'correct', hex: '#00C08B', group: 'reference', wired: false,
    description: 'Этот цвет отвечает за пройденные материалы, а также за верный вариант ответа',
  },
  { name: 'backgr', key: 'backgr', hex: '#F3F4F5', group: 'reference', wired: true, description: '' },
  { name: 'overlay', key: 'overlay', hex: '#00000080', group: 'reference', wired: false, description: '' },
  {
    name: 'authorizationTextHighEmphasis', key: 'authorizationTextHighEmphasis', hex: '#FFFFFF',
    group: 'reference', wired: false, description: '',
  },
  {
    name: 'authorizationTextMediumEmphasis', key: 'authorizationTextMediumEmphasis', hex: '#FFFFFFCC',
    group: 'reference', wired: true,
    description: 'Отвечает за цвет текста версии приложения на странице авторизации (снизу)',
  },
  { name: 'navBar', key: 'navBar', hex: '#FFFFFF', group: 'reference', wired: false, description: 'Отвечает за цвет навбара' },
  {
    name: 'navBarElement', key: 'navBarElement', hex: '#000000', group: 'reference', wired: true,
    description: 'Отвечает за цвет иконок на навбаре',
  },
  {
    name: 'navBarTabActiveLabel', key: 'navBarTabActiveLabel', hex: '#FFFFFF', group: 'reference', wired: false,
    locked: true, description: 'Этот цвет не меняем',
  },
  {
    name: 'navBarTabNotActive', key: 'navBarTabNotActive', hex: '#00000080', group: 'reference', wired: false,
    locked: true, description: 'Этот цвет не меняем',
  },
  {
    name: 'progressBar', key: 'progressBar', hex: '#FFFFFF', group: 'reference', wired: true,
    description: 'Отвечает за цвет загрузки на странице авторизации (зачастую не меняем)',
  },
  { name: 'progressBarBackground', key: 'progressBarBackground', hex: '#FFFFFF26', group: 'reference', wired: true, description: '' },
  {
    name: 'links', key: 'links', hex: '#5DB9F2', group: 'reference', wired: false, locked: true,
    description: 'Цвет ссылок (обычно не меняем его)',
  },
  { name: 'stub', key: 'stub', hex: '#E4E5E7', group: 'reference', wired: true, description: '' },
  {
    name: 'Store/Фон под макетом', key: 'storeBackdrop', hex: '#FFFFFF', group: 'reference', wired: false,
    gradient: true, description: 'Линейный градиент — редактирование HEX недоступно',
  },
  { name: 'Store / Мокап', key: 'storeMockup', hex: '#FFFFFF', group: 'reference', wired: false, description: 'Store / Мокап' },
  { name: 'Store / Текст', key: 'storeText', hex: '#FFFFFF', group: 'reference', wired: false, description: '' },
  { name: 'Фон под макетами', key: 'mockupsBackground', hex: '#EBEBEB', group: 'reference', wired: false, description: '' },
]

/**
 * Значения отрисовки iOS-хрома. В Figma таких Color Styles НЕТ.
 *
 * Это НЕ часть цветовой системы бренда: они не показываются в панели цветов,
 * не редактируются и не считаются токенами. Держим их здесь, а не россыпью
 * литералов по экранам, чтобы список нефигмовых значений был обозрим и
 * ревьюился. Удалить нельзя — экраны без них не отрисуются, а подходящих
 * Color Styles в Figma не существует (проверено: ближайшие `navBar` #FFFFFF
 * и `navBarElement` #000000 имеют другой смысл).
 */
export const RENDER_CONSTANTS: Record<string, string> = {
  surface: '#FFFFFF',
  divider: '#DEDEDE',
  textPrimary: '#000000',
  textSecondary: '#00000099',
  textDisabled: '#00000061',
}

export const DEFAULT_COLORS: Record<string, string> = Object.fromEntries(
  FIGMA_STYLES.map((s) => [s.key, s.hex]),
)

export const STYLES_BY_KEY: Record<string, FigmaColorStyle> = Object.fromEntries(
  FIGMA_STYLES.map((s) => [s.key, s]),
)

export function stylesInGroup(g: StyleGroup): FigmaColorStyle[] {
  return FIGMA_STYLES.filter((s) => s.group === g)
}

/** Можно ли править стиль из Студии. Reference-стили — только просмотр. */
export function isEditable(key: string): boolean {
  const s = STYLES_BY_KEY[key]
  return !!s && s.group !== 'reference' && !s.gradient
}

/** CSS-переменная Figma-стиля: primary -> --c-primary */
export function cssVarName(key: string): string {
  return `--c-${key}`
}

/** CSS-переменная render-константы: surface -> --k-surface */
export function constVarName(key: string): string {
  return `--k-${key}`
}
