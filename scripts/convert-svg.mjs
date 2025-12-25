import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'docs', 'public')

const conversions = [
  {
    input: 'og-cover.svg',
    output: 'og-cover.png',
    width: 1200,
    height: 630
  },
  {
    input: 'logo.svg',
    output: 'logo.png',
    width: 512,
    height: 512
  }
]

async function convert() {
  for (const { input, output, width, height } of conversions) {
    const inputPath = path.join(publicDir, input)
    const outputPath = path.join(publicDir, output)

    if (!fs.existsSync(inputPath)) {
      console.error(`Input file not found: ${inputPath}`)
      continue
    }

    try {
      await sharp(inputPath)
        .resize(width, height)
        .png()
        .toFile(outputPath)
      console.log(`Converted: ${input} -> ${output}`)
    } catch (err) {
      console.error(`Error converting ${input}:`, err.message)
    }
  }
}

convert()
