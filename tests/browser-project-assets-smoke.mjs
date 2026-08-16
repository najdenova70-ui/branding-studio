import { spawn } from 'node:child_process'
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import JSZip from 'jszip'

const edge = process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const baseUrl = process.env.STUDIO_URL || 'http://127.0.0.1:8088'
const runDir = await mkdtemp(join(tmpdir(), 'branding-projects-smoke-'))
const downloadDir = join(runDir, 'downloads')
const port = 9800 + (process.pid % 100)
const browser = spawn(edge, [
  '--headless=new', '--disable-gpu', '--disable-crash-reporter', '--disable-breakpad',
  '--no-first-run', '--no-default-browser-check', '--window-size=1440,1000',
  `--remote-debugging-port=${port}`, `--user-data-dir=${join(runDir, 'profile')}`, baseUrl,
], { stdio: 'ignore', windowsHide: true })
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function target() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json`)
      if (response.ok) return (await response.json()).find((entry) => entry.type === 'page')
    } catch {}
    await delay(100)
  }
  throw new Error('Edge DevTools endpoint did not start.')
}

function connect(url) {
  const socket = new WebSocket(url)
  const pending = new Map()
  let id = 0
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data)
    const request = pending.get(message.id)
    if (!request) return
    pending.delete(message.id)
    if (message.error) request.reject(new Error(message.error.message))
    else request.resolve(message.result)
  }
  const opened = new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject })
  return {
    socket,
    async send(method, params = {}) {
      await opened
      const requestId = ++id
      const result = new Promise((resolve, reject) => pending.set(requestId, { resolve, reject }))
      socket.send(JSON.stringify({ id: requestId, method, params }))
      return result
    },
  }
}

async function evaluate(cdp, expression) {
  const response = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text)
  return response.result.value
}

async function waitFor(cdp, expression, timeout = 15_000) {
  const started = Date.now()
  while (Date.now() - started < timeout) {
    const value = await evaluate(cdp, expression)
    if (value) return value
    await delay(100)
  }
  throw new Error(`Timed out: ${expression}`)
}

async function waitForZip(timeout = 180_000) {
  const started = Date.now()
  while (Date.now() - started < timeout) {
    const files = await readdir(downloadDir).catch(() => [])
    const name = files.find((file) => file.endsWith('.zip') && !file.endsWith('.crdownload'))
    if (name) return join(downloadDir, name)
    await delay(250)
  }
  throw new Error('Development ZIP download timed out.')
}

function pngDimensions(bytes) {
  if (bytes[0] !== 0x89 || bytes[1] !== 0x50) return undefined
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
}

function jpegDimensions(bytes) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return undefined
  let offset = 2
  while (offset < bytes.length - 9) {
    if (bytes[offset] !== 0xff) { offset += 1; continue }
    const marker = bytes[offset + 1]
    const length = bytes.readUInt16BE(offset + 2)
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) }
    }
    offset += 2 + length
  }
  return undefined
}

let cdp
try {
  const page = await target()
  if (!page) throw new Error('No browser page found.')
  cdp = connect(page.webSocketDebuggerUrl)
  await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloadDir, eventsEnabled: true })
  await cdp.send('Runtime.enable')
  await waitFor(cdp, `document.querySelectorAll('.bs-workspace-nav button').length === 8`)

  await evaluate(cdp, `(() => { const node = [...document.querySelectorAll('.bs-workspace-nav button')].find((item) => item.textContent.includes('Проекты')); node.click() })()`)
  await waitFor(cdp, `!!document.querySelector('.bs-project-grid')`)
  await evaluate(cdp, `(() => {
    const input = document.querySelector('.bs-page-head form input');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, 'Test Client'); input.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('.bs-page-head form').requestSubmit();
  })()`)
  await waitFor(cdp, `document.querySelector('.bs-current-project select')?.selectedOptions[0]?.textContent === 'Test Client'`)

  await evaluate(cdp, `(() => { const node = [...document.querySelectorAll('.bs-screen-thumb')].find((item) => item.textContent.includes('Профиль')); node.click() })()`)
  await waitFor(cdp, `!![...document.querySelectorAll('.bs-style-card code')].find((node) => node.textContent === 'primary')`)
  await evaluate(cdp, `(() => {
    const card = [...document.querySelectorAll('.bs-style-card')].find((node) => node.querySelector('code')?.textContent === 'primary');
    const input = card.querySelector('input[type="color"]');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, '#123456'); input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true }));
  })()`)

  const upload = async (screenName, assetName, width, height, color) => {
    await evaluate(cdp, `(() => { const node = [...document.querySelectorAll('.bs-screen-thumb')].find((item) => item.textContent.includes(${JSON.stringify(screenName)})); node.click() })()`)
    await waitFor(cdp, `!![...document.querySelectorAll('.bs-asset-card__title')].find((node) => node.textContent.includes(${JSON.stringify(assetName)}))`)
    await evaluate(cdp, `(async () => {
      const card = [...document.querySelectorAll('.bs-asset-card')].find((node) => node.querySelector('.bs-asset-card__title')?.textContent.includes(${JSON.stringify(assetName)}));
      const input = card.querySelector('input[type="file"]');
      const canvas = document.createElement('canvas'); canvas.width = ${width}; canvas.height = ${height};
      const context = canvas.getContext('2d'); context.fillStyle = ${JSON.stringify(color)}; context.fillRect(0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      const transfer = new DataTransfer(); transfer.items.add(new File([blob], 'test.png', { type: 'image/png' }));
      input.files = transfer.files; input.dispatchEvent(new Event('change', { bubbles: true }));
    })()`)
    await delay(350)
  }
  await upload('Авторизация — заставка', 'Фон заставки', 375, 812, '#214365')
  await upload('Рабочий стол телефона', 'Иконка приложения', 60, 60, '#654321')
  await evaluate(cdp, `(() => { [...document.querySelectorAll('.bs-workspace-nav button')].find((item) => item.textContent.includes('Планшетная версия')).click() })()`)
  await waitFor(cdp, `!![...document.querySelectorAll('.bs-asset-card__title')].find((node) => node.textContent.includes('Фон авторизации планшета'))`)
  await evaluate(cdp, `(async () => {
    const card = [...document.querySelectorAll('.bs-asset-card')].find((node) => node.querySelector('.bs-asset-card__title')?.textContent.includes('Фон авторизации планшета'));
    const input = card.querySelector('input[type="file"]');
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 768;
    const context = canvas.getContext('2d'); context.fillStyle = '#31245f'; context.fillRect(0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    const transfer = new DataTransfer(); transfer.items.add(new File([blob], 'tablet.png', { type: 'image/png' }));
    input.files = transfer.files; input.dispatchEvent(new Event('change', { bubbles: true }));
  })()`)
  await waitFor(cdp, `document.querySelector('.bs-current-project em')?.textContent === 'Сохранено'`)

  await cdp.send('Page.reload', { ignoreCache: true })
  await waitFor(cdp, `document.querySelector('.bs-current-project select')?.selectedOptions[0]?.textContent === 'Test Client'`)
  const persisted = await evaluate(cdp, `(async () => { const state = await new Promise((resolve, reject) => { const open = indexedDB.open('branding-studio', 1); open.onerror = () => reject(open.error); open.onsuccess = () => { const request = open.result.transaction('state', 'readonly').objectStore('state').get('brand-projects'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error) } }); const project = state.projects.find((item) => item.name === 'Test Client'); return { count: state.projects.length, color: project.brandConfig.colors.primary, icon: project.brandConfig.assets.appIcon.src.startsWith('data:'), splash: project.brandConfig.assets.background.authPhone.src.startsWith('data:'), tablet: project.brandConfig.assets.background.authTablet.src.startsWith('data:') } })()`)
  if (persisted.count !== 2 || persisted.color !== '#123456' || !persisted.icon || !persisted.splash || !persisted.tablet) throw new Error(`Project persistence failed: ${JSON.stringify(persisted)}`)

  const isolation = await evaluate(cdp, `(async () => {
    const select = document.querySelector('.bs-current-project select');
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
    const ekvio = [...select.options].find((option) => option.textContent === 'Эквио'); setter.call(select, ekvio.value); select.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 150));
    const state = await new Promise((resolve, reject) => { const open = indexedDB.open('branding-studio', 1); open.onerror = () => reject(open.error); open.onsuccess = () => { const request = open.result.transaction('state', 'readonly').objectStore('state').get('brand-projects'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error) } }); const project = state.projects.find((item) => item.name === 'Эквио');
    return { color: project.brandConfig.colors.primary, icon: project.brandConfig.assets.appIcon.src.startsWith('data:') };
  })()`)
  if (isolation.color === '#123456' || isolation.icon) throw new Error(`Project isolation failed: ${JSON.stringify(isolation)}`)

  await evaluate(cdp, `(() => { const select = document.querySelector('.bs-current-project select'); const option = [...select.options].find((item) => item.textContent === 'Test Client'); select.value = option.value; select.dispatchEvent(new Event('change', { bubbles: true })) })()`)
  await waitFor(cdp, `document.querySelector('.bs-current-project select')?.selectedOptions[0]?.textContent === 'Test Client'`)
  await evaluate(cdp, `(() => { [...document.querySelectorAll('.bs-workspace-nav button')].find((item) => item.textContent.includes('Ресурсы для сборки')).click() })()`)
  const preview = await waitFor(cdp, `(() => { const groups = document.querySelectorAll('.bs-build-group').length; const variants = document.querySelectorAll('.bs-build-variant').length; const ready = document.querySelectorAll('.bs-variant-status.is-ready').length; const setup = document.querySelectorAll('.bs-build-setup .bs-build-group').length; const toolbar = [...document.querySelectorAll('.bs-build-group')].find((node) => node.querySelector('h2')?.textContent === 'Toolbar Logo')?.querySelector('.bs-group-status')?.textContent; return variants === 35 ? { groups, variants, ready, setup, toolbar } : null })()`)
  if (preview.groups !== 7 || preview.variants !== 35 || preview.ready !== 25 || preview.setup !== 1 || preview.toolbar !== 'MISSING SOURCE') throw new Error(`Android preview failed: ${JSON.stringify(preview)}`)
  await evaluate(cdp, `document.querySelectorAll('.bs-platform-tabs button')[1].click()`)
  const ios = await waitFor(cdp, `(() => { const groups = document.querySelectorAll('.bs-build-group').length; const variants = document.querySelectorAll('.bs-build-variant').length; return variants === 1 ? { groups, variants } : null })()`)
  if (ios.groups !== 1 || ios.variants !== 1) throw new Error(`iOS preview failed: ${JSON.stringify(ios)}`)

  await evaluate(cdp, `(() => { [...document.querySelectorAll('.bs-workspace-nav button')].find((item) => item.textContent.includes('Экспорт')).click() })()`)
  await waitFor(cdp, `!![...document.querySelectorAll('button')].find((item) => item.textContent === 'Скачать пакет')`)
  await evaluate(cdp, `([...document.querySelectorAll('button')].find((item) => item.textContent === 'Скачать пакет')).click()`)
  const zipPath = await waitForZip()
  const zip = await JSZip.loadAsync(await readFile(zipPath))
  const manifest = JSON.parse(await zip.file('test-client/manifest.json').async('string'))
  const brandConfig = JSON.parse(await zip.file('test-client/brand-config.json').async('string'))
  if (manifest.projectName !== 'Test Client' || brandConfig.editableFigmaStyles.primary !== '#123456') throw new Error('Export used the wrong project.')
  if (brandConfig.masterAssets['background.authTablet']?.source !== 'uploaded') throw new Error('Tablet master metadata is missing from brand-config.json.')
  const tabletOutputs = manifest.outputs.filter((output) => output.exportRecipeId.startsWith('android-authorization-tablet-'))
  if (tabletOutputs.length !== 5 || tabletOutputs.some((output) => output.status !== 'READY')) throw new Error(`Tablet outputs failed: ${JSON.stringify(tabletOutputs)}`)
  const ready = manifest.outputs.filter((output) => output.status === 'READY')
  for (const output of ready) {
    const entry = zip.file(`test-client/${output.path}`)
    if (!entry) throw new Error(`Missing generated output: ${output.path}`)
    const bytes = Buffer.from(await entry.async('uint8array'))
    const dimensions = output.format === 'png' ? pngDimensions(bytes) : jpegDimensions(bytes)
    if (!dimensions || dimensions.width !== output.width || dimensions.height !== output.height) throw new Error(`Wrong dimensions for ${output.path}: ${JSON.stringify(dimensions)}`)
  }
  process.stdout.write(JSON.stringify({ persisted, isolation, androidGroups: preview.groups, androidOutputs: preview.variants, iosGroups: ios.groups, iosOutputs: ios.variants, generatedOutputs: ready.length, manifestOutputs: manifest.outputs.length }) + '\n')
  await cdp.send('Browser.close').catch(() => {})
  cdp.socket.close()
} finally {
  browser.kill()
  await Promise.race([new Promise((resolve) => browser.once('exit', resolve)), delay(3000)])
  await delay(300)
  await rm(runDir, { recursive: true, force: true }).catch(() => {})
}
