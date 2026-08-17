/**
 * Каталог брендовых ассетов для левой панели Brand Workspace.
 *
 * provenance — откуда взялось требование заменяемости:
 *   'figma-annotated'      — элемент указан аннотацией 3655:11
 *                            «Эти элементы редактируются под клиента»;
 *   'business-requirement' — расширение по решению команды, в аннотации нет.
 *
 * Каталог описательный: значения слотов живут в BrandConfig, здесь — только
 * то, что показывается дизайнеру.
 */

import type { AssetPath, AssetStatus } from './BrandConfig'

export type AssetProvenance = 'figma-annotated'

export interface AssetCard {
  path: AssetPath
  label: string
  /** Короткое пояснение: что это и где встречается. */
  description: string
  status: AssetStatus
  provenance: AssetProvenance
  /** Экраны прототипа, которые реально используют слот. */
  usedBy: string[]
  /** Подпись источника, когда узла в Figma нет. */
  sourceFallback?: string
  /** Как показывать превью в карточке. */
  preview: 'square' | 'tall' | 'wide'
}

export const ASSET_CARDS: AssetCard[] = [
  {
    path: 'appIcon',
    label: 'Иконка приложения',
    description: 'Иконка приложения на устройстве',
    status: 'active',
    provenance: 'figma-annotated',
    usedBy: ['Иконка приложения'],
    preview: 'square',
  },
  {
    path: 'background.authPhone',
    label: 'Фон заставки',
    description: 'Фон экрана авторизации, телефон',
    status: 'active',
    provenance: 'figma-annotated',
    usedBy: ['Авторизация — заставка'],
    preview: 'tall',
  },
  {
    path: 'background.authTablet',
    label: 'Фон авторизации планшета',
    description: 'Фоновое изображение экрана авторизации для планшетной версии',
    status: 'active',
    provenance: 'figma-annotated',
    usedBy: ['Планшетная версия · Android'],
    preview: 'wide',
  },
  {
    path: 'logo.largeWhiteRu',
    label: 'Логотип',
    description: 'Большой белый логотип, RU',
    status: 'active',
    provenance: 'figma-annotated',
    usedBy: ['Авторизация — заставка'],
    preview: 'wide',
  },
  {
    path: 'background.mainBanner',
    label: 'Главный баннер',
    description: 'Изображение главного баннера; текст и кнопка остаются неизменными',
    status: 'active',
    provenance: 'figma-annotated',
    usedBy: ['Главная — баннер'],
    preview: 'square',
  },
  {
    path: 'background.webHomeBanner',
    label: 'Баннер веб-версии',
    description: 'Изображение главного баннера; текст и кнопки остаются неизменными',
    status: 'active',
    provenance: 'figma-annotated',
    usedBy: ['Веб-версия — Главная'],
    preview: 'wide',
  },
  {
    path: 'web.authorization.background',
    label: 'Фон авторизации',
    description: 'Фоновое изображение web-экрана авторизации',
    status: 'active',
    provenance: 'figma-annotated',
    usedBy: ['Веб-версия — Авторизация'],
    preview: 'tall',
  },
  {
    path: 'web.authorization.logo',
    label: 'Логотип авторизации',
    description: 'Логотип web-экрана авторизации',
    status: 'active',
    provenance: 'figma-annotated',
    usedBy: ['Веб-версия — Авторизация'],
    preview: 'wide',
  },
  {
    path: 'background.navigationDrawer',
    label: 'Фон бокового меню',
    description: 'Шапка бокового меню',
    status: 'active',
    provenance: 'figma-annotated',
    usedBy: ['Боковое меню'],
    preview: 'wide',
  },
]

export const STATUS_META: Record<AssetStatus, { label: string; title: string }> = {
  active: {
    label: 'в прототипе',
    title: 'Замена сразу отображается на экранах прототипа',
  },
}
