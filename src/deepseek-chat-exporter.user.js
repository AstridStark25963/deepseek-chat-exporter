// ==UserScript==
// @name                 DeepSeek Chat Exporter
// @name:zh-CN           DeepSeek 对话导出工具
// @description          Export DeepSeek chat to Markdown with accurate formatting, including code blocks, tables, and math formulas.
// @description:zh-CN    深度优化排版，高保真还原 DeepSeek 聊天的标题、代码块、表格和公式。
// @namespace            https://github.com/AstridStark25963/deepseek-chat-exporter
// @version              1.0.0
// @author               AstridStark25963
// @license              MIT
// @icon                 data:image/svg+xml;base64,PHN2
// @match                https://chat.deepseek.com/*
// @run-at               document-idle
// @grant                none
// @updateURL            https://raw.githubusercontent.com/AstridStark25963/deepseek-chat-exporter/main/src/deepseek-chat-exporter.user.js
// @downloadURL          https://raw.githubusercontent.com/AstridStark25963/deepseek-chat-exporter/main/src/deepseek-chat-exporter.user.js
// ==/UserScript==

(function() {
    'use strict';

    const style = document.createElement('style');
    style.innerHTML = `
        #ds-export-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: #4d6bfe;
            color: white;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(77, 107, 254, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        #ds-export-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 16px rgba(77, 107, 254, 0.5);
            background-color: #3d5be0;
        }

        #ds-export-btn:active {
            transform: scale(0.95);
        }

        .ds-export-icon {
            width: 24px;
            height: 24px;
            fill: none;
            stroke: currentColor;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
        }
    `;
    document.head.appendChild(style);

    class DOMToMarkdown {
        constructor() {}

        convert(element) {
            return this._traverse(element).trim();
        }

        _isCitationLink(node) {
            if (!node || node.nodeType !== Node.ELEMENT_NODE) return false;
            if (node.classList.contains('ds-markdown-cite')) return true;
            if (node.tagName.toLowerCase() === 'a' && node.querySelector('.ds-markdown-cite')) return true;
            return false;
        }

        _traverse(node) {
            if (!node) return "";
            if (node.nodeType === Node.TEXT_NODE) return node.textContent;
            if (node.nodeType === Node.ELEMENT_NODE) {
                const tagName = node.tagName.toLowerCase();

                if (node.classList.contains('ds-markdown-cite')) {
                    const num = node.textContent.replace(/[^0-9]/g, '');
                    if (tagName === 'a') {
                        const url = node.getAttribute('href') || '';
                        return `[${num}](${url})`;
                    }
                    return num;
                }

                if (node.classList.contains('md-code-block')) return this._processCodeBlock(node);
                if (node.classList.contains('katex-display') || node.classList.contains('katex')) return this._processMath(node);

                if (node.classList.contains('ds-icon-button') ||
                    node.classList.contains('ds-atom-button') ||
                    node.style.display === 'none' ||
                    node.classList.contains('ds-icon')) {
                    return "";
                }

                let content = "";
                const children = Array.from(node.childNodes);
                children.forEach((child, index) => {
                    if (index > 0) {
                        const prev = children[index - 1];
                        if (this._isCitationLink(child) && this._isCitationLink(prev)) {
                            content += " ";
                        }
                    }
                    content += this._traverse(child);
                });

                switch (tagName) {
                    case 'h1': return `# ${content}\n\n`;
                    case 'h2': return `## ${content}\n\n`;
                    case 'h3': return `### ${content}\n\n`;
                    case 'h4': return `#### ${content}\n\n`;
                    case 'h5': return `##### ${content}\n\n`;
                    case 'h6': return `###### ${content}\n\n`;
                    case 'p': return `${content}\n\n`;
                    case 'br': return `\n`;
                    case 'hr': return `\n---\n\n`;
                    case 'strong': case 'b': return `**${content}**`;
                    case 'em': case 'i': return `*${content}*`;
                    case 'del': case 's': return `~~${content}~~`;
                    case 'code': return `\`${content}\``;
                    case 'blockquote': return content.split('\n').map(l => l.trim() ? `> ${l}` : '>').join('\n') + '\n\n';
                    case 'ul': return this._processList(node, false);
                    case 'ol': return this._processList(node, true);
                    case 'li': return content;
                    case 'a': return `[${content}](${node.getAttribute('href') || ''})`;
                    case 'img': return `![${node.getAttribute('alt') || 'image'}](${node.getAttribute('src')})`;
                    case 'table': return this._processTable(node);
                    case 'tbody': case 'thead': case 'tr': case 'td': case 'th': return content;
                    default: return content;
                }
            }
            return "";
        }

        _processCodeBlock(node) {
            let lang = "";
            const banner = node.querySelector('.md-code-block-banner-wrap');
            if (banner) {
                const clone = banner.cloneNode(true);
                clone.querySelectorAll('button').forEach(btn => btn.remove());
                lang = clone.textContent.trim().toLowerCase();
            }
            const pre = node.querySelector('pre');
            const code = pre ? pre.textContent : "";
            return `\n\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
        }

        _processMath(node) {
            const annotation = node.querySelector('annotation[encoding="application/x-tex"]');
            if (annotation) {
                const tex = annotation.textContent;
                const isDisplay = node.classList.contains('katex-display') || node.tagName.toLowerCase() === 'div';
                return isDisplay ? `\n$$${tex}$$\n` : `$${tex}$`;
            }
            return node.textContent;
        }

        _processList(node, isOrdered) {
            let markdown = "";
            const items = Array.from(node.children).filter(n => n.tagName.toLowerCase() === 'li');
            items.forEach((li, index) => {
                let liContent = "";
                const liChildren = Array.from(li.childNodes);
                liChildren.forEach((child, i) => {
                     if (i > 0) {
                        const prev = liChildren[i - 1];
                        if (this._isCitationLink(child) && this._isCitationLink(prev)) liContent += " ";
                    }
                    liContent += this._traverse(child);
                });
                const finalContent = liContent.split('\n').map((l, i) => i === 0 ? l : `    ${l}`).join('\n');
                const prefix = isOrdered ? `${index + 1}.` : `*`;
                markdown += `${prefix} ${finalContent.trim()}\n`;
            });
            return markdown + '\n';
        }

        _processTable(node) {
            const rows = Array.from(node.querySelectorAll('tr'));
            if (rows.length === 0) return "";
            let markdown = "\n";
            const headerCells = Array.from(rows[0].querySelectorAll('th, td'));
            const headers = headerCells.map(c => this._traverse(c).trim());
            markdown += `| ${headers.join(' | ')} |\n`;
            markdown += `| ${headers.map(() => '---').join(' | ')} |\n`;
            for (let i = 1; i < rows.length; i++) {
                const cells = Array.from(rows[i].querySelectorAll('td, th'));
                const rowData = cells.map(c => this._traverse(c).replace(/\n/g, '<br>').trim());
                markdown += `| ${rowData.join(' | ')} |\n`;
            }
            return markdown + "\n";
        }
    }

    class DeepseekParser {
        constructor() {
            this.selectors = {
                messageBubble: '.ds-message',
                aiContent: '.ds-markdown',
                thinkContent: '.ds-think-content',
            };
            this.converter = new DOMToMarkdown();
        }

        getChatTitle() {
            return document.title.replace(' - DeepSeek', '').trim() || 'DeepSeek_Chat';
        }

        getAllMessages() {
            const nodes = document.querySelectorAll(this.selectors.messageBubble);
            const messages = [];

            nodes.forEach(node => {
                const aiContent = node.querySelector(this.selectors.aiContent);

                if (aiContent) {
                    let finalMarkdown = "";

                    const searchNode = Array.from(node.querySelectorAll('div')).find(div => {
                         return div.innerText && div.innerText.includes('Read') && div.innerText.includes('web pages') && div.querySelector('.ds-icon');
                    });
                    if (searchNode && !finalMarkdown.includes('DeepSearch')) {
                        const textSpan = Array.from(searchNode.querySelectorAll('span')).find(s => s.innerText.includes('web pages'));
                        const searchText = textSpan ? textSpan.innerText : "Search Results";
                        finalMarkdown += `> 🌐 **DeepSearch:** ${searchText}\n>\n\n`;
                    }

                    const thinkNode = node.querySelector(this.selectors.thinkContent);
                    if (thinkNode) {
                        const thinkMarkdownNode = thinkNode.querySelector('.ds-markdown');
                        if (thinkMarkdownNode) {
                            const rawThought = this.converter.convert(thinkMarkdownNode);
                            finalMarkdown += `> 💭 **DeepThinking...**\n>\n`;
                            finalMarkdown += rawThought.split('\n').map(line => `> ${line}`).join('\n');
                            finalMarkdown += `\n\n---\n\n`;
                        }
                    }

                    const allMarkdownNodes = Array.from(node.querySelectorAll(this.selectors.aiContent));
                    const contentNode = allMarkdownNodes.find(n => !n.closest(this.selectors.thinkContent));

                    if (contentNode) {
                        finalMarkdown += this.converter.convert(contentNode);
                    }

                    messages.push({ role: 'DeepSeek', content: finalMarkdown });

                } else {
                    messages.push({ role: 'User', content: node.innerText.trim() });
                }
            });

            return messages;
        }
    }

    class ExporterUI {
        constructor() {
            this.parser = new DeepseekParser();
            this.initButton();
        }

        initButton() {
            if (document.getElementById('ds-export-btn')) return;
            const btn = document.createElement('button');
            btn.id = 'ds-export-btn';

            btn.innerHTML = `<svg class="ds-export-icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>`;

            btn.title = "Export Chat to Markdown";

            btn.onclick = () => this.exportChat();
            document.body.appendChild(btn);
        }

        async exportChat() {
            const messages = this.parser.getAllMessages();
            if (messages.length === 0) {
                alert('未找到对话记录，请确保页面已加载完毕。');
                return;
            }

            const title = this.parser.getChatTitle();
            let markdown = `# ${title}\n\n`;

            messages.forEach((msg, index) => {
                const roleTitle = msg.role === 'DeepSeek' ? '🤖 DeepSeek' : '👤 User';
                markdown += `## ${roleTitle}\n\n`;
                markdown += `${msg.content}\n\n`;

                if (msg.role === 'DeepSeek' && index < messages.length - 1) {
                    markdown += `---\n\n`;
                }
            });

            this.downloadFile(markdown, title);
        }

        downloadFile(content, title) {
            const now = new Date();
            const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
            const safeTitle = title.replace(/[\\/:*?"<>|]/g, '_').substring(0, 50);
            const filename = `${safeTitle}_${timestamp}.md`;
            const blob = new Blob([content], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    setTimeout(() => {
        new ExporterUI();
    }, 2000);

})();
