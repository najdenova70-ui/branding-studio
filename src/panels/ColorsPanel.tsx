/** Правая зона — Editable Brand Styles. */
import { useState } from 'react'
import { useBrand } from '../brand/BrandContext'
import { contrastRatio, contrastToLuminance } from '../brand/TokenResolver'
import { EDITABLE_GROUPS, GROUP_LABELS, stylesInGroup, STYLES_BY_KEY, type StyleGroup } from '../brand/tokens'
import { useSplashLuminance } from '../brand/useSplashLuminance'
import StyleCard from './StyleCard'
import ReferenceStyles from './ReferenceStyles'

/** Склонение: 1 стиль, 2 стиля, 5 стилей. */
function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}

function Group({ group, defaultOpen }: { group: StyleGroup; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const { config } = useBrand()
  const styles = stylesInGroup(group)
  const changed = styles.filter((s) => {
    const v = config.colors[s.key]
    return typeof v === 'string' && v.toUpperCase() !== s.hex.toUpperCase()
  }).length

  return (
    <div className="bs-group">
      <button className="bs-group__head" onClick={() => setOpen((o) => !o)}>
        <span className="bs-group__chevron">{open ? '▾' : '▸'}</span>
        <span>{GROUP_LABELS[group]}</span>
        <span className="bs-group__count">{styles.length}{changed > 0 && ` · ${changed} изм.`}</span>
      </button>
      {open && (
        <div className="bs-group__body bs-group__body--cards">
          {styles.map((s) => <StyleCard key={s.key} style={s} />)}
        </div>
      )}
    </div>
  )
}

/** Подсказка по читаемости поверх Splash Background. Значения Figma не меняет. */
function SplashContrastHint() {
  const { config } = useBrand()
  const lum = useSplashLuminance(config.assets.background.authPhone.src)
  if (!lum) return null

  const progress = config.colors.progressBar ?? STYLES_BY_KEY.progressBar.hex
  const spinnerRatio = contrastToLuminance(progress, lum.spinner)
  const statusRatio = contrastToLuminance('#FFFFFF', lum.statusBar)

  const problems: string[] = []
  if (statusRatio !== null && statusRatio < 3) {
    problems.push(`status bar и время (белые) — контраст ${statusRatio.toFixed(1)}:1 к верхней полосе фона`)
  }
  if (spinnerRatio !== null && spinnerRatio < 3) {
    problems.push(`спиннер (progressBar ${progress.toUpperCase()}) — контраст ${spinnerRatio.toFixed(1)}:1 к фону под ним`)
  }
  if (problems.length === 0) return null

  return (
    <div className="bs-warn">
      <strong>Читаемость поверх Splash Background</strong>
      <ul>{problems.map((p) => <li key={p}>{p}</li>)}</ul>
      Экран заставки рисует системные элементы светлыми. Значения Figma-стилей автоматически
      не меняются — замените фон или согласуйте тёмный вариант.
    </div>
  )
}

export default function ColorsPanel() {
  const { config, resetAllColors } = useBrand()
  const ratio = contrastRatio(config.colors.primary, config.colors.authorizationButtonText)
  const low = ratio !== null && ratio < 4.5

  const editable = EDITABLE_GROUPS.reduce((n, g) => n + stylesInGroup(g).length, 0)
  const changed = EDITABLE_GROUPS.flatMap(stylesInGroup).filter((s) => {
    const v = config.colors[s.key]
    return typeof v === 'string' && v.toUpperCase() !== s.hex.toUpperCase()
  }).length

  return (
    <div className="bs-zone">
      <div className="bs-zone__head">
        <h2>Editable Styles</h2>
        <span className="bs-zone__count">{editable} из {editable + stylesInGroup('reference').length}</span>
      </div>
      <p className="bs-zone__lead">
        Figma Color Styles файла «Демо», которые меняются при брендировании.
        Имена и значения — как в Figma, без переименований.
      </p>

      {changed > 0 && (
        <div className="bs-zone__actions">
          <span>
            {changed} {plural(changed, 'стиль отличается', 'стиля отличаются', 'стилей отличаются')} от Figma
          </span>
          <button className="bs-link" onClick={resetAllColors}>Вернуть к Figma</button>
        </div>
      )}

      <SplashContrastHint />

      {low && (
        <div className="bs-warn">
          Контраст primary / authorizationButtonText — {ratio!.toFixed(2)}:1. Ниже 4.5:1,
          текст на кнопке может быть нечитаемым.
        </div>
      )}

      {EDITABLE_GROUPS.map((g, i) => <Group key={g} group={g} defaultOpen={i === 0} />)}
      <ReferenceStyles />
    </div>
  )
}
