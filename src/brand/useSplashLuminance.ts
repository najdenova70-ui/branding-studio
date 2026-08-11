/**
 * Семплирует яркость Splash Background, чтобы подсказать дизайнеру,
 * читаемы ли на нём status bar и спиннер.
 *
 * Значения Figma-стилей НИКОГДА не перезаписываются — это только подсказка.
 */
import { useEffect, useState } from 'react'

export interface SplashLuminance {
  /** Относительная яркость верхних 44 px (зона status bar), 0..1. */
  statusBar: number
  /** Относительная яркость зоны спиннера (y ≈ 683..725), 0..1. */
  spinner: number
}

function srgbToLinear(v: number): number {
  const s = v / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

/** Средняя относительная яркость полосы изображения по вертикали [y0, y1] в координатах 375×812. */
function stripLuminance(ctx: CanvasRenderingContext2D, w: number, h: number, y0: number, y1: number): number {
  const top = Math.max(0, Math.floor((y0 / 812) * h))
  const bottom = Math.min(h, Math.ceil((y1 / 812) * h))
  const rows = Math.max(1, bottom - top)
  const data = ctx.getImageData(0, top, w, rows).data
  let sum = 0
  let n = 0
  // Шаг 4 пикселя — точности достаточно, а работы вчетверо меньше.
  for (let i = 0; i < data.length; i += 16) {
    sum += 0.2126 * srgbToLinear(data[i]) + 0.7152 * srgbToLinear(data[i + 1]) + 0.0722 * srgbToLinear(data[i + 2])
    n++
  }
  return n > 0 ? sum / n : 0
}

export function useSplashLuminance(src: string): SplashLuminance | null {
  const [lum, setLum] = useState<SplashLuminance | null>(null)

  useEffect(() => {
    if (!src) { setLum(null); return }
    let cancelled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (cancelled) return
      try {
        const w = Math.min(160, img.naturalWidth || 160)
        const h = Math.round(w * ((img.naturalHeight || 812) / (img.naturalWidth || 375)))
        const cv = document.createElement('canvas')
        cv.width = w
        cv.height = h
        const ctx = cv.getContext('2d', { willReadFrequently: true })
        if (!ctx) return
        ctx.drawImage(img, 0, 0, w, h)
        setLum({
          statusBar: stripLuminance(ctx, w, h, 0, 44),
          spinner: stripLuminance(ctx, w, h, 683, 725),
        })
      } catch {
        // SVG без размеров или tainted canvas — подсказку просто не показываем.
        setLum(null)
      }
    }
    img.onerror = () => { if (!cancelled) setLum(null) }
    img.src = src
    return () => { cancelled = true }
  }, [src])

  return lum
}
