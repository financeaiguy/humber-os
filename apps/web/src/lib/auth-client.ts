'use client'

import { signIn as nextAuthSignIn } from 'next-auth/react'

export async function signIn(email: string, password: string) {
  try {
    // Check if nextAuthSignIn is available
    if (!nextAuthSignIn) {
      console.error('NextAuth signIn not available')
      return { success: false, error: 'Authentication not configured' }
    }

    const result = await nextAuthSignIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      return { success: false, error: 'Invalid credentials' }
    }

    if (result?.ok) {
      return { success: true }
    }

    return { success: false, error: 'Authentication failed' }
  } catch (error) {
    return { success: false, error: 'Something went wrong' }
  }
}