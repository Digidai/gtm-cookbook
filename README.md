# GTM（Go-to-Market）专业培训材料

## 项目概述

本项目是一套完整的 GTM（Go-to-Market）专业培训材料，涵盖五大模块和实战工具包，总培训时长约 13 小时。

## 快速开始

### 写作者指南
**开始写作前，请先阅读 [agent.md](./agent.md)**

`agent.md` 包含：
- 写作流程与规范
- 项目结构说明
- 写作进度追踪
- 关键概念速查

### 快速命令
```
请阅读 agent.md，然后开始写作 [文件名]
```

## 部署到 GitHub Pages

本项目是 VitePress 静态站点，已提供 GitHub Actions 工作流 `./.github/workflows/deploy-gh-pages.yml`。

### 从头部署
1. 新建 GitHub 仓库并推送代码（默认分支为 `main`）。
2. GitHub → Settings → Pages → Source 选择 `GitHub Actions`。
3. 推送后自动触发构建与发布。

### 项目站点 vs 用户/组织站点
- 项目站点（`https://<user>.github.io/<repo>/`）：工作流已设置 `VITEPRESS_BASE=/<repo>/`。
- 用户/组织站点（`https://<user>.github.io/`）：将工作流中的 `VITEPRESS_BASE` 改为 `/`。

本地验证示例（项目站点）：
```
VITEPRESS_BASE=/你的仓库名/ npm run build
```

## 部署到 Cloudflare Pages

已包含 `wrangler.toml` 和 `wrangler.pages.json`，输出目录为 `.vitepress/dist`。

### 从头部署（Cloudflare Dashboard）
1. Cloudflare → Pages → Create a project → 连接 Git 仓库。
2. Build command：`npm ci && npm run build`
3. Build output directory：`.vitepress/dist`
4. 环境变量（可选）：`VITEPRESS_BASE=/` 或 `VITEPRESS_BASE=/子路径/`

### 使用 Wrangler 部署
1. 登录：`npx wrangler login`
2. 构建：`npm run build`
3. 部署：`npx wrangler pages deploy .vitepress/dist --project-name gtm-cookbook`

### 绑定自定义域名
1. 确保域名已托管到 Cloudflare DNS。
2. Cloudflare → Pages → 选择项目 → Custom Domains → 添加域名（如 `docs.example.com`）。

## 项目结构

```
GTM/
├── agent.md          # 写作管理指南（核心文件）
├── README.md         # 本文件
│
├── module-01/        # 模块一：GTM 基础认知与战略意义
├── module-02/        # 模块二：GTM 核心方法论与框架
├── module-03/        # 模块三：GTM 执行体系与运营
├── module-04/        # 模块四：GTM 实战案例深度解析
├── module-05/        # 模块五：GTM 执行工具包
│
└── appendix/         # 附录：术语表、推荐阅读、参考资源
```

## 模块概览

| 模块 | 主题 | 时长 | 教学方式 |
|------|------|------|----------|
| 模块一 | GTM 基础认知与战略意义 | 2小时 | 讲授+讨论 |
| 模块二 | GTM 核心方法论与框架 | 4小时 | 讲授+案例分析 |
| 模块三 | GTM 执行体系与运营 | 3小时 | 讲授+工具演示 |
| 模块四 | GTM 实战案例深度解析 | 2小时 | 案例研讨 |
| 模块五 | GTM 执行工具包 | 2小时 | 工作坊 |

## 目标读者

- 产品经理
- 市场营销人员
- 销售团队
- 创业者
- 企业战略人员

## 核心内容

### 核心框架
- Geoffrey Moore 跨越鸿沟理论
- GTM Motion（PLG/SLG/MLG/CLG/Hybrid）
- ICP 构建方法论
- 价值主张画布
- April Dunford 定位公式

### 实战工具
- GTM 战略规划模板
- ICP 定义工作表
- 竞争定位矩阵
- 漏斗诊断检查表
- GTM 里程碑规划表

## 当前进度

详见 [agent.md](./agent.md) 中的"写作进度追踪"章节。

## 贡献指南

1. 阅读 `agent.md` 了解写作规范
2. 选择待写作的章节
3. 按照文档模板撰写内容
4. 更新 `agent.md` 中的进度状态

## 案例资源

本培训材料包含丰富的中美两地案例，帮助学员全面理解 GTM 最佳实践：

### 美国标杆案例

| 模块 | 美国案例 |
|------|----------|
| 模块二 | Slack、Datadog、Stripe、Figma 的 ICP 演进 |
| 模块三 | HubSpot Smarketing、Salesforce ABM、Drift 实时对齐 |
| 模块三 | Datadog NRR 130%+、Snowflake Consumption、Okta 上移市场、Zoom Rule of 40 |
| 模块三 | Stripe 数据驱动 RevOps、Notion PLG RevOps、HubSpot RevOps 组织 |
| 模块四 | Slack PLG、Salesforce SLG、HubSpot 跨越鸿沟 |

### 中国本土案例

| 模块 | 中国案例 |
|------|----------|
| 模块二 | 飞书定位战略、纷享销客价值主张、有赞 ICP 演进 |
| 模块三 | 纷享销客对齐实践、北森 NRR 提升、销售易 RevOps |
| 模块三 | 阿里云渠道生态、有赞定价演进、中国 SaaS 指标基准 |
| 模块四 | 飞书 PLG 增长、北森企业级 SLG、有赞跨越鸿沟 |
| 模块五 | 中国本土 GTM 工具栈（销售易、纷享销客、探迹等） |

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v0.1 | 2024-12-06 | 项目结构初始化，创建所有章节骨架 |
| v1.0 | 2024-12-07 | 全部模块初稿完成 |
| v1.1 | 2024-12-07 | 审校完成，增加中国本土案例 |
| v1.2 | 2024-12-07 | 增加美国标杆案例，内容校验完成 |

---

**项目维护者**：[待填写]
**最后更新**：2024-12-07
