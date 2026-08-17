import { spawn } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const edge = process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const baseUrl = process.env.STUDIO_URL || 'http://127.0.0.1:5173'
const evidencePath = process.env.WEB_AUTH_EVIDENCE_PATH
const runDir = await mkdtemp(join(tmpdir(), 'branding-web-auth-smoke-'))
const port = 9600 + (process.pid % 300)
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

async function clickNavigation(cdp, label) {
  await evaluate(cdp, `(() => { const node = [...document.querySelectorAll('.bs-workspace-nav button')].find((item) => item.textContent.includes(${JSON.stringify(label)})); node?.click(); return !!node })()`)
}

async function upload(cdp, label, width, height, color) {
  await evaluate(cdp, `(async () => {
    const card = [...document.querySelectorAll('.bs-asset-card')].find((node) => node.querySelector('.bs-asset-card__title')?.textContent.includes(${JSON.stringify(label)}));
    const input = card?.querySelector('input[type="file"]');
    if (!input) throw new Error('Asset input not found: ${label}');
    const canvas = document.createElement('canvas'); canvas.width = ${width}; canvas.height = ${height};
    const context = canvas.getContext('2d'); context.fillStyle = ${JSON.stringify(color)}; context.fillRect(0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    const transfer = new DataTransfer(); transfer.items.add(new File([blob], 'replacement.png', { type: 'image/png' }));
    input.files = transfer.files; input.dispatchEvent(new Event('change', { bubbles: true }));
  })()`)
}

async function uploadSvg(cdp, label, color) {
  await evaluate(cdp, `(() => {
    const card = [...document.querySelectorAll('.bs-asset-card')].find((node) => node.querySelector('.bs-asset-card__title')?.textContent.includes(${JSON.stringify(label)}));
    const input = card?.querySelector('input[type="file"]');
    if (!input) throw new Error('Asset input not found: ${label}');
    const source = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="${color}"/></svg>';
    const transfer = new DataTransfer(); transfer.items.add(new File([source], 'replacement.svg', { type: 'image/svg+xml' }));
    input.files = transfer.files; input.dispatchEvent(new Event('change', { bubbles: true }));
  })()`)
}

let cdp
try {
  const page = await target()
  if (!page) throw new Error('No browser page found.')
  cdp = connect(page.webSocketDebuggerUrl)
  await cdp.send('Runtime.enable')
  await waitFor(cdp, `document.querySelectorAll('.bs-workspace-nav button').length === 6`)

  const navigation = await evaluate(cdp, `[...document.querySelectorAll('.bs-workspace-nav button')].map((node) => node.textContent)`)
  if (navigation.some((label) => label.includes('Планшетная версия') || label.includes('Метаданные'))) throw new Error('Future navigation capabilities became visible.')

  await clickNavigation(cdp, 'Веб-версия')
  const initial = await waitFor(cdp, `(() => {
    const canvas = document.querySelector('.bs-web-mode__canvas');
    const titles = [...document.querySelectorAll('.bs-shell__settings .bs-asset-card__title')].map((node) => node.textContent);
    return canvas?.dataset.figmaNode === '8470:8952' && titles.length === 2 ? { titles, selected: document.querySelector('.bs-web-mode__tabs .is-active')?.textContent } : null;
  })()`)
  if (!initial.titles.some((title) => title.includes('Фон авторизации')) || !initial.titles.some((title) => title.includes('Логотип авторизации'))) throw new Error(`Wrong authorization assets: ${JSON.stringify(initial)}`)
  if (evidencePath) {
    const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true })
    await writeFile(evidencePath, Buffer.from(screenshot.data, 'base64'))
  }

  await upload(cdp, 'Фон авторизации', 1024, 1540, '#214365')
  await waitFor(cdp, `document.querySelector('.bs-web-auth__background')?.src.startsWith('data:image/png')`)
  await uploadSvg(cdp, 'Логотип авторизации', '#654321')
  await waitFor(cdp, `document.querySelector('.bs-web-auth__logo')?.src.startsWith('data:image/svg+xml')`)
  await waitFor(cdp, `document.querySelector('.bs-current-project em')?.textContent === 'Сохранено'`)

  await cdp.send('Page.reload', { ignoreCache: true })
  await waitFor(cdp, `document.querySelectorAll('.bs-workspace-nav button').length === 6`)
  await clickNavigation(cdp, 'Веб-версия')
  const persisted = await waitFor(cdp, `document.querySelector('.bs-web-auth__background')?.src.startsWith('data:image/png') && document.querySelector('.bs-web-auth__logo')?.src.startsWith('data:image/svg+xml')`)

  await clickNavigation(cdp, 'Проекты')
  await waitFor(cdp, `!!document.querySelector('.bs-project-grid')`)
  await evaluate(cdp, `(() => {
    const input = document.querySelector('.bs-page-head form input');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, 'Web Project B'); input.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('.bs-page-head form').requestSubmit();
  })()`)
  await waitFor(cdp, `document.querySelector('.bs-current-project select')?.selectedOptions[0]?.textContent === 'Web Project B'`)
  await clickNavigation(cdp, 'Веб-версия')
  const isolated = await waitFor(cdp, `(() => { const background = document.querySelector('.bs-web-auth__background'); const logo = document.querySelector('.bs-web-auth__logo'); return background && logo ? !background.src.startsWith('data:') && !logo.src.startsWith('data:') : false })()`)

  await clickNavigation(cdp, 'Мобильная версия')
  const mobile = await waitFor(cdp, `!!document.querySelector('[data-screen-id="splash"]')`)

  process.stdout.write(JSON.stringify({ navigation: navigation.length, screen: '8470:8952', assets: initial.titles.length, persisted: !!persisted, isolated: !!isolated, mobile: !!mobile }) + '\n')
  await cdp.send('Browser.close').catch(() => {})
  cdp.socket.close()
} finally {
  browser.kill()
  await Promise.race([new Promise((resolve) => browser.once('exit', resolve)), delay(3000)])
  await delay(300)
  await rm(runDir, { recursive: true, force: true }).catch(() => {})
}
