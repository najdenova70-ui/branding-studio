/**
 * Figma Reference Styles — остальные Color Styles файла.
 * Только просмотр и контроль: редактирование запрещено и в UI, и в контексте.
 */
import { useState } from 'react'
import { stylesInGroup } from '../brand/tokens'
import StyleCard from './StyleCard'

export default function ReferenceStyles() {
  const [open, setOpen] = useState(false)
  const styles = stylesInGroup('reference')
  const wired = styles.filter((s) => s.wired).length

  return (
    <div className="bs-advanced">
      <button className="bs-advanced__toggle" onClick={() => setOpen((o) => !o)}>
        <span className="bs-group__chevron">{open ? '▾' : '▸'}</span>
        Advanced · Figma Reference Styles
        <span className="bs-group__count">{styles.length}</span>
      </button>

      {open && (
        <div className="bs-advanced__body">
          <p className="bs-advanced__note">
            Остальные Color Styles файла — только для просмотра и контроля.
            При брендировании они не меняются; {wired} из {styles.length} участвуют
            в отрисовке прототипа. Чтобы поменять такой стиль, правьте его в Figma.
          </p>
          {styles.map((s) => <StyleCard key={s.key} style={s} readOnly />)}
        </div>
      )}
    </div>
  )
}
