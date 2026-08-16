import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { cloneBrandConfig, DEFAULT_BRAND_CONFIG, slotAt, type BrandConfig, type AssetPath } from './BrandConfig'
import { resolveTokens } from './TokenResolver'
import { DEFAULT_COLORS, isEditable } from './tokens'

interface BrandContextValue {
  config: BrandConfig
  cssVars: Record<string, string>
  readOnly: boolean
  /** tokenId — идентификатор из каталога tokens.ts. */
  setColor: (tokenId: string, value: string) => void
  resetColor: (tokenId: string) => void
  resetAllColors: () => void
  setAsset: (path: AssetPath, src: string) => void
  resetAsset: (path: AssetPath) => void
  setDisplayName: (value: string) => void
}

const Ctx = createContext<BrandContextValue | null>(null)

function withSlotSrc(cfg: BrandConfig, path: AssetPath, src: string): BrandConfig {
  const next = cloneBrandConfig(cfg)
  slotAt(next, path).src = src
  return next
}

export function BrandProvider({
  children, initialConfig = DEFAULT_BRAND_CONFIG, readOnly = false, onConfigChange,
}: {
  children: ReactNode
  initialConfig?: BrandConfig
  readOnly?: boolean
  onConfigChange?: (config: BrandConfig) => void
}) {
  const [config, setConfig] = useState<BrandConfig>(() => cloneBrandConfig(initialConfig))
  const onChangeRef = useRef(onConfigChange)
  const mounted = useRef(false)
  useEffect(() => { onChangeRef.current = onConfigChange }, [onConfigChange])
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return }
    onChangeRef.current?.(config)
  }, [config])

  const change = (updater: (current: BrandConfig) => BrandConfig) => setConfig(updater)

  const value = useMemo<BrandContextValue>(() => ({
    config,
    cssVars: resolveTokens(config.colors),
    readOnly,
    // Reference-стили доступны только для просмотра — запись отклоняется здесь,
    // а не только пряча контрол в UI.
    setColor: (tokenId, v) => change((c) => {
      if (readOnly || !isEditable(tokenId)) return c
      const next = cloneBrandConfig(c)
      next.colors[tokenId] = v
      return next
    }),
    resetColor: (tokenId) => change((c) => {
      if (readOnly || !isEditable(tokenId)) return c
      const next = cloneBrandConfig(c)
      next.colors[tokenId] = DEFAULT_COLORS[tokenId]
      return next
    }),
    resetAllColors: () => !readOnly && change((c) => ({ ...cloneBrandConfig(c), colors: { ...DEFAULT_COLORS } })),
    setAsset: (path, src) => !readOnly && change((c) => withSlotSrc(c, path, src)),
    resetAsset: (path) => !readOnly && change((c) => withSlotSrc(c, path, slotAt(DEFAULT_BRAND_CONFIG, path).src)),
    setDisplayName: (displayName) => !readOnly && change((c) => ({ ...cloneBrandConfig(c), displayName: displayName.slice(0, 30) })),
  }), [config, readOnly])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useBrand(): BrandContextValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useBrand must be used inside <BrandProvider>')
  return v
}
