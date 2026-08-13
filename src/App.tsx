import { useEffect, useState } from 'react'
import { BrandProvider, useBrand } from './brand/BrandContext'
import type { BrandConfig } from './brand/BrandConfig'
import ExportMode from './modes/ExportMode'
import PresentationMode from './modes/PresentationMode'
import PrototypeMode from './modes/PrototypeMode'
import WebMode from './modes/WebMode'
import WorkspaceNav, { type WorkspaceMode } from './navigation/WorkspaceNav'
import ScreenSettings from './panels/ScreenSettings'
import type { ScreenId } from './registry/types'
import { loadShare } from './share/client'

function Shell({ viewer }: { viewer: boolean }) {
  const [mode, setMode] = useState<WorkspaceMode>(viewer ? 'presentation' : 'mobile')
  const [screen, setScreen] = useState<ScreenId>('splash')
  const [webScreen, setWebScreen] = useState<'home' | 'course'>('home')
  const [dark, setDark] = useState(() => localStorage.getItem('constructor-theme') === 'dark')
  const { cssVars, config } = useBrand()
  const showSettings = !viewer && (mode === 'mobile' || mode === 'web')

  return (
    <div className={'bs-shell' + (showSettings ? ' has-settings' : '') + (dark ? ' is-dark' : '')} style={cssVars as React.CSSProperties}>
      <aside className="bs-shell__nav"><WorkspaceNav mode={mode} onChange={setMode} viewer={viewer} /></aside>
      <main className="bs-shell__main">
        <header className="bs-shell__header">
          <div><strong>{config.displayName}</strong><span>{mode === 'mobile' ? 'Мобильный прототип' : mode === 'presentation' ? 'Презентация' : mode === 'export' ? 'Экспорт' : 'Веб-версия'}</span></div>
          <span className="bs-shell__header-actions">
            <button className="bs-theme-toggle" aria-label={dark ? 'Включить светлую тему' : 'Включить тёмную тему'} title={dark ? 'Светлая тема' : 'Тёмная тема'} onClick={() => setDark((value) => { localStorage.setItem('constructor-theme', value ? 'light' : 'dark'); return !value })}>{dark ? '☀' : '☾'}</button>
            {viewer && <span className="bs-viewer-badge">Только просмотр</span>}
          </span>
        </header>
        <div className="bs-shell__content">
          {mode === 'web' && <WebMode selectedId={webScreen} onSelectedId={setWebScreen} />}
          {mode === 'mobile' && <PrototypeMode screen={screen} onScreenChange={setScreen} />}
          {mode === 'presentation' && <PresentationMode />}
          {mode === 'export' && <ExportMode viewer={viewer} />}
        </div>
      </main>
      {showSettings && <aside className="bs-shell__settings"><ScreenSettings screenId={screen} webScreen={mode === 'web' ? webScreen : undefined} /></aside>}
    </div>
  )
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
  return <BrandProvider><Shell viewer={false} /></BrandProvider>
}
