export const PRESENTATION_MAX_LENGTH = 100000
export const WORK_LIST_COLUMNS = 'id,title,description,image_url,image_alt,tags,published,sort_order,created_at,updated_at' as const

export type WorkRow = {
  id: string
  slug: string | null // Read-only legacy redirect alias; never used for new URLs.
  title: string
  description: string
  presentation: string
  image_url: string
  image_alt: string
  tags: string[]
  published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}
export type WorkListRow = Omit<WorkRow, 'presentation' | 'slug'>
export type WorkFields = Pick<WorkRow, 'title' | 'description' | 'presentation' | 'image_url' | 'image_alt' | 'tags' | 'published' | 'sort_order'>
export type Project = { id: string; title: string; description: string; presentation: string; image: string; alt: string; tags: string[] }
export function projectFromRow(row: WorkListRow & { presentation?: string }): Project {
  return { id: row.id, title: row.title, description: row.description, presentation: row.presentation ?? '', image: row.image_url, alt: row.image_alt, tags: row.tags }
}
