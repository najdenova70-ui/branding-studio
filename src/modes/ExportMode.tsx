import { useState } from 'react'
import { useBrand } from '../brand/BrandContext'
import { SLIDES } from '../registry/SlideRegistry'
import SlideCanvas from '../presentation/SlideCanvas'
import { exportPdf, exportPptx } from '../export/presentationExport'
import { createShare } from '../share/client'

export default function ExportMode({ viewer }: { viewer: boolean }) {
  const { config } = useBrand()
  const [status, setStatus] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const [error, setError] = useState('')
  const run = async (task: () => Promise<void>) => {
    setError(''); try { await task() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Операция не выполнена.') } finally { setStatus('') }
  }
  return (
    <div className="bs-export">
      <div className="bs-export__intro"><span>Экспорт и демонстрация</span><h1>Готовые материалы бренда</h1><p>PDF и PPTX создаются из текущей фиксированной презентации. Публичная ссылка открывается только для просмотра.</p></div>
      <div className="bs-export__grid">
        <article><div className="bs-export__icon">PDF</div><h2>Документ PDF</h2><p>Один файл для отправки и печати.</p><button className="bs-btn bs-btn--primary" disabled={!!status} onClick={() => void run(() => exportPdf(config.displayName, setStatus))}>Скачать PDF</button></article>
        <article><div className="bs-export__icon">PPTX</div><h2>PowerPoint</h2><p>Слайды как изображения — макет не разъедется.</p><button className="bs-btn bs-btn--primary" disabled={!!status} onClick={() => void run(() => exportPptx(config.displayName, setStatus))}>Скачать PPTX</button></article>
        {!viewer && <article><div className="bs-export__icon">↗</div><h2>Публичная демонстрация</h2><p>Ссылка только для просмотра презентации и мобильного прототипа.</p><button className="bs-btn bs-btn--primary" disabled={!!status} onClick={() => void run(async () => { setStatus('Создание ссылки'); const shared = await createShare(config); setShareUrl(`${location.origin}/share/${shared.id}`) })}>Создать ссылку</button></article>}
      </div>
      {status && <div className="bs-export__status">{status}…</div>}
      {error && <div className="bs-warn">{error}</div>}
      {shareUrl && <div className="bs-share-result"><input readOnly value={shareUrl} /><button className="bs-btn" onClick={() => void navigator.clipboard.writeText(shareUrl)}>Копировать</button><a className="bs-btn" href={shareUrl} target="_blank" rel="noreferrer">Открыть</a></div>}
      <div className="bs-export-render" aria-hidden>
        {SLIDES.map((slide) => <div key={slide.figmaNodeId} data-export-slide><SlideCanvas slide={slide} exportSize /></div>)}
      </div>
    </div>
  )
}
