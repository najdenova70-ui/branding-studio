type Progress = (message: string) => void

async function captureSlides(progress: Progress): Promise<string[]> {
  const { toPng } = await import('html-to-image')
  const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-export-slide]'))
  const images: string[] = []
  for (let index = 0; index < nodes.length; index += 1) {
    progress(`Подготовка слайда ${index + 1} из ${nodes.length}`)
    images.push(await toPng(nodes[index], {
      backgroundColor: '#F9FAFB', pixelRatio: 1, cacheBust: false,
      width: 1280, height: 720,
      style: { width: '1280px', height: '720px', margin: '0', borderRadius: '0', boxShadow: 'none' },
    }))
  }
  return images
}

export async function exportPdf(filename: string, progress: Progress): Promise<void> {
  const [images, { jsPDF }] = await Promise.all([captureSlides(progress), import('jspdf')])
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1280, 720], hotfixes: ['px_scaling'] })
  images.forEach((image, index) => {
    if (index > 0) pdf.addPage([1280, 720], 'landscape')
    pdf.addImage(image, 'PNG', 0, 0, 1280, 720, undefined, 'FAST')
  })
  progress('Сохранение PDF')
  pdf.save(`${filename}.pdf`)
}

export async function exportPptx(filename: string, progress: Progress): Promise<void> {
  const [images, { buildPptx }] = await Promise.all([captureSlides(progress), import('./pptxBuilder')])
  progress('Сохранение PPTX')
  await buildPptx(images, filename)
}
