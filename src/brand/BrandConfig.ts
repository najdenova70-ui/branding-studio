/**
 * BrandConfig — the single source of branding truth for both modes.
 *
 * Scope is locked to the validated MVP:
 *   - 4 asset slots (of the 10 annotated in Figma by note 3655:11)
 *   - 4 colour tokens
 *
 * Deliberately absent: brand.secondary, brand.accent, brand.background,
 * typography, spacing, radii, shadows, component variants.
 */

import { DEFAULT_COLORS } from './tokens'
import type { ColorState } from './TokenResolver'

import appIconDefault from '../assets/app-icon.png'
import authBgPhoneDefault from '../assets/auth-bg-phone.png'
import navDrawerBgDefault from '../assets/nav-drawer-bg.png'
import mainBannerDefault from '../assets/figma-screens/main-banner-default.png'
import webHomeBannerDefault from '../assets/web-screens/home-banner-default.png'
import webAuthorizationBackgroundDefault from '../assets/web-authorization/background-authorization-web.png'
import webAuthorizationLogoDefault from '../assets/web-authorization/logo-authorization-web.svg'
import logoWhiteRuDefault from '../assets/logo-large-white-ru.svg'

export type AssetFit = 'scale' | 'cover'

/** One replaceable client asset. Only `src` is user-editable. */
export interface AssetSlot {
  /** Object URL from an upload, or the bundled Figma export as the default. */
  src: string
  /** Locked — from the Figma export. */
  readonly format: 'png' | 'svg'
  /** Locked — the Figma component's intrinsic size. */
  readonly intrinsicWidth: number
  readonly intrinsicHeight: number
  /** Locked — Figma annotation 3655:172978 pins the three backgrounds to Scale. */
  readonly fit: AssetFit
  /** Traceability only; never used for runtime lookup. */
  readonly figmaNodeId: string
  readonly figmaComponentName: string
}

/**
 * active   — заменяется и сразу виден в прототипе;
 * prepared — слот и источник есть, но ни один экран MVP его не рендерит;
 * planned  — только архитектура, источник не определён.
 */
export type AssetStatus = 'active'

export type AssetPath =
  | 'appIcon'
  | 'logo.largeWhiteRu'
  | 'background.mainBanner'
  | 'background.webHomeBanner'
  | 'background.navigationDrawer'
  | 'background.authPhone'
  | 'background.authTablet'
  | 'web.authorization.background'
  | 'web.authorization.logo'

export interface BrandConfig {
  readonly schemaVersion: '2.1-tokens'
  brandId: string
  displayName: string
  assets: {
    appIcon: AssetSlot
    logo: { largeWhiteRu: AssetSlot }
    background: {
      mainBanner: AssetSlot
      webHomeBanner: AssetSlot
      navigationDrawer: AssetSlot
      authPhone: AssetSlot
      authTablet: AssetSlot
    }
    web: {
      authorization: {
        background: AssetSlot
        logo: AssetSlot
      }
    }
  }
  /**
   * Значения цветовых токенов: id из каталога `tokens.ts` -> HEX.
   * Токены с одинаковым HEX хранятся раздельно и меняются независимо.
   */
  colors: ColorState
}

export const DEFAULT_BRAND_CONFIG: BrandConfig = {
  schemaVersion: '2.1-tokens',
  brandId: 'ekvio-demo',
  displayName: 'Эквио',
  assets: {
    appIcon: {
      src: appIconDefault,
      format: 'png',
      intrinsicWidth: 60,
      intrinsicHeight: 60,
      fit: 'cover',
      figmaNodeId: '11:20376',
      figmaComponentName: 'app-icon',
    },
    logo: {
      largeWhiteRu: {
        src: logoWhiteRuDefault,
        format: 'svg',
        intrinsicWidth: 200,
        intrinsicHeight: 150,
        fit: 'cover',
        figmaNodeId: '11:18490',
        figmaComponentName: 'Logo / Large - white (RUS)',
      },
    },
    background: {
      mainBanner: {
        src: mainBannerDefault,
        format: 'png',
        intrinsicWidth: 343,
        intrinsicHeight: 343,
        fit: 'cover',
        figmaNodeId: '6135:66705',
        figmaComponentName: 'Banner',
      },
      webHomeBanner: {
        src: webHomeBannerDefault,
        format: 'png',
        intrinsicWidth: 1024,
        intrinsicHeight: 400,
        fit: 'cover',
        figmaNodeId: '6759:41703',
        figmaComponentName: 'Banner / Web home',
      },
      navigationDrawer: {
        src: navDrawerBgDefault,
        format: 'png',
        intrinsicWidth: 304,
        intrinsicHeight: 175,
        fit: 'scale',
        figmaNodeId: '11:18482',
        figmaComponentName: 'Background / Navigation',
      },
      authPhone: {
        src: authBgPhoneDefault,
        format: 'png',
        intrinsicWidth: 375,
        intrinsicHeight: 812,
        fit: 'scale',
        figmaNodeId: '11:18518',
        figmaComponentName: 'Background Authorization / Phone',
      },
      authTablet: {
        src: '',
        format: 'png',
        intrinsicWidth: 1024,
        intrinsicHeight: 768,
        fit: 'cover',
        figmaNodeId: '11:122133',
        figmaComponentName: 'Background Authorization / Tablet',
      },
    },
    web: {
      authorization: {
        background: {
          src: webAuthorizationBackgroundDefault,
          format: 'png',
          intrinsicWidth: 1024,
          intrinsicHeight: 1540,
          fit: 'scale',
          figmaNodeId: '8467:2264',
          figmaComponentName: 'Background Authorization / Web',
        },
        logo: {
          src: webAuthorizationLogoDefault,
          format: 'svg',
          intrinsicWidth: 800,
          intrinsicHeight: 600,
          fit: 'scale',
          figmaNodeId: '8467:2291',
          figmaComponentName: 'Logo authorization WEB',
        },
      },
    },
  },
  colors: { ...DEFAULT_COLORS },
}

/** Единый доступ к слоту по пути. Используется контекстом и панелью ассетов. */
export function slotAt(cfg: BrandConfig, path: AssetPath): AssetSlot {
  switch (path) {
    case 'appIcon': return cfg.assets.appIcon
    case 'logo.largeWhiteRu': return cfg.assets.logo.largeWhiteRu
    case 'background.mainBanner': return cfg.assets.background.mainBanner
    case 'background.webHomeBanner': return cfg.assets.background.webHomeBanner
    case 'background.navigationDrawer': return cfg.assets.background.navigationDrawer
    case 'background.authPhone': return cfg.assets.background.authPhone
    case 'background.authTablet': return cfg.assets.background.authTablet
    case 'web.authorization.background': return cfg.assets.web.authorization.background
    case 'web.authorization.logo': return cfg.assets.web.authorization.logo
  }
}

/** Deep clone used by project storage and the runtime context. */
export function cloneBrandConfig(cfg: BrandConfig): BrandConfig {
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
        authTablet: { ...(cfg.assets.background.authTablet ?? DEFAULT_BRAND_CONFIG.assets.background.authTablet) },
      },
      web: {
        authorization: {
          background: { ...(cfg.assets.web?.authorization?.background ?? DEFAULT_BRAND_CONFIG.assets.web.authorization.background) },
          logo: { ...(cfg.assets.web?.authorization?.logo ?? DEFAULT_BRAND_CONFIG.assets.web.authorization.logo) },
        },
      },
    },
    colors: { ...cfg.colors },
  }
}
