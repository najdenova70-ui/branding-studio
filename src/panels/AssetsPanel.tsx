/** Левая зона — Brand Assets. */
import { useRef } from 'react'
import { useBrand } from '../brand/BrandContext'
import { slotAt, type AssetPath } from '../brand/BrandConfig'
import { ASSET_CARDS, STATUS_META, type AssetCard } from '../brand/assetCatalog'

function BrandIdentity() {
  const { config, setDisplayName } = useBrand()
  return (
    <div className="bs-card bs-card--identity">
      <label className="bs-card__label" htmlFor="bs-client">Клиент</label>
      <input
        id="bs-client"
        className="bs-input bs-input--lg"
        type="text"
        value={config.displayName}
        placeholder="Название клиента"
        onChange={(e) => setDisplayName(e.target.value)}
      />
      <div className="bs-card__foot"><code>{config.brandId}</code> · schema {config.schemaVersion}</div>
    </div>
  )
}

function AssetCardView({ card }: { card: AssetCard }) {
  const { config, setAsset, resetAsset } = useBrand()
  const slot = slotAt(config, card.path)
  const inputRef = useRef<HTMLInputElement>(null)
  const replaceable = card.status !== 'planned'
  const hasImage = slot.src.length > 0
  const isCustom = slot.src.startsWith('blob:')
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
            {slot.fit === 'scale' && <span className="bs-lock" title="Figma требует режим Scale">fit: scale 🔒</span>}
          </div>
        </div>
      </div>

      <div className="bs-asset-card__source" title={source}>{source}</div>

      <div className="bs-asset-card__foot">
        <span className={'bs-badge bs-badge--' + card.status} title={st.title}>{st.label}</span>
        {card.provenance === 'business-requirement' && (
          <span className="bs-badge bs-badge--business" title="Не входит в аннотацию Figma 3655:11 — добавлено по решению команды">
            вне Figma-аннотации
          </span>
        )}
        <span className="bs-asset-card__actions">
          {isCustom && <button className="bs-link" onClick={() => resetAsset(card.path)}>Сброс</button>}
          <button
            className="bs-btn"
            disabled={!replaceable}
            title={replaceable ? undefined : 'Источник ещё не определён'}
            onClick={() => inputRef.current?.click()}
          >
            Replace
          </button>
        </span>
      </div>

      {card.usedBy.length > 0 && (
        <div className="bs-asset-card__used">Экраны: {card.usedBy.join(', ')}</div>
      )}

      <input
        ref={inputRef} type="file" hidden
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) setAsset(card.path as AssetPath, URL.createObjectURL(f))
          e.target.value = ''
        }}
      />
    </div>
  )
}

export default function AssetsPanel() {
  const active = ASSET_CARDS.filter((c) => c.status === 'active')
  const rest = ASSET_CARDS.filter((c) => c.status !== 'active')

  return (
    <div className="bs-zone">
      <div className="bs-zone__head">
        <h2>Brand Assets</h2>
        <span className="bs-zone__count">{active.length} из {ASSET_CARDS.length} в прототипе</span>
      </div>

      <BrandIdentity />

      {active.map((c) => <AssetCardView key={c.path} card={c} />)}

      <div className="bs-zone__divider">Подготовлено к подключению</div>
      {rest.map((c) => <AssetCardView key={c.path} card={c} />)}
    </div>
  )
}
