import { useLayoutEffect, useRef, useState } from 'react'
import { SLIDES } from '../registry/SlideRegistry'
import SlideCanvas from '../presentation/SlideCanvas'

function SlidePreview({ index }: { index: number }) {
  const host = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const node = host.current
    if (!node) return
    const resize = () => setScale(Math.min((node.clientWidth - 48) / 1280, (node.clientHeight - 40) / 720, 1))
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="bs-pres__stage" ref={host}>
      <div className="bs-pres__scaled" style={{ width: 1280 * scale, height: 720 * scale }}>
        <div style={{ width: 1280, height: 720, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <SlideCanvas slide={SLIDES[index]} />
        </div>
      </div>
    </div>
  )
}

export default function PresentationMode() {
  const [index, setIndex] = useState(0)
  return (
    <div className="bs-pres">
      <div className="bs-pres__nav">
        {SLIDES.map((item, itemIndex) => (
          <button key={item.figmaNodeId} className={'bs-chip' + (itemIndex === index ? ' is-active' : '')} onClick={() => setIndex(itemIndex)}>
            <span>{item.badge === null ? 'Обложка' : `${item.badge}. ${item.title}`}</span>
          </button>
        ))}
      </div>
      <SlidePreview index={index} />
      <div className="bs-pres__pager">
        <button onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0}>← Назад</button>
        <span>{index + 1} / {SLIDES.length}</span>
        <button onClick={() => setIndex((value) => Math.min(SLIDES.length - 1, value + 1))} disabled={index === SLIDES.length - 1}>Вперёд →</button>
      </div>
    </div>
  )
}
