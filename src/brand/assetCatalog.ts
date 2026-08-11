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

export type AssetProvenance = 'figma-annotated' | 'business-requirement'

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
    label: 'App Icon',
    description: 'Иконка приложения на устройстве',
    status: 'active',
    provenance: 'figma-annotated',
    usedBy: ['Иконка приложения'],
    preview: 'square',
  },
  {
    path: 'background.authPhone',
    label: 'Splash Background',
    description: 'Фон экрана авторизации, телефон',
    status: 'active',
    provenance: 'figma-annotated',
    usedBy: ['Авторизация — заставка'],
    preview: 'tall',
  },
  {
    path: 'logo.largeWhiteRu',
    label: 'Logo',
    description: 'Большой белый логотип, RU',
    status: 'active',
    provenance: 'figma-annotated',
    usedBy: ['Авторизация — заставка'],
    preview: 'wide',
  },
  {
    path: 'background.navigationDrawer',
    label: 'Navigation Menu Background',
    description: 'Шапка бокового меню',
    status: 'active',
    provenance: 'figma-annotated',
    usedBy: ['Боковое меню'],
    preview: 'wide',
  },
  {
    path: 'banner.mobile',
    label: 'Mobile Banner',
    description: 'Баннер на главном экране приложения',
    status: 'prepared',
    provenance: 'business-requirement',
    usedBy: [],
    preview: 'square',
  },
  {
    path: 'banner.web',
    label: 'Web Banner',
    description: 'Баннер веб-версии',
    status: 'planned',
    provenance: 'business-requirement',
    usedBy: [],
    sourceFallback: 'Источник в Figma не определён',
    preview: 'wide',
  },
  {
    path: 'certificate.main',
    label: 'Certificate',
    description: 'Шаблон сертификата о прохождении',
    status: 'planned',
    provenance: 'business-requirement',
    usedBy: [],
    sourceFallback: 'Источник в Figma не определён',
    preview: 'wide',
  },
]

export const STATUS_META: Record<AssetStatus, { label: string; title: string }> = {
  active: {
    label: 'в прототипе',
    title: 'Замена сразу отображается на экранах прототипа',
  },
  prepared: {
    label: 'подготовлен',
    title: 'Слот и источник в Figma есть, но ни один экран MVP его не рендерит',
  },
  planned: {
    label: 'архитектура',
    title: 'Определён только слот — источник и место применения ещё не заданы',
  },
}
