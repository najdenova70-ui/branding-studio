import { useBrand } from '../brand/BrandContext'
import { contrastRatio, contrastToLuminance } from '../brand/TokenResolver'
import { BRANDABLE_STYLE_KEYS, FIGMA_STYLES, STYLES_BY_KEY } from '../brand/tokens'
import { useSplashLuminance } from '../brand/useSplashLuminance'
import StyleCard from './StyleCard'

const STYLES = FIGMA_STYLES.filter((style) => BRANDABLE_STYLE_KEYS.has(style.key))

function SplashContrastHint() {
  const { config } = useBrand()
  const luminance = useSplashLuminance(config.assets.background.authPhone.src)
  if (!luminance) return null
  const progress = config.colors.progressBar ?? STYLES_BY_KEY.progressBar.hex
  const ratio = contrastToLuminance(progress, luminance.spinner)
  if (ratio === null || ratio >= 3) return null
  return <div className="bs-warn">Контраст индикатора загрузки к фону заставки — {ratio.toFixed(1)}:1. Лучше заменить фон или цвет индикатора.</div>
}

export default function ColorsPanel({ tokenIds }: { tokenIds?: string[] }) {
  const { config, resetAllColors } = useBrand()
  const styles = tokenIds ? STYLES.filter((style) => tokenIds.includes(style.key)) : STYLES
  const changed = styles.filter((style) => config.colors[style.key]?.toUpperCase() !== style.hex.toUpperCase()).length
  const ctaRatio = contrastRatio(config.colors.authorizationButton, config.colors.authorizationButtonText)

  return (
    <div className="bs-zone">
      {!tokenIds && <div className="bs-zone__head"><h2>Фирменные цвета</h2><span className="bs-zone__count">{styles.length} активных</span></div>}
      {!tokenIds && <p className="bs-zone__lead">Только брендовые цвета, которые реально используются текущими экранами. Остальные стили скрыты.</p>}
      {changed > 0 && <div className="bs-zone__actions"><span>Изменено: {changed}</span><button className="bs-link" onClick={resetAllColors}>Вернуть к Figma</button></div>}
      {(!tokenIds || tokenIds.includes('progressBar')) && <SplashContrastHint />}
      {(!tokenIds || tokenIds.includes('authorizationButton')) && ctaRatio !== null && ctaRatio < 4.5 && <div className="bs-warn">Контраст кнопки авторизации — {ctaRatio.toFixed(2)}:1. Текст может быть нечитаемым.</div>}
      <div className="bs-group__body--cards">
        {styles.map((style) => <StyleCard key={style.key} style={style} />)}
        {styles.length === 0 && <p className="bs-panel-empty">На этом экране нет настраиваемых цветов.</p>}
      </div>
    </div>
  )
}
