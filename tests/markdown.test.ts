import assert from 'node:assert/strict'
import test from 'node:test'
import { renderPresentation } from '../src/work/markdown'

// Runs without window, document or DOMParser: this is also the Workers SSR path.
test('presentation Markdown renders semantic headings, lists, tables and code on the server', () => {
  const html = renderPresentation('# Research\n\nA **clear** result.\n\n- One\n- Two\n\n| Goal | Result |\n| --- | --- |\n| Speed | Faster |\n\n```ts\nconst value = "<safe>"\n```\n\n![Preview](/imgs/sc.jpg)\n\n[Details](https://example.com/work)')
  assert.match(html, /<h2>Research<\/h2>/)
  assert.doesNotMatch(html, /<h1\b/)
  assert.match(html, /<strong>clear<\/strong>/)
  assert.match(html, /<ul>/)
  assert.match(html, /<li>One<\/li>/)
  assert.match(html, /<div class="presentation-table"><table>/)
  assert.match(html, /<th>Goal<\/th>/)
  assert.match(html, /<pre><code class="language-ts">/)
  assert.match(html, /&lt;safe&gt;/)
  assert.match(html, /<img src="\/imgs\/sc.jpg" alt="Preview"/)
  assert.match(html, /<a href="https:\/\/example.com\/work">Details<\/a>/)
  assert.equal(renderPresentation(''), '')
})

test('presentation Markdown never emits raw executable HTML or unsafe URL schemes', () => {
  const source = [
    '<script>globalThis.compromised=true</script>',
    '<img src=x onerror="alert(1)">',
    '<iframe src="https://evil.test"></iframe>',
    '[script](javascript:alert(1))',
    '[entity](javascript&#58;alert(1))',
    '[unknown](custom:danger)',
    '![data](data:image/svg+xml;base64,PHN2Zz4=)',
    '![local](file:///etc/passwd)',
    '[credentials](https://user:password@example.com/)',
  ].join('\n\n')
  const html = renderPresentation(source)
  assert.doesNotMatch(html, /<(?:script|iframe|object|embed)\b/i)
  assert.doesNotMatch(html, /<img\b[^>]*\bonerror=/i)
  assert.doesNotMatch(html, /(?:href|src)="(?:javascript|vbscript|data|file|custom):/i)
  assert.doesNotMatch(html, /href="https:\/\/user:password@/)
  assert.match(html, /&lt;script&gt;/)
})

test('presentation Markdown is deterministic for hydration and keeps Arabic content', () => {
  const source = '# البحث\n\nشرح **النتائج** والتصميم.\n\nFirst line\nSecond line\n\n[اتصل](mailto:hello@example.com)'
  const html = renderPresentation(source)
  assert.equal(renderPresentation(source), html)
  assert.match(html, /<h2>البحث<\/h2>/)
  assert.match(html, /<strong>النتائج<\/strong>/)
  assert.match(html, /First line<br>\nSecond line/)
  assert.match(html, /href="mailto:hello@example.com"/)
})
