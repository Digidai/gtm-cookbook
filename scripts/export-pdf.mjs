/**
 * Script to export VitePress site to PDF
 *
 * Usage: node scripts/export-pdf.mjs
 *
 * Requirements:
 * - npm install puppeteer
 * - npm install pdf-lib
 * - Site must be built (npm run docs:build) or running locally
 */

import fs from 'fs'
import http from 'http'
import os from 'os'
import path from 'path'

let puppeteer
try {
  puppeteer = await import('puppeteer')
} catch (err) {
  console.error('\n❌ Puppeteer is not installed.')
  console.error('To use the PDF export feature, please run:')
  console.error('\nnpm install puppeteer --save-dev\n')
  if (err instanceof Error && err.message) {
    console.error(err.message)
  }
  process.exit(1)
}

let pdfLib
try {
  pdfLib = await import('pdf-lib')
} catch (err) {
  console.error('\n❌ pdf-lib is not installed.')
  console.error('To use the PDF export feature, please run:')
  console.error('\nnpm install pdf-lib --save-dev\n')
  if (err instanceof Error && err.message) {
    console.error(err.message)
  }
  process.exit(1)
}

const { PDFDocument } = pdfLib

const OUTPUT_FILE = process.env.PDF_OUTPUT || 'GTM-Cookbook.pdf'
const DIST_DIR = path.resolve(process.cwd(), process.env.PDF_DIST_DIR || 'docs/.vitepress/dist')
const distIndex = path.join(DIST_DIR, 'index.html')
const hasDist = fs.existsSync(distIndex)
const distHtml = hasDist ? fs.readFileSync(distIndex, 'utf-8') : ''
const siteData = distHtml ? parseSiteData(distHtml) : null
const baseFromSite = siteData?.base ? normalizeBase(siteData.base) : undefined

const defaultBase =
  process.env.VITEPRESS_BASE ||
  (process.env.CF_PAGES || process.env.DEPLOY_TARGET === 'cloudflare' ? '/' : '/gtm-cookbook/')
const BASE_PATH = normalizeBase(process.env.PDF_BASE_PATH || baseFromSite || defaultBase)
const PORT = Number(process.env.PDF_PORT || 4173)
const DEV_URL = process.env.PDF_DEV_URL || `http://localhost:5173${BASE_PATH}`
const LOCAL_URL = `http://127.0.0.1:${PORT}${BASE_PATH}`
const SITE_URL = process.env.PDF_SITE_URL || (hasDist ? LOCAL_URL : DEV_URL)
const shouldStartServer = !process.env.PDF_SITE_URL && hasDist
const INCLUDE_HOME = process.env.PDF_INCLUDE_HOME !== 'false'
const ROUTE_LIMIT = Number(process.env.PDF_ROUTE_LIMIT || 0)
const TIMEOUT = Number(process.env.PDF_TIMEOUT || 60000)
const VIEWPORT_WIDTH = Number(process.env.PDF_VIEWPORT_WIDTH || 1280)
const VIEWPORT_HEIGHT = Number(process.env.PDF_VIEWPORT_HEIGHT || 720)
const MARGIN = {
  top: '24px',
  bottom: '24px',
  left: '24px',
  right: '24px'
}

const PRINT_OVERRIDES = `
  :root { color-scheme: light; }
  body { background: #fff !important; }
  .VPSkipLink,
  .VPNav,
  .VPNavBar,
  .VPLocalNav,
  .VPSidebar,
  .VPDocAside,
  .VPDocFooter,
  .VPFooter,
  .VPBackToTop,
  .VPNavBarHamburger,
  .VPNavBarSearch,
  .VPNavBarMenu,
  .VPNavBarSocialLinks,
  .VPNavBarExtra,
  .VPNavScreen,
  .VPHomeHero .actions {
    display: none !important;
  }
  .VPContent { padding-top: 0 !important; }
  .VPDoc .container,
  .VPHome .container { max-width: 100% !important; }
  .VPDoc .content-container { max-width: 100% !important; }
  .VPDoc .content { padding: 0 24px !important; }
  .vp-doc { max-width: 100% !important; }
  .vp-doc .header-anchor { display: none !important; }
  * { animation: none !important; transition: none !important; }
`

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
}

function normalizeBase(value) {
  if (!value || value.trim() === '') return '/'
  let base = value.trim()
  if (!base.startsWith('/')) base = `/${base}`
  if (!base.endsWith('/')) base = `${base}/`
  return base
}

function normalizeRoute(value) {
  if (!value || typeof value !== 'string') return null
  let route = value.split('#')[0].split('?')[0].trim()
  if (!route) return null
  if (/^(https?:)?\/\//.test(route) || route.startsWith('mailto:')) return null
  if (!route.startsWith('/')) route = `/${route}`
  if (route === '/index') return '/'
  if (route.endsWith('/index')) route = `${route.slice(0, -'/index'.length)}/`
  if (route.endsWith('.html')) route = route.slice(0, -'.html'.length)
  return route
}

function parseSiteData(html) {
  const match = html.match(/window\.__VP_SITE_DATA__=JSON\.parse\(("[\s\S]+?")\);/)
  if (!match) return null
  const decoded = JSON.parse(match[1])
  return JSON.parse(decoded)
}

async function loadSiteDataFromUrl(url) {
  if (!globalThis.fetch) return null
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const html = await response.text()
    return parseSiteData(html)
  } catch {
    return null
  }
}

function collectLinks(items, links) {
  if (!Array.isArray(items)) return
  for (const item of items) {
    if (!item || typeof item !== 'object') continue
    if (item.link) links.push(item.link)
    if (item.items) collectLinks(item.items, links)
  }
}

function getRoutesFromSiteData(data) {
  const sidebar = data?.themeConfig?.sidebar
  if (!sidebar) return []
  const groups = Array.isArray(sidebar) ? sidebar : Object.values(sidebar).flat()
  const links = []
  for (const group of groups) {
    if (!group || typeof group !== 'object') continue
    if (group.link) links.push(group.link)
    if (group.items) collectLinks(group.items, links)
  }
  return links
}

function walkHtmlFiles(dir, files) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.name === 'assets') continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkHtmlFiles(fullPath, files)
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath)
    }
  }
}

function routeFromFile(filePath) {
  const relative = path.relative(DIST_DIR, filePath).replace(/\\/g, '/')
  if (relative === 'index.html') return '/'
  if (relative.endsWith('/index.html')) {
    return `/${relative.slice(0, -'/index.html'.length)}/`
  }
  if (relative.endsWith('.html')) {
    return `/${relative.slice(0, -'.html'.length)}`
  }
  return null
}

function listRoutesFromDist() {
  if (!hasDist) return []
  const files = []
  walkHtmlFiles(DIST_DIR, files)
  return files.map(routeFromFile).filter(Boolean)
}

function buildRouteList(data) {
  const routes = []
  if (INCLUDE_HOME) routes.push('/')
  routes.push(...getRoutesFromSiteData(data))
  if (routes.length === (INCLUDE_HOME ? 1 : 0)) {
    routes.push(...listRoutesFromDist())
  }

  const seen = new Set()
  const cleaned = []
  for (const route of routes) {
    const normalized = normalizeRoute(route)
    if (!normalized || normalized.startsWith('/404')) continue
    if (!seen.has(normalized)) {
      seen.add(normalized)
      cleaned.push(normalized)
    }
  }

  if (ROUTE_LIMIT > 0) return cleaned.slice(0, ROUTE_LIMIT)
  return cleaned
}

function resolveRequestPath(requestPath) {
  if (!requestPath) return '/'
  const normalized = requestPath.replace(/\\/g, '/')
  if (BASE_PATH === '/') return normalized
  const baseNoSlash = BASE_PATH.slice(0, -1)
  if (normalized === baseNoSlash) return '/'
  if (!normalized.startsWith(BASE_PATH)) return null
  const stripped = normalized.slice(BASE_PATH.length)
  return `/${stripped}`
}

function getFileCandidates(relativePath) {
  const normalized = path.posix.normalize(relativePath)
  if (normalized.includes('..')) return []
  const cleaned = normalized.replace(/^\/+/, '')
  const basePath = path.join(DIST_DIR, cleaned)
  if (cleaned === '' || normalized.endsWith('/')) {
    return [path.join(basePath, 'index.html')]
  }
  return [basePath, `${basePath}.html`, path.join(basePath, 'index.html')]
}

function startStaticServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || '/', 'http://localhost')
      const relativePath = resolveRequestPath(url.pathname)
      if (!relativePath) {
        res.statusCode = 404
        res.end('Not Found')
        return
      }

      const candidates = getFileCandidates(relativePath)
      const filePath = candidates.find((candidate) => {
        try {
          return fs.existsSync(candidate) && fs.statSync(candidate).isFile()
        } catch {
          return false
        }
      })

      if (!filePath) {
        res.statusCode = 404
        res.end('Not Found')
        return
      }

      const ext = path.extname(filePath).toLowerCase()
      res.setHeader('Content-Type', CONTENT_TYPES[ext] || 'application/octet-stream')
      const stream = fs.createReadStream(filePath)
      stream.on('error', () => {
        res.statusCode = 500
        res.end('Server Error')
      })
      stream.pipe(res)
    })

    server.on('error', (error) => reject(error))
    server.listen(PORT, '127.0.0.1', () => resolve(server))
  })
}

async function ensureImagesLoaded(page) {
  await page.evaluate(async () => {
    const images = Array.from(document.images)
    for (const img of images) {
      if (img.loading === 'lazy') img.loading = 'eager'
    }
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve()
        return new Promise((resolve) => {
          const done = () => resolve()
          img.addEventListener('load', done, { once: true })
          img.addEventListener('error', done, { once: true })
        })
      })
    )
  })
}

function buildRouteUrl(route) {
  const cleaned = route.replace(/^\/+/, '')
  return new URL(cleaned, SITE_URL).toString()
}

async function generatePDF() {
  console.log('🚀 Starting PDF generation...')
  console.log(`Target: ${SITE_URL}`)

  let server
  if (shouldStartServer) {
    server = await startStaticServer()
  } else if (!process.env.PDF_SITE_URL && !hasDist) {
    console.warn(`⚠️  Build output not found at ${DIST_DIR}`)
    console.warn('    Run "npm run docs:build" or start the dev server before exporting.')
  }

  const resolvedSiteData = siteData || (await loadSiteDataFromUrl(SITE_URL))
  const routes = buildRouteList(resolvedSiteData)
  if (routes.length === 0) {
    console.error('❌ No routes found to export.')
    process.exit(1)
  }
  console.log(`Found ${routes.length} routes to export.`)

  const launchArgs = process.env.CI ? ['--no-sandbox', '--disable-setuid-sandbox'] : []
  const browser = await puppeteer.default.launch({
    headless: 'new',
    args: launchArgs
  })

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gtm-pdf-'))
  const pdfParts = []

  try {
    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(TIMEOUT)
    page.setDefaultTimeout(TIMEOUT)
    await page.setViewport({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT })
    await page.emulateMediaType('screen')
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }])
    await page.evaluateOnNewDocument(() => {
      try {
        localStorage.setItem('vitepress-theme-appearance', 'light')
      } catch {
        // ignore
      }
    })

    for (let i = 0; i < routes.length; i += 1) {
      const route = routes[i]
      const url = buildRouteUrl(route)
      const outputPath = path.join(tempDir, `${String(i + 1).padStart(3, '0')}.pdf`)

      console.log(`Rendering ${route} (${i + 1}/${routes.length})`)
      await page.goto(url, { waitUntil: 'networkidle0' })
      await page.addStyleTag({ content: PRINT_OVERRIDES })
      await page.waitForSelector('.vp-doc, .VPHome', { timeout: TIMEOUT })
      await page.evaluateHandle('document.fonts.ready')
      await ensureImagesLoaded(page)
      await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: MARGIN
      })

      pdfParts.push(outputPath)
    }
  } finally {
    await browser.close()
    if (server) {
      await new Promise((resolve) => server.close(resolve))
    }
  }

  console.log('Merging PDF...')
  const merged = await PDFDocument.create()
  for (const pdfPath of pdfParts) {
    const bytes = fs.readFileSync(pdfPath)
    const source = await PDFDocument.load(bytes)
    const pages = await merged.copyPages(source, source.getPageIndices())
    pages.forEach((page) => merged.addPage(page))
  }
  const mergedBytes = await merged.save()
  fs.writeFileSync(OUTPUT_FILE, mergedBytes)
  fs.rmSync(tempDir, { recursive: true, force: true })

  console.log(`✅ PDF exported to ${OUTPUT_FILE}`)
}

generatePDF()
