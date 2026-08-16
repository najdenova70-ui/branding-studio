import { useMemo, useState } from 'react'
import { useBrand } from '../brand/BrandContext'
import { assessPlatform, exportDevelopmentPackage } from '../export/buildAssetService'
import type { ExportPlatform } from '../export/exportRecipes'
import AssetsPanel from '../panels/AssetsPanel'
import { useBrandProjects } from '../projects/BrandProjectsContext'

const TABLET_MASTER_ASSETS = ['background.authTablet', 'background.navigationDrawer'] as const

function MetadataPlaceholder({ platform }: { platform: ExportPlatform }) {
  const platformName = platform === 'android' ? 'Android' : 'iOS'
  return (
    <article className="bs-prep-card">
      <div className="bs-prep-card__icon">⛁</div>
      <div><span>{platformName}</span><h2>Метаданные · {platformName}</h2></div>
      <em>Запланировано</em>
      <p>Состав технических метаданных будет добавлен после утверждения требований платформы.</p>
    </article>
  )
}

function TabletAssets() {
  const { config } = useBrand()
  const { currentProject, markCurrentExported } = useBrandProjects()
  const [platform, setPlatform] = useState<ExportPlatform>('android')
  const [exportState, setExportState] = useState('')
  const [exportError, setExportError] = useState('')
  const outputs = useMemo(() => assessPlatform(config, platform).filter(({ recipe }) =>
    TABLET_MASTER_ASSETS.includes(recipe.masterAssetId as typeof TABLET_MASTER_ASSETS[number])), [config, platform])
  const ready = outputs.filter(({ status }) => status === 'READY').length

  const download = async () => {
    setExportError('')
    setExportState('Подготовка пакета')
    try {
      await exportDevelopmentPackage({ ...currentProject, brandConfig: config }, platform, setExportState)
      markCurrentExported()
    } catch (reason) {
      setExportError(reason instanceof Error ? reason.message : 'Не удалось собрать пакет.')
    } finally {
      setExportState('')
    }
  }

  return (
    <>
      <div className="bs-platform-tabs" role="tablist">
        <button className={platform === 'android' ? 'is-active' : ''} onClick={() => setPlatform('android')}>Android</button>
        <button className={platform === 'ios' ? 'is-active' : ''} onClick={() => setPlatform('ios')}>iOS</button>
      </div>

      <section className="bs-tablet-status">
        <div className="bs-tablet-status__icon">▭</div>
        <div>
          <span>{platform === 'android' ? 'Android tablet assets' : 'iOS tablet assets'}</span>
          <h2>{platform === 'android' ? `${ready} из ${outputs.length} outputs готовы` : 'Ожидаются подтверждённые iOS-рецепты'}</h2>
          <p>{platform === 'android'
            ? 'Фон планшетной авторизации экспортируется в пять drawable-sw600dp density-вариантов. Фон бокового меню использует общий master asset приложения.'
            : 'Master assets можно загрузить и сохранить в проекте уже сейчас. Размеры планшетных iOS outputs в Figma source пока не подтверждены, поэтому система не создаёт их на глаз.'}</p>
        </div>
        <button className="bs-btn bs-btn--primary" disabled={outputs.length === 0 || !!exportState} onClick={() => void download()}>
          {exportState || (platform === 'android' ? 'Скачать Android пакет' : 'Скачать iOS пакет')}
        </button>
      </section>

      <div className="bs-prep-assets">
        <AssetsPanel paths={[...TABLET_MASTER_ASSETS]} countLabel="2 master assets текущего проекта" />
      </div>
      {exportError && <div className="bs-warn bs-prep-export-error">{exportError}</div>}
    </>
  )
}

export default function PreparationMode({ section }: { section: 'tablet' | 'metadata' }) {
  const tablet = section === 'tablet'
  return (
    <div className="bs-prep">
      <div className="bs-page-head"><div><span>{tablet ? 'Master assets' : 'Подготовлено для развития'}</span><h1>{tablet ? 'Планшетная версия' : 'Метаданные'}</h1><p>{tablet ? 'Загрузите фон планшетной авторизации и изображение бокового меню. Файлы сохраняются отдельно для текущей сборки клиента и участвуют в техническом экспорте.' : 'Предварительный раздел системных данных приложения. Сейчас доступен только обзор будущих платформенных категорий.'}</p></div></div>
      {tablet ? <TabletAssets /> : (
        <div className="bs-prep-grid bs-prep-grid--two"><MetadataPlaceholder platform="android" /><MetadataPlaceholder platform="ios" /></div>
      )}
    </div>
  )
}
