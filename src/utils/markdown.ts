import { marked } from 'marked'
import hljs from 'highlight.js'

// Configure marked to use highlight.js for syntax highlighting
marked.setOptions({
    async: false,
    breaks: true,
    gfm: true,
    pedantic: false,
})

// Override code renderer to add syntax highlighting
const renderer = {
    code({ text, lang }: { text: string; lang?: string }): string {
        const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
        const highlighted = hljs.highlight(text, { language }).value

        return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
    },
}

marked.use({ renderer })

export function parseMarkdown(markdown: string): string {
    try {
        const result = marked(markdown)
        return typeof result === 'string' ? result : ''
    } catch (error) {
        console.error('Error parsing markdown:', error)
        return `<p>${markdown}</p>`
    }
}
