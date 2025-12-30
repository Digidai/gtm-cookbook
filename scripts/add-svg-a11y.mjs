import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const imagesDir = path.join(__dirname, '..', 'docs', 'images')

function extractTitleFromFilename(filename) {
  // Remove extension and module prefix
  const name = filename.replace('.svg', '')

  // Extract meaningful part after module prefix
  // e.g., "module-01-gtm-framework" -> "GTM 框架"
  // e.g., "module-02-2-1-crossing-the-chasm-01" -> "跨越鸿沟"

  const parts = name.split('-')

  // Skip module prefix parts (module-XX or module-XX-X-X)
  const meaningfulParts = []
  let skipNext = false
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === 'module') {
      skipNext = true
      continue
    }
    if (skipNext && /^\d+$/.test(parts[i])) {
      continue
    }
    skipNext = false
    // Skip trailing numbers (like -01, -02)
    if (i === parts.length - 1 && /^\d+$/.test(parts[i])) {
      continue
    }
    meaningfulParts.push(parts[i])
  }

  // Convert to readable title
  const title = meaningfulParts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
    .replace(/Gtm/g, 'GTM')
    .replace(/Plg/g, 'PLG')
    .replace(/Slg/g, 'SLG')
    .replace(/Icp/g, 'ICP')
    .replace(/Mlg/g, 'MLG')
    .replace(/Clg/g, 'CLG')
    .replace(/Revops/g, 'RevOps')
    .replace(/Ai/g, 'AI')
    .replace(/Saas/g, 'SaaS')

  return title || filename
}

function hasTitleTag(content) {
  return /<title[^>]*>/.test(content)
}

function addA11yTags(content, title) {
  // Check if SVG tag exists - use more robust regex with multiline support
  const svgMatch = content.match(/<svg\s+([^>]*)>/is)
  if (!svgMatch) {
    console.warn(`Could not find SVG tag, skipping accessibility update`)
    return null
  }

  // Check if already has title
  if (hasTitleTag(content)) return null

  // Add role and aria attributes to svg tag
  let svgAttrs = svgMatch[1]
  if (!svgAttrs.includes('role=')) {
    svgAttrs += ' role="img"'
  }
  if (!svgAttrs.includes('aria-labelledby=')) {
    svgAttrs += ' aria-labelledby="title"'
  }

  // Create title tag
  const titleTag = `<title id="title">${title}</title>`

  // Replace svg tag and add title after it
  const newSvgTag = `<svg ${svgAttrs.trim()}>\n  ${titleTag}`
  return content.replace(/<svg\s+[^>]*>/is, newSvgTag)
}

function processDirectory(dir) {
  let files = []
  try {
    files = fs.readdirSync(dir)
  } catch (error) {
    console.error(`❌ Error reading directory ${dir}:`, error.message)
    return { processed: 0, skipped: 0 }
  }

  let processed = 0
  let skipped = 0

  for (const file of files) {
    if (!file.endsWith('.svg')) continue

    const filePath = path.join(dir, file)

    try {
      let content
      try {
        content = fs.readFileSync(filePath, 'utf-8')
      } catch (readError) {
        console.error(`❌ Error reading ${file}:`, readError.message)
        skipped++
        continue
      }

      // Skip if already has title
      if (hasTitleTag(content)) {
        skipped++
        continue
      }

      const title = extractTitleFromFilename(file)
      const newContent = addA11yTags(content, title)

      if (newContent) {
        // Atomic write: write to temp file first, then rename
        const tempPath = `${filePath}.tmp`
        try {
          fs.writeFileSync(tempPath, newContent, 'utf-8')
          fs.renameSync(tempPath, filePath)
        } catch (writeError) {
          // Clean up temp file if write/rename fails
          if (fs.existsSync(tempPath)) {
            try {
              fs.unlinkSync(tempPath)
            } catch {
              // Ignore cleanup errors
            }
          }
          throw writeError
        }
        console.log(`✅ ${file}`)
        processed++
      } else {
        skipped++
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message)
      skipped++
    }
  }

  return { processed, skipped }
}

console.log('Adding accessibility tags to SVG files...\n')
const result = processDirectory(imagesDir)
console.log(`\n✅ Processed: ${result.processed}`)
console.log(`⏭️  Skipped: ${result.skipped}`)
