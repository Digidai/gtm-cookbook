# 自动 Sitemap 提交系统

本目录包含 GTM Cookbook 项目的自动 Sitemap 提交系统，用于定期向 Google 提交网站地图，提高页面收录率。

## 📋 目录

- [系统概述](#系统概述)
- [快速开始](#快速开始)
- [工作原理](#工作原理)
- [配置指南](#配置指南)
- [使用说明](#使用说明)
- [监控和调试](#监控和调试)
- [最佳实践](#最佳实践)

## 系统概述

### 为什么需要自动提交？

Sitemap 自动提交可以帮助：
- **更快被发现**：新页面和更新内容更快被 Google 发现
- **提高索引效率**：系统化地通知 Google 内容变化
- **提升收录率**：逐步提高网站整体收录率
- **节省时间**：自动化流程，无需手动操作

### 系统组成

1. **GitHub Actions Workflow** (`.github/workflows/submit-sitemap.yml`)
   - 每周自动运行（每周一上午）
   - 部署后自动触发
   - 支持手动运行

2. **Sitemap 验证工具** (`scripts/verify-sitemap.mjs`)
   - 验证 sitemap 有效性
   - 分析 sitemap 内容
   - 提供优化建议

3. **配置文档** (`docs/GOOGLE-SEARCH-CONSOLE-SETUP.md`)
   - 详细的配置步骤
   - 故障排查指南
   - 最佳实践建议

## 快速开始

### 1. 前置条件

- 已有 Google 账号
- 网站已在 [Google Search Console](https://search.google.com/search-console) 验证
- 有 GitHub 仓库的管理员权限

### 2. 配置步骤（5 分钟）

```bash
# 1. 克隆仓库（如果还没有）
git clone https://github.com/Digidai/gtm-cookbook.git
cd gtm-cookbook

# 2. 阅读详细配置指南
open docs/GOOGLE-SEARCH-CONSOLE-SETUP.md

# 3. 按照 guide 配置 Google Cloud 和 Search Console

# 4. 配置 GitHub Secrets
# 访问: https://github.com/Digidai/gtm-cookbook/settings/secrets/actions
# 添加以下 secrets:
#   - GOOGLE_SERVICE_ACCOUNT_EMAIL
#   - GOOGLE_SERVICE_ACCOUNT_KEY

# 5. 手动运行测试
# 访问: https://github.com/Digidai/gtm-cookbook/actions
# 选择 "Submit Sitemap to Google" workflow，点击 "Run workflow"
```

### 3. 验证配置

```bash
# 构建 sitemap
npm run build

# 验证 sitemap
npm run verify:sitemap

# 查看 sitemap 内容
cat docs/.vitepress/dist/sitemap.xml
```

## 工作原理

### 自动化流程

```
┌─────────────────────────────────────────────────────────────┐
│                     触发条件                                 │
│  1. 每周一 10:00 CST (自动)                                 │
│  2. 部署成功后 (自动)                                       │
│  3. 手动触发 (GitHub Actions 页面)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     构建阶段                                 │
│  1. 拉取最新代码                                            │
│  2. 安装依赖                                                │
│  3. 构建网站 (生成最新 sitemap)                             │
│  4. 验证 sitemap 文件存在                                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     提交阶段                                 │
│  1. 读取 Google Service Account 凭据                       │
│  2. 调用 Google Search Console API                         │
│  3. 提交 sitemap URL                                       │
│  4. 等待响应并记录结果                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     报告阶段                                 │
│  1. 生成 GitHub Actions Summary                            │
│  2. 记录提交时间、URL 数量等信息                            │
│  3. 提供下次运行时间                                        │
└─────────────────────────────────────────────────────────────┘
```

### Sitemap 生成

VitePress 在构建时自动生成 sitemap.xml：

```typescript
// docs/.vitepress/config.mts
export default defineConfig({
  sitemap: {
    hostname: 'https://genedai.space'
  }
})
```

生成的 sitemap 包含：
- 所有页面 URL
- 最后更新时间 (lastmod)
- 优先级 (priority)
- 更新频率 (changefreq)

## 配置指南

### Google Cloud 配置

详细步骤请参考：[docs/GOOGLE-SEARCH-CONSOLE-SETUP.md](docs/GOOGLE-SEARCH-CONSOLE-SETUP.md)

**核心配置：**

1. **启用 Search Console API**
   - 访问 [Google Cloud Console](https://console.cloud.google.com/)
   - 搜索并启用 "Search Console API"

2. **创建服务账号**
   - 类型：Service Account
   - 名称：`github-actions-sitemap`
   - 权限：Owner 或 Full

3. **生成私钥**
   - 格式：JSON
   - 下载并安全保存

4. **添加到 Search Console**
   - 复制服务账号邮箱
   - 在 Search Console 添加用户
   - 授予 Owner/Full 权限

### GitHub Secrets 配置

访问：https://github.com/Digidai/gtm-cookbook/settings/secrets/actions

**Secret 1: `GOOGLE_SERVICE_ACCOUNT_EMAIL`**
```
值：github-actions-sitemap@your-project-id.iam.gserviceaccount.com
```

**Secret 2: `GOOGLE_SERVICE_ACCOUNT_KEY`**
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "github-actions-sitemap@your-project-id.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}
```

### 调整提交频率

编辑 `.github/workflows/submit-sitemap.yml`:

```yaml
schedule:
  - cron: '0 2 * * 1'  # 每周一 02:00 UTC (10:00 CST)
```

**常见配置：**
- 每周一：`0 2 * * 1`
- 每周日：`0 2 * * 0`
- 每月 1 日：`0 2 1 * *`
- 每 6 小时：`0 */6 * * *`（不推荐，太频繁）

## 使用说明

### 本地验证

```bash
# 1. 构建网站（生成 sitemap）
npm run build

# 2. 验证 sitemap
npm run verify:sitemap
```

**输出示例：**
```
🗺️  Sitemap 验证和提交工具

============================================================
Sitemap 分析报告
============================================================

📁 文件路径: .../docs/.vitepress/dist/sitemap.xml
📊 文件大小: 12.34 KB
🔗 URL 总数: 42
📅 最新更新: 2024/12/30 10:00:00
📅 最早更新: 2024/12/01 08:00:00

📋 URL 类型分布:
   homepage: 1 (2.4%)
   module: 35 (83.3%)
   appendix: 6 (14.3%)

🔍 健康检查:
✅ 所有检查通过！
```

### 手动提交到 Google

如果 GitHub Actions 暂时无法使用，可以手动提交：

**方法 1: Search Console（推荐）**
1. 访问 https://search.google.com/search-console
2. 选择网站属性
3. 点击左侧 "索引" > "Sitemaps"
4. 输入：`https://genedai.space/sitemap.xml`
5. 点击 "提交"

**方法 2: HTTP Ping（备用）**
在浏览器中打开以下 URL：
```
https://www.google.com/ping?sitemap=https://genedai.space/sitemap.xml
```

### GitHub Actions 运行

**自动运行：**
- 每周一 10:00 CST
- 每次部署后

**手动运行：**
1. 访问 https://github.com/Digidai/gtm-cookbook/actions
2. 选择 "Submit Sitemap to Google"
3. 点击 "Run workflow" > "Run workflow"
4. 等待完成（通常 1-2 分钟）

**查看结果：**
- 点击具体的 workflow run
- 查看详细日志
- 查看 Summary（提交报告）

## 监控和调试

### 查看 Submission 状态

**1. GitHub Actions**
- ✅ 绿色勾号：提交成功
- ❌ 红色叉号：提交失败（查看日志）
- 📊 Summary：包含提交详情

**2. Google Search Console**
- 访问：https://search.google.com/search-console
- 进入："索引" > "Sitemaps"
- 查看："已提交的 sitemap" 列表
- 状态：
  - ✅ 成功：Google 已处理
  - ⏳ 处理中：正在处理
  - ❌ 失败：有错误（查看详情）

### 收录监控

**Coverage 报告：**
- 路径："索引" > "覆盖率"
- 查看：
  - 已编入索引的页面
  - 已排除的页面
  - 错误页面

**URL Inspection：**
- 输入具体 URL
- 查看索引状态
- "请求编入索引"（手动触发）

### 常见问题

<details>
<summary><b>Q: 提交成功但 Google 没有立即收录？</b></summary>

**A: 这是正常的。** 提交只是通知 Google 有新的 sitemap，实际索引需要时间：

- **新页面**：几天到几周
- **更新页面**：几小时到几天
- **影响因素**：
  - 网站权重（Domain Authority）
  - 内容质量
  - 抓取频率
  - 竞争程度

**建议**：
1. 定期更新高质量内容
2. 建立内部链接结构
3. 获取外部链接（backlinks）
4. 对重要页面使用 "请求编入索引"
</details>

<details>
<summary><b>Q: GitHub Actions 运行失败？</b></summary>

**A: 检查以下几点：**

1. **Google Cloud 配置**
   - [ ] Search Console API 已启用
   - [ ] 服务账号已创建
   - [ ] 私钥已生成

2. **Search Console 配置**
   - [ ] 服务账号已添加为用户
   - [ ] 权限为 Owner 或 Full
   - [ ] 网站属性已验证

3. **GitHub Secrets**
   - [ ] `GOOGLE_SERVICE_ACCOUNT_EMAIL` 已配置
   - [ ] `GOOGLE_SERVICE_ACCOUNT_KEY` 已配置
   - [ ] JSON 格式正确（包含所有字段）

4. **调试步骤**
   ```bash
   # 查看 workflow 日志
   # 在 GitHub Actions 页面点击失败的 run

   # 测试 Google API 连接
   curl -X POST \
     "https://www.googleapis.com/webmasters/v3/sites/YOUR_SITE_URL/sitemaps/SITEMAP_URL?access_token=YOUR_TOKEN"
   ```
</details>

<details>
<summary><b>Q: 如何提高收录速度？</b></summary>

**A: 多管齐下：**

1. **内容质量**
   - 原创高质量内容
   - 定期更新
   - 深度内容（1000+ 字）

2. **技术优化**
   - 页面加载速度 < 3 秒
   - 移动友好
   - HTTPS 启用
   - 结构化数据（JSON-LD）

3. **链接建设**
   - 内部链接：相关页面互相链接
   - 外部链接：获取高质量 backlinks
   - 社交媒体：分享到社交平台

4. **主动提交**
   - 定期提交 sitemap
   - 对新页面使用 "请求编入索引"
   - 在 Google 提交 URL（Search Console）

5. **监控优化**
   - 查看 Coverage 报告
   - 修复索引错误
   - 优化被排除的页面
</details>

<details>
<summary><b>Q: Sitemap 文件太大怎么办？</b></summary>

**A: Google 限制：**
- 单文件最大 50MB
- 单文件最多 50,000 URL

**解决方案：**
1. **拆分 sitemap**（VitePress 暂不支持）
2. **减少 URL 数量**：
   - 排除低质量页面
   - 使用 `noindex` 元标签
   - 检查 `robots.txt` 配置

3. **优化 sitemap**：
   ```typescript
   // VitePress 配置
   sitemap: {
     hostname: 'https://genedai.space',
     // 排除某些页面（需要自定义）
   }
   ```
</details>

## 最佳实践

### 1. 提交频率

**推荐：每周 1-2 次**
- ✅ 每周一上午
- ✅ 部署后立即提交
- ❌ 不要过于频繁（可能被限制）

### 2. 内容更新

**定期更新内容：**
- 每周 1-2 篇新文章
- 更新旧内容（保持新鲜度）
- 修复错误和过时信息

### 3. 质量优先

**内容质量 > 数量：**
- 原创内容
- 深度分析（1000+ 字）
- 实用价值
- 良好的排版

### 4. 监控和迭代

**定期检查：**
- 每月查看 Search Console
- 分析覆盖率报告
- 修复索引问题
- 优化低收录页面

### 5. 安全考虑

**保护 API 密钥：**
- ✅ 使用 GitHub Secrets
- ❌ 不要提交到仓库
- ✅ 定期轮换密钥（6-12 个月）
- ✅ 使用最小权限原则

## 相关文件

```
.
├── .github/
│   └── workflows/
│       └── submit-sitemap.yml      # GitHub Actions workflow
├── docs/
│   ├── .vitepress/
│   │   └── dist/
│   │       └── sitemap.xml         # 生成的 sitemap
│   └── GOOGLE-SEARCH-CONSOLE-SETUP.md  # 配置指南
├── scripts/
│   └── verify-sitemap.mjs          # Sitemap 验证工具
└── SEO-AUTOMATION.md               # 本文档
```

## 额外资源

### 官方文档

- [Google Search Console API](https://developers.google.com/webmaster-tools/search-console-api-original)
- [Sitemaps Protocol](https://www.sitemaps.org/protocol.html)
- [Search Console Help Center](https://support.google.com/webmasters/)

### 相关工具

- [Google Search Console](https://search.google.com/search-console)
- [Google Cloud Console](https://console.cloud.google.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

### 学习资源

- [Google SEO Starter Guide](https://developers.google.com/search/docs)
- [Technical SEO Guide](https://ahrefs.com/seo/glossary/technical-seo/)
- [Sitemaps Best Practices](https://www.sitemaps.org/protocol.html#sitemapFileLocation)

## 贡献

如果你有改进建议或发现问题：

1. 搜索现有 issues
2. 创建新 issue，描述问题或建议
3. Fork 并创建 PR

## 许可证

本项目采用 CC-BY-NC-SA-4.0 许可证。

---

**最后更新**: 2024-12-30
**维护者**: Digidai
**版本**: 1.0.0
