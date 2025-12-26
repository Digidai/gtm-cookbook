<p align="center">
  <img src="docs/public/og-cover.png" alt="GTM Cookbook - Go-To-Market 完整实战手册" width="100%">
</p>

<h1 align="center">GTM Cookbook</h1>

<p align="center">
  <strong>专为创业者、产品经理和增长负责人打造的 Go-To-Market 实战百科全书</strong><br>
  从战略认知到落地执行，系统掌握市场进入的核心方法论
</p>

<p align="center">
  <a href="https://genedai.space">在线阅读 (Online)</a> •
  <a href="#english">English</a> •
  <a href="#中文">中文</a>
</p>

<p align="center">
  <a href="https://github.com/Digidai/gtm-cookbook/actions/workflows/ci.yml"><img src="https://github.com/Digidai/gtm-cookbook/actions/workflows/ci.yml/badge.svg" alt="CI Status"></a>
  <a href="https://github.com/Digidai/gtm-cookbook/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-CC--BY--NC--SA--4.0-blue.svg?style=flat-square" alt="License"></a>
  <a href="https://github.com/Digidai/gtm-cookbook/stargazers"><img src="https://img.shields.io/github/stars/Digidai/gtm-cookbook?style=flat-square&logo=github&color=yellow" alt="Stars"></a>
  <img src="https://img.shields.io/badge/VitePress-v1.5.0-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Built with VitePress">
  <a href="https://github.com/Digidai/gtm-cookbook/issues"><img src="https://img.shields.io/github/issues/Digidai/gtm-cookbook?style=flat-square" alt="Issues"></a>
</p>

---

## 💡 为什么需要这份手册？

> **GTM（Go-To-Market）不仅是营销计划，更是产品成功的操作系统。**

很多团队在达到"产品-市场匹配"（PMF）后陷入增长瓶颈，往往是因为缺乏系统的市场进入策略。这份手册旨在解决以下痛点：
- ❌ **概念混淆**：分不清 PLG、SLG、集客营销的区别
- ❌ **执行脱节**：战略停留在 PPT，无法转化为销售和市场的具体动作
- ❌ **缺乏工具**：知道要做 ICP 和定位，但没有可用的模板和框架

**GTM Cookbook 提供了一套经过验证的"导航系统"：**

- 🧭 **30 年方法论精华**：融合《跨越鸿沟》、PLG、ICP、定位理论等经典框架
- 🛠️ **即插即用工具包**：提供战略模板、检查表、计算器等实战工具
- 🌏 **中美双重视角**：深度解析 Slack、Notion、飞书、北森等标杆案例

---

## 📚 内容全景

本手册包含 **5 大核心模块**，总计 **13 小时** 的系统化学习内容：

| 模块 | 主题 | 核心解决问题 | 关键工具/概念 |
|:---:|------|--------------|---------------|
| **01** | **GTM 基础认知** | GTM 到底是什么？为什么现在需要它？ | 核心四问、战略全景图 |
| **02** | **核心方法论** | 如何跨越鸿沟？如何选择增长模式？ | 技术采纳曲线、PLG vs SLG、ICP 7标准 |
| **03** | **执行体系** | 渠道怎么选？定价怎么定？团队怎么建？ | 渠道矩阵、定价模型、RevOps |
| **04** | **实战案例** | 别人是怎么成功的？有哪些坑？ | Slack 增长飞轮、Figma 社区、SaaS 转型 |
| **05** | **工具包** | 如何快速落地？如何统一团队认知？ | **[👉 7套实战模板](./docs/module-05/index.md)** |

---

## ✨ 项目亮点

- **🎨 极致阅读体验**：基于 VitePress 构建，支持暗黑模式、全局搜索、响应式布局。
- **📊 249+ 可视化图表**：将晦涩的理论转化为直观的 SVG 图表，一图胜千言。
- **🧮 交互式工具**：内置 [CAC 回收期计算器](./docs/module-05/5.6-tool-stack.md#cac-calculator-demo) 等实用小组件。
- **📥 导出友好**：支持生成 PDF 电子书（详见下文）。

---

## 🚀 快速开始

### 方式一：在线阅读（推荐）
访问 **[genedai.space](https://genedai.space)** 获得最佳阅读体验。

### 方式二：本地运行
如果你想在本地离线阅读或进行二次开发：

```bash
# 1. 克隆项目
git clone https://github.com/Digidai/gtm-cookbook.git
cd gtm-cookbook

# 2. 安装依赖
npm install

# 3. 启动本地服务
npm run dev
```
访问 `http://localhost:5173` 即可。

### 方式三：导出 PDF 电子书
你需要先安装 `puppeteer`：

```bash
npm install puppeteer --save-dev
npm run export:pdf
```
这将在根目录生成 `GTM-Cookbook.pdf`。

---

## 🗺️ 学习路径建议

- **产品经理**：重点阅读 [模块二（方法论）](./docs/module-02/index.md) 和 [模块五（工具）](./docs/module-05/index.md)。
- **市场/增长**：建议通读全书，特别是 [模块三（执行）](./docs/module-03/index.md)。
- **销售负责人**：关注 [2.2 GTM Motion](./docs/module-02/2.2-gtm-motions.md) 和 [3.3 销售对齐](./docs/module-03/3.3-sales-marketing-alignment.md)。
- **创业者**：请从 [1.1 定义](./docs/module-01/1.1-gtm-definition.md) 开始，系统构建你的 GTM 认知。

---

## 🤝 参与贡献

GTM Cookbook 是一个开源知识项目，我们非常欢迎你的贡献！无论是修正错别字、补充新案例，还是分享你的实战经验。

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

详情请参阅 [CONTRIBUTING.md](CONTRIBUTING.md)。

### 贡献者墙

感谢这些伙伴的付出：

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Digidai"><img src="https://avatars.githubusercontent.com/Digidai?v=4?s=80" width="80px;" alt="Digidai"/><br /><sub><b>Digidai</b></sub></a><br /><a href="#content-Digidai" title="Content">🖋</a> <a href="https://github.com/Digidai/gtm-cookbook/commits?author=Digidai" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

---

## 📜 协议

本项目内容采用 [CC BY-NC-SA 4.0](LICENSE) 协议授权。
代码部分采用 MIT 协议。

---

<a id="english"></a>

## 🇬🇧 English Introduction

**GTM Cookbook** is a comprehensive guide designed for startups and product teams to master Go-To-Market strategies. 

It covers everything from **Product-Market Fit** validation to **Scaling**, integrating classic frameworks like *Crossing the Chasm* and *Product-Led Growth* into actionable playbooks.

**Key Features:**
- 📚 **Systematic Curriculum**: 5 modules, 13+ hours of reading time.
- 🛠️ **Actionable Toolkits**: Ready-to-use templates for ICP, Positioning, and Strategy.
- 📊 **Rich Visuals**: Over 200 SVG diagrams explaining complex concepts.
- 🚀 **Modern Tech Stack**: Built with VitePress, supporting Dark Mode and Full-text Search.

**Read Online**: [genedai.space](https://genedai.space)

---

<p align="center">
  <sub>Made with ❤️ by the GTM Cookbook Team</sub>
</p>