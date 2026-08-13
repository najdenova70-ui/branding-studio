import { useState } from 'react'
import type { AssetPath } from '../brand/BrandConfig'
import { getScreen } from '../registry/ScreenRegistry'
import type { ScreenId } from '../registry/types'
import AssetsPanel from './AssetsPanel'
import ColorsPanel from './ColorsPanel'

function Section({ title, count, children, defaultOpen = true }: {
  title: string
  count: number
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="bs-settings-group">
      <button className="bs-settings-group__head" onClick={() => setOpen((value) => !value)}>
        <span>{open ? '▾' : '▸'}</span><strong>{title}</strong><em>{count}</em>
      </button>
      {open && <div className="bs-settings-group__body">{children}</div>}
    </section>
  )
}

export default function ScreenSettings({ screenId, webScreen }: { screenId: ScreenId; webScreen?: 'home' | 'course' }) {
  if (webScreen) {
    const paths: AssetPath[] = webScreen === 'home' ? ['background.webHomeBanner'] : []
    return (
      <div className="bs-screen-settings">
        <div className="bs-screen-settings__title"><span>Настройки экрана</span><strong>{webScreen === 'home' ? 'Веб-версия — Главная' : 'Веб-версия — Основы веб-разработки'}</strong></div>
        <Section title="Изображения и логотипы" count={paths.length}><AssetsPanel paths={paths} /></Section>
        <Section title="Цвета элементов" count={0}><ColorsPanel tokenIds={[]} /></Section>
      </div>
    )
  }
  const screen = getScreen(screenId)
  const assetPaths = screen.brandFields.filter((field) => field.startsWith('assets.'))
    .map((field) => field.slice('assets.'.length) as AssetPath)
  const tokenIds = screen.brandFields.filter((field) => field.startsWith('colors.'))
    .map((field) => field.slice('colors.'.length))

  return (
    <div className="bs-screen-settings">
      <div className="bs-screen-settings__title"><span>Настройки экрана</span><strong>{screen.title}</strong></div>
      <Section title="Изображения и логотипы" count={assetPaths.length}>
        <AssetsPanel paths={assetPaths} />
      </Section>
      <Section title="Цвета элементов" count={tokenIds.length}>
        <ColorsPanel tokenIds={tokenIds} />
      </Section>
    </div>
  )
}
