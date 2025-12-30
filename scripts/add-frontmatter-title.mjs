import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const docsDir = path.join(__dirname, '..', 'docs')

// Files to skip (already have special handling or layout)
const skipFiles = ['index.md', '404.md', 'agent.md']

function extractTitle(content) {
  // Try to get title from first # heading
  const headingMatch = content.match(/^#\s+(.+)$/m)
  if (headingMatch) {
    // Remove markdown links from title
    return headingMatch[1].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim()
  }
  return null
}

function hasFrontmatterTitle(content) {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/)
  if (frontmatterMatch) {
    return /^title:/m.test(frontmatterMatch[1])
  }
  return false
}

function addTitleToFrontmatter(content, title) {
  const frontmatterMatch = content.match(/^(---\s*\n)([\s\S]*?)(\n---)/)
  if (frontmatterMatch) {
    // Add title after opening ---
    const newFrontmatter = `${frontmatterMatch[1]}title: "${title}"\n${frontmatterMatch[2]}${frontmatterMatch[3]}`
    return content.replace(/^---\s*\n[\s\S]*?\n---/, newFrontmatter)
  } else {
    // No frontmatter, create one
    return `---\ntitle: "${title}"\n---\n\n${content}`
  }
}

function processDirectory(dir, depth = 0) {
  // Prevent infinite recursion
  const MAX_DEPTH = 50
  if (depth > MAX_DEPTH) {
    console.warn(`⚠️  Maximum depth reached: ${dir}`)
    return { processed: 0, skipped: 0 }
  }

  let files = []
  try {
    files = fs.readdirSync(dir)
  } catch (error) {
    if (error.code === 'EACCES') {
      console.warn(`⚠️  Permission denied: ${dir}`)
    } else {
      console.error(`❌ Error reading directory ${dir}:`, error.message)
    }
    return { processed: 0, skipped: 0 }
  }

  let processed = 0
  let skipped = 0

  for (const file of files) {
    const filePath = path.join(dir, file)

    try {
      const stat = fs.statSync(filePath)

      if (stat.isDirectory()) {
        const result = processDirectory(filePath, depth + 1)
        processed += result.processed
        skipped += result.skipped
      } else if (file.endsWith('.md')) {
        const relativePath = path.relative(docsDir, filePath)

        // Skip special files in root only
        if (skipFiles.includes(file) && !relativePath.includes('/')) {
          console.log(`⏭️  Skipped: ${relativePath} (special file)`)
          skipped++
          continue
        }

        const content = fs.readFileSync(filePath, 'utf-8')

        // Skip if already has title
        if (hasFrontmatterTitle(content)) {
          console.log(`⏭️  Skipped: ${relativePath} (already has title)`)
          skipped++
          continue
        }

        const title = extractTitle(content)
        if (title) {
          const newContent = addTitleToFrontmatter(content, title)

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

          console.log(`✅ Added title: ${relativePath} → "${title}"`)
          processed++
        } else {
          console.log(`⚠️  No title found: ${relativePath}`)
          skipped++
        }
      }
    } catch (error) {
      if (error.code === 'ELOOP') {
        console.error(`❌ Symbolic link loop detected: ${filePath}`)
      } else if (error.code === 'EACCES') {
        console.warn(`⚠️  Permission denied: ${filePath}`)
        skipped++
      } else {
        console.error(`❌ Error processing ${filePath}:`, error.message)
        skipped++
      }
    }
  }

  return { processed, skipped }
}

console.log('Adding frontmatter titles to markdown files...\n')
const result = processDirectory(docsDir)
console.log(`\n✅ Processed: ${result.processed}`)
console.log(`⏭️  Skipped: ${result.skipped}`)
