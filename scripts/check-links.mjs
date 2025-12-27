import fs from 'fs'
import path from 'path'

// Adjust root based on where script is run. Assuming run from root.
const DOCS_ROOT = path.resolve(process.cwd(), 'docs')
const PUBLIC_DIR = path.join(DOCS_ROOT, 'public')

const errors = []
const warnings = []

// Helper to check if file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile()
  } catch {
    return false
  }
}

// Helper to resolve link path
function resolvePath(linkPath, currentFileDir) {
  const hashIndex = linkPath.indexOf('#')
  const cleanPath = hashIndex > -1 ? linkPath.slice(0, hashIndex) : linkPath
  const hash = hashIndex > -1 ? linkPath.slice(hashIndex) : ''

  if (!cleanPath) return { path: currentFileDir, hash } // Just a hash link

  if (cleanPath.startsWith('http') || cleanPath.startsWith('mailto:')) return null // External link

  let absolutePath
  if (cleanPath.startsWith('/')) {
    // Absolute path relative to project root (docs/ or docs/public/)
    // First check docs/public
    const publicPath = path.join(PUBLIC_DIR, cleanPath)
    if (fileExists(publicPath)) return { path: publicPath, hash }

    // Then check docs/
    absolutePath = path.join(DOCS_ROOT, cleanPath)
  } else {
    // Relative path
    absolutePath = path.resolve(currentFileDir, cleanPath)
  }

  return { path: absolutePath, hash }
}

function checkLink(link, filePath, type = 'link') {
  if (link.startsWith('http') || link.startsWith('mailto:')) return

  const currentDir = path.dirname(filePath)
  const result = resolvePath(link, currentDir)

  if (!result) return // External or special protocol

  let targetPath = result.path

  // Handle Vitepress clean URLs (try adding .md or /index.md)
  if (!fileExists(targetPath) && type === 'link') {
    if (fileExists(targetPath + '.md')) {
      targetPath = targetPath + '.md'
    } else if (fileExists(path.join(targetPath, 'index.md'))) {
      targetPath = path.join(targetPath, 'index.md')
    }
  }

  // Handle images (must exist exactly or in public)
  if (type === 'image') {
    if (!fileExists(targetPath)) {
      errors.push(
        `[Image] ${path.relative(DOCS_ROOT, filePath)}: Broken image reference '${link}' (resolved: ${targetPath})`
      )
    }
  } else {
    // Regular links
    if (!fileExists(targetPath)) {
      errors.push(
        `[Link] ${path.relative(DOCS_ROOT, filePath)}: Broken link '${link}' (resolved: ${targetPath})`
      )
    }
  }
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')

  // 1. Check Images: ![alt](src)
  const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  let match
  while ((match = imgRegex.exec(content)) !== null) {
    const [, alt, src] = match
    if (!alt) {
      warnings.push(
        `[Alt] ${path.relative(DOCS_ROOT, filePath)}: Missing alt text for image '${src}'`
      )
    }
    checkLink(src, filePath, 'image')
  }

  // 2. Check HTML Images: <img src="...">
  const htmlImgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g
  while ((match = htmlImgRegex.exec(content)) !== null) {
    const [full, src] = match
    if (!full.includes('alt=')) {
      warnings.push(
        `[Alt] ${path.relative(DOCS_ROOT, filePath)}: Missing alt attribute in HTML img '${src}'`
      )
    }
    checkLink(src, filePath, 'image')
  }

  // 3. Check Links: [text](href)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  while ((match = linkRegex.exec(content)) !== null) {
    const [, , href] = match
    if (match[0].startsWith('!')) continue
    checkLink(href, filePath, 'link')
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.vitepress' && file !== 'public') {
        walkDir(fullPath)
      }
    } else if (file.endsWith('.md')) {
      processFile(fullPath)
    }
  }
}

console.log('🔍 Starting link and image check...')
walkDir(DOCS_ROOT)

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:')
  warnings.forEach((w) => console.warn(w))
}

if (errors.length > 0) {
  console.log('\n❌  Errors:')
  errors.forEach((e) => console.error(e))
  console.log(`\nFound ${errors.length} broken links/images.`)
  process.exit(1)
} else {
  console.log('\n✅  All links and images look good!')
  process.exit(0)
}
