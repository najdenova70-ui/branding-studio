export type WorkspaceMode = 'web' | 'mobile' | 'presentation' | 'export'

const ITEMS: { id: WorkspaceMode; icon: string; label: string; note: string }[] = [
  { id: 'web', icon: '◫', label: 'Веб-версия', note: '2 экрана' },
  { id: 'mobile', icon: '▯', label: 'Мобильная версия', note: 'Интерактивно' },
  { id: 'presentation', icon: '▤', label: 'Презентация', note: 'Просмотр' },
  { id: 'export', icon: '⇩', label: 'Экспорт', note: 'PDF · PPTX · Ссылка' },
]

export default function WorkspaceNav({ mode, onChange, viewer }: {
  mode: WorkspaceMode
  onChange: (mode: WorkspaceMode) => void
  viewer: boolean
}) {
  const { config } = useBrand()
  const appIcon = resolveAsset(config.assets.appIcon)
  return (
    <div className="bs-workspace-nav">
      <div className="bs-workspace-nav__brand"><span className="bs-workspace-nav__mark"><img src={appIcon.src} alt="" /></span><div><strong>Конструктор экранов</strong><small>{viewer ? 'Демонстрация' : 'Рабочее пространство'}</small></div></div>
      <nav>
        {ITEMS.filter((item) => !viewer || item.id !== 'web').map((item) => (
          <button key={item.id} className={mode === item.id ? 'is-active' : ''} onClick={() => onChange(item.id)}>
            <span className="bs-workspace-nav__icon">{item.icon}</span>
            <span><strong>{item.label}</strong><small>{item.note}</small></span>
          </button>
        ))}
      </nav>
      {viewer && <div className="bs-workspace-nav__foot">Только просмотр</div>}
    </div>
  )
}
import { useBrand } from '../brand/BrandContext'
import { resolveAsset } from '../brand/AssetResolver'
