import type { AssetPath, BrandConfig } from '../brand/BrandConfig'
import { cloneBrandConfig, DEFAULT_BRAND_CONFIG } from '../brand/BrandConfig'

export interface BrandTemplate {
  id: string
  name: string
  masterAssetIds: readonly AssetPath[]
  createBrandConfig: (projectId: string, projectName: string) => BrandConfig
}

export const MOBILE_APP_DEFAULT_TEMPLATE: BrandTemplate = {
  id: 'mobile-app-default',
  name: 'Mobile App Default',
  masterAssetIds: [
    'appIcon',
    'logo.largeWhiteRu',
    'background.mainBanner',
    'background.webHomeBanner',
    'background.navigationDrawer',
    'background.authPhone',
    'background.authTablet',
  ],
  createBrandConfig(projectId, projectName) {
    const config = cloneBrandConfig(DEFAULT_BRAND_CONFIG)
    config.brandId = projectId
    config.displayName = projectName
    return config
  },
}
