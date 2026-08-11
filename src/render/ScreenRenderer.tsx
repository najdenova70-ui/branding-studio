/**
 * ScreenRenderer — the only place a screen component is instantiated.
 * Presentation mode and Prototype mode both go through it, which is what
 * guarantees they cannot diverge.
 */
import { getScreen } from '../registry/ScreenRegistry'
import type { ScreenId } from '../registry/types'

export function ScreenRenderer({
  screenId, onNavigate, interactive = true,
}: {
  screenId: ScreenId
  onNavigate?: (to: ScreenId) => void
  interactive?: boolean
}) {
  const entry = getScreen(screenId)
  const Component = entry.component

  return (
    <div
      data-screen-id={entry.id}
      data-figma-node={entry.figmaNodeId ?? 'studio-preview'}
      style={{
        position: 'absolute', inset: 0,
        pointerEvents: interactive ? 'auto' : 'none',
        fontFamily: '-apple-system, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <Component onNavigate={onNavigate} />
    </div>
  )
}
