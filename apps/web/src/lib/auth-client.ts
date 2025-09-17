'use client'

import { signIn as nextAuthSignIn } from 'next-auth/react'

export async function signIn(email: string, password: string) {
  try {
    console.log('Attempting NextAuth sign in for:', email)
    
    const result = await nextAuthSignIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: '/',
    })

    console.log('NextAuth sign in result:', result)

    if (result?.error) {
      console.error('NextAuth error:', result.error)
      return { success: false, error: result.error }
    }

    if (result?.ok) {
      // Wait a moment for the session to be set, then redirect
      setTimeout(() => {
        window.location.href = '/'
      }, 500)
      return { success: true }
    }

    return { success: false, error: 'Authentication failed' }
  } catch (error) {
    console.error('Sign in error:', error)
    return { success: false, error: 'Something went wrong' }
  }
}