import { createClient } from '@supabase/supabase-js'
import { getBindings } from '../server/environment.server'
import type { Database } from '../auth/database'
import { seedProjects } from './seed'
import { projectFromRow, type Project } from './types'

// Anonymous reads use no visitor cookies, even for administrators. Drafts are
// excluded explicitly and by RLS. No service-role key or shared auth state.
export async function readPublishedWork(slug?: string): Promise<{ projects: Project[]; unavailable: boolean }> {
  const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = getBindings()
  const seed = () => ({ projects: slug ? seedProjects.filter(project => project.id === slug) : seedProjects, unavailable: false })
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return seed()
  try {
    const client = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
    let query = client.from('work_projects').select('*').eq('published', true).order('sort_order').order('created_at').order('id')
    if (slug) query = query.eq('slug', slug)
    const { data, error } = await query
    // Only pre-migration/missing-table setups use the original public samples.
    // Empty results (including unpublished/deleted projects) never fall back.
    if (error?.code === 'PGRST205' || error?.code === '42P01') return seed()
    if (error) return { projects: [], unavailable: true }
    return { projects: (data ?? []).map(projectFromRow), unavailable: false }
  } catch {
    return { projects: [], unavailable: true }
  }
}
