import { lazy, Suspense, useEffect, useState } from 'react'
import { BrandProvider, useBrand } from './brand/BrandContext'
import type { BrandConfig } from './brand/BrandConfig'
import PresentationMode from './modes/PresentationMode'
import PrototypeMode from './modes/PrototypeMode'
import WebMode from './modes/WebMode'
import type { WebScreenId } from './registry/WebScreenRegistry'
import WorkspaceNav, { type WorkspaceMode } from './navigation/WorkspaceNav'
import ScreenSettings from './panels/ScreenSettings'
import type { ScreenId } from './registry/types'
import { loadShare } from './share/client'
import { BrandProjectsProvider, useBrandProjects } from './projects/BrandProjectsContext'

const ExportMode = lazy(() => import('./modes/ExportMode'))
const BuildAssetsMode = lazy(() => import('./modes/BuildAssetsMode'))
const ProjectsMode = lazy(() => import('./modes/ProjectsMode'))
const PreparationMode = lazy(() => import('./modes/PreparationMode'))

const MODE_LABELS: Record<WorkspaceMode, string> = {
  projects: 'Проекты', web: 'Веб-версия', mobile: 'Мобильный прототип', tablet: 'Планшетная версия',
  presentation: 'Презентация', buildAssets: 'Ресурсы для сборки', metadata: 'Метаданные', export: 'Экспорт',
}

function Shell({ viewer, projectControls = false }: { viewer: boolean; projectControls?: boolean }) {
  const [mode, setMode] = useState<WorkspaceMode>(viewer ? 'presentation' : 'mobile')
  const [screen, setScreen] = useState<ScreenId>('splash')
  const [webScreen, setWebScreen] = useState<WebScreenId>('authorization')
  const [dark, setDark] = useState(() => localStorage.getItem('constructor-theme') === 'dark')
  const { cssVars, config } = useBrand()
  const showSettings = !viewer && (mode === 'mobile' || mode === 'web')

  return (
    <div className={'bs-shell' + (showSettings ? ' has-settings' : '') + (dark ? ' is-dark' : '')} style={cssVars as React.CSSProperties}>
      <aside className="bs-shell__nav"><WorkspaceNav mode={mode} onChange={setMode} viewer={viewer} /></aside>
      <main className="bs-shell__main">
        <header className="bs-shell__header">
          <div><strong>{config.displayName}</strong><span>{MODE_LABELS[mode]}</span></div>
          <span className="bs-shell__header-actions">
            {projectControls && <CurrentProjectControl />}
            <button className="bs-theme-toggle" aria-label={dark ? 'Включить светлую тему' : 'Включить тёмную тему'} title={dark ? 'Светлая тема' : 'Тёмная тема'} onClick={() => setDark((value) => { localStorage.setItem('constructor-theme', value ? 'light' : 'dark'); return !value })}>{dark ? '☀' : '☾'}</button>
            {viewer && <span className="bs-viewer-badge">Только просмотр</span>}
          </span>
        </header>
        <div className="bs-shell__content">
          <Suspense fallback={<div className="bs-load-state"><div className="bs-loader" /><p>Загрузка раздела…</p></div>}>
          {mode === 'web' && <WebMode selectedId={webScreen} onSelectedId={setWebScreen} />}
          {mode === 'mobile' && <PrototypeMode screen={screen} onScreenChange={setScreen} />}
          {mode === 'presentation' && <PresentationMode />}
          {mode === 'projects' && !viewer && <ProjectsMode />}
          {mode === 'buildAssets' && !viewer && <BuildAssetsMode />}
          {mode === 'tablet' && !viewer && <PreparationMode section="tablet" />}
          {mode === 'metadata' && !viewer && <PreparationMode section="metadata" />}
          {mode === 'export' && <ExportMode viewer={viewer} />}
          </Suspense>
        </div>
      </main>
      {showSettings && <aside className="bs-shell__settings"><ScreenSettings screenId={screen} webScreen={mode === 'web' ? webScreen : undefined} /></aside>}
    </div>
  )
}

function CurrentProjectControl() {
  const { projects, currentProject, selectProject, saveState } = useBrandProjects()
  return (
    <label className="bs-current-project"><span>Проект:</span><select value={currentProject.id} onChange={(event) => selectProject(event.target.value)}>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select><em className={`is-${saveState}`}>{saveState === 'saving' ? 'Сохраняется…' : saveState === 'error' ? 'Ошибка сохранения' : 'Сохранено'}</em></label>
  )
}

function ProjectWorkspace() {
  const { currentProject, updateCurrentBrandConfig } = useBrandProjects()
  return <BrandProvider key={currentProject.id} initialConfig={currentProject.brandConfig} onConfigChange={updateCurrentBrandConfig}><Shell viewer={false} projectControls /></BrandProvider>
}

function ShareLoader({ id }: { id: string }) {
  const [brand, setBrand] = useState<BrandConfig | null>(null)
  const [error, setError] = useState('')
  useEffect(() => { void loadShare(id).then((shared) => setBrand(shared.brand)).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Ссылка недоступна.')) }, [id])
  if (error) return <div className="bs-load-state"><h1>Демонстрация недоступна</h1><p>{error}</p></div>
  if (!brand) return <div className="bs-load-state"><div className="bs-loader" /><p>Загрузка демонстрации…</p></div>
  return <BrandProvider initialConfig={brand} readOnly><Shell viewer /></BrandProvider>
}

export default function App() {
  const match = location.pathname.match(/^\/share\/([a-zA-Z0-9_-]+)$/)
  if (match) return <ShareLoader id={match[1]} />
  return <BrandProjectsProvider><ProjectWorkspace /></BrandProjectsProvider>
}
