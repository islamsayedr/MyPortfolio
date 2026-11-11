import { Remarkable } from 'remarkable'

// Same Markdown engine as msa7a-desktop, but no browser-only DOMParser step:
// public HTML must be safe and identical during Workers SSR and hydration.
const markdown = new Remarkable({ html: false, breaks: true, typographer: false })

function safeDestination(value: string, image = false): boolean {
  try {
    const url = new URL(value, 'https://portfolio.invalid/')
    return !url.username && !url.password && (['https:', 'http:'].includes(url.protocol) || (!image && ['mailto:', 'tel:'].includes(url.protocol)))
  } catch { return false }
}

const linkOpen = markdown.renderer.rules.link_open
markdown.renderer.rules.link_open = (tokens, index, options, env, instance) => safeDestination(tokens[index].href)
  ? linkOpen(tokens, index, options, env, instance)
  : '<a>'
const image = markdown.renderer.rules.image
markdown.renderer.rules.image = (tokens, index, options, env, instance) => safeDestination(tokens[index].src, true)
  ? image(tokens, index, options, env, instance)
  : ''

// The project title already supplies the page's H1. Markdown begins at H2.
markdown.renderer.rules.heading_open = (tokens, index) => `<h${Math.min(tokens[index].hLevel + 1, 6)}>`
markdown.renderer.rules.heading_close = (tokens, index) => `</h${Math.min(tokens[index].hLevel + 1, 6)}>\n`
markdown.renderer.rules.table_open = () => '<div class="presentation-table"><table>\n'
markdown.renderer.rules.table_close = () => '</table></div>\n'

export function renderPresentation(source: string): string {
  return markdown.render(source)
}
