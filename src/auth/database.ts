import type { WorkRow, WorkFields } from '../work/types'

export type ProfileRow = { id: string; email: string; display_name: string; created_at: string }
export type RoleRow = { user_id: string; role: 'user' | 'admin' }

export type Database = {
  public: {
    Tables: {
      work_projects: {
        Row: WorkRow
        Insert: WorkFields
        Update: Partial<WorkFields>
        Relationships: []
      }
      profiles: {
        Row: ProfileRow
        Insert: ProfileRow
        Update: { display_name?: string }
        Relationships: []
      }
      user_roles: {
        Row: RoleRow
        Insert: RoleRow
        Update: { role?: 'user' | 'admin' }
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: {
      set_user_role: { Args: { target_user_id: string; new_role: string }; Returns: undefined }
    }
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}
