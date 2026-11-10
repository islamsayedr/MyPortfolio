import assert from 'node:assert/strict'
import test from 'node:test'
import { getSites, hostResponse, isDashboardOrigin, isDashboardPath } from '../src/server/hosts'

const bindings = { PUBLIC_SITE_URL: 'https://example.com' }
const response = (url: string) => hostResponse(new Request(url), bindings)

test('apex and www serve public pages without redirects', () => {
  assert.equal(response('https://example.com/about'), null)
  assert.equal(response('https://www.example.com/work'), null)
})
test('main origin serves dashboard, login and callback paths in place', () => {
  for (const path of ['/', '/dashboard', '/dashboard/account', '/dashboard/users', '/login', '/auth/callback?code=test']) {
    assert.equal(response('https://example.com' + path), null)
  }
})
test('www account routes canonicalize to main origin, not dash subdomain', () => {
  for (const path of ['/dashboard', '/dashboard/users?page=1', '/login', '/auth/callback?code=test']) {
    assert.equal(response('https://www.example.com' + path)?.headers.get('location'), 'https://example.com' + path)
  }
})
test('old dashboard subdomain and unknown hosts are rejected', () => {
  assert.equal(response('https://dash.example.com/dashboard')?.status, 421)
  assert.equal(response('https://example.com.evil.test/dashboard')?.status, 421)
  assert.equal(response('https://evil.example.com/dashboard')?.status, 421)
})
test('static assets and RPC transport stay on trusted origins', () => {
  for (const path of ['/assets/app.js', '/fonts/font.woff2', '/icons/logo.svg', '/imgs/sc.jpg', '/_serverFn/123']) {
    assert.equal(response('https://example.com' + path), null)
    assert.equal(response('https://evil.example' + path)?.status, 421)
  }
})
test('canonical auth redirects never follow a supplied external next URL', () => {
  assert.equal(response('https://www.example.com/login?next=https://evil.test')?.headers.get('location'), 'https://example.com/login?next=https://evil.test')
})
test('configured main origins must be secure and contain no path or credentials', () => {
  assert.throws(() => getSites({ PUBLIC_SITE_URL: 'http://example.com' }, 'https://example.com'))
  assert.throws(() => getSites({ PUBLIC_SITE_URL: 'https://user:pass@example.com' }, 'https://example.com'))
  assert.throws(() => getSites({ PUBLIC_SITE_URL: 'https://example.com/dashboard' }, 'https://example.com'))
})
test('localhost and previews work on their existing origin without domain configuration', () => {
  for (const origin of ['http://localhost:4178', 'http://127.0.0.1:5173', 'https://portfolio.workers.dev']) {
    const sites = getSites({}, origin)
    assert.equal(sites.dashboardUrl.href, origin + '/dashboard')
    assert.equal(isDashboardOrigin(origin + '/dashboard', sites), true)
    assert.equal(hostResponse(new Request(origin + '/dashboard'), {}), null)
  }
})
test('auth route classification includes trailing slash variants', () => {
  for (const path of ['/dashboard/', '/dashboard/users', '/login/', '/auth/callback/']) assert.equal(isDashboardPath(path), true)
  assert.equal(isDashboardPath('/work'), false)
})
