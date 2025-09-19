'use client'

import { signIn as nextAuthSignIn } from 'next-auth/react'

export async function signIn(email: string, password: string) {
  try {
    // Use NextAuth's built-in signIn function
    const result = await nextAuthSignIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: '/',
    })

    if (result?.error) {
      // Handle specific NextAuth errors
      if (result.error === 'CredentialsSignin') {
        return { success: false, error: 'Invalid email or password' }
      }
      return { success: false, error: result.error }
    }

    if (result?.ok && result?.url) {
      // Successful sign in - redirect to the callback URL
      window.location.href = result.url
      return { success: true }
    }

    if (result?.ok) {
      // Successful sign in without redirect URL
      window.location.href = '/'
      return { success: true }
    }

    return { success: false, error: 'Authentication failed' }
  } catch (error) {
    console.error('Sign in error:', error)
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return { success: false, error: 'Network error. Please check your connection and try again.' }
    }
    
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}