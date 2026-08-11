/**
 * AssetResolver — BrandConfig asset slots -> concrete render props.
 *
 * Figma annotation 3655:172978 requires Scale behaviour for the three
 * background images. Figma "Scale" stretches the fill to the frame without
 * preserving aspect ratio, which is `object-fit: fill` on the web — NOT
 * `cover`. That mapping lives here and nowhere else.
 */

import type { AssetSlot } from './BrandConfig'
import type { CSSProperties } from 'react'

export interface ResolvedAsset {
  src: string
  style: CSSProperties
  /** Traceability, surfaced as a data attribute for inspection. */
  figmaNodeId: string
}

export function resolveAsset(slot: AssetSlot): ResolvedAsset {
  const objectFit: CSSProperties['objectFit'] = slot.fit === 'scale' ? 'fill' : 'cover'
  return {
    src: slot.src,
    figmaNodeId: slot.figmaNodeId,
    style: {
      width: '100%',
      height: '100%',
      objectFit,
      display: 'block',
      pointerEvents: 'none',
    },
  }
}

/** Revoke a previously created object URL, if the src was an upload. */
export function releaseObjectUrl(src: string) {
  if (src.startsWith('blob:')) URL.revokeObjectURL(src)
}
