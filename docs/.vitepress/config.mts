import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'

const siteTitle = 'GTM 市场战略指南'
const siteDescription = 'Go-To-Market 市场进入战略完整教程'
const ogImageName = 'og-cover.png'

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
  const siteWithBase =
    normalizedBase && normalizedSite.endsWith(normalizedBase)
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
  appendix: '附录'
}

// 生成面包屑导航数据
function generateBreadcrumbs(
  relativePath: string,
  pageTitle: string,
  siteUrl: string,
  basePath: string
): Array<{ name: string; url: string }> {
  const breadcrumbs: Array<{ name: string; url: string }> = [
    { name: '首页', url: `${siteUrl}${basePath}` }
  ]

  const normalized = relativePath.replace(/\\/g, '/').replace(/\.md$/, '')
  const parts = normalized.split('/').filter(Boolean)

  if (parts.length === 0 || (parts.length === 1 && parts[0] === 'index')) {
    return breadcrumbs
  }

  let currentPath = ''
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (part === 'index') continue

    currentPath += `/${part}`

    if (i === parts.length - 1 || (i === parts.length - 2 && parts[parts.length - 1] === 'index')) {
      // 最后一项使用页面标题
      breadcrumbs.push({
        name: pageTitle,
        url: `${siteUrl}${basePath.replace(/\/$/, '')}${currentPath}`
      })
    } else if (moduleNames[part]) {
      // 模块目录
      breadcrumbs.push({
        name: moduleNames[part].replace(/^模块[一二三四五]：/, ''),
        url: `${siteUrl}${basePath.replace(/\/$/, '')}${currentPath}/`
      })
    } else if (part === 'appendix') {
      breadcrumbs.push({
        name: '附录',
        url: `${siteUrl}${basePath.replace(/\/$/, '')}${currentPath}/`
      })
    }
  }

  return breadcrumbs
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
  const name = filename
    .replace('.md', '')
    .replace(/^\d+\.\d+-?/, '')
    .replace(/-/g, ' ')
  return name.charAt(0).toUpperCase() + name.slice(1)
}

// 生成侧边栏
function getSidebar() {
  const sidebar: any[] = []
  const docsDir = path.join(__dirname, '..')

  // 读取所有 module- 开头的目录
  let modules: string[] = []
  try {
    const allFiles = fs.readdirSync(docsDir)
    modules = allFiles
      .filter((file: string) => {
        try {
          return fs.statSync(path.join(docsDir, file)).isDirectory() && file.startsWith('module-')
        } catch {
          return false
        }
      })
      .sort()
  } catch (error) {
    console.error('Failed to read docs directory:', error)
    return []
  }

  modules.forEach((moduleDir: string) => {
    const modulePath = path.join(docsDir, moduleDir)
    let files: string[] = []
    try {
      const allFiles = fs.readdirSync(modulePath)
      files = allFiles.filter((file: string) => file.endsWith('.md')).sort()
    } catch (error) {
      console.error(`Failed to read module directory ${moduleDir}:`, error)
      return
    }

    if (files.length > 0) {
      const items: any[] = []
      const indexPath = path.join(modulePath, 'index.md')
      if (fs.existsSync(indexPath)) {
        items.push({
          text: '模块概览',
          link: `/${moduleDir}/`
        })
      }

      const contentFiles = files.filter((file: string) => file !== 'index.md')
      const contentItems = contentFiles.map((file: string) => {
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
          link: `/${moduleDir}/${file.replace(/\.md$/, '')}`
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
    let appendixFiles: string[] = []
    try {
      const allFiles = fs.readdirSync(appendixPath)
      appendixFiles = allFiles.filter((file: string) => file.endsWith('.md')).sort()
    } catch (error) {
      console.error('Failed to read appendix directory:', error)
    }

    if (appendixFiles.length > 0) {
      const appendixItems: any[] = []
      const appendixIndexPath = path.join(appendixPath, 'index.md')
      if (fs.existsSync(appendixIndexPath)) {
        appendixItems.push({
          text: '附录概览',
          link: `/appendix/`
        })
      }

      const appendixContentFiles = appendixFiles.filter((file: string) => file !== 'index.md')
      const appendixContentItems = appendixContentFiles.map((file: string) => {
        const fullPath = path.join(appendixPath, file)
        let text = extractTitle(fullPath)
        if (!text) {
          text = getTitleFromFilename(file)
        }

        return {
          text: text,
          link: `/appendix/${file.replace(/\.md$/, '')}`
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
    (process.env.CF_PAGES
      ? '/'
      : process.env.DEPLOY_TARGET === 'cloudflare'
        ? '/'
        : '/gtm-cookbook/')
)
const defaultSiteUrl = 'https://genedai.space'
const siteUrl = normalizeSiteUrl(process.env.SITE_URL || process.env.CF_PAGES_URL || defaultSiteUrl)
const sitemapHostname = siteUrl ? resolveSitemapHostname(siteUrl, base) : undefined

export default defineConfig({
  title: siteTitle,
  description: siteDescription,
  lang: 'zh-CN',
  base,
  cleanUrls: true,
  lastUpdated: true,
  // Only enable sitemap if we have a valid hostname.
  // This prevents 'EmptySitemap' errors during local dev or CI if URL is missing.
  sitemap: sitemapHostname ? { hostname: sitemapHostname } : undefined,

  head: [
    // Resource preloading hints
    ['link', { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com', crossorigin: '' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],

    // Basic meta
    ['meta', { name: 'author', content: 'Digidai' }],
    [
      'meta',
      {
        name: 'keywords',
        content:
          'GTM, Go-To-Market, 市场战略, SaaS, PLG, SLG, 产品增长, B2B, 创业, 增长黑客, ICP, 价值主张, 定位策略, RevOps'
      }
    ],
    ['meta', { name: 'robots', content: 'index,follow,max-image-preview:large,max-snippet:-1' }],
    ['meta', { name: 'googlebot', content: 'index,follow,max-image-preview:large' }],
    ['meta', { name: 'theme-color', content: '#0f172a' }],

    // Mobile optimization
    ['meta', { name: 'format-detection', content: 'telephone=no' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }],
    ['meta', { name: 'apple-mobile-web-app-title', content: 'GTM Cookbook' }],

    // Geo targeting
    ['meta', { name: 'geo.region', content: 'CN' }],
    ['meta', { name: 'geo.placename', content: 'China' }],
    ['meta', { name: 'content-language', content: 'zh-CN' }],

    // Favicons
    ['link', { rel: 'icon', type: 'image/x-icon', href: `${base}favicon.ico` }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: `${base}favicon-32x32.png` }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: `${base}favicon-16x16.png` }],

    // Apple Touch Icon
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: `${base}apple-touch-icon.png` }],

    // PWA Manifest
    ['link', { rel: 'manifest', href: `${base}site.webmanifest` }],

    // Microsoft Tile
    ['meta', { name: 'msapplication-TileColor', content: '#0f172a' }],
    ['meta', { name: 'msapplication-config', content: `${base}browserconfig.xml` }],
    [
      'script',
      { type: 'application/ld+json' },
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'GTM Cookbook',
        alternateName: ['GTM 市场战略指南', 'Go-To-Market Cookbook'],
        description: 'Go-To-Market 完整实战手册，从战略到执行系统掌握市场进入方法论',
        url: 'https://genedai.space',
        image: 'https://genedai.space/og-cover.png',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://genedai.space/?search={search_term_string}'
          },
          'query-input': 'required name=search_term_string'
        },
        author: {
          '@type': 'Organization',
          name: 'Digidai',
          url: 'https://github.com/Digidai',
          logo: {
            '@type': 'ImageObject',
            url: 'https://genedai.space/logo.png',
            width: 512,
            height: 512
          },
          sameAs: ['https://github.com/Digidai/gtm-cookbook', 'https://twitter.com/digidai']
        },
        publisher: {
          '@type': 'Organization',
          name: 'Digidai',
          logo: {
            '@type': 'ImageObject',
            url: 'https://genedai.space/logo.png',
            width: 512,
            height: 512
          }
        },
        inLanguage: 'zh-CN',
        isAccessibleForFree: true,
        license: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
      })
    ],
    // Course Schema for educational content
    [
      'script',
      { type: 'application/ld+json' },
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: 'GTM 市场战略指南',
        description:
          'Go-To-Market 完整实战手册，涵盖 GTM 基础认知、核心方法论、执行体系、实战案例和工具模板五大模块',
        url: 'https://genedai.space',
        image: 'https://genedai.space/og-cover.png',
        provider: {
          '@type': 'Organization',
          name: 'GTM Cookbook',
          url: 'https://genedai.space'
        },
        educationalLevel: 'Intermediate',
        teaches: [
          'Go-To-Market 战略',
          'PLG 产品驱动增长',
          'SLG 销售驱动增长',
          'ICP 理想客户画像',
          '价值主张设计',
          'RevOps 收入运营'
        ],
        numberOfCredits: 5,
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          courseWorkload: 'PT10H'
        },
        inLanguage: 'zh-CN',
        isAccessibleForFree: true,
        license: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
      })
    ]
  ],
  transformHead: ({ pageData }) => {
    const title = pageData.title || siteTitle
    const description = pageData.frontmatter.description || pageData.description || siteDescription
    const metaTitle = title === siteTitle ? title : `${title} | ${siteTitle}`

    const tags: any[] = [
      // Open Graph (Facebook, LinkedIn, etc.)
      ['meta', { property: 'og:title', content: metaTitle }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:site_name', content: 'GTM Cookbook' }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:locale', content: 'zh_CN' }],

      // Twitter Card
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:site', content: '@gtmcookbook' }],
      ['meta', { name: 'twitter:creator', content: '@digidai' }],
      ['meta', { name: 'twitter:title', content: metaTitle }],
      ['meta', { name: 'twitter:description', content: description }]
    ]

    if (siteUrl) {
      const canonical = buildCanonicalUrl(siteUrl, base, pageData.relativePath)
      const ogImage = `${siteUrl}${base}${ogImageName}`
      const twitterImage = `${siteUrl}${base}twitter-card.png`

      // Canonical URL
      tags.push(['link', { rel: 'canonical', href: canonical }])

      // hreflang for internationalization (primary language is Chinese)
      tags.push(['link', { rel: 'alternate', hreflang: 'zh-CN', href: canonical }])
      tags.push(['link', { rel: 'alternate', hreflang: 'zh', href: canonical }])
      tags.push(['link', { rel: 'alternate', hreflang: 'x-default', href: canonical }])

      // Alternate locale for Open Graph
      tags.push(['meta', { property: 'og:locale:alternate', content: 'en_US' }])

      // Open Graph Image
      tags.push(['meta', { property: 'og:url', content: canonical }])
      tags.push(['meta', { property: 'og:image', content: ogImage }])
      tags.push(['meta', { property: 'og:image:secure_url', content: ogImage }])
      tags.push(['meta', { property: 'og:image:type', content: 'image/png' }])
      tags.push(['meta', { property: 'og:image:width', content: '1200' }])
      tags.push(['meta', { property: 'og:image:height', content: '630' }])
      tags.push([
        'meta',
        { property: 'og:image:alt', content: 'GTM Cookbook - Go-To-Market 完整实战手册' }
      ])

      // Twitter Image
      tags.push(['meta', { name: 'twitter:image', content: twitterImage }])
      tags.push([
        'meta',
        { name: 'twitter:image:alt', content: 'GTM Cookbook - Go-To-Market 完整实战手册' }
      ])

      // WeChat / 微信分享
      tags.push(['meta', { itemprop: 'name', content: metaTitle }])
      tags.push(['meta', { itemprop: 'description', content: description }])
      tags.push(['meta', { itemprop: 'image', content: `${siteUrl}${base}wechat-share.png` }])

      // Additional social platforms
      tags.push(['meta', { property: 'article:author', content: 'Digidai' }])

      // Pinterest
      tags.push(['meta', { name: 'pinterest-rich-pin', content: 'true' }])
      tags.push([
        'meta',
        { property: 'og:see_also', content: 'https://github.com/Digidai/gtm-cookbook' }
      ])

      // Telegram
      tags.push(['meta', { name: 'telegram:channel', content: '@gtmcookbook' }])

      // 微博 Weibo
      tags.push(['meta', { property: 'weibo:article:title', content: metaTitle }])
      tags.push(['meta', { property: 'weibo:article:description', content: description }])

      // Article timestamps (use lastUpdated from VitePress or current date)
      const publishDate = '2024-12-01T00:00:00+08:00' // 项目发布日期
      const modifiedDate = pageData.lastUpdated
        ? new Date(pageData.lastUpdated).toISOString()
        : new Date().toISOString()
      tags.push(['meta', { property: 'article:published_time', content: publishDate }])
      tags.push(['meta', { property: 'article:modified_time', content: modifiedDate }])

      // Article section and tags
      const isContentPage =
        pageData.relativePath.startsWith('module-') || pageData.relativePath.startsWith('appendix/')
      if (isContentPage) {
        tags.push(['meta', { property: 'article:section', content: 'GTM Strategy' }])
        tags.push(['meta', { property: 'article:tag', content: 'GTM' }])
        tags.push(['meta', { property: 'article:tag', content: 'Go-To-Market' }])
        tags.push(['meta', { property: 'article:tag', content: 'SaaS' }])
        tags.push(['meta', { property: 'article:tag', content: '增长策略' }])
      }

      // BreadcrumbList Schema
      const breadcrumbs = generateBreadcrumbs(pageData.relativePath, title, siteUrl, base)
      if (breadcrumbs.length > 1) {
        tags.push([
          'script',
          { type: 'application/ld+json' },
          JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs.map((crumb, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: crumb.name,
              item: crumb.url
            }))
          })
        ])
      }

      // Article JSON-LD Schema for content pages
      const isIndex = pageData.relativePath.endsWith('index.md')
      if (isContentPage && !isIndex) {
        tags.push([
          'script',
          { type: 'application/ld+json' },
          JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: title,
            description: description,
            url: canonical,
            image: ogImage,
            datePublished: publishDate,
            dateModified: modifiedDate,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': canonical
            },
            author: {
              '@type': 'Organization',
              name: 'Digidai',
              url: 'https://github.com/Digidai',
              logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}${base}logo.png`
              }
            },
            publisher: {
              '@type': 'Organization',
              name: 'GTM Cookbook',
              url: 'https://genedai.space',
              logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}${base}logo.png`,
                width: 512,
                height: 512
              }
            },
            articleSection: 'GTM Strategy',
            keywords: ['GTM', 'Go-To-Market', 'SaaS', '增长策略', 'PLG', 'SLG'],
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: ['h1', 'h2', '.vp-doc p:first-of-type']
            },
            inLanguage: 'zh-CN',
            isAccessibleForFree: true,
            license: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
          })
        ])

        // WebPage Schema with additional properties
        tags.push([
          'script',
          { type: 'application/ld+json' },
          JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': canonical,
            name: title,
            description: description,
            url: canonical,
            isPartOf: {
              '@type': 'WebSite',
              '@id': `${siteUrl}${base}`,
              name: 'GTM Cookbook'
            },
            about: {
              '@type': 'Thing',
              name: 'Go-To-Market Strategy'
            },
            audience: {
              '@type': 'Audience',
              audienceType: '产品经理、市场营销人员、销售负责人、创业者'
            },
            inLanguage: 'zh-CN',
            potentialAction: {
              '@type': 'ReadAction',
              target: canonical
            }
          })
        ])
      }

      // FAQ Schema for homepage
      if (pageData.relativePath === 'index.md') {
        tags.push([
          'script',
          { type: 'application/ld+json' },
          JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: '什么是 GTM（Go-To-Market）战略？',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'GTM 即 Go-To-Market，是将产品或服务成功推向目标市场的完整战略，涵盖市场定位、客户获取、销售渠道、定价策略等核心环节。'
                }
              },
              {
                '@type': 'Question',
                name: 'GTM Cookbook 适合什么人学习？',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '适合产品经理、市场营销人员、销售负责人、创业者和投资人。无论你是初学者还是有经验的从业者，都能从系统化的方法论中获益。'
                }
              },
              {
                '@type': 'Question',
                name: 'PLG 和 SLG 有什么区别？',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'PLG（Product-Led Growth）是产品驱动增长，用户可自助使用产品；SLG（Sales-Led Growth）是销售驱动增长，需要销售团队主导成交流程。两者可以结合使用。'
                }
              },
              {
                '@type': 'Question',
                name: '如何选择合适的 GTM Motion？',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '根据产品复杂度、客户规模、ACV（年合同价值）等因素选择。低价简单产品适合 PLG，高价复杂产品适合 SLG，中间地带可采用混合模式。'
                }
              }
            ]
          })
        ])

        // ItemList Schema for course modules
        tags.push([
          'script',
          { type: 'application/ld+json' },
          JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'GTM Cookbook 课程模块',
            description: 'Go-To-Market 市场战略完整课程的五大学习模块',
            numberOfItems: 5,
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'GTM 基础认知',
                description: '了解 GTM 的定义、战略意义和核心框架',
                url: `${siteUrl}${base}module-01/`
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: '核心方法论',
                description: '掌握跨越鸿沟、PLG/SLG、ICP 构建等核心方法论',
                url: `${siteUrl}${base}module-02/`
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: '执行体系',
                description: '学习 GTM 执行框架和运营管理方法',
                url: `${siteUrl}${base}module-03/`
              },
              {
                '@type': 'ListItem',
                position: 4,
                name: '实战案例',
                description: '深度解析 Slack、Notion、飞书等经典案例',
                url: `${siteUrl}${base}module-04/`
              },
              {
                '@type': 'ListItem',
                position: 5,
                name: '工具模板',
                description: '提供战略模板、工作表、检查表等实用工具',
                url: `${siteUrl}${base}module-05/`
              }
            ]
          })
        ])
      }

      // DefinedTermSet Schema for glossary page
      if (pageData.relativePath === 'appendix/glossary.md') {
        tags.push([
          'script',
          { type: 'application/ld+json' },
          JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'DefinedTermSet',
            name: 'GTM 术语表',
            description:
              'Go-To-Market 专业术语表，涵盖 CAC、LTV、NRR、ICP、PLG、SLG 等 40+ 常用术语的定义和应用场景',
            url: canonical,
            inLanguage: 'zh-CN',
            publisher: {
              '@type': 'Organization',
              name: 'GTM Cookbook',
              url: 'https://genedai.space'
            },
            hasDefinedTerm: [
              { '@type': 'DefinedTerm', name: 'GTM', description: 'Go-To-Market，市场进入战略' },
              {
                '@type': 'DefinedTerm',
                name: 'PLG',
                description: 'Product-Led Growth，产品驱动增长'
              },
              {
                '@type': 'DefinedTerm',
                name: 'SLG',
                description: 'Sales-Led Growth，销售驱动增长'
              },
              {
                '@type': 'DefinedTerm',
                name: 'ICP',
                description: 'Ideal Customer Profile，理想客户画像'
              },
              {
                '@type': 'DefinedTerm',
                name: 'CAC',
                description: 'Customer Acquisition Cost，客户获取成本'
              },
              { '@type': 'DefinedTerm', name: 'LTV', description: 'Lifetime Value，客户终身价值' },
              {
                '@type': 'DefinedTerm',
                name: 'ARR',
                description: 'Annual Recurring Revenue，年度经常性收入'
              },
              {
                '@type': 'DefinedTerm',
                name: 'MRR',
                description: 'Monthly Recurring Revenue，月度经常性收入'
              },
              {
                '@type': 'DefinedTerm',
                name: 'NRR',
                description: 'Net Revenue Retention，净收入留存率'
              },
              {
                '@type': 'DefinedTerm',
                name: 'ACV',
                description: 'Annual Contract Value，年合同价值'
              }
            ]
          })
        ])
      }

      // HowTo Schema for tool/template pages in module-05
      if (pageData.relativePath.startsWith('module-05/') && !isIndex) {
        const toolName = title.replace(/^[\d.]+\s*/, '')
        tags.push([
          'script',
          { type: 'application/ld+json' },
          JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: `如何使用 ${toolName}`,
            description: description,
            url: canonical,
            image: ogImage,
            totalTime: 'PT30M',
            tool: {
              '@type': 'HowToTool',
              name: toolName
            },
            supply: {
              '@type': 'HowToSupply',
              name: 'GTM 相关数据和信息'
            },
            step: [
              {
                '@type': 'HowToStep',
                position: 1,
                name: '准备阶段',
                text: '回顾相关模块知识，准备业务数据'
              },
              {
                '@type': 'HowToStep',
                position: 2,
                name: '填写模板',
                text: '按照模板结构填写各项内容'
              },
              {
                '@type': 'HowToStep',
                position: 3,
                name: '团队讨论',
                text: '与团队讨论并达成共识'
              },
              {
                '@type': 'HowToStep',
                position: 4,
                name: '定期复盘',
                text: '设置复盘节奏，持续更新优化'
              }
            ],
            inLanguage: 'zh-CN'
          })
        ])
      }

      // CollectionPage Schema for module index pages
      if (isContentPage && isIndex) {
        const moduleName = moduleNames[pageData.relativePath.split('/')[0]] || title
        tags.push([
          'script',
          { type: 'application/ld+json' },
          JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: moduleName,
            description: description,
            url: canonical,
            isPartOf: {
              '@type': 'Course',
              name: 'GTM 市场战略指南',
              url: `${siteUrl}${base}`
            },
            inLanguage: 'zh-CN'
          })
        ])
      }
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

    socialLinks: [{ icon: 'github', link: 'https://github.com/Digidai/gtm-cookbook' }],

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
