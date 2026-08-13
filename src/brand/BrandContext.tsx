import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_BRAND_CONFIG, slotAt, type BrandConfig, type AssetPath } from './BrandConfig'
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

/** Клон, сохраняющий readonly-метаданные ассетов. */
function cloneConfig(cfg: BrandConfig): BrandConfig {
  return {
    ...cfg,
    assets: {
      appIcon: { ...cfg.assets.appIcon },
      logo: { largeWhiteRu: { ...cfg.assets.logo.largeWhiteRu } },
      background: {
        mainBanner: { ...(cfg.assets.background.mainBanner ?? DEFAULT_BRAND_CONFIG.assets.background.mainBanner) },
        webHomeBanner: { ...(cfg.assets.background.webHomeBanner ?? DEFAULT_BRAND_CONFIG.assets.background.webHomeBanner) },
        navigationDrawer: { ...cfg.assets.background.navigationDrawer },
        authPhone: { ...cfg.assets.background.authPhone },
      },
    },
    colors: { ...cfg.colors },
  }
}

function withSlotSrc(cfg: BrandConfig, path: AssetPath, src: string): BrandConfig {
  const next = cloneConfig(cfg)
  slotAt(next, path).src = src
  return next
}

export function BrandProvider({
  children, initialConfig = DEFAULT_BRAND_CONFIG, readOnly = false,
}: {
  children: ReactNode
  initialConfig?: BrandConfig
  readOnly?: boolean
}) {
  const [config, setConfig] = useState<BrandConfig>(() => cloneConfig(initialConfig))

  const value = useMemo<BrandContextValue>(() => ({
    config,
    cssVars: resolveTokens(config.colors),
    readOnly,
    // Reference-стили доступны только для просмотра — запись отклоняется здесь,
    // а не только пряча контрол в UI.
    setColor: (tokenId, v) => setConfig((c) => {
      if (readOnly || !isEditable(tokenId)) return c
      const next = cloneConfig(c)
      next.colors[tokenId] = v
      return next
    }),
    resetColor: (tokenId) => setConfig((c) => {
      if (readOnly || !isEditable(tokenId)) return c
      const next = cloneConfig(c)
      next.colors[tokenId] = DEFAULT_COLORS[tokenId]
      return next
    }),
    resetAllColors: () => !readOnly && setConfig((c) => ({ ...cloneConfig(c), colors: { ...DEFAULT_COLORS } })),
    setAsset: (path, src) => !readOnly && setConfig((c) => withSlotSrc(c, path, src)),
    resetAsset: (path) => !readOnly && setConfig((c) => withSlotSrc(c, path, slotAt(DEFAULT_BRAND_CONFIG, path).src)),
    setDisplayName: (displayName) => !readOnly && setConfig((c) => ({ ...cloneConfig(c), displayName: displayName.slice(0, 30) })),
  }), [config, readOnly])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useBrand(): BrandContextValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useBrand must be used inside <BrandProvider>')
  return v
}
