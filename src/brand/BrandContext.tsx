import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_BRAND_CONFIG, slotAt, type BrandConfig, type AssetPath } from './BrandConfig'
import { resolveTokens } from './TokenResolver'
import { DEFAULT_COLORS, isEditable } from './tokens'

interface BrandContextValue {
  config: BrandConfig
  cssVars: Record<string, string>
  setDisplayName: (v: string) => void
  /** tokenId — идентификатор из каталога tokens.ts. */
  setColor: (tokenId: string, value: string) => void
  resetColor: (tokenId: string) => void
  resetAllColors: () => void
  setAsset: (path: AssetPath, src: string) => void
  resetAsset: (path: AssetPath) => void
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
        navigationDrawer: { ...cfg.assets.background.navigationDrawer },
        authPhone: { ...cfg.assets.background.authPhone },
      },
      banner: {
        mobile: { ...cfg.assets.banner.mobile },
        web: { ...cfg.assets.banner.web },
      },
      certificate: { main: { ...cfg.assets.certificate.main } },
    },
    colors: { ...cfg.colors },
  }
}

function withSlotSrc(cfg: BrandConfig, path: AssetPath, src: string): BrandConfig {
  const next = cloneConfig(cfg)
  slotAt(next, path).src = src
  return next
}

export function BrandProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<BrandConfig>(DEFAULT_BRAND_CONFIG)

  const value = useMemo<BrandContextValue>(() => ({
    config,
    cssVars: resolveTokens(config.colors),
    setDisplayName: (v) => setConfig((c) => ({ ...cloneConfig(c), displayName: v })),
    // Reference-стили доступны только для просмотра — запись отклоняется здесь,
    // а не только пряча контрол в UI.
    setColor: (tokenId, v) => setConfig((c) => {
      if (!isEditable(tokenId)) return c
      const next = cloneConfig(c)
      next.colors[tokenId] = v
      return next
    }),
    resetColor: (tokenId) => setConfig((c) => {
      if (!isEditable(tokenId)) return c
      const next = cloneConfig(c)
      next.colors[tokenId] = DEFAULT_COLORS[tokenId]
      return next
    }),
    resetAllColors: () => setConfig((c) => ({ ...cloneConfig(c), colors: { ...DEFAULT_COLORS } })),
    setAsset: (path, src) => setConfig((c) => withSlotSrc(c, path, src)),
    resetAsset: (path) => setConfig((c) => withSlotSrc(c, path, slotAt(DEFAULT_BRAND_CONFIG, path).src)),
  }), [config])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useBrand(): BrandContextValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useBrand must be used inside <BrandProvider>')
  return v
}
