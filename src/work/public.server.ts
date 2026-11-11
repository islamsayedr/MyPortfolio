import { createClient } from '@supabase/supabase-js'
import { getBindings } from '../server/environment.server'
import type { Database } from '../auth/database'
import { seedLegacyIds, seedProjects } from './seed'
import { projectFromRow, WORK_LIST_COLUMNS, type Project } from './types'

// Anonymous reads use no visitor cookies, even for administrators. Drafts are
// excluded explicitly and by RLS. No service-role key or shared auth state.
export async function readPublishedWork(id?: string): Promise<{ projects: Project[]; unavailable: boolean }> {
  const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = getBindings()
  const seed = () => ({ projects: id ? seedProjects.filter(project => project.id === id) : seedProjects, unavailable: false })
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return seed()
  try {
    const client = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
    // Separate typed selects keep large Markdown bodies off list/carousel data.
    const table = client.from('work_projects')
    const query = id
      ? table.select('*').eq('published', true).eq('id', id)
      : table.select(WORK_LIST_COLUMNS).eq('published', true)
    const { data, error } = await query.order('sort_order').order('created_at').order('id')
    // Only pre-migration/missing-table setups use the original public samples.
    // Empty results (including unpublished/deleted projects) never fall back.
    if (error?.code === 'PGRST205' || error?.code === '42P01') return seed()
    if (error) return { projects: [], unavailable: true }
    return { projects: (data ?? []).map(projectFromRow), unavailable: false }
  } catch {
    return { projects: [], unavailable: true }
  }
}

// Legacy aliases are read-only and resolved anonymously through published RLS.
// Never redirect to a visitor-supplied URL or reveal a private draft's UUID.
export async function readLegacyProjectId(key: string): Promise<{ id: string | null; unavailable: boolean }> {
  const legacyKey = Object.entries(seedLegacyIds).find(([, id]) => id === key)?.[0] ?? key
  const seed = () => ({ id: Object.hasOwn(seedLegacyIds, legacyKey) ? seedLegacyIds[legacyKey] : null, unavailable: false })
  const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = getBindings()
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return seed()
  try {
    const client = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
    const { data, error } = await client.from('work_projects').select('id').eq('published', true).eq('slug', legacyKey).maybeSingle()
    if (error?.code === 'PGRST205' || error?.code === '42P01') return seed()
    if (error) return { id: null, unavailable: true }
    return { id: data?.id ?? null, unavailable: false }
  } catch { return { id: null, unavailable: true } }
}
