import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'docs', 'public')

const conversions = [
  // Open Graph / Facebook / LinkedIn
  {
    input: 'og-cover.svg',
    output: 'og-cover.png',
    width: 1200,
    height: 630
  },
  // Twitter Card (same as OG, but explicit)
  {
    input: 'og-cover.svg',
    output: 'twitter-card.png',
    width: 1200,
    height: 600
  },
  // Logo variants
  {
    input: 'logo.svg',
    output: 'logo.png',
    width: 512,
    height: 512
  },
  {
    input: 'logo.svg',
    output: 'logo-192.png',
    width: 192,
    height: 192
  },
  // Apple Touch Icon
  {
    input: 'logo.svg',
    output: 'apple-touch-icon.png',
    width: 180,
    height: 180
  },
  // Favicons
  {
    input: 'logo.svg',
    output: 'favicon-32x32.png',
    width: 32,
    height: 32
  },
  {
    input: 'logo.svg',
    output: 'favicon-16x16.png',
    width: 16,
    height: 16
  },
  // Microsoft Tile
  {
    input: 'logo.svg',
    output: 'mstile-150x150.png',
    width: 150,
    height: 150
  },
  // WeChat Share (recommended 300x300 square)
  {
    input: 'logo.svg',
    output: 'wechat-share.png',
    width: 300,
    height: 300
  }
]

async function convert() {
  console.log('Converting SVG to optimized PNG images...\n')

  let totalSaved = 0

  for (const { input, output, width, height } of conversions) {
    const inputPath = path.join(publicDir, input)
    const outputPath = path.join(publicDir, output)

    if (!fs.existsSync(inputPath)) {
      console.error(`✗ Input file not found: ${inputPath}`)
      continue
    }

    try {
      // Get original size if file exists
      let originalSize = 0
      if (fs.existsSync(outputPath)) {
        originalSize = fs.statSync(outputPath).size
      }

      await sharp(inputPath)
        .resize(width, height)
        .png({
          compressionLevel: 9, // Maximum compression
          palette: true, // Use palette-based quantization for smaller files
          quality: 80, // Quality for palette mode
          effort: 10 // Maximum effort for compression
        })
        .toFile(outputPath)

      const newSize = fs.statSync(outputPath).size
      const sizeKB = (newSize / 1024).toFixed(1)

      if (originalSize > 0) {
        const saved = originalSize - newSize
        totalSaved += saved
        const percent = ((saved / originalSize) * 100).toFixed(0)
        console.log(
          `✓ ${output} (${width}x${height}) - ${sizeKB} KB ${saved > 0 ? `(-${percent}%)` : ''}`
        )
      } else {
        console.log(`✓ ${output} (${width}x${height}) - ${sizeKB} KB`)
      }
    } catch (err) {
      console.error(`✗ Error converting ${input}:`, err.message)
    }
  }

  if (totalSaved > 0) {
    console.log(`\nTotal saved: ${(totalSaved / 1024).toFixed(1)} KB`)
  }
  console.log('\nDone!')
}

convert()
