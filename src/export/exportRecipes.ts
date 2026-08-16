import type { AssetPath } from '../brand/BrandConfig'

export type ExportPlatform = 'android' | 'ios'
export type ExportFormat = 'png' | 'jpeg' | 'svg'
export type ExportFit = 'contain' | 'cover'

export interface ExportRecipe {
  id: string
  platform: ExportPlatform
  masterAssetId: AssetPath | `unknown.${string}`
  outputName: string
  directory: string
  width: number
  height: number
  format: ExportFormat
  fit: ExportFit
  quality?: number
  sourceFigmaNodeId: string
  sourceFigmaNodeName: string
  masterFigmaNodeName: string
  required: boolean
  /** Figma's Android app-icon frames include a transparent inset. */
  contentInsetRatio?: number
  notes: string
}

const density = [
  ['mdpi', 1], ['hdpi', 1.5], ['xhdpi', 2], ['xxhdpi', 3], ['xxxhdpi', 4],
] as const

function densityRecipes(args: {
  id: string
  masterAssetId: ExportRecipe['masterAssetId']
  outputName: string
  baseWidth: number
  baseHeight: number
  format: ExportFormat
  fit: ExportFit
  nodes: readonly string[]
  sourceName: string
  required: boolean
  notes: string
  contentInsetRatio?: number
  tablet?: boolean
}): ExportRecipe[] {
  return density.map(([bucket, scale], index) => ({
    id: `${args.id}-${bucket}`,
    platform: 'android',
    masterAssetId: args.masterAssetId,
    outputName: args.outputName,
    directory: `res/drawable${args.tablet ? '-sw600dp' : ''}-${bucket}`,
    width: Math.round(args.baseWidth * scale),
    height: Math.round(args.baseHeight * scale),
    format: args.format,
    fit: args.fit,
    sourceFigmaNodeId: args.nodes[index],
    sourceFigmaNodeName: `res / ${args.tablet ? `drawable-sw600dp-${bucket}` : `drawable-${bucket}`} / ${args.outputName}`,
    masterFigmaNodeName: args.sourceName,
    required: args.required,
    contentInsetRatio: args.contentInsetRatio,
    notes: args.notes,
  }))
}

export const ANDROID_EXPORT_RECIPES: readonly ExportRecipe[] = [
  ...densityRecipes({
    id: 'android-authorization-logo', masterAssetId: 'logo.largeWhiteRu', outputName: 'pic_authorization_logo',
    baseWidth: 200, baseHeight: 150, format: 'png', fit: 'contain',
    nodes: ['11:122052', '11:122054', '11:122060', '11:122056', '11:122058'],
    sourceName: 'Logo / Large - white (RUS)', required: true,
    notes: 'Exact density outputs from the Android Assets Figma page.',
  }),
  ...densityRecipes({
    id: 'android-toolbar-logo', masterAssetId: 'unknown.toolbarLogo', outputName: 'pic_toolbar_logo',
    baseWidth: 200, baseHeight: 22, format: 'png', fit: 'contain',
    nodes: ['11:122062', '11:122064', '11:122066', '11:122068', '11:122070'],
    sourceName: 'Logo / Navbar rus', required: false,
    notes: 'Output is confirmed; no approved master asset slot exists.',
  }),
  ...densityRecipes({
    id: 'android-drawer-background', masterAssetId: 'background.navigationDrawer', outputName: 'pic_drawer_background',
    baseWidth: 304, baseHeight: 172, format: 'jpeg', fit: 'cover',
    nodes: ['11:122072', '11:122074', '11:122080', '11:122076', '11:122078'],
    sourceName: 'Background / Navigation', required: true,
    notes: 'Centered cover preserves source aspect ratio while matching the exact output frame.',
  }),
  ...densityRecipes({
    id: 'android-authorization-phone', masterAssetId: 'background.authPhone', outputName: 'pic_authorization_foreground',
    baseWidth: 375, baseHeight: 860, format: 'jpeg', fit: 'cover',
    nodes: ['11:122082', '11:122090', '11:122088', '11:122086', '11:122084'],
    sourceName: 'Background Authorization / Phone', required: true,
    notes: 'Figma config pins authorization background positioning to center.',
  }),
  ...densityRecipes({
    id: 'android-authorization-tablet', masterAssetId: 'background.authTablet', outputName: 'pic_authorization_foreground',
    baseWidth: 1024, baseHeight: 768, format: 'jpeg', fit: 'cover', tablet: true,
    nodes: ['11:122133', '11:122127', '11:122129', '11:122131', '11:122135'],
    sourceName: 'Background Authorization / Tablet', required: true,
    notes: 'Exact tablet density outputs from the Android Assets Figma page.',
  }),
  ...densityRecipes({
    id: 'android-app-icon', masterAssetId: 'appIcon', outputName: 'ic_app_icon',
    baseWidth: 48, baseHeight: 48, format: 'png', fit: 'contain', contentInsetRatio: 0.103515625,
    nodes: ['11:122143', '11:122167', '11:122149', '11:122161', '11:122155'],
    sourceName: 'app-icon', required: true,
    notes: 'Transparent inset measured from the mdpi Figma node: 4.96875 px in a 48 px frame.',
  }),
  ...densityRecipes({
    id: 'android-notification-icon', masterAssetId: 'unknown.notificationIcon', outputName: 'ic_notification',
    baseWidth: 24, baseHeight: 24, format: 'png', fit: 'contain',
    nodes: ['3143:2081', '3143:1841', '3163:165', '3143:1985', '3143:2129'],
    sourceName: 'ic_notifiaction', required: false,
    notes: 'Output is confirmed; master source cannot be proven from the supplied Figma page.',
  }),
]

export const IOS_EXPORT_RECIPES: readonly ExportRecipe[] = [{
  id: 'ios-start-screen-background',
  platform: 'ios',
  masterAssetId: 'background.authPhone',
  outputName: 'ic_background',
  directory: 'Assets/authorization/ic_start_screen_background.imageset',
  width: 828,
  height: 1472,
  format: 'png',
  fit: 'cover',
  sourceFigmaNodeId: '11:18409',
  sourceFigmaNodeName: 'Assets / authorization / ic_start_screen_background.imageset / ic_background',
  masterFigmaNodeName: 'Background Authorization / Phone',
  required: true,
  notes: 'The only iOS output proven by the supplied node; source is centered and cropped in Figma.',
}]

export const EXPORT_RECIPES: readonly ExportRecipe[] = [...ANDROID_EXPORT_RECIPES, ...IOS_EXPORT_RECIPES]

export const UNKNOWN_FIGMA_MAPPINGS = [
  'Android Logo / Navbar rus → approved master asset is unknown.',
  'Android ic_notifiaction → approved master asset is unknown.',
  'The supplied iOS node proves no app icon, logo, drawer, notification, or additional scale variants.',
] as const

export function recipeFilename(recipe: ExportRecipe) {
  return `${recipe.outputName}.${recipe.format}`
}
