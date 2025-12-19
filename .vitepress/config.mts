import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'

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
      .filter(file => file.endsWith('.md') && file !== 'index.md')
      .sort()

    if (files.length > 0) {
      const items = files.map(file => {
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
      const appendixItems = appendixFiles.map(file => {
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
// GitHub Pages: /gtm-cookbook/
// Cloudflare Workers: /
const base = process.env.DEPLOY_TARGET === 'cloudflare' ? '/' : '/gtm-cookbook/'

export default defineConfig({
  title: "GTM 市场战略指南",
  description: "Go-To-Market 市场进入战略完整教程",
  srcDir: 'docs',
  lang: 'zh-CN',
  base,

  head: [
    ['meta', { name: 'author', content: 'GTM Team' }],
    ['meta', { name: 'keywords', content: 'GTM, Go-To-Market, 市场战略, SaaS, PLG, SLG' }]
  ],

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
