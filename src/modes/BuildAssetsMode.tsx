import { useMemo, useState } from 'react'
import { useBrand } from '../brand/BrandContext'
import { assessPlatform, type BuildAssetAssessment, type BuildAssetStatus } from '../export/buildAssetService'
import { recipeFilename, type ExportPlatform } from '../export/exportRecipes'

type GroupStatus = 'READY' | 'INCOMPLETE' | 'MISSING SOURCE' | 'ERROR'

interface AssetGroupMeta {
  title: string
  masterLabel: string
  order: number
  setupRequired?: boolean
}

interface AssetGroup {
  id: string
  meta: AssetGroupMeta
  outputs: BuildAssetAssessment[]
  status: GroupStatus
}

const GROUP_META: Record<string, AssetGroupMeta> = {
  'background.authPhone': { title: 'Экран загрузки', masterLabel: 'Splash Background', order: 1 },
  'background.navigationDrawer': { title: 'Боковое меню', masterLabel: 'Navigation Menu Background', order: 2 },
  'logo.largeWhiteRu': { title: 'Логотип авторизации', masterLabel: 'Logo / Large White', order: 3 },
  'unknown.toolbarLogo': { title: 'Toolbar Logo', masterLabel: 'Master asset не назначен', order: 4 },
  appIcon: { title: 'Иконка приложения', masterLabel: 'App Icon Master', order: 5 },
  'background.authTablet': { title: 'Фон авторизации планшета', masterLabel: 'Tablet Authorization Background', order: 6 },
  'unknown.notificationIcon': { title: 'Иконка уведомлений', masterLabel: 'Master asset не назначен', order: 101, setupRequired: true },
}

function statusClass(status: string) {
  return status.toLowerCase().replace(/ /g, '-')
}

function variantStatus(status: BuildAssetStatus) {
  return status === 'NOT IMPLEMENTED' ? 'MISSING SOURCE' : status
}

function groupStatus(outputs: BuildAssetAssessment[]): GroupStatus {
  if (outputs.some(({ status }) => status === 'INVALID SOURCE')) return 'ERROR'
  const ready = outputs.filter(({ status }) => status === 'READY').length
  if (ready === outputs.length) return 'READY'
  if (ready > 0) return 'INCOMPLETE'
  return 'MISSING SOURCE'
}

function densityLabel(output: BuildAssetAssessment) {
  if (output.recipe.platform === 'ios') return 'основной'
  return output.recipe.directory.match(/(mdpi|hdpi|xhdpi|xxhdpi|xxxhdpi)$/)?.[1] ?? '—'
}

function buildGroups(outputs: BuildAssetAssessment[]): AssetGroup[] {
  const grouped = new Map<string, BuildAssetAssessment[]>()
  for (const output of outputs) {
    const id = output.recipe.masterAssetId
    grouped.set(id, [...(grouped.get(id) ?? []), output])
  }
  return [...grouped].map(([id, groupOutputs]) => ({
    id,
    meta: GROUP_META[id] ?? {
      title: groupOutputs[0].recipe.masterFigmaNodeName,
      masterLabel: id.startsWith('unknown.') ? 'Master asset не назначен' : groupOutputs[0].recipe.masterFigmaNodeName,
      order: id.startsWith('unknown.') ? 1000 : 50,
      setupRequired: id.startsWith('unknown.'),
    },
    outputs: groupOutputs,
    status: groupStatus(groupOutputs),
  })).sort((a, b) => a.meta.order - b.meta.order)
}

function AssetGroupCard({ group, platform }: { group: AssetGroup; platform: ExportPlatform }) {
  const source = group.outputs.find((output) => output.source)?.source
  const firstRecipe = group.outputs[0].recipe
  const issue = group.outputs.find((output) => output.issue)?.issue
  return (
    <article className="bs-build-group">
      <header className="bs-build-group__header">
        <div className="bs-build-master-preview">
          {source?.src ? <img src={source.src} alt="" style={{ objectFit: firstRecipe.fit }} /> : <span>MASTER<br />не назначен</span>}
        </div>
        <div className="bs-build-group__identity">
          <h2>{group.meta.title}</h2>
          <small>Master asset</small>
          <strong>{group.meta.masterLabel}</strong>
          <span>{group.outputs.length} generated {group.outputs.length === 1 ? 'variant' : 'variants'}</span>
        </div>
        <span className={`bs-group-status is-${statusClass(group.status)}`}>{group.status}</span>
      </header>
      {!source && <div className="bs-build-group__issue">No approved master asset mapping.{issue ? ` ${issue}` : ''}</div>}

      <div className="bs-build-variants">
        <div className="bs-build-variants__title">Generated {platform === 'android' ? 'Android' : 'iOS'} resources</div>
        <div className="bs-build-variants__head"><span>Вариант</span><span>Размер</span><span>Формат</span><span>Имя файла</span><span>Статус</span></div>
        {group.outputs.map((output) => {
          const status = variantStatus(output.status)
          return (
            <div className="bs-build-variant" key={output.recipe.id}>
              <strong>{densityLabel(output)}</strong>
              <span>{output.recipe.width} × {output.recipe.height}</span>
              <span>{output.recipe.format.toUpperCase()}</span>
              <code>{recipeFilename(output.recipe)}</code>
              <span className={`bs-variant-status is-${statusClass(status)}`}>{status}</span>
            </div>
          )
        })}
      </div>

      <details className="bs-build-tech">
        <summary>Техническая информация</summary>
        <div className="bs-build-tech__master"><span>masterAssetId</span><code>{group.id}</code></div>
        {group.outputs.map(({ recipe }) => (
          <div className="bs-build-tech__row" key={recipe.id}>
            <code>{recipe.id}</code><span>Figma {recipe.sourceFigmaNodeId}</span><span>{recipe.platform}/{recipe.directory}/{recipeFilename(recipe)}</span>
          </div>
        ))}
      </details>
    </article>
  )
}

export default function BuildAssetsMode() {
  const { config } = useBrand()
  const [platform, setPlatform] = useState<ExportPlatform>('android')
  const outputs = assessPlatform(config, platform)
  const groups = useMemo(() => buildGroups(outputs), [outputs])
  const regularGroups = groups.filter(({ meta }) => !meta.setupRequired)
  const setupGroups = groups.filter(({ meta }) => meta.setupRequired)
  const readyGroups = groups.filter(({ status }) => status === 'READY').length

  return (
    <div className="bs-build-assets">
      <div className="bs-page-head"><div><span>Development assets</span><h1>Ресурсы для сборки</h1><p>Предпросмотр технического результата текущего проекта. Исходные изображения меняются только в настройках соответствующих экранов.</p></div></div>
      <div className="bs-platform-tabs" role="tablist">
        <button className={platform === 'android' ? 'is-active' : ''} onClick={() => setPlatform('android')}>Android</button>
        <button className={platform === 'ios' ? 'is-active' : ''} onClick={() => setPlatform('ios')}>iOS</button>
      </div>

      <div className="bs-build-summary">
        <strong>{platform === 'android' ? 'Android' : 'iOS'}</strong>
        <span>{groups.length} брендовых элементов</span>
        <span className="is-ready">{readyGroups} готовы</span>
        <span className={groups.length === readyGroups ? '' : 'is-warning'}>{groups.length - readyGroups} требуют настройки</span>
        <small>{outputs.length} технических variants</small>
      </div>

      <div className="bs-build-list">
        {regularGroups.map((group) => <AssetGroupCard key={group.id} group={group} platform={platform} />)}
        {setupGroups.length > 0 && (
          <section className="bs-build-setup">
            <div className="bs-build-setup__head"><div><h2>Требует настройки</h2><p>Для этих outputs Figma подтверждает размеры, но approved master asset mapping отсутствует.</p></div><span>{setupGroups.length}</span></div>
            {setupGroups.map((group) => <AssetGroupCard key={group.id} group={group} platform={platform} />)}
          </section>
        )}
      </div>
    </div>
  )
}
