import { supabase } from '../supabase/supabase'
import type { Session } from '@supabase/supabase-js'
import type { SignInData, SignUpData } from '@/types/auth'


export class AuthService {
  static async signIn({ email, password }: SignInData) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return data
  }

  static async signUp({ email, password }: Omit<SignUpData, 'confirmPassword'>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) throw error
    return data
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  static async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  }

  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  }

  static onAuthStateChange(callback: (session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session)
    })
  }
}

export const authQueryKeys = {
  session: ['auth', 'session'] as const,
  user: ['auth', 'user'] as const,
} 