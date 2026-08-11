import { useState } from 'react'
import { PhonePlate } from '../render/PhonePlate'
import { ScreenRenderer } from '../render/ScreenRenderer'
import { SCREENS, getScreen } from '../registry/ScreenRegistry'
import { edgesFrom, PRIMARY_FLOW, SELECTOR_ONLY } from '../registry/NavigationGraph'
import type { ScreenId } from '../registry/types'

export default function PrototypeMode() {
  const [screen, setScreen] = useState<ScreenId>('splash')
  const entry = getScreen(screen)
  const edges = edgesFrom(screen)

  return (
    <div className="bs-proto">
      {/* Селектор экранов — горизонтальная лента над телефоном.
          Логика навигации не менялась: тот же NavigationGraph. */}
      <div className="bs-proto__bar">
        <span className="bs-proto__bar-label">Экраны</span>
        {SCREENS.map((s) => (
          <button
            key={s.id}
            className={'bs-pill' + (s.id === screen ? ' is-active' : '')}
            onClick={() => setScreen(s.id)}
            title={SELECTOR_ONLY.includes(s.id) ? 'Доступен только из селектора' : undefined}
          >
            {s.title}
            {SELECTOR_ONLY.includes(s.id) && <i className="bs-pill__mark">•</i>}
          </button>
        ))}
      </div>

      <div className="bs-proto__bar bs-proto__bar--flow">
        <span className="bs-proto__bar-label">Поток</span>
        {PRIMARY_FLOW.map((id, i) => (
          <span key={id} className="bs-proto__flow-step">
            <button
              className={'bs-pill bs-pill--ghost' + (id === screen ? ' is-active' : '')}
              onClick={() => setScreen(id)}
            >
              {getScreen(id).title}
            </button>
            {i < PRIMARY_FLOW.length - 1 && <span className="bs-proto__arrow">→</span>}
          </span>
        ))}
      </div>

      <div className="bs-proto__stage">
        <PhonePlate>
          <ScreenRenderer screenId={screen} onNavigate={setScreen} />
        </PhonePlate>

        <div className="bs-proto__meta">
          <div><strong>{entry.title}</strong> — Figma <code>{entry.figmaNodeId ?? '—'}</code> ({entry.figmaName})</div>
          <div className="bs-proto__fields">
            {entry.brandFields.length
              ? entry.brandFields.map((f) => <code key={f}>{f}</code>)
              : <span>нет брендируемых полей</span>}
          </div>
          {edges.length > 0 && (
            <div className="bs-proto__edges">
              {edges.map((e) => (
                <button key={`${e.from}-${e.to}-${e.trigger}`} onClick={() => setScreen(e.to)}>
                  {e.trigger} → {getScreen(e.to).title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
