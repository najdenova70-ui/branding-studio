/** Левая зона — Brand Assets. */
import { useRef, useState } from 'react'
import { useBrand } from '../brand/BrandContext'
import { DEFAULT_BRAND_CONFIG, slotAt, type AssetPath } from '../brand/BrandConfig'
import { ASSET_CARDS, STATUS_META, type AssetCard } from '../brand/assetCatalog'

function BrandIdentity() {
  const { config, setDisplayName } = useBrand()
  return (
    <div className="bs-card bs-card--identity">
      <div className="bs-card__label">Клиент</div>
      <label className="bs-card__label" htmlFor="brand-display-name">Название приложения</label>
      <input id="brand-display-name" className="bs-name-input" value={config.displayName} maxLength={30} onChange={(event) => setDisplayName(event.target.value)} />
      <div className="bs-card__foot">Меняется только подпись приложения; остальные тексты экранов зафиксированы</div>
    </div>
  )
}

function AssetCardView({ card }: { card: AssetCard }) {
  const { config, setAsset, resetAsset } = useBrand()
  const slot = slotAt(config, card.path)
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const replaceable = true
  const hasImage = slot.src.length > 0
  const defaultSrc = slotAt(DEFAULT_BRAND_CONFIG, card.path).src
  const isCustom = slot.src !== defaultSrc
  const st = STATUS_META[card.status]

  const source = slot.figmaNodeId
    ? `${slot.figmaComponentName} · ${slot.figmaNodeId}`
    : (card.sourceFallback ?? 'Источник не определён')

  const size = slot.intrinsicWidth > 0
    ? `${slot.intrinsicWidth} × ${slot.intrinsicHeight} · ${slot.format.toUpperCase()}`
    : 'размер не задан'

  return (
    <div className={'bs-card bs-asset-card is-' + card.status}>
      <div className="bs-asset-card__top">
        <div className={'bs-preview bs-preview--' + card.preview}>
          {hasImage
            ? <img src={slot.src} alt="" />
            : <span className="bs-preview__empty">{replaceable ? 'нет файла' : '—'}</span>}
        </div>

        <div className="bs-asset-card__info">
          <div className="bs-asset-card__title">
            {card.label}
            {isCustom && <span className="bs-badge bs-badge--custom">заменён</span>}
          </div>
          <div className="bs-asset-card__desc">{card.description}</div>
          <div className="bs-asset-card__meta">
            <span>{size}</span>
            {slot.fit === 'scale' && <span className="bs-lock" title="Масштабирование зафиксировано макетом">по размеру 🔒</span>}
          </div>
        </div>
      </div>

      <div className="bs-asset-card__source" title={source}>{source}</div>

      <div className="bs-asset-card__foot">
        <span className={'bs-badge bs-badge--' + card.status} title={st.title}>{st.label}</span>
        <span className="bs-asset-card__actions">
          {isCustom && <button className="bs-link" onClick={() => resetAsset(card.path)}>Сброс</button>}
          <button
            className="bs-btn"
            disabled={!replaceable}
            title={replaceable ? undefined : 'Источник ещё не определён'}
            onClick={() => inputRef.current?.click()}
          >
            Заменить
          </button>
        </span>
      </div>

      {card.usedBy.length > 0 && (
        <div className="bs-asset-card__used">Экраны: {card.usedBy.join(', ')}</div>
      )}
      {error && <div className="bs-warn">{error}</div>}

      <input
        ref={inputRef} type="file" hidden
        accept={slot.format === 'svg' ? 'image/svg+xml,.svg' : 'image/png,.png'}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) {
            const expectedType = slot.format === 'svg' ? 'image/svg+xml' : 'image/png'
            const expectedExtension = `.${slot.format}`
            if (f.type !== expectedType && !f.name.toLowerCase().endsWith(expectedExtension)) {
              setError(`Нужен файл в формате ${slot.format.toUpperCase()}.`)
              e.target.value = ''
              return
            }
            const reader = new FileReader()
            reader.onload = () => {
              if (typeof reader.result !== 'string') return
              const image = new Image()
              image.onload = () => {
                const expectedRatio = slot.intrinsicWidth / slot.intrinsicHeight
                const actualRatio = image.naturalWidth / image.naturalHeight
                const wrongRatio = slot.format === 'png' && Math.abs(expectedRatio - actualRatio) / expectedRatio > 0.01
                const tooSmall = slot.format === 'png' && (image.naturalWidth < slot.intrinsicWidth || image.naturalHeight < slot.intrinsicHeight)
                if (wrongRatio || tooSmall) {
                  setError(`Файл ${image.naturalWidth} × ${image.naturalHeight}. Нужна пропорция ${slot.intrinsicWidth}:${slot.intrinsicHeight} и размер не меньше ${slot.intrinsicWidth} × ${slot.intrinsicHeight}.`)
                  return
                }
                setError('')
                setAsset(card.path as AssetPath, reader.result as string)
              }
              image.onerror = () => setError('Файл изображения не удалось прочитать.')
              image.src = reader.result
            }
            reader.readAsDataURL(f)
          }
          e.target.value = ''
        }}
      />
    </div>
  )
}

export default function AssetsPanel({ paths, countLabel }: { paths?: AssetPath[]; countLabel?: string }) {
  const active = ASSET_CARDS.filter((card) => card.status === 'active' && (!paths || paths.includes(card.path)))

  return (
    <div className="bs-zone">
      <div className="bs-zone__head">
        <h2>Фирменные элементы</h2>
        <span className="bs-zone__count">{countLabel ?? `${active.length} из ${ASSET_CARDS.length} в прототипе`}</span>
      </div>

      {!paths && <BrandIdentity />}

      {active.length === 0 && <p className="bs-panel-empty">На этом экране нет заменяемых изображений.</p>}

      {active.map((c) => <AssetCardView key={c.path} card={c} />)}

    </div>
  )
}
