/**
 * TokenResolver — Figma Color Styles -> CSS custom properties.
 *
 * `--c-<key>` — значение Figma-стиля, редактируемое.
 * `--k-<key>` — render-константа, в Figma такого стиля нет, не редактируется.
 *
 * FIXED указывает на эти переменные, поэтому экраны подхватывают значения
 * без правок в своих файлах.
 */

import { FIGMA_STYLES, RENDER_CONSTANTS, cssVarName, constVarName } from './tokens'

/**
 * Legacy-псевдонимы экранов MVP. Каждый указывает на реальный Figma-стиль.
 * Примечание: в Figma CTA логина завязан на `secondary`, здесь он пока идёт
 * от `primary` — по-элементная разводка запланирована отдельным шагом.
 */
const LEGACY_ALIASES: Record<string, string> = {
  '--brand-primary': 'primary',
  '--brand-on-primary': 'authorizationTextHighEmphasis',
  '--brand-on-auth-background': 'authorizationTextMediumEmphasis',
  '--brand-auth-progress': 'progressBar',
}

/** Ссылки на переменные для инлайновых стилей экранов. Имена полей с MVP не менялись. */
export const FIXED = {
  surface: `var(${constVarName('surface')})`,
  surfaceGrey: `var(${cssVarName('backgr')})`,
  neutral100: `var(${cssVarName('backgr')})`,
  divider: `var(${constVarName('divider')})`,
  textHigh: `var(${constVarName('textPrimary')})`,
  textMedium: `var(${constVarName('textSecondary')})`,
  textDisabled: `var(${constVarName('textDisabled')})`,
  stub: `var(${cssVarName('stub')})`,
  navbarElement: `var(${cssVarName('navBarElement')})`,
  correct: `var(${cssVarName('correct')})`,
  wrong: `var(${cssVarName('wrong')})`,
  // Не цвета — остаются константами.
  radiusSm: '4px',
  radiusMd: '6px',
} as const

export type BrandCssVars = Record<string, string>

/** Значения Figma-стилей: key -> HEX. */
export type ColorState = Record<string, string>

export function resolveTokens(colors: ColorState): BrandCssVars {
  const vars: BrandCssVars = {}

  for (const s of FIGMA_STYLES) {
    const v = colors[s.key]
    vars[cssVarName(s.key)] = typeof v === 'string' && v.length > 0 ? v : s.hex
  }
  for (const [key, hex] of Object.entries(RENDER_CONSTANTS)) {
    vars[constVarName(key)] = hex
  }
  for (const [alias, styleKey] of Object.entries(LEGACY_ALIASES)) {
    vars[alias] = `var(${cssVarName(styleKey)})`
  }
  return vars
}

export const LEGACY_ALIAS_MAP = LEGACY_ALIASES

/* ── Контраст ───────────────────────────────────────────────────────────── */

/** Принимает #RGB, #RRGGBB и #RRGGBBAA; альфа игнорируется. */
export function luminance(hex: unknown): number | null {
  if (typeof hex !== 'string') return null
  let h = hex.trim().replace(/^#/, '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (h.length === 8) h = h.slice(0, 6)
  if (!/^[0-9a-f]{6}$/i.test(h)) return null
  const srgb = [h.slice(0, 2), h.slice(2, 4), h.slice(4, 6)].map((p) => {
    const v = parseInt(p, 16) / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]
}

/** null, если один из цветов не разобран. */
export function contrastRatio(a: unknown, b: unknown): number | null {
  const la = luminance(a)
  const lb = luminance(b)
  if (la === null || lb === null) return null
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

/** Контраст цвета к произвольной относительной яркости 0..1. */
export function contrastToLuminance(color: string, bgLum: number): number | null {
  const l = luminance(color)
  if (l === null) return null
  const [hi, lo] = l > bgLum ? [l, bgLum] : [bgLum, l]
  return (hi + 0.05) / (lo + 0.05)
}
