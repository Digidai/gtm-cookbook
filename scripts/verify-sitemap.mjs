#!/usr/bin/env node

/**
 * Sitemap 验证和提交工具
 *
 * 功能：
 * 1. 验证 sitemap.xml 是否有效
 * 2. 统计 sitemap 中的 URL 数量
 * 3. 提供手动 ping 服务提交
 * 4. 生成 sitemap 分析报告
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SITEMAP_PATH = path.join(__dirname, '../docs/.vitepress/dist/sitemap.xml')
const SITE_URL = 'https://genedai.space'

// ANSI 颜色代码
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function error(message) {
  log(`❌ ${message}`, 'red')
}

function success(message) {
  log(`✅ ${message}`, 'green')
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan')
}

function warn(message) {
  log(`⚠️  ${message}`, 'yellow')
}

/**
 * 验证 sitemap 文件是否存在
 */
function validateSitemapExists() {
  if (!fs.existsSync(SITEMAP_PATH)) {
    error(`Sitemap 文件不存在: ${SITEMAP_PATH}`)
    info('请先运行 npm run build 生成 sitemap')
    return false
  }
  return true
}

/**
 * 解析 sitemap.xml 并提取信息
 */
function parseSitemap() {
  const content = fs.readFileSync(SITEMAP_PATH, 'utf-8')

  // 基本验证
  if (!content.includes('<?xml') || !content.includes('<urlset')) {
    error('Sitemap 格式无效：缺少必要的 XML 标签')
    return null
  }

  // 提取所有 URL
  const urlRegex = /<loc>(.*?)<\/loc>/g
  const urls = []
  let match

  while ((match = urlRegex.exec(content)) !== null) {
    urls.push(match[1])
  }

  // 提取所有 lastmod
  const lastmodRegex = /<lastmod>(.*?)<\/lastmod>/g
  const lastmods = []
  while ((match = lastmodRegex.exec(content)) !== null) {
    lastmods.push(new Date(match[1]))
  }

  return {
    content,
    urls,
    lastmods,
    size: content.length,
    totalUrls: urls.length
  }
}

/**
 * 分析 sitemap 并生成报告
 */
function analyzeSitemap(data) {
  log('\n' + '='.repeat(60), 'bright')
  log('Sitemap 分析报告', 'bright')
  log('='.repeat(60) + '\n', 'bright')

  // 基本信息
  log(`📁 文件路径: ${SITEMAP_PATH}`, 'white')
  log(`📊 文件大小: ${(data.size / 1024).toFixed(2)} KB`, 'white')
  log(`🔗 URL 总数: ${data.totalUrls}`, 'white')

  if (data.lastmods.length > 0) {
    const newest = new Date(Math.max(...data.lastmods))
    const oldest = new Date(Math.min(...data.lastmods))
    log(`📅 最新更新: ${newest.toLocaleString('zh-CN')}`, 'white')
    log(`📅 最早更新: ${oldest.toLocaleString('zh-CN')}`, 'white')
  }

  // URL 类型统计
  const urlTypes = {}
  data.urls.forEach((url) => {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname

    let type = 'other'
    if (pathname === '/' || pathname === '/gtm-cookbook/') {
      type = 'homepage'
    } else if (pathname.startsWith('/module-')) {
      type = 'module'
    } else if (pathname.startsWith('/appendix')) {
      type = 'appendix'
    }

    urlTypes[type] = (urlTypes[type] || 0) + 1
  })

  log('\n📋 URL 类型分布:', 'cyan')
  Object.entries(urlTypes)
    .sort(([, a], [, b]) => b - a)
    .forEach(([type, count]) => {
      const percentage = ((count / data.totalUrls) * 100).toFixed(1)
      log(`   ${type}: ${count} (${percentage}%)`, 'white')
    })

  // 检查常见问题
  log('\n🔍 健康检查:', 'cyan')

  const issues = []

  // 检查是否有非 HTTPS URL
  const httpUrls = data.urls.filter((url) => url.startsWith('http:'))
  if (httpUrls.length > 0) {
    issues.push(`发现 ${httpUrls.length} 个 HTTP URL（应该使用 HTTPS）`)
  }

  // 检查 URL 是否正确
  const invalidUrls = data.urls.filter((url) => !url.startsWith(SITE_URL))
  if (invalidUrls.length > 0) {
    issues.push(`发现 ${invalidUrls.length} 个不属于 ${SITE_URL} 的 URL`)
  }

  // 检查文件大小（Google 限制 50MB）
  if (data.size > 50 * 1024 * 1024) {
    issues.push('Sitemap 文件超过 50MB 限制')
  }

  // 检查 URL 数量（Google 限制 50,000）
  if (data.totalUrls > 50000) {
    issues.push('URL 数量超过 50,000 限制，需要拆分为多个 sitemap')
  }

  if (issues.length === 0) {
    success('所有检查通过！')
  } else {
    issues.forEach((issue) => warn(issue))
  }

  return {
    ...data,
    urlTypes,
    issues
  }
}

/**
 * 通过 HTTP Ping 提交 sitemap
 * 注意：这是 Google 的传统方式，不如 API 可靠，但可以作为备选
 */
function pingSitemap() {
  const searchEngines = [
    {
      name: 'Google',
      url: 'https://www.google.com/ping?sitemap=https://genedai.space/sitemap.xml'
    },
    {
      name: 'Bing',
      url: 'https://www.bing.com/ping?sitemap=https://genedai.space/sitemap.xml'
    }
  ]

  log('\n📡 提交 Sitemap 到搜索引擎:', 'cyan')
  info('注意：Ping 方式不如 API 提交可靠，建议使用 GitHub Actions 自动提交\n')

  searchEngines.forEach((engine) => {
    log(`${engine.name}:`, 'white')
    log(`   URL: ${engine.url}`, 'white')
    log(`   提示: 可以在浏览器中打开此 URL 手动提交`, 'white')
    log('', 'white')
  })

  info('💡 建议：在浏览器中依次打开上述 URL 进行手动提交')
}

/**
 * 生成下一步操作建议
 */
function generateNextSteps(data) {
  log('\n' + '='.repeat(60), 'bright')
  log('后续操作建议', 'bright')
  log('='.repeat(60) + '\n', 'bright')

  log('1. 自动提交（推荐）:', 'cyan')
  log('   按照 docs/GOOGLE-SEARCH-CONSOLE-SETUP.md 配置 GitHub Actions，', 'white')
  log('   每周自动提交 sitemap 到 Google Search Console\n', 'white')

  log('2. 手动提交:', 'cyan')
  log('   a) 访问 Google Search Console: https://search.google.com/search-console', 'white')
  log('   b) 选择网站属性 (genedai.space)', 'white')
  log('   c) 进入 "索引" > "Sitemaps"', 'white')
  log('   d) 输入 sitemap URL: https://genedai.space/sitemap.xml', 'white')
  log('   e) 点击 "提交"\n', 'white')

  log('3. 监控收录状态:', 'cyan')
  log('   在 Search Console 查看 "覆盖率" 报告，了解页面索引情况\n', 'white')

  log('4. 提高收录效率:', 'cyan')
  log('   - 定期更新高质量内容', 'white')
  log('   - 保持良好的网站结构', 'white')
  log('   - 建立内部链接', 'white')
  log('   - 对重要页面使用 "请求编入索引" 功能\n', 'white')

  if (data.issues.length > 0) {
    log('⚠️  注意事项:', 'yellow')
    data.issues.forEach((issue) => warn(`   - ${issue}`))
    log('', 'white')
  }
}

/**
 * 显示示例 URL
 */
function showSampleUrls(urls, count = 5) {
  log('\n📝 示例 URL:', 'cyan')
  urls.slice(0, count).forEach((url, index) => {
    log(`   ${index + 1}. ${url}`, 'white')
  })

  if (urls.length > count) {
    info(`... 还有 ${urls.length - count} 个 URL`)
  }
}

/**
 * 主函数
 */
async function main() {
  log('\n🗺️  Sitemap 验证和提交工具\n', 'bright')

  // 检查 sitemap 是否存在
  if (!validateSitemapExists()) {
    process.exit(1)
  }

  // 解析 sitemap
  const data = parseSitemap()
  if (!data) {
    process.exit(1)
  }

  // 分析 sitemap
  const analysis = analyzeSitemap(data)

  // 显示示例 URL
  showSampleUrls(analysis.urls, 5)

  // Ping 提交信息
  pingSitemap()

  // 生成建议
  generateNextSteps(analysis)

  // 总结
  log('\n' + '='.repeat(60), 'bright')
  success('验证完成！')
  log('='.repeat(60) + '\n', 'bright')
}

// 运行
main().catch((err) => {
  error('运行失败:')
  console.error(err)
  process.exit(1)
})
