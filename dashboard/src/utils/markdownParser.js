/**
 * Zero-dependency GitHub Flavored Markdown (GFM) to HTML parser
 * Specifically tuned for technical audits, matrix tables, and security reports.
 */

export function parseMarkdown(markdown) {
  if (!markdown) return { html: '', toc: [] }

  const lines = markdown.split('\n')
  const toc = []
  const output = []
  
  let inCodeBlock = false
  let codeBlockContent = []
  let inTable = false
  let tableHeaderParsed = false
  let tableRows = []

  const flushTable = () => {
    if (!inTable) return
    let tableHtml = '<div class="markdown-table-wrapper"><table>\n'
    tableRows.forEach((row, idx) => {
      if (idx === 0) {
        tableHtml += '<thead><tr>'
        row.forEach((cell) => {
          tableHtml += `<th>${formatInline(cell.trim())}</th>`
        })
        tableHtml += '</tr></thead>\n<tbody>\n'
      } else {
        tableHtml += '<tr>'
        row.forEach((cell) => {
          tableHtml += `<td>${formatInline(cell.trim())}</td>`
        })
        tableHtml += '</tr>\n'
      }
    })
    tableHtml += '</tbody></table></div>\n'
    output.push(tableHtml)
    inTable = false
    tableHeaderParsed = false
    tableRows = []
  }

  const formatInline = (text) => {
    return text
      // Bold + Italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code
      .replace(/`([^`]+)`/g, (match, code) => {
        if (code.toLowerCase() === 'pass') {
          return '<span class="badge-pass">PASS</span>'
        }
        if (code.toLowerCase() === 'warning') {
          return '<span class="badge-warning">WARNING</span>'
        }
        return `<code>${escapeHtml(code)}</code>`
      })
      // Inline math like $T+30\text{s}$
      .replace(/\$([^\$]+)\$/g, '<code class="math">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  }

  const escapeHtml = (str) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Handle code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        output.push(`<pre><code>${escapeHtml(codeBlockContent.join('\n'))}</code></pre>`)
        codeBlockContent = []
        inCodeBlock = false
      } else {
        flushTable()
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeBlockContent.push(line)
      continue
    }

    // Check for tables
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      // Check if it's separator row like | :--- | :---: |
      if (line.includes('---')) {
        tableHeaderParsed = true
        continue
      }
      const cells = line.split('|').slice(1, -1)
      tableRows.push(cells)
      inTable = true
      continue
    } else {
      flushTable()
    }

    // Horizontal Rule
    if (/^---$|^___$|^\*\*\*$/.test(line.trim())) {
      output.push('<hr />')
      continue
    }

    // Headings
    const h1Match = line.match(/^#\s+(.+)$/)
    const h2Match = line.match(/^##\s+(.+)$/)
    const h3Match = line.match(/^###\s+(.+)$/)
    const h4Match = line.match(/^####\s+(.+)$/)

    if (h1Match) {
      const title = h1Match[1].replace(/[*_`]/g, '').trim()
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      toc.push({ text: title, id, level: 1 })
      output.push(`<h1 id="${id}">${formatInline(h1Match[1])}</h1>`)
      continue
    }
    if (h2Match) {
      const title = h2Match[1].replace(/[*_`]/g, '').trim()
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      toc.push({ text: title, id, level: 2 })
      output.push(`<h2 id="${id}">${formatInline(h2Match[1])}</h2>`)
      continue
    }
    if (h3Match) {
      const title = h3Match[1].replace(/[*_`]/g, '').trim()
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      output.push(`<h3 id="${id}">${formatInline(h3Match[1])}</h3>`)
      continue
    }
    if (h4Match) {
      output.push(`<h4>${formatInline(h4Match[1])}</h4>`)
      continue
    }

    // Blockquotes
    if (line.startsWith('>')) {
      const quoteText = line.replace(/^>\s?/, '')
      output.push(`<blockquote>${formatInline(quoteText)}</blockquote>`)
      continue
    }

    // Unordered lists
    if (/^\s*[-*]\s+(.+)$/.test(line)) {
      const itemMatch = line.match(/^\s*[-*]\s+(.+)$/)
      output.push(`<ul><li>${formatInline(itemMatch[1])}</li></ul>`)
      continue
    }

    // Ordered lists
    if (/^\s*\d+\.\s+(.+)$/.test(line)) {
      const itemMatch = line.match(/^\s*\d+\.\s+(.+)$/)
      output.push(`<ol><li>${formatInline(itemMatch[1])}</li></ol>`)
      continue
    }

    // Paragraph
    if (line.trim().length > 0) {
      output.push(`<p>${formatInline(line)}</p>`)
    }
  }

  flushTable()

  // Collapse consecutive <ul> and <ol> tags
  let html = output.join('\n')
  html = html.replace(/<\/ul>\n<ul>/g, '\n')
  html = html.replace(/<\/ol>\n<ol>/g, '\n')

  return { html, toc }
}
