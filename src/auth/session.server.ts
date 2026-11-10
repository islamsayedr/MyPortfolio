import { dashboardRequest } from '../server/environment.server'
import { isSupabaseConfigured, supabaseForRequest } from './supabase.server'
import type { DashboardSession, DashboardUser } from './types'

export async function verifiedAccount() {
  dashboardRequest()
  const client = supabaseForRequest()
  // getUser verifies the token with Supabase Auth. Never trust getSession or
  // user-editable metadata for identity or authorization.
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) return { client, user: null }
  const [{ data: profile, error: profileError }, { data: role, error: roleError }] = await Promise.all([
    client.from('profiles').select('id,email,display_name,created_at').eq('id', data.user.id).single(),
    client.from('user_roles').select('role').eq('user_id', data.user.id).single(),
  ])
  if (profileError || roleError || !profile || !role) throw new Error('Unable to load your account. Check the Supabase database setup.')
  const user: DashboardUser = {
    id: data.user.id,
    email: data.user.email ?? profile.email,
    displayName: profile.display_name,
    role: role.role,
    createdAt: profile.created_at,
  }
  return { client, user }
}

export async function dashboardSession(): Promise<DashboardSession> {
  const sites = dashboardRequest()
  const base = { publicUrl: sites.publicUrl.origin, dashboardUrl: sites.dashboardUrl.href }
  if (!isSupabaseConfigured()) return { ...base, configured: false, user: null }
  const { user } = await verifiedAccount()
  return { ...base, configured: true, user }
}

export async function requireUser() {
  const account = await verifiedAccount()
  if (!account.user) throw new Error('Please sign in to continue.')
  return { client: account.client, user: account.user }
}

export async function requireAdmin() {
  const account = await requireUser()
  if (account.user.role !== 'admin') throw new Error('Administrator access is required.')
  return account
}
