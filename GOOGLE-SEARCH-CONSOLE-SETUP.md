# Google Sitemap Submission Setup Guide

这个文档说明如何配置 Google Search Console API，使 GitHub Actions 能够自动提交 sitemap。

## 为什么需要这个设置？

GitHub Actions 通过 Google Search Console API 自动提交 sitemap，可以让 Google：
- 更快发现新页面和更新内容
- 提高索引效率
- 逐步提升网站收录率

## 配置步骤

### 1. 创建 Google Cloud 项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 记录项目 ID（后续需要使用）

### 2. 启用 Search Console API

1. 在 Google Cloud Console 中，进入 **APIs & Services** > **Library**
2. 搜索 "Search Console API"
3. 点击启用

### 3. 创建服务账号

1. 进入 **APIs & Services** > **Credentials**
2. 点击 **Create Credentials** > **Service Account**
3. 填写服务账号信息：
   - Name: `github-actions-sitemap`
   - Description: `GitHub Actions sitemap submission`
4. 点击 **Create and Continue**
5. 跳过权限设置（直接点击 Done）
6. 创建完成后，点击服务账号进入详情页

### 4. 生成私钥

1. 在服务账号详情页，切换到 **Keys** 标签
2. 点击 **Add Key** > **Create New Key**
3. 选择 **JSON** 格式
4. 点击 **Create** - 会自动下载 JSON 文件
5. **重要**: 安全保存这个 JSON 文件，后续需要配置到 GitHub Secrets

### 5. 添加服务账号到 Search Console

1. 打开 [Google Search Console](https://search.google.com/search-console)
2. 选择你的网站属性（https://genedai.space）
3. 点击左下角 **设置** > **用户和权限**
4. 点击 **添加用户**
5. 输入服务账号邮箱（格式：`xxx@xxx.iam.gserviceaccount.com`）
6. 权限选择 **Owner** 或 **Full**
7. 点击 **添加**

### 6. 配置 GitHub Secrets

1. 打开 GitHub 仓库：`https://github.com/Digidai/gtm-cookbook`
2. 进入 **Settings** > **Secrets and variables** > **Actions**
3. 添加以下 secrets：

   **Secret 1: `GOOGLE_SERVICE_ACCOUNT_EMAIL`**
   - 值：服务账号邮箱（从步骤 3 或 JSON 文件中获取）
   - 格式：`xxx@xxx.iam.gserviceaccount.com`

   **Secret 2: `GOOGLE_SERVICE_ACCOUNT_KEY`**
   - 值：步骤 4 下载的 JSON 文件的完整内容
   - 获取方式：打开 JSON 文件，复制全部内容
   - 注意：包括所有的大括号、引号、逗号等

### 7. 验证配置

1. 在 GitHub 仓库中，进入 **Actions** 标签
2. 选择 "Submit Sitemap to Google" workflow
3. 点击 **Run workflow** 手动测试
4. 查看运行结果，确认提交成功

## 配置示例

### GitHub Secrets 配置示例

**Secret 1: `GOOGLE_SERVICE_ACCOUNT_EMAIL`**
```
github-actions-sitemap@your-project-id.iam.gserviceaccount.com
```

**Secret 2: `GOOGLE_SERVICE_ACCOUNT_KEY`**
复制整个 JSON 文件内容（包括所有大括号、引号、逗号等）

## 工作流程说明

### 自动触发

新的 workflow 会在以下情况下自动运行：

1. **每周定期运行**：每周一凌晨 2:00 UTC（周一上午 10:00 CST）
2. **部署后运行**：每次成功部署到 GitHub Pages 或 Cloudflare 后
3. **手动运行**：在 GitHub Actions 页面手动触发

### 执行步骤

1. 检出代码并构建网站（生成最新的 sitemap）
2. 验证 sitemap 文件存在且有效
3. 向 Google Search Console API 提交 sitemap
4. 生成提交报告（在 GitHub Actions Summary 中查看）
5. 等待 Google 处理（通常几分钟到几小时）

## 监控和调试

### 查看 submission 状态

1. **GitHub Actions**:
   - 访问仓库的 Actions 标签
   - 查看 "Submit Sitemap to Google" workflow 的运行记录
   - 点击具体运行查看详细日志和 Summary

2. **Google Search Console**:
   - 访问 https://search.google.com/search-console
   - 进入 **索引** > **Sitemaps**
   - 查看 sitemap 的处理状态和收录情况

### 常见问题

**Q: 提交成功但 Google 没有立即收录？**
A: 这是正常的。提交只是通知 Google 有新的 sitemap，实际索引需要时间。通常：
- 新页面：几天到几周
- 更新页面：几小时到几天
- 受网站权重、内容质量、抓取频率影响

**Q: 如何提高收录速度？**
A:
1. 定期更新高质量内容
2. 保持良好的网站结构和内部链接
3. 提交 sitemap 后在 Search Console 使用 "请求编入索引"
4. 建立外部链接（backlinks）
5. 确保页面加载速度快

**Q: workflow 失败怎么办？**
A: 检查以下几点：
1. Google Cloud 项目是否启用了 Search Console API
2. 服务账号是否添加到 Search Console
3. GitHub Secrets 是否正确配置
4. 网站是否已在 Search Console 验证所有权

**Q: 可以修改提交频率吗？**
A: 可以。编辑 `.github/workflows/submit-sitemap.yml`，修改 cron 表达式：
```yaml
schedule:
  - cron: '0 2 * * 1'  # 每周一凌晨 2:00 UTC
```

Cron 格式：`分钟 小时 日 月 星期`
- `0 2 * * 1` - 每周一 02:00
- `0 2 * * 0` - 每周日 02:00
- `0 2 1 * *` - 每月 1 日 02:00
- `0 */6 * * *` - 每 6 小时

**注意**: 不要设置太频繁，避免被 Google 限制。建议每周 1-2 次即可。

## 安全建议

1. **不要提交私钥到仓库**: 永远不要将 JSON 私钥文件提交到 Git
2. **定期轮换密钥**: 建议每 6-12 个月重新生成一次服务账号密钥
3. **最小权限原则**: 只给服务账号必要的权限（Search Console 的 Owner 或 Full）
4. **监控使用情况**: 在 Google Cloud Console 监控 API 调用情况

## 相关资源

- [Google Search Console API Documentation](https://developers.google.com/webmaster-tools/search-console-api-original)
- [Google Cloud IAM Documentation](https://cloud.google.com/iam/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Sitemaps Protocol](https://www.sitemaps.org/protocol.html)

## 需要帮助？

如果遇到问题，请：
1. 查看 GitHub Actions 的运行日志
2. 检查 Google Search Console 的状态
3. 参考 Google Search Console API 文档
4. 提交 issue 到仓库
