# 贡献指南

感谢你对 GTM Playbook 的关注！我们欢迎各种形式的贡献。

## 贡献方式

### 1. 报告问题

如果你发现了错误或有改进建议：

1. 检查 [Issues](https://github.com/daidai2025/GTM/issues) 中是否已有类似问题
2. 如果没有，创建一个新的 Issue，包含：
   - 清晰的标题
   - 详细描述（包括截图或链接）
   - 期望的改进方向

### 2. 改进内容

#### 内容类型

| 类型 | 说明 | 优先级 |
|------|------|--------|
| 错误修复 | 修正拼写、语法、事实错误 | 高 |
| 案例补充 | 添加中美两地新案例 | 高 |
| 内容扩展 | 深化现有章节内容 | 中 |
| 工具模板 | 优化或新增工具模板 | 中 |
| 翻译 | 英文版本翻译 | 中 |

#### 内容规范

参考 [docs/agent.md](docs/agent.md) 中的写作规范：

- 每个章节包含：学习目标、核心内容、关键要点、实践练习、延伸阅读
- 使用 SVG 替代 ASCII 图表
- 保持术语一致性（参考术语表）

### 3. 提交 PR

```bash
# 1. Fork 仓库并克隆到本地
git clone https://github.com/YOUR_USERNAME/GTM.git
cd GTM

# 2. 创建功能分支
git checkout -b feature/your-feature-name

# 3. 安装依赖并启动本地预览
npm install
npm run dev

# 4. 完成修改后提交
git add .
git commit -m "feat: 添加 xxx 功能"

# 5. 推送并创建 PR
git push origin feature/your-feature-name
```

### Commit 规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

| 类型 | 说明 |
|------|------|
| `feat` | 新增内容或功能 |
| `fix` | 修复错误 |
| `docs` | 文档修改 |
| `style` | 格式调整（不影响内容） |
| `refactor` | 重构（无新功能，无修复） |
| `chore` | 构建或辅助工具变动 |

示例：
```
feat: 添加飞书 PLG 案例分析
fix: 修正术语表中 CAC 公式错误
docs: 完善模块三执行体系内容
```

## 项目结构

```
docs/
├── module-01/         # 模块一：基础认知
├── module-02/         # 模块二：核心方法论
├── module-03/         # 模块三：执行体系
├── module-04/         # 模块四：实战案例
├── module-05/         # 模块五：工具包
├── appendix/          # 附录
├── images/            # SVG 图表
└── public/            # 静态资源
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 审核流程

1. 提交 PR 后，维护者会在 3-5 个工作日内审核
2. 如需修改，会在 PR 中评论说明
3. 审核通过后合并到 main 分支
4. 自动部署到线上

## 问题讨论

- 一般问题：[GitHub Discussions](https://github.com/daidai2025/GTM/discussions)
- 紧急问题：[GitHub Issues](https://github.com/daidai2025/GTM/issues)

## 致谢

感谢所有贡献者！你的每一个 Star、Issue、PR 都是对项目的支持。

---

**注意**：提交贡献即表示你同意以 [CC BY-NC-SA 4.0](LICENSE) 协议授权你的贡献。
