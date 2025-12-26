/**
 * Script to export VitePress site to PDF
 *
 * Usage: node scripts/export-pdf.mjs
 *
 * Requirements:
 * - npm install puppeteer
 * - Site must be built (npm run docs:build) or running locally
 */

import fs from 'fs'
import http from 'http'
import path from 'path'

// Check if puppeteer is installed
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

const OUTPUT_FILE = process.env.PDF_OUTPUT || 'GTM-Cookbook.pdf'
const DIST_DIR = path.resolve(process.cwd(), process.env.PDF_DIST_DIR || 'docs/.vitepress/dist')
const defaultBase =
  process.env.VITEPRESS_BASE ||
  (process.env.CF_PAGES || process.env.DEPLOY_TARGET === 'cloudflare' ? '/' : '/gtm-cookbook/')
const BASE_PATH = normalizeBase(process.env.PDF_BASE_PATH || defaultBase)
const PORT = Number(process.env.PDF_PORT || 4173)
const DEV_URL = process.env.PDF_DEV_URL || `http://localhost:5173${BASE_PATH}`
const LOCAL_URL = `http://127.0.0.1:${PORT}${BASE_PATH}`
const distIndex = path.join(DIST_DIR, 'index.html')
const hasDist = fs.existsSync(distIndex)
const hasCustomUrl = Boolean(process.env.PDF_SITE_URL)
const SITE_URL = process.env.PDF_SITE_URL || (hasDist ? LOCAL_URL : DEV_URL)
const shouldStartServer = !hasCustomUrl && hasDist

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

async function generatePDF() {
  console.log('🚀 Starting PDF generation...')
  console.log(`Target: ${SITE_URL}`)

  let server
  if (shouldStartServer) {
    server = await startStaticServer()
  } else if (!hasCustomUrl && !hasDist) {
    console.warn(`⚠️  Build output not found at ${DIST_DIR}`)
    console.warn('    Run "npm run docs:build" or start the dev server before exporting.')
  }

  const launchArgs = process.env.CI ? ['--no-sandbox', '--disable-setuid-sandbox'] : []
  const browser = await puppeteer.default.launch({
    headless: 'new',
    args: launchArgs
  })
  const page = await browser.newPage()

  console.log('Connecting to page...')
  try {
    await page.goto(SITE_URL, { waitUntil: 'networkidle0' })
  } catch (err) {
    console.error(`❌ Could not connect to ${SITE_URL}. Make sure the site is available.`)
    if (err instanceof Error && err.message) {
      console.error(err.message)
    }
    await browser.close()
    if (server) {
      await new Promise((resolve) => server.close(resolve))
    }
    process.exit(1)
  }

  console.log('Generating PDF...')
  await page.pdf({
    path: OUTPUT_FILE,
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
  })

  await browser.close()
  if (server) {
    await new Promise((resolve) => server.close(resolve))
  }
  console.log(`✅ PDF exported to ${OUTPUT_FILE}`)
}

generatePDF()
