# AGENTS.md

This guide helps agents work effectively in the GTM Cookbook repository.

## Project Overview

**GTM Cookbook** is a VitePress-based documentation site providing a comprehensive Go-To-Market strategy guide. It serves as a professional training resource covering 5 modules with 13+ hours of content.

- **Type**: VitePress static site generator
- **Language**: TypeScript/JavaScript (ES modules), Markdown content
- **Node.js**: >= 18.0.0
- **License**: CC-BY-NC-SA-4.0

## Essential Commands

### Development

```bash
# Start local development server
npm run dev
# or
npm run docs:dev

# Build for production
npm run build
# or
npm run docs:build

# Preview production build locally
npm run preview
# or
npm run docs:preview
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Check for broken links and missing image alt text
npm run check:links
```

### Special Scripts

```bash
# Export site to PDF (requires puppeteer and pdf-lib)
npm run export:pdf

# Convert SVG images (optimization/accessibility)
npm run convert:images

# Prepare git hooks (runs automatically on npm install)
npm run prepare
```

## Project Structure

```
gtm/
├── docs/                        # VitePress source directory
│   ├── module-01/              # Module 1: GTM Foundation
│   ├── module-02/              # Module 2: Core Methodologies
│   ├── module-03/              # Module 3: Execution Framework
│   ├── module-04/              # Module 4: Case Studies
│   ├── module-05/              # Module 5: Tools & Templates
│   ├── appendix/               # Glossary, reading list, resources
│   ├── images/                 # SVG diagrams and visual assets
│   ├── public/                 # Static assets (favicons, logos, etc.)
│   ├── .vitepress/             # VitePress configuration
│   │   ├── config.mts          # Main config with sidebar generation
│   │   ├── components/         # Vue components
│   │   └── theme/              # Theme customization
│   └── agent.md               # Writing guidelines and project tracking
├── scripts/                    # Utility scripts
│   ├── check-links.mjs        # Validate links and image alt text
│   ├── convert-svg.mjs        # Convert/optimize SVGs
│   └── export-pdf.mjs         # PDF generation
├── src/                        # Cloudflare Workers edge functions
├── .vitepress/                 # VitePress cache and build output
├── package.json
├── tsconfig.json
├── eslint.config.js
├── .prettierrc
└── AGENTS.md                   # This file
```

## Code Conventions

### Markdown Content Structure

Every content file MUST follow this structure:

```markdown
---
title: "Section Title"
description: Brief description for SEO
---

# [Section Number] [Section Title]

> **学习目标**：What learners should achieve
>
> **预计时长**：X minutes
>
> **前置知识**：[Dependencies]

---

## 核心内容

[Bullet list of topics covered]

[Main content with headings, examples, tables]

## 关键要点

- Key point 1
- Key point 2
- Key point 3

## 实践练习

[Exercises or thought questions]

## 延伸阅读

- [Related resources]

---
**写作状态**：[草稿/初稿/审核中/完成]
**最后更新**：YYYY-MM-DD
**版本**：v1.x
```

### Markdown Style Guidelines

- **Language**: Chinese with English terms preserved where appropriate
- **Headings**: Use `H1` for title (first heading), `H2` for major sections, `H3` for subsections
- **Tables**: Use for comparisons and structured data
- **Images**: Use SVG format, stored in `docs/images/`, use relative paths `../images/xxx.svg`
- **Links**:
  - Internal links: Use `/module-xx/section-name` format
  - External links: Include descriptive anchor text
- **Code blocks**: Use triple backticks with language specifiers
- **Emphasis**: Use bullet points for lists, bold for key terms

### Frontmatter Requirements

All `.md` files MUST have frontmatter with at least `title` and `description`:

```yaml
---
title: "1.1 GTM 的本质定义"
description: 准确理解 GTM（Go-To-Market）的定义，掌握市场进入操作系统的本质
---
```

Home page uses special VitePress hero frontmatter:

```yaml
---
layout: home

hero:
  name: "Title"
  text: "Subtitle"
  tagline: Tagline text
  actions:
    - theme: brand
      text: Action Text
      link: /path

features:
  - title: Feature 1
    details: Description
---
```

### JavaScript/TypeScript Style

- **Module system**: ES modules (`import`/`export`)
- **File extension**: `.mjs` for scripts, `.ts` for TypeScript, `.vue` for Vue components
- **Indentation**: 2 spaces (no tabs)
- **Quotes**: Single quotes preferred (enforced by Prettier)
- **Semicolons**: No semicolons (enforced by Prettier)
- **Line width**: 100 characters max
- **Line endings**: LF only
- **No unused variables**: Allowed with `_` prefix for unused parameters

### Vue Component Style

- Use `<script setup>` syntax with Composition API
- Use `<style scoped>` for component-specific styles
- Leverage VitePress theme CSS variables: `--vp-c-bg`, `--vp-c-text-1`, etc.
- Example: `docs/.vitepress/components/CACCalculator.vue`

## Testing & Validation

### Pre-commit Checks

Git hooks run `lint-staged` automatically on commit:

```json
{
  "*.{js,mjs,mts,ts}": ["eslint --fix", "prettier --write"],
  "*.{json,css,scss}": ["prettier --write"]
}
```

### CI/CD Pipeline

**`.github/workflows/ci.yml`** runs on push/PR to `main`:

1. Setup Node.js 18
2. `npm ci` (clean install)
3. `npm run lint`
4. `npm run check:links`
5. `npm run docs:build`

**`.github/workflows/deploy.yml`** deploys to both GitHub Pages and Cloudflare Pages:

1. Node.js 20
2. `npm ci`
3. ESLint check
4. Prettier format check
5. Build twice (different base paths for GitHub/Cloudflare)
6. Deploy to both platforms

### Link & Image Validation

Run `npm run check:links` locally before committing:

- Checks all internal links resolve correctly
- Validates image paths exist
- Warns about missing alt text on images
- Exits with error code 1 if broken links found

## Important Patterns & Gotchas

### VitePress Sidebar Generation

The sidebar is **auto-generated** from file structure in `.vitepress/config.mts`. Do NOT manually edit the sidebar array.

Sidebar generation logic:
1. Scans `docs/module-XX/` directories for `.md` files
2. Reads `index.md` first as "模块概览"
3. Extracts titles from frontmatter or H1 headings
4. Removes chapter numbers (e.g., "1.1 ") from display text
5. Automatically collapses appendix, expands modules

### Clean URL Handling

VitePress uses clean URLs (no `.html` or `.md` in URLs):

- `/module-01/1.1-gtm-definition` → `module-01/1.1-gtm-definition.md`
- `/module-01/` → `module-01/index.md`

When linking internally, omit `.md` extension:
```markdown
[Link text](/module-01/1.1-gtm-definition)
```

### Base Path Configuration

Site supports multiple deployments with different base paths:

- **Default**: `/gtm-cookbook/` (GitHub Pages)
- **Cloudflare**: `/` (set via `DEPLOY_TARGET=cloudflare` or `CF_PAGES` env var)
- **Custom**: `VITEPRESS_BASE` environment variable

The `config.mts` automatically resolves base path based on environment.

### Image Reference Patterns

Images should be referenced using relative paths from markdown file:

```markdown
![Alt text](../images/diagram-name.svg)
```

This ensures images work correctly regardless of base path configuration.

### Schema.org Structured Data

The VitePress config auto-generates extensive structured data (JSON-LD) for SEO:

- WebSite schema on homepage
- Article schema on content pages
- BreadcrumbList schema for navigation
- Course schema for educational content
- FAQPage schema on homepage
- HowTo schema for tool pages in Module 5

No manual maintenance required - automatically updates based on page metadata.

### Vue Component Integration

Custom Vue components are registered in `docs/.vitepress/theme/index.ts`:

```typescript
import CACCalculator from '../components/CACCalculator.vue'

export default {
  enhanceApp({ app }) {
    app.component('CACCalculator', CACCalculator)
  }
}
```

Usage in Markdown:

```markdown
<CACCalculator />
```

## Writing New Content

### Step 1: Check `docs/agent.md`

Before writing any content, read `docs/agent.md` for:
- Detailed writing standards
- Content quality requirements
- Project status and progress tracking

### Step 2: Create File in Appropriate Module

Place new content in the appropriate module directory:
- `docs/module-01/` - GTM Foundation
- `docs/module-02/` - Core Methodologies
- `docs/module-03/` - Execution Framework
- `docs/module-04/` - Case Studies
- `docs/module-05/` - Tools & Templates
- `docs/appendix/` - Reference materials

### Step 3: Follow Naming Convention

Use descriptive names with chapter number:

```
module-01/1.5-new-topic.md
module-02/2.6-new-framework.md
```

### Step 4: Add Required Sections

Ensure your file has:
- Frontmatter (title, description)
- Learning objectives block
- Core content outline
- Key takeaways
- Practice exercises
- Extended reading section
- Status footer (写作状态, 最后更新, 版本)

### Step 5: Create SVG Diagrams

If needed, create diagrams in `docs/images/`:
- Use `.svg` format
- Follow naming convention: `module-XX-section-name-01.svg`, `module-XX-section-name-02.svg`
- Ensure accessible (add title/desc tags in SVG)
- Reference with relative path: `../images/module-XX-section-name-01.svg`

### Step 6: Run Validation

Before committing:

```bash
# Format code
npm run format

# Lint
npm run lint

# Check links
npm run check:links

# Build (to catch any VitePress errors)
npm run build
```

### Step 7: Update Tracking

Update `docs/agent.md`:
- Add your chapter to the appropriate module table
- Set status to appropriate value
- Update version history if major changes

## Deployment

### GitHub Pages

- Base path: `/gtm-cookbook/`
- URL: `https://digidai.github.io/gtm-cookbook`
- Automatic on push to `main`

### Cloudflare Pages

- Base path: `/`
- URL: `https://genedai.space`
- Automatic on push to `main`
- Uses `wrangler` for deployment

### PDF Export

To generate PDF cookbook:

```bash
# Ensure puppeteer and pdf-lib are installed
npm install --save-dev puppeteer pdf-lib

# Build site first
npm run build

# Export PDF
npm run export:pdf

# Customize output
PDF_OUTPUT=Custom-Name.pdf npm run export:pdf
```

## Terminology Consistency

Use terms consistently per `docs/appendix/glossary.md`:

| Term | Chinese | Definition |
|------|---------|------------|
| GTM | 市场进入战略 | Go-To-Market strategy |
| PLG | 产品驱动增长 | Product-Led Growth |
| SLG | 销售驱动增长 | Sales-Led Growth |
| ICP | 理想客户画像 | Ideal Customer Profile |
| CAC | 客户获取成本 | Customer Acquisition Cost |
| LTV | 客户终身价值 | Lifetime Value |
| ARR | 年度经常性收入 | Annual Recurring Revenue |
| MRR | 月度经常性收入 | Monthly Recurring Revenue |
| NRR | 净收入留存率 | Net Revenue Retention |

## Commit Message Format

Use Conventional Commits:

```
<type>[optional scope]: <description>

[optional body]
```

Types:
- `feat`: New content or features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Formatting changes (no content change)
- `refactor`: Code refactoring
- `chore`: Build tools, dependencies, etc.

Examples:
```
feat: add new PLG case study for Figma
fix: correct CAC formula in glossary
docs: update module 2 introduction
style: format code with prettier
chore: upgrade vitepress to 1.5.0
```

## Common Issues & Solutions

### Build Fails with "Cannot find module"

```bash
# Clean and reinstall dependencies
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Link Checker Reports Broken Links

- For internal links: Ensure path matches actual file structure
- For module links: Check file exists and follows naming convention
- For index pages: Link to directory path, not explicit `index.md`

### Images Not Displaying

- Check image is in `docs/images/` directory
- Verify path is relative from markdown file location
- Confirm image extension is `.svg`
- Check for typos in filename

### Vue Component Not Working

- Ensure component is registered in `docs/.vitepress/theme/index.ts`
- Check for correct import path
- Verify component uses `<script setup>` syntax
- Test component in isolation

### PDF Export Fails

```bash
# Install required dependencies
npm install --save-dev puppeteer pdf-lib

# Ensure site is built or dev server is running
npm run build

# Try with explicit environment variables
PDF_SITE_URL=http://localhost:5173/ npm run export:pdf
```

## Key Files Reference

- **`package.json`**: All npm scripts and dependencies
- **`.vitepress/config.mts`**: VitePress configuration, sidebar generation, SEO schemas
- **`docs/agent.md`**: Writing standards and project tracking
- **`docs/index.md`**: Home page content
- **`eslint.config.js`**: ESLint rules and ignore patterns
- **`.prettierrc`**: Prettier formatting rules
- **`scripts/check-links.mjs`**: Link and image validation
- **`scripts/export-pdf.mjs`**: PDF generation
- **`tsconfig.json`**: TypeScript configuration

## Additional Resources

- [VitePress Documentation](https://vitepress.dev/)
- [Vue 3 Documentation](https://vuejs.org/)
- [Project README](README.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Writing Guidelines](docs/agent.md)
