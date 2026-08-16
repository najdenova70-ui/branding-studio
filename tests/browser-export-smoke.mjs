import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import JSZip from 'jszip'

const edge = process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const baseUrl = process.env.STUDIO_URL || 'http://127.0.0.1:8088'
const runDir = await mkdtemp(join(tmpdir(), 'branding-studio-smoke-'))
const downloadDir = join(runDir, 'downloads')
const evidenceDir = process.env.SMOKE_EVIDENCE_DIR
const drawerEvidence = process.env.DRAWER_EVIDENCE_PATH
const homeEvidence = process.env.HOME_EVIDENCE_PATH
const shellEvidence = process.env.SHELL_EVIDENCE_PATH
const webEvidence = process.env.WEB_EVIDENCE_PATH
const mainBannerEvidence = process.env.MAIN_BANNER_EVIDENCE_PATH
const port = 9300 + (process.pid % 500)
const browser = spawn(edge, [
  '--headless=new', '--disable-gpu', '--disable-crash-reporter', '--disable-breakpad',
  '--no-first-run', '--no-default-browser-check',
  '--window-size=1440,1000',
  `--remote-debugging-port=${port}`, `--user-data-dir=${join(runDir, 'profile')}`, baseUrl,
], { stdio: 'ignore', windowsHide: true })
let cdp

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const trace = (step) => { if (process.env.SMOKE_TRACE) process.stderr.write(`[smoke] ${step}\n`) }

async function targets() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json`)
      if (response.ok) return response.json()
    } catch {}
    await delay(100)
  }
  throw new Error('Edge DevTools endpoint did not start.')
}

function connect(url) {
  const socket = new WebSocket(url)
  const pending = new Map()
  let sequence = 0
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data)
    const job = pending.get(message.id)
    if (!job) return
    pending.delete(message.id)
    if (message.error) job.reject(new Error(message.error.message))
    else job.resolve(message.result)
  }
  const opened = new Promise((resolve, reject) => {
    socket.onopen = resolve
    socket.onerror = () => reject(new Error('Could not connect to Edge DevTools.'))
  })
  return {
    socket,
    async send(method, params = {}) {
      await opened
      const id = ++sequence
      const result = new Promise((resolve, reject) => pending.set(id, { resolve, reject }))
      socket.send(JSON.stringify({ id, method, params }))
      return result
    },
  }
}

async function evaluate(cdp, expression) {
  const result = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text)
  return result.result.value
}

async function waitForFile(extension, timeout = 90_000) {
  const started = Date.now()
  while (Date.now() - started < timeout) {
    const files = await readdir(downloadDir).catch(() => [])
    const file = files.find((name) => name.toLowerCase().endsWith(extension))
    if (file) return join(downloadDir, file)
    await delay(250)
  }
  throw new Error(`${extension} download timed out.`)
}

try {
  trace('connecting')
  const pages = await targets()
  const page = pages.find((target) => target.type === 'page')
  if (!page) throw new Error('No browser page found.')
  cdp = connect(page.webSocketDebuggerUrl)
  await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloadDir, eventsEnabled: true })
  await cdp.send('Runtime.enable')

  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (await evaluate(cdp, `document.querySelectorAll('.bs-workspace-nav button').length`)) break
    await delay(100)
  }
  const editorContract = await evaluate(cdp, `({
    nav: [...document.querySelectorAll('.bs-workspace-nav button')].map((node) => node.textContent),
    settings: !!document.querySelector('.bs-shell__settings'),
    oldRows: !!document.querySelector('.bs-proto__bar'),
  })`)
  if (!editorContract.settings || editorContract.oldRows || editorContract.nav.length !== 8) throw new Error(`Editor contract failed: ${JSON.stringify(editorContract)}`)
  trace('editor contract')

  if (webEvidence) {
    await evaluate(cdp, `(() => { [...document.querySelectorAll('.bs-workspace-nav button')].find((item) => item.textContent.includes('Веб-версия'))?.click() })()`)
    await delay(300)
    const webContract = await evaluate(cdp, `({ banner: !!document.querySelector('.bs-web-home-banner'), assetCard: document.querySelectorAll('.bs-shell__settings .bs-asset-card').length, hotspot: !!document.querySelector('.bs-web-course-hotspot') })`)
    if (!webContract.banner || webContract.assetCard !== 1 || !webContract.hotspot) throw new Error(`Web home contract failed: ${JSON.stringify(webContract)}`)
    const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true })
    await writeFile(webEvidence, Buffer.from(screenshot.data, 'base64'))
    await evaluate(cdp, `document.querySelector('.bs-web-course-hotspot')?.click()`)
    await delay(200)
    const courseContract = await evaluate(cdp, `({ selected: document.querySelector('.bs-web-mode__tabs button.is-active')?.textContent, node: document.querySelector('.bs-web-mode__canvas')?.dataset.figmaNode, assetCard: document.querySelectorAll('.bs-shell__settings .bs-asset-card').length })`)
    if (courseContract.node !== '6785:27550' || courseContract.assetCard !== 0) throw new Error(`Web course contract failed: ${JSON.stringify(courseContract)}`)
    await evaluate(cdp, `(() => { [...document.querySelectorAll('.bs-workspace-nav button')].find((item) => item.textContent.includes('Мобильная версия'))?.click() })()`)
    await delay(200)
  }

  if (mainBannerEvidence) {
    await evaluate(cdp, `document.querySelectorAll('.bs-screen-thumb')[5]?.click()`)
    await delay(300)
    const rect = await evaluate(cdp, `(() => { const value = [...document.querySelectorAll('[data-screen-id="mainBanner"]')].map((node) => node.getBoundingClientRect()).sort((a, b) => b.width - a.width)[0]; return value && ({ x: value.x, y: value.y, width: value.width, height: value.height }) })()`)
    if (!rect) throw new Error('Main banner screen was not rendered.')
    const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true, clip: { ...rect, scale: 1 } })
    await writeFile(mainBannerEvidence, Buffer.from(screenshot.data, 'base64'))
  }

  if (homeEvidence) {
    await evaluate(cdp, `(() => { const node = [...document.querySelectorAll('.bs-screen-thumb')].find((item) => item.textContent.includes('Рабочий стол телефона')); node?.click(); return !!node })()`)
    await delay(300)
    const rect = await evaluate(cdp, `(() => { const value = [...document.querySelectorAll('[data-screen-id="home"]')].map((node) => node.getBoundingClientRect()).sort((a, b) => b.width - a.width)[0]; return value && ({ x: value.x, y: value.y, width: value.width, height: value.height }) })()`)
    if (!rect) throw new Error('Home screen was not rendered.')
    const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true, clip: { ...rect, scale: 1 } })
    await writeFile(homeEvidence, Buffer.from(screenshot.data, 'base64'))
    await evaluate(cdp, `document.querySelector('[data-screen-id="home"] .bs-home-app.is-brand')?.click()`)
    await delay(150)
    const openedSplash = await evaluate(cdp, `!!document.querySelector('[data-screen-id="splash"]')`)
    if (!openedSplash) throw new Error('Home application icon did not open the splash screen.')
  }

  if (shellEvidence) {
    await evaluate(cdp, `document.querySelector('.bs-theme-toggle')?.click()`)
    await delay(200)
    const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true })
    await writeFile(shellEvidence, Buffer.from(screenshot.data, 'base64'))
    await evaluate(cdp, `document.querySelector('.bs-theme-toggle')?.click()`)
  }

  if (drawerEvidence) {
    await evaluate(cdp, `(() => { const nodes = [...document.querySelectorAll('.bs-screen-thumb')]; const node = nodes.find((item) => item.textContent.includes('Боковое меню')); node?.click(); return !!node })()`)
    await delay(300)
    const rect = await evaluate(cdp, `(() => { const value = [...document.querySelectorAll('[data-screen-id="drawer"]')].map((node) => node.getBoundingClientRect()).sort((a, b) => b.width - a.width)[0]; return value && ({ x: value.x, y: value.y, width: value.width, height: value.height }) })()`)
    if (!rect) throw new Error('Drawer screen was not rendered.')
    const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true, clip: { ...rect, scale: 1 } })
    await writeFile(drawerEvidence, Buffer.from(screenshot.data, 'base64'))
  }

  if (evidenceDir) {
    await mkdir(evidenceDir, { recursive: true })
    await evaluate(cdp, `(() => { [...document.querySelectorAll('.bs-workspace-nav button')].find((item) => item.textContent.includes('Презентация'))?.click() })()`)
    await delay(400)
    for (let index = 0; index < 3; index += 1) {
      await evaluate(cdp, `document.querySelectorAll('.bs-pres__nav button')[${index}]?.click()`)
      await delay(150)
      const rect = await evaluate(cdp, `(() => { const value = document.querySelector('.bs-slide-design')?.getBoundingClientRect(); return value && ({ x: value.x, y: value.y, width: value.width, height: value.height }) })()`)
      if (!rect) throw new Error('Presentation slide was not rendered.')
      const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true, clip: { ...rect, scale: 1 } })
      await writeFile(join(evidenceDir, `slide-${index + 1}.png`), Buffer.from(screenshot.data, 'base64'))
    }
  }

  const exportOpened = await evaluate(cdp, `(() => { const node = [...document.querySelectorAll('.bs-workspace-nav button')].find((item) => item.textContent.includes('Экспорт')); node?.click(); return !!node })()`)
  if (!exportOpened) throw new Error('Export navigation item was not found.')
  await delay(500)
  trace('export opened')

  const clickDownload = async (label) => {
    const clicked = await evaluate(cdp, `(() => { const node = [...document.querySelectorAll('button')].find((item) => item.textContent.includes(${JSON.stringify(label)})); node?.click(); return !!node })()`)
    if (!clicked) throw new Error(`${label} button was not found.`)
  }

  trace('pptx capture start')
  await clickDownload('Скачать PPTX')
  const pptxPath = await waitForFile('.pptx')
  trace('pptx downloaded')
  const pptx = await readFile(pptxPath)
  const archive = await JSZip.loadAsync(pptx)
  const slideFiles = Object.keys(archive.files).filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
  if (pptx[0] !== 0x50 || pptx[1] !== 0x4b || slideFiles.length !== 3) throw new Error('Generated PPTX is invalid.')

  trace('pdf capture start')
  await clickDownload('Скачать PDF')
  const pdfPath = await waitForFile('.pdf')
  trace('pdf downloaded')
  const pdf = await readFile(pdfPath)
  if (pdf.subarray(0, 4).toString() !== '%PDF') throw new Error('Generated PDF is invalid.')

  await clickDownload('Создать ссылку')
  let shareUrl = ''
  for (let attempt = 0; attempt < 200; attempt += 1) {
    shareUrl = await evaluate(cdp, `document.querySelector('.bs-share-result input')?.value || ''`)
    if (shareUrl) break
    await delay(100)
  }
  if (!shareUrl) throw new Error('Public share link was not created.')
  await cdp.send('Page.navigate', { url: shareUrl })
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (await evaluate(cdp, `document.querySelectorAll('.bs-workspace-nav button').length === 3`)) break
    await delay(100)
  }
  const viewerContract = await evaluate(cdp, `({
    nav: [...document.querySelectorAll('.bs-workspace-nav button')].map((node) => node.textContent),
    settings: !!document.querySelector('.bs-shell__settings'),
    viewerLabel: document.body.textContent.includes('Только просмотр'),
  })`)
  if (viewerContract.settings || !viewerContract.viewerLabel || viewerContract.nav.length !== 3) throw new Error(`Viewer contract failed: ${JSON.stringify(viewerContract)}`)

  process.stdout.write(JSON.stringify({ editorContract, viewerContract, pptxBytes: pptx.length, pdfBytes: pdf.length, slides: slideFiles.length }) + '\n')
  await cdp.send('Browser.close').catch(() => {})
  cdp.socket.close()
} finally {
  browser.kill()
  await Promise.race([new Promise((resolve) => browser.once('exit', resolve)), delay(3000)])
  await delay(500)
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try { await rm(runDir, { recursive: true, force: true }); break } catch (error) {
      if (attempt === 9 && error?.code !== 'EBUSY') throw error
      await delay(200)
    }
  }
}
