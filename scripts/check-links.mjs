import fs from 'fs'
import path from 'path'

// Adjust root based on where script is run. Assuming run from root.
const DOCS_ROOT = path.resolve(process.cwd(), 'docs')
const PUBLIC_DIR = path.join(DOCS_ROOT, 'public')

const errors = []
const warnings = []

// Safety limits to prevent resource exhaustion
const MAX_DEPTH = 50
const MAX_FILES = 10000
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
let totalFilesProcessed = 0

// Helper to check if file exists and is a regular file
function isFile(filePath) {
  try {
    return fs.statSync(filePath).isFile()
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false
    }
    console.warn(`Warning checking file ${filePath}:`, error.message)
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
    if (isFile(publicPath)) return { path: publicPath, hash }

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
  if (!isFile(targetPath) && type === 'link') {
    if (isFile(targetPath + '.md')) {
      targetPath = targetPath + '.md'
    } else if (isFile(path.join(targetPath, 'index.md'))) {
      targetPath = path.join(targetPath, 'index.md')
    }
  }

  // Handle images (must exist exactly or in public)
  if (type === 'image') {
    if (!isFile(targetPath)) {
      errors.push(
        `[Image] ${path.relative(DOCS_ROOT, filePath)}: Broken image reference '${link}' (resolved: ${targetPath})`
      )
    }
  } else {
    // Regular links
    if (!isFile(targetPath)) {
      errors.push(
        `[Link] ${path.relative(DOCS_ROOT, filePath)}: Broken link '${link}' (resolved: ${targetPath})`
      )
    }
  }
}

function processFile(filePath) {
  try {
    // Check file size before reading
    let stat
    try {
      stat = fs.statSync(filePath)
    } catch (error) {
      console.error(`Error checking file ${filePath}:`, error.message)
      return
    }

    if (stat.size > MAX_FILE_SIZE) {
      console.warn(
        `Skipping large file ${path.relative(DOCS_ROOT, filePath)} (${(stat.size / 1024 / 1024).toFixed(2)}MB)`
      )
      return
    }

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
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message)
  }
}

function walkDir(dir, depth = 0) {
  // Prevent infinite recursion and resource exhaustion
  if (depth > MAX_DEPTH) {
    console.warn(`Maximum depth reached: ${dir}`)
    return
  }

  if (totalFilesProcessed > MAX_FILES) {
    console.warn(`Maximum file count reached: ${MAX_FILES}`)
    return
  }

  if (!fs.existsSync(dir)) return

  let files = []
  try {
    files = fs.readdirSync(dir)
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message)
    return
  }

  for (const file of files) {
    const fullPath = path.join(dir, file)
    let stat
    try {
      stat = fs.statSync(fullPath)
    } catch (error) {
      console.warn(`Warning checking ${fullPath}:`, error.message)
      continue
    }

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.vitepress' && file !== 'public') {
        walkDir(fullPath, depth + 1)
      }
    } else if (file.endsWith('.md')) {
      processFile(fullPath)
      totalFilesProcessed++
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
  process.exitCode = 1
} else {
  console.log('\n✅  All links and images look good!')
}
