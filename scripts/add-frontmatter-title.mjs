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
    // Add title after the opening ---
    const newFrontmatter = `${frontmatterMatch[1]}title: "${title}"\n${frontmatterMatch[2]}${frontmatterMatch[3]}`
    return content.replace(/^---\s*\n[\s\S]*?\n---/, newFrontmatter)
  } else {
    // No frontmatter, create one
    return `---\ntitle: "${title}"\n---\n\n${content}`
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir)
  let processed = 0
  let skipped = 0

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      const result = processDirectory(filePath)
      processed += result.processed
      skipped += result.skipped
    } else if (file.endsWith('.md')) {
      const relativePath = path.relative(docsDir, filePath)

      // Skip special files
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
        fs.writeFileSync(filePath, newContent)
        console.log(`✅ Added title: ${relativePath} → "${title}"`)
        processed++
      } else {
        console.log(`⚠️  No title found: ${relativePath}`)
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
