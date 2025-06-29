import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import type { SignInData, SignUpData } from '@/types/auth'

export interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (data: SignInData) => Promise<void>
  signUp: (data: Omit<SignUpData, 'confirmPassword'>) => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined) 