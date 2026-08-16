import type { BrandConfig } from '../brand/BrandConfig'

export interface SharedBrand {
  id: string
  brand: BrandConfig
  createdAt: string
  expiresAt: string
}

async function inlineAsset(src: string): Promise<string> {
  if (!src) return src
  if (src.startsWith('data:')) return src
  const response = await fetch(src)
  if (!response.ok) throw new Error('Не удалось подготовить бренд-изображения для публикации.')
  const blob = await response.blob()
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Ошибка чтения изображения.'))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

async function portableBrand(brand: BrandConfig): Promise<BrandConfig> {
  const next = structuredClone(brand)
  const [appIcon, logo, authPhone, authTablet, navigationDrawer, mainBanner, webHomeBanner] = await Promise.all([
    inlineAsset(brand.assets.appIcon.src), inlineAsset(brand.assets.logo.largeWhiteRu.src),
    inlineAsset(brand.assets.background.authPhone.src), inlineAsset(brand.assets.background.authTablet.src),
    inlineAsset(brand.assets.background.navigationDrawer.src),
    inlineAsset(brand.assets.background.mainBanner.src),
    inlineAsset(brand.assets.background.webHomeBanner.src),
  ])
  next.assets.appIcon.src = appIcon
  next.assets.logo.largeWhiteRu.src = logo
  next.assets.background.authPhone.src = authPhone
  next.assets.background.authTablet.src = authTablet
  next.assets.background.navigationDrawer.src = navigationDrawer
  next.assets.background.mainBanner.src = mainBanner
  next.assets.background.webHomeBanner.src = webHomeBanner
  return next
}

export async function createShare(brand: BrandConfig): Promise<SharedBrand> {
  const response = await fetch('/api/shares', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ brand: await portableBrand(brand) }) })
  const result = await response.json() as SharedBrand & { error?: string }
  if (!response.ok) throw new Error(result.error || 'Не удалось создать публичную ссылку.')
  return result
}

export async function loadShare(id: string): Promise<SharedBrand> {
  const response = await fetch(`/api/shares/${encodeURIComponent(id)}`)
  const result = await response.json() as SharedBrand & { error?: string }
  if (!response.ok) throw new Error(result.error || 'Публичная ссылка недоступна.')
  return result
}
