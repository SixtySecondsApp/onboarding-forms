export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      forms: {
        Row: {
          id: number
          client_name: string
          client_email: string
          progress: number
          status: 'pending' | 'in_progress' | 'completed'
          data: Json
          last_reminder: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          client_name: string
          client_email: string
          progress?: number
          status?: 'pending' | 'in_progress' | 'completed'
          data?: Json
          last_reminder?: string | null
        }
        Update: {
          client_name?: string
          client_email?: string
          progress?: number
          status?: 'pending' | 'in_progress' | 'completed'
          data?: Json
          last_reminder?: string | null
        }
      }
    }
  }
}
