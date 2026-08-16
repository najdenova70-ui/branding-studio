import { slotAt, type AssetPath, type AssetSlot, type BrandConfig } from '../brand/BrandConfig'
import type { BrandProject } from '../projects/types'
import { EXPORT_RECIPES, recipeFilename, type ExportPlatform, type ExportRecipe } from './exportRecipes'

export type BuildAssetStatus = 'READY' | 'MISSING SOURCE' | 'INVALID SOURCE' | 'NOT IMPLEMENTED'

export interface BuildAssetAssessment {
  recipe: ExportRecipe
  source?: AssetSlot
  status: BuildAssetStatus
  issue?: string
}

function isKnownMaster(value: ExportRecipe['masterAssetId']): value is AssetPath {
  return !value.startsWith('unknown.')
}

export function assessRecipe(config: BrandConfig, recipe: ExportRecipe): BuildAssetAssessment {
  if (!isKnownMaster(recipe.masterAssetId)) {
    return { recipe, status: 'NOT IMPLEMENTED', issue: recipe.notes }
  }
  const source = slotAt(config, recipe.masterAssetId)
  if (!source.src) return { recipe, source, status: 'MISSING SOURCE', issue: `Missing: ${source.figmaComponentName}` }
  if (!['png', 'svg'].includes(source.format) || source.intrinsicWidth <= 0 || source.intrinsicHeight <= 0) {
    return { recipe, source, status: 'INVALID SOURCE', issue: `Invalid source: ${source.figmaComponentName}` }
  }
  return { recipe, source, status: 'READY' }
}

export function assessPlatform(config: BrandConfig, platform: ExportPlatform) {
  return EXPORT_RECIPES.filter((recipe) => recipe.platform === platform).map((recipe) => assessRecipe(config, recipe))
}

export function exportIssues(config: BrandConfig, platform?: ExportPlatform) {
  const recipes = platform ? EXPORT_RECIPES.filter((recipe) => recipe.platform === platform) : EXPORT_RECIPES
  return recipes.map((recipe) => assessRecipe(config, recipe)).filter((item) => item.status !== 'READY')
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Не удалось прочитать master asset.'))
    image.src = src
  })
}

async function validateSource(source: AssetSlot): Promise<string | undefined> {
  try {
    const image = await loadImage(source.src)
    // SVG masters keep their vector geometry; the locked slot frame supplies
    // the export aspect ratio, so the glyph's own viewBox is not an error.
    if (source.format === 'svg') return undefined
    const expectedRatio = source.intrinsicWidth / source.intrinsicHeight
    const actualRatio = image.naturalWidth / image.naturalHeight
    if (!Number.isFinite(actualRatio) || Math.abs(expectedRatio - actualRatio) / expectedRatio > 0.01) {
      return `Invalid ${source.figmaComponentName} ratio: ${image.naturalWidth}:${image.naturalHeight}`
    }
    if (image.naturalWidth < source.intrinsicWidth || image.naturalHeight < source.intrinsicHeight) {
      return `Invalid ${source.figmaComponentName} dimensions: ${image.naturalWidth} × ${image.naturalHeight}`
    }
    return undefined
  } catch {
    return `Invalid source: ${source.figmaComponentName}`
  }
}

function drawPreservingRatio(ctx: CanvasRenderingContext2D, image: HTMLImageElement, recipe: ExportRecipe) {
  const inset = recipe.contentInsetRatio ?? 0
  const boxX = recipe.width * inset
  const boxY = recipe.height * inset
  const boxWidth = recipe.width - boxX * 2
  const boxHeight = recipe.height - boxY * 2
  const sourceRatio = image.naturalWidth / image.naturalHeight
  const targetRatio = boxWidth / boxHeight
  const cover = recipe.fit === 'cover'
  const useWidth = cover ? sourceRatio < targetRatio : sourceRatio > targetRatio
  const drawWidth = useWidth ? boxWidth : boxHeight * sourceRatio
  const drawHeight = useWidth ? boxWidth / sourceRatio : boxHeight
  ctx.drawImage(image, boxX + (boxWidth - drawWidth) / 2, boxY + (boxHeight - drawHeight) / 2, drawWidth, drawHeight)
}

export async function generateAsset(source: AssetSlot, recipe: ExportRecipe): Promise<Blob> {
  if (recipe.format === 'svg') {
    if (source.format !== 'svg') throw new Error(`Recipe ${recipe.id} requires an SVG source.`)
    return fetch(source.src).then((response) => response.blob())
  }
  const image = await loadImage(source.src)
  const canvas = document.createElement('canvas')
  canvas.width = recipe.width
  canvas.height = recipe.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas недоступен в этом браузере.')
  if (recipe.format === 'jpeg') {
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, recipe.width, recipe.height)
  }
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  drawPreservingRatio(ctx, image, recipe)
  const mime = recipe.format === 'jpeg' ? 'image/jpeg' : 'image/png'
  return new Promise((resolve, reject) => canvas.toBlob(
    (blob) => blob ? resolve(blob) : reject(new Error(`Не удалось создать ${recipeFilename(recipe)}.`)),
    mime,
    recipe.quality,
  ))
}

function cleanConfig(config: BrandConfig) {
  const masterAssets: Record<string, Omit<AssetSlot, 'src'> & { source: 'bundled' | 'uploaded' }> = {}
  const paths: AssetPath[] = ['appIcon', 'logo.largeWhiteRu', 'background.mainBanner', 'background.webHomeBanner', 'background.navigationDrawer', 'background.authPhone', 'background.authTablet']
  for (const path of paths) {
    const { src, ...metadata } = slotAt(config, path)
    masterAssets[path] = { ...metadata, source: src.startsWith('data:') ? 'uploaded' : 'bundled' }
  }
  return {
    schemaVersion: config.schemaVersion,
    brandId: config.brandId,
    displayName: config.displayName,
    editableFigmaStyles: { ...config.colors },
    masterAssets,
  }
}

function slug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-zа-яё0-9]+/gi, '-').replace(/^-|-$/g, '') || 'brand-project'
}

function download(blob: Blob, filename: string) {
  const href = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = href
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(href), 1000)
}

export async function exportDevelopmentPackage(project: BrandProject, platform?: ExportPlatform, progress?: (message: string) => void) {
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  const rootName = slug(project.name)
  const root = zip.folder(rootName)
  if (!root) throw new Error('Не удалось создать ZIP.')
  const recipes = EXPORT_RECIPES.filter((recipe) => !platform || recipe.platform === platform)
  const outputs = []
  const validation = new Map<string, Promise<string | undefined>>()

  for (let index = 0; index < recipes.length; index += 1) {
    const recipe = recipes[index]
    const assessment = assessRecipe(project.brandConfig, recipe)
    progress?.(`Подготовка ресурса ${index + 1} из ${recipes.length}`)
    const filename = recipeFilename(recipe)
    const path = `${recipe.platform}/${recipe.directory}/${filename}`
    let finalStatus = assessment.status
    let issue = assessment.issue
    if (assessment.status === 'READY' && assessment.source) {
      const key = recipe.masterAssetId
      const check = validation.get(key) ?? validateSource(assessment.source)
      validation.set(key, check)
      const invalid = await check
      if (invalid) { finalStatus = 'INVALID SOURCE'; issue = invalid }
      else {
        try { root.file(path, await generateAsset(assessment.source, recipe)) }
        catch (reason) { finalStatus = 'INVALID SOURCE'; issue = reason instanceof Error ? reason.message : 'Invalid source' }
      }
    }
    outputs.push({
      platform: recipe.platform,
      path,
      filename,
      width: recipe.width,
      height: recipe.height,
      format: recipe.format,
      sourceMasterAsset: recipe.masterAssetId,
      sourceFigmaNode: recipe.sourceFigmaNodeId,
      exportRecipeId: recipe.id,
      status: finalStatus,
      issue,
    })
  }

  root.file('brand-config.json', JSON.stringify({
    projectId: project.id,
    projectName: project.name,
    templateId: project.templateId,
    ...cleanConfig(project.brandConfig),
  }, null, 2))
  root.file('manifest.json', JSON.stringify({
    schemaVersion: '1.0',
    projectId: project.id,
    projectName: project.name,
    exportedAt: new Date().toISOString(),
    outputs,
  }, null, 2))
  progress?.('Сборка ZIP')
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
  download(blob, `${rootName}-${platform ?? 'development-package'}.zip`)
}
