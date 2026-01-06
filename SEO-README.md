# SEO 自动化系统 - 快速开始

这是一个自动化的 Sitemap 提交系统，用于定期向 Google 提交网站地图，提高页面收录率。

## ✅ 已完成的工作

1. ✅ **GitHub Actions Workflow** - 自动每周提交 sitemap 到 Google
2. ✅ **Sitemap 验证工具** - 本地验证和分析 sitemap
3. ✅ **完整配置文档** - 详细的设置指南
4. ✅ **测试验证** - sitemap 生成正常(37 个 URL)

## 📁 新增文件

```
.
├── .github/workflows/
│   └── submit-sitemap.yml           # GitHub Actions 自动提交流程
├── scripts/
│   └── verify-sitemap.mjs           # Sitemap 验证和分析工具
├── GOOGLE-SEARCH-CONSOLE-SETUP.md   # Google API 配置指南
└── SEO-AUTOMATION.md                # 完整系统文档
```

## 🚀 下一步操作

### 1. 配置 Google Search Console API（5 分钟）

这是启用自动提交的**必需步骤**。

```bash
# 打开配置指南
open GOOGLE-SEARCH-CONSOLE-SETUP.md
```

**快速步骤：**
1. 创建 Google Cloud 项目
2. 启用 Search Console API
3. 创建服务账号并生成私钥
4. 在 Search Console 添加服务账号用户
5. 配置 GitHub Secrets

### 2. 测试验证

```bash
# 本地验证 sitemap
npm run verify:sitemap

# 输出：
# ✅ Sitemap 已生成 (4.27 KB, 37 URLs)
# ✅ 所有检查通过
```

### 3. 手动提交测试（可选）

在配置完成前，可以手动提交 sitemap：

**方法 1: Search Console**
1. 访问 https://search.google.com/search-console
2. 索引 > Sitemaps
3. 输入: `https://genedai.space/sitemap.xml`

**方法 2: HTTP Ping**
```
https://www.google.com/ping?sitemap=https://genedai.space/sitemap.xml
```

## 🔄 自动化流程

配置完成后，系统将自动运行：

```
每周一上午 10:00 CST ─────┐
每次部署后 ────────────────┤──► 构建网站 ──► 提交到 Google ──► 生成报告
手动触发 ──────────────────┘
```

**查看运行状态：**
```
https://github.com/Digidai/gtm-cookbook/actions
```

## 📊 当前状态

- **Sitemap URL**: https://genedai.space/sitemap.xml
- **URL 数量**: 37
- **文件大小**: 4.27 KB
- **生成状态**: ✅ 正常

**URL 分布：**
- 模块页面: 30 (81.1%)
- 附录页面: 4 (10.8%)
- 其他页面: 3 (8.1%)

## 📚 详细文档

- **完整系统文档**: [SEO-AUTOMATION.md](SEO-AUTOMATION.md)
- **配置指南**: [GOOGLE-SEARCH-CONSOLE-SETUP.md](GOOGLE-SEARCH-CONSOLE-SETUP.md)

## ⚙️ 可用命令

```bash
# 构建并生成 sitemap
npm run build

# 验证 sitemap
npm run verify:sitemap

# 本地开发
npm run dev
```

## 💡 收录优化建议

1. **内容质量**: 定期更新高质量原创内容
2. **提交频率**: 已配置每周自动提交
3. **内部链接**: 保持良好的网站结构
4. **外部链接**: 获取高质量 backlinks
5. **监控状态**: 在 Search Console 查看覆盖率报告

## 🔧 故障排查

如果 workflow 运行失败，检查：
- [ ] Google Cloud Console 中启用了 Search Console API
- [ ] 服务账号已添加到 Search Console
- [ ] GitHub Secrets 配置正确
- [ ] 网站已在 Search Console 验证所有权

详细信息请参考 [GOOGLE-SEARCH-CONSOLE-SETUP.md](GOOGLE-SEARCH-CONSOLE-SETUP.md) 的常见问题部分。

---

**创建时间**: 2024-12-30
**维护者**: Digidai
