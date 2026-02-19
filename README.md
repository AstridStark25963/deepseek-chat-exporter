# DeepSeek Chat Exporter

一个专为 DeepSeek 打造的极简、高保真对话导出工具。基于 DOM 解析技术，只需点击一下，即可将整段对话（包括深度思考、联网搜索结果）转换为排版精美的 Markdown 文档。

## ✨ 核心特性

* **🧠 深度思考适配 (DeepThinking)**：完美支持 DeepSeek R1 模型的思考过程。
  * 自动将思考内容格式化为 `> 💭 **DeepThinking...**` 引用块，既保留思维链细节，又与正文清晰分隔。
* **🌐 联网搜索整合 (DeepSearch)**：智能提取联网搜索模块。
  * 将 "Read X web pages" 等搜索元数据格式化为引用块，保留信息来源概览。
* **🔗 智能引用优化**：
  * **精准链接**：将网页端的角标引用（如 `[1]`）自动转换为标准的 Markdown 超链接 `[1](url)`，支持点击直达原始来源。
  * **排版优化**：自动检测并修复相邻引用间的间距（如将 `[1][2]` 优化为 `[1] [2]`），提升阅读体验。
* **💻 代码块清洗**：基于 DOM 的深度清洗，自动移除代码块头部冗余的 "Copy"、"Download" 按钮文本，仅保留纯净代码和语言标记。
* **🧮 完美数学公式**：利用 KaTeX 解析机制，精准还原 LaTeX 公式，无论是行内公式还是独立公式块，均可在 Typora/Obsidian 中完美渲染。
* **🎨 极简交互**：右下角悬浮圆形图标（DeepSeek 品牌蓝），鼠标悬停时伴有丝滑放大及阴影动效，点击即刻导出。
* **📅 精准命名**：自动提取对话标题并附加秒级时间戳（`YYYYMMDD_HHmmss`），彻底杜绝文件名冲突。
* **📊 深度表格还原**：支持复杂表格结构导出，保留表头与单元格对齐格式。

## 📸 效果演示

UI展示：

![UI 展示](https://cdn.jsdelivr.net/gh/AstridStark25963/ImageHosting@main/image/image-20260219091836271.png)

导出效果展示：

![导出效果展示1](https://cdn.jsdelivr.net/gh/AstridStark25963/ImageHosting@main/image/image-20260219091650933.png)
![导出效果展示2](https://cdn.jsdelivr.net/gh/AstridStark25963/ImageHosting@main/image/image-20260219091735633.png)
![导出效果展示3](https://cdn.jsdelivr.net/gh/AstridStark25963/ImageHosting@main/image/image-20260219091807320.png)

## 🛠️ 安装说明

### 前置要求

确保你的浏览器已安装以下任意一个用户脚本管理器：

* [Tampermonkey (推荐)](https://www.tampermonkey.net/)
* [Violentmonkey](https://violentmonkey.github.io/)

### 安装链接

点击下方链接进入 Greasy Fork 页面进行一键安装：
👉 **[安装 DeepSeek Chat Exporter](https://greasyfork.org/scripts/566716-deepseek-chat-exporter)**
*(请在发布脚本后替换此链接)*

## 📖 导出规范

导出的 Markdown 文档遵循以下结构：

* `# 对话标题` (文件首行)
* `## 👤 User` (用户输入内容)
* `## 🤖 DeepSeek` (AI 生成内容)
  * `> 🌐 **DeepSearch:**` (如包含联网搜索结果)
  * `> 💭 **DeepThinking...**` (如包含深度思考过程)
* `---` (每轮对话间的分隔线)

## 🔗 相关链接

* **GitHub 仓库**: [AstridStark25963/deepseek-chat-exporter](https://github.com/AstridStark25963/deepseek-chat-exporter)
* **问题反馈**: [Issues 页面](https://www.google.com/search?q=https://github.com/AstridStark25963/deepseek-chat-exporter/issues)
* **脚本发布页**: [Greasy Fork](https://greasyfork.org/scripts/566716-deepseek-chat-exporter)

## ⚖️ 许可证

本项目基于 **MIT License** 协议开源。
