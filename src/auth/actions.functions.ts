import { createServerFn } from '@tanstack/react-start'
import { credentials, profileInput, registration, roleInput, userPageInput } from './validation'
import type { UserPage } from './types'

export const getDashboardSession = createServerFn({ method: 'GET' }).handler(async () => {
  const { dashboardSession } = await import('./session.server')
  return dashboardSession()
})

export const signIn = createServerFn({ method: 'POST' }).validator(credentials).handler(async ({ data }) => {
  const { dashboardRequest } = await import('../server/environment.server')
  const { supabaseForRequest } = await import('./supabase.server')
  dashboardRequest()
  const { error } = await supabaseForRequest().auth.signInWithPassword(data)
  if (error) throw new Error('Invalid email or password.')
  return { success: true }
})

export const signUp = createServerFn({ method: 'POST' }).validator(registration).handler(async ({ data }) => {
  const { dashboardRequest } = await import('../server/environment.server')
  const { supabaseForRequest } = await import('./supabase.server')
  const sites = dashboardRequest()
  const { data: result, error } = await supabaseForRequest().auth.signUp({
    email: data.email,
    password: data.password,
    options: { data: { display_name: data.displayName }, emailRedirectTo: new URL('/auth/callback', sites.dashboardUrl).href },
  })
  if (error) throw new Error('Unable to create your account. Please try again.')
  return { signedIn: Boolean(result.session) }
})

export const signOut = createServerFn({ method: 'POST' }).handler(async () => {
  const { dashboardRequest } = await import('../server/environment.server')
  const { supabaseForRequest } = await import('./supabase.server')
  dashboardRequest()
  const { error } = await supabaseForRequest().auth.signOut({ scope: 'local' })
  if (error) throw new Error('Unable to sign out. Please try again.')
  return { success: true }
})

export const updateProfile = createServerFn({ method: 'POST' }).validator(profileInput).handler(async ({ data }) => {
  const { requireUser } = await import('./session.server')
  const { client, user } = await requireUser()
  const { data: profile, error } = await client.from('profiles').update({ display_name: data.displayName }).eq('id', user.id).select('display_name').single()
  if (error || !profile) throw new Error('Unable to save your profile.')
  return { displayName: profile.display_name }
})

export const getUsers = createServerFn({ method: 'GET' }).validator(userPageInput).handler(async ({ data }): Promise<UserPage> => {
  const { requireAdmin } = await import('./session.server')
  const { client } = await requireAdmin()
  const pageSize = 20
  const { data: profiles, count, error } = await client.from('profiles').select('id,email,display_name,created_at', { count: 'exact' })
    .order('created_at', { ascending: false }).order('id').range(data.page * pageSize, (data.page + 1) * pageSize - 1)
  if (error || !profiles) throw new Error('Unable to load users.')
  const ids = profiles.map(profile => profile.id)
  const { data: roles, error: roleError } = ids.length ? await client.from('user_roles').select('user_id,role').in('user_id', ids) : { data: [], error: null }
  if (roleError) throw new Error('Unable to load users.')
  const roleMap = new Map((roles ?? []).map(role => [role.user_id, role.role]))
  return { users: profiles.map(profile => ({ id: profile.id, email: profile.email, displayName: profile.display_name, role: roleMap.get(profile.id) ?? 'user', createdAt: profile.created_at })), total: count ?? 0, page: data.page, pageSize }
})

export const changeUserRole = createServerFn({ method: 'POST' }).validator(roleInput).handler(async ({ data }) => {
  const { requireAdmin } = await import('./session.server')
  const { client, user } = await requireAdmin()
  if (data.userId === user.id) throw new Error('You cannot change your own role.')
  // The database RPC rechecks admin rights and protects the last admin, even
  // if someone calls it directly without this application's UI/server guards.
  const { error } = await client.rpc('set_user_role', { target_user_id: data.userId, new_role: data.role })
  if (error) throw new Error('Unable to change this role. The last administrator must be retained.')
  return { success: true }
})
