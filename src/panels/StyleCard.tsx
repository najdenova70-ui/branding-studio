/** Карточка одного Figma Color Style. Имя показывается ровно как в Figma. */
import { useState } from 'react'
import type { FigmaColorStyle } from '../brand/tokens'
import { ColorEditor, Swatch, useTokenValue } from './colorControls'

function CopyHex({ value }: { value: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      className="bs-copy"
      title="Скопировать HEX"
      onClick={() => {
        navigator.clipboard?.writeText(value.toUpperCase()).then(
          () => { setDone(true); setTimeout(() => setDone(false), 1200) },
          () => {},
        )
      }}
    >
      {done ? 'скопировано' : 'копировать'}
    </button>
  )
}

export default function StyleCard({
  style, readOnly = false,
}: { style: FigmaColorStyle; readOnly?: boolean }) {
  const value = useTokenValue(style.key, style.hex)
  const dirty = value.toUpperCase() !== style.hex.toUpperCase()
  const [descOpen, setDescOpen] = useState(false)

  return (
    <div className={'bs-card bs-style-card' + (readOnly ? ' is-readonly' : '')}>
      <div className="bs-style-card__top">
        <Swatch color={value} size={readOnly ? 'md' : 'lg'} />
        <div className="bs-style-card__info">
          <div className="bs-style-card__name">
            <code>{style.name}</code>
            {style.wired && <i className="bs-dot" title="Влияет на прототип" />}
            {dirty && <em className="bs-token__dirty" title="Отличается от Figma">•</em>}
          </div>
          <div className="bs-style-card__hex">
            {value.toUpperCase()}
            {value.length === 9 && <span className="bs-style-card__alpha">альфа</span>}
            {readOnly && <CopyHex value={value} />}
          </div>
        </div>
      </div>

      {!readOnly && !style.gradient && <ColorEditor tokenId={style.key} fallback={style.hex} />}

      {style.gradient && <div className="bs-style-card__note">{style.description}</div>}

      {style.locked && !style.gradient && (
        <div className="bs-style-card__locked" title="Так указано в описании стиля в Figma">
          Figma: этот цвет не меняем
        </div>
      )}

      {style.description && !style.gradient && (
        <button className="bs-style-card__desc" onClick={() => setDescOpen((o) => !o)}>
          <span className={descOpen ? '' : 'is-clamped'}>{style.description}</span>
        </button>
      )}

      {!style.wired && !readOnly && (
        <div className="bs-style-card__note">Пока не влияет на экраны прототипа</div>
      )}
    </div>
  )
}
