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
import path from 'path'
import { fileURLToPath } from 'url'

// Check if puppeteer is installed
let puppeteer
try {
  puppeteer = await import('puppeteer')
} catch (e) {
  console.error('\n❌ Puppeteer is not installed.')
  console.error('To use the PDF export feature, please run:')
  console.error('\nnpm install puppeteer --save-dev\n')
  process.exit(1)
}

const SITE_URL = 'http://localhost:5173' // Default dev server
const OUTPUT_FILE = 'GTM-Cookbook.pdf'

async function generatePDF() {
  console.log('🚀 Starting PDF generation...')
  console.log(`Target: ${SITE_URL}`)

  const browser = await puppeteer.default.launch({
    headless: 'new'
  })
  const page = await browser.newPage()

  // 1. Get all links from sidebar (simulated logic for now, or just crawl)
  // For simplicity in this v1 script, we'll visit the intro page and maybe print it
  // A full book generation requires crawling all pages.
  // Here we will just demo printing the current page.

  // Ideally, we would read the sidebar config from .vitepress/config.mts if possible,
  // or just crawl the sitemap.xml if built.

  console.log('Connecting to page...')
  try {
    await page.goto(SITE_URL, { waitUntil: 'networkidle0' })
  } catch (e) {
    console.error(
      `❌ Could not connect to ${SITE_URL}. Make sure 'npm run docs:dev' is running in another terminal.`
    )
    await browser.close()
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
  console.log(`✅ PDF exported to ${OUTPUT_FILE}`)
}

generatePDF()
