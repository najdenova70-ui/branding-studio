import { useState } from 'react'
import { BrandProvider, useBrand } from './brand/BrandContext'
import AssetsPanel from './panels/AssetsPanel'
import ColorsPanel from './panels/ColorsPanel'
import PresentationMode from './modes/PresentationMode'
import PrototypeMode from './modes/PrototypeMode'

type Mode = 'presentation' | 'prototype'

function Shell() {
  const [mode, setMode] = useState<Mode>('prototype')
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const { cssVars, config } = useBrand()

  const cls = [
    'bs-app',
    leftOpen ? '' : 'is-left-collapsed',
    rightOpen ? '' : 'is-right-collapsed',
  ].filter(Boolean).join(' ')

  return (
    <div className={cls} style={cssVars as React.CSSProperties}>
      <aside className="bs-app__left">
        {leftOpen && <AssetsPanel />}
      </aside>

      <main className="bs-app__center">
        <header className="bs-topbar">
          <button
            className="bs-icon-btn"
            onClick={() => setLeftOpen((o) => !o)}
            title={leftOpen ? 'Скрыть Brand Assets' : 'Показать Brand Assets'}
          >
            {leftOpen ? '⟨' : '⟩'}
          </button>

          <div className="bs-topbar__title">
            Live Preview
            <span className="bs-topbar__client">{config.displayName || 'Без названия'}</span>
          </div>

          <nav className="bs-tabs">
            <button className={mode === 'presentation' ? 'is-active' : ''} onClick={() => setMode('presentation')}>
              Презентация
            </button>
            <button className={mode === 'prototype' ? 'is-active' : ''} onClick={() => setMode('prototype')}>
              Интерактивный прототип
            </button>
          </nav>

          <button
            className="bs-icon-btn"
            onClick={() => setRightOpen((o) => !o)}
            title={rightOpen ? 'Скрыть Brand Colors' : 'Показать Brand Colors'}
          >
            {rightOpen ? '⟩' : '⟨'}
          </button>
        </header>

        <div className="bs-app__content">
          {mode === 'presentation' ? <PresentationMode /> : <PrototypeMode />}
        </div>
      </main>

      <aside className="bs-app__right">
        {rightOpen && <ColorsPanel />}
      </aside>
    </div>
  )
}

export default function App() {
  return (
    <BrandProvider>
      <Shell />
    </BrandProvider>
  )
}
