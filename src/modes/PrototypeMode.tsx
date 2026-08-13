import { getScreen, SCREENS } from '../registry/ScreenRegistry'
import type { ScreenId } from '../registry/types'
import { PhonePlate } from '../render/PhonePlate'
import { ScreenRenderer } from '../render/ScreenRenderer'

function Thumbnail({ id, active, onClick }: { id: ScreenId; active: boolean; onClick: () => void }) {
  const entry = getScreen(id)
  return (
    <button className={'bs-screen-thumb' + (active ? ' is-active' : '')} onClick={onClick} title={entry.title}>
      <span className="bs-screen-thumb__viewport">
        <span style={{ width: 375, height: 812, transform: 'scale(.105)', transformOrigin: 'top left', position: 'relative', display: 'block' }}>
          <ScreenRenderer screenId={id} interactive={false} />
        </span>
      </span>
      <span>{entry.title}</span>
    </button>
  )
}

export default function PrototypeMode({ screen, onScreenChange }: {
  screen: ScreenId
  onScreenChange: (screen: ScreenId) => void
}) {
  return (
    <div className="bs-proto">
      <div className="bs-proto__stage">
        <PhonePlate>
          <ScreenRenderer screenId={screen} onNavigate={onScreenChange} />
        </PhonePlate>
      </div>

      <div className="bs-screen-dock-zone">
        <div className="bs-screen-dock">
          {SCREENS.map((entry) => (
            <Thumbnail key={entry.id} id={entry.id} active={entry.id === screen} onClick={() => onScreenChange(entry.id)} />
          ))}
        </div>
      </div>
    </div>
  )
}
