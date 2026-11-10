export type AppRole = 'user' | 'admin'
export type DashboardUser = {
  id: string
  email: string
  displayName: string
  role: AppRole
  createdAt: string
}
export type DashboardSession = {
  configured: boolean
  user: DashboardUser | null
  publicUrl: string
  dashboardUrl: string
}
export type UserPage = { users: DashboardUser[]; total: number; page: number; pageSize: number }
