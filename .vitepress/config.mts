import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'

const siteTitle = 'GTM 市场战略指南'
const siteDescription = 'Go-To-Market 市场进入战略完整教程'

function normalizeBase(value?: string): string {
  if (!value || value.trim() === '') return '/'
  let base = value.trim()
  if (!base.startsWith('/')) base = `/${base}`
  if (!base.endsWith('/')) base = `${base}/`
  return base
}

function normalizeSiteUrl(value?: string): string | undefined {
  if (!value || value.trim() === '') return undefined
  return value.trim().replace(/\/+$/, '')
}

function resolvePagePath(relativePath: string): { path: string; isIndex: boolean } {
  const normalized = relativePath.replace(/\\/g, '/')
  let pathValue = normalized.replace(/\.md$/, '')
  const isRootIndex = pathValue === 'index'
  const isNestedIndex = pathValue.endsWith('/index')
  const isIndex = isRootIndex || isNestedIndex

  if (isRootIndex) pathValue = ''
  if (isNestedIndex) pathValue = pathValue.slice(0, -'/index'.length)

  return { path: pathValue, isIndex }
}

function buildCanonicalUrl(siteUrl: string, basePath: string, relativePath: string): string {
  const { path: pagePath, isIndex } = resolvePagePath(relativePath)
  const normalizedSite = siteUrl.replace(/\/+$/, '')
  const normalizedBase = basePath === '/' ? '' : basePath.replace(/\/+$/, '')
  const siteWithBase = normalizedBase && normalizedSite.endsWith(normalizedBase)
    ? normalizedSite
    : `${normalizedSite}${normalizedBase}`

  const finalPath = isIndex ? (pagePath ? `${pagePath}/` : '') : pagePath
  const normalizedPath = finalPath.replace(/^\/+/, '')

  if (!normalizedPath) return `${siteWithBase}/`
  return `${siteWithBase}/${normalizedPath}`
}

function resolveSitemapHostname(siteUrl: string, basePath: string): string {
  const normalizedSite = siteUrl.replace(/\/+$/, '')
  const normalizedBase = basePath === '/' ? '' : basePath.replace(/\/+$/, '')
  if (normalizedBase && normalizedSite.endsWith(normalizedBase)) {
    return normalizedSite.slice(0, -normalizedBase.length)
  }
  return normalizedSite
}

// 模块名称中文映射
const moduleNames: Record<string, string> = {
  'module-01': '模块一：GTM 基础认知',
  'module-02': '模块二：核心方法论',
  'module-03': '模块三：执行体系',
  'module-04': '模块四：实战案例',
  'module-05': '模块五：工具模板',
  'appendix': '附录'
}

// 从 markdown 文件提取标题
function extractTitle(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    // 首先尝试从 frontmatter 的 title 字段获取
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/)
    if (frontmatterMatch) {
      const titleMatch = frontmatterMatch[1].match(/title:\s*["']?(.+?)["']?\s*$/m)
      if (titleMatch) return titleMatch[1]
    }
    // 否则从第一个 # 标题获取
    const headingMatch = content.match(/^#\s+(.+)$/m)
    if (headingMatch) {
      // 去掉可能的 Markdown 链接格式
      return headingMatch[1].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    }
  } catch (e) {
    // 忽略错误
  }
  return ''
}

// 从文件名生成简洁标题
function getTitleFromFilename(filename: string): string {
  const name = filename.replace('.md', '').replace(/^\d+\.\d+-?/, '').replace(/-/g, ' ')
  return name.charAt(0).toUpperCase() + name.slice(1)
}

// 生成侧边栏
function getSidebar() {
  const sidebar: any[] = []
  const docsDir = path.join(__dirname, '..', 'docs')

  // 读取所有 module- 开头的目录
  const modules = fs.readdirSync(docsDir)
    .filter(file => {
      return fs.statSync(path.join(docsDir, file)).isDirectory() && file.startsWith('module-')
    })
    .sort()

  modules.forEach(moduleDir => {
    const modulePath = path.join(docsDir, moduleDir)
    const files = fs.readdirSync(modulePath)
      .filter(file => file.endsWith('.md'))
      .sort()

    if (files.length > 0) {
      const items: any[] = []
      const indexPath = path.join(modulePath, 'index.md')
      if (fs.existsSync(indexPath)) {
        items.push({
          text: '模块概览',
          link: `/${moduleDir}/`
        })
      }

      const contentFiles = files.filter(file => file !== 'index.md')
      const contentItems = contentFiles.map(file => {
        const fullPath = path.join(modulePath, file)
        // 优先使用 markdown 文件中的标题
        let text = extractTitle(fullPath)
        if (!text) {
          text = getTitleFromFilename(file)
        }
        // 简化标题：去掉章节编号前缀（如 "1.1 "）
        text = text.replace(/^[\d.]+\s*/, '')

        return {
          text: text,
          link: `/${moduleDir}/${file}`
        }
      })

      items.push(...contentItems)

      sidebar.push({
        text: moduleNames[moduleDir] || moduleDir,
        items: items,
        collapsed: false
      })
    }
  })

  // 添加附录
  const appendixPath = path.join(docsDir, 'appendix')
  if (fs.existsSync(appendixPath)) {
    const appendixFiles = fs.readdirSync(appendixPath)
      .filter(file => file.endsWith('.md'))
      .sort()

    if (appendixFiles.length > 0) {
      const appendixItems: any[] = []
      const appendixIndexPath = path.join(appendixPath, 'index.md')
      if (fs.existsSync(appendixIndexPath)) {
        appendixItems.push({
          text: '附录概览',
          link: `/appendix/`
        })
      }

      const appendixContentFiles = appendixFiles.filter(file => file !== 'index.md')
      const appendixContentItems = appendixContentFiles.map(file => {
        const fullPath = path.join(appendixPath, file)
        let text = extractTitle(fullPath)
        if (!text) {
          text = getTitleFromFilename(file)
        }

        return {
          text: text,
          link: `/appendix/${file}`
        }
      })

      appendixItems.push(...appendixContentItems)

      sidebar.push({
        text: moduleNames['appendix'] || '附录',
        items: appendixItems,
        collapsed: true
      })
    }
  }

  return sidebar
}

// 根据环境变量设置 base 路径
// VITEPRESS_BASE 优先，例如：/gtm-cookbook/
// Cloudflare Pages 会自动设置 CF_PAGES
// 兼容旧的 DEPLOY_TARGET=cloudflare
const base = normalizeBase(
  process.env.VITEPRESS_BASE ||
  (process.env.CF_PAGES ? '/' : process.env.DEPLOY_TARGET === 'cloudflare' ? '/' : '/gtm-cookbook/')
)
const defaultSiteUrl = 'https://genedai.space'
const siteUrl = normalizeSiteUrl(
  process.env.SITE_URL ||
  process.env.CF_PAGES_URL ||
  defaultSiteUrl
)
const sitemapHostname = siteUrl ? resolveSitemapHostname(siteUrl, base) : undefined

export default defineConfig({
  title: siteTitle,
  description: siteDescription,
  srcDir: 'docs',
  lang: 'zh-CN',
  base,
  cleanUrls: true,
  sitemap: sitemapHostname ? { hostname: sitemapHostname } : undefined,

  head: [
    ['meta', { name: 'author', content: 'GTM Team' }],
    ['meta', { name: 'keywords', content: 'GTM, Go-To-Market, 市场战略, SaaS, PLG, SLG' }],
    ['meta', { name: 'robots', content: 'index,follow' }],
    ['meta', { name: 'theme-color', content: '#0f172a' }],
    ['link', { rel: 'icon', type: 'image/x-icon', href: `${base}favicon.ico` }],
    ['link', { rel: 'shortcut icon', type: 'image/x-icon', href: `${base}favicon.ico` }]
  ],
  transformHead: ({ pageData }) => {
    const title = pageData.title || siteTitle
    const description = pageData.frontmatter.description || pageData.description || siteDescription
    const metaTitle = title === siteTitle ? title : `${title} | ${siteTitle}`

    const tags: any[] = [
      ['meta', { property: 'og:title', content: metaTitle }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:site_name', content: siteTitle }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:locale', content: 'zh_CN' }],
      ['meta', { name: 'twitter:card', content: 'summary' }],
      ['meta', { name: 'twitter:title', content: metaTitle }],
      ['meta', { name: 'twitter:description', content: description }]
    ]

    if (siteUrl) {
      const canonical = buildCanonicalUrl(siteUrl, base, pageData.relativePath)
      tags.push(['link', { rel: 'canonical', href: canonical }])
      tags.push(['meta', { property: 'og:url', content: canonical }])
    }

    return tags
  },

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '开始学习', link: '/module-01/1.1-gtm-definition' },
      { text: '工具模板', link: '/module-05/' }
    ],

    sidebar: getSidebar(),

    outline: {
      label: '页面导航',
      level: [2, 3]
    },

    socialLinks: [],

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换'
            }
          }
        }
      }
    },

    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },

    lastUpdated: {
      text: '最后更新于'
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式'
  }
})
