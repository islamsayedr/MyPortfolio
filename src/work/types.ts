export type WorkRow = {
  id: string
  slug: string
  title: string
  description: string
  image_url: string
  image_alt: string
  tags: string[]
  published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}
export type WorkFields = Pick<WorkRow, 'slug' | 'title' | 'description' | 'image_url' | 'image_alt' | 'tags' | 'published' | 'sort_order'>
export type Project = { id: string; title: string; description: string; image: string; alt: string; tags: string[] }
export function projectFromRow(row: WorkRow): Project {
  return { id: row.slug, title: row.title, description: row.description, image: row.image_url, alt: row.image_alt, tags: row.tags }
}
