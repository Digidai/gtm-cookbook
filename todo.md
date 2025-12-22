# Diagram to SVG Conversion

## Method
1) Inventory all code-fenced diagrams in `docs/` (box-drawing chars like `┌`/`│`, arrows, or ASCII layouts). Record each file and diagram count.
2) 手工逐个分析图示含义，重新设计为更清晰美观的 SVG：
   - 结构重排：突出层级、流程与重点信息。
   - 真实排版：使用统一字体、留白与色彩系统。
   - 可读性与可访问性：添加 `title`/`desc` 与清晰标签。
3) Save SVGs in `docs/images/` with names like `module-01-learning-path.svg`.
4) Replace the code fence with a Markdown image link using a relative path (e.g., `../images/...`).
5) Validate: ensure no diagram code fences remain and links resolve.

## Progress
- [x] docs/module-01/1.1-gtm-definition.md (3 diagrams -> SVG)
- [x] docs/module-01/index.md (learning path -> SVG)
- [x] docs/agent.md
- [x] docs/appendix/glossary.md
- [x] docs/module-01/1.4-gtm-core-questions.md
- [x] docs/module-02/index.md
- [x] docs/module-02/2.1-crossing-the-chasm.md
- [x] docs/module-02/2.2-gtm-motions.md
- [x] docs/module-02/2.3-icp-methodology.md
- [x] docs/module-02/2.4-value-proposition.md
- [x] docs/module-02/2.5-positioning.md
- [x] docs/module-03/index.md
- [x] docs/module-03/3.1-channel-strategy.md
- [x] docs/module-03/3.2-pricing-strategy.md
- [x] docs/module-03/3.3-sales-marketing-alignment.md
- [x] docs/module-03/3.4-metrics.md
- [x] docs/module-03/3.5-revops.md
- [x] docs/module-04/index.md
- [x] docs/module-04/4.1-plg-cases.md
- [x] docs/module-04/4.2-slg-cases.md
- [x] docs/module-04/4.3-chasm-cases.md
- [x] docs/module-04/4.4-ai-gtm.md
- [x] docs/module-05/5.1-strategy-template.md
- [x] docs/module-05/5.2-icp-worksheet.md
- [x] docs/module-05/5.3-competitive-matrix.md
- [x] docs/module-05/5.4-funnel-checklist.md
- [x] docs/module-05/5.5-milestone-plan.md
- [x] docs/module-05/5.6-tool-stack.md
- [x] docs/module-05/5.7-value-proposition-worksheet.md
