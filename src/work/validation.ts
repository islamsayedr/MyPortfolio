import { PRESENTATION_MAX_LENGTH, type WorkFields } from './types'

function text(value: unknown, name: string, max: number, required = true): string {
  if (typeof value !== 'string') throw new Error('Invalid ' + name + '.')
  const result = value.trim()
  if ((required && !result) || result.length > max) throw new Error('Invalid ' + name + '.')
  return result
}
// Used only to resolve old, published URLs to their canonical database UUID.
export function legacyProjectKey(value: unknown): string {
  if (typeof value !== 'string' || value.length > 100 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) throw new Error('Invalid project.')
  return value
}
export function workId(value: unknown): string {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) throw new Error('Invalid project.')
  return value.toLowerCase()
}
export function workIdentity(value: unknown): { id: string; updated_at: string } {
  if (!value || typeof value !== 'object') throw new Error('Invalid project.')
  const data = value as Record<string, unknown>
  const id = workId(data.id)
  if (typeof data.updated_at !== 'string' || data.updated_at.length > 64 || !/^\d{4}-\d\d-\d\dT/.test(data.updated_at) || !Number.isFinite(Date.parse(data.updated_at))) throw new Error('Invalid project version.')
  return { id, updated_at: data.updated_at }
}
export function workInput(value: unknown): { identity: ReturnType<typeof workIdentity> | null; fields: WorkFields } {
  if (!value || typeof value !== 'object') throw new Error('Invalid project.')
  const data = value as Record<string, unknown>
  const presentation = data.presentation
  if (typeof presentation !== 'string' || presentation.length > PRESENTATION_MAX_LENGTH || presentation.includes('\0')) throw new Error('Invalid presentation. Use up to 100000 characters of Markdown.')
  const image = text(data.image_url, 'image URL', 2048)
  if (/[\s\\\u0000-\u001f]/.test(image)) throw new Error('Use an HTTPS image URL or a local image path.')
  if (!image.startsWith('/') || image.startsWith('//')) {
    let url: URL
    try { url = new URL(image) } catch { throw new Error('Use an HTTPS image URL or a local image path.') }
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Use an HTTPS image URL or a local image path.')
  }
  if (!Array.isArray(data.tags) || data.tags.length > 20) throw new Error('Use up to 20 categories.')
  const tags = [...new Set(data.tags.map(tag => text(tag, 'category', 60)))]
  if (typeof data.published !== 'boolean') throw new Error('Invalid publish status.')
  if (typeof data.sort_order !== 'number' || !Number.isInteger(data.sort_order) || data.sort_order < 0 || data.sort_order > 100000) throw new Error('Use an order from 0 to 100000.')
  return {
    identity: data.id == null ? null : workIdentity(data),
    fields: { title: text(data.title, 'title', 120), description: text(data.description, 'description', 10000, false), presentation, image_url: image, image_alt: text(data.image_alt, 'image description', 240), tags, published: data.published, sort_order: data.sort_order },
  }
}
export function reorderWorkInput(value: unknown): { page: number; projects: ReturnType<typeof workIdentity>[] } {
  const { page } = workPage(value)
  const projects = (value as Record<string, unknown>).projects
  if (!Array.isArray(projects) || projects.length < 1 || projects.length > 20) throw new Error('Invalid project order.')
  const identities = projects.map(workIdentity)
  if (new Set(identities.map(project => project.id)).size !== identities.length) throw new Error('Invalid project order.')
  return { page, projects: identities }
}

export function workPage(value: unknown): { page: number } {
  const page = value && typeof value === 'object' ? (value as Record<string, unknown>).page : undefined
  if (typeof page !== 'number' || !Number.isInteger(page) || page < 0 || page > 10000) throw new Error('Invalid page.')
  return { page }
}
