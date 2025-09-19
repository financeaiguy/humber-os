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
      console.log('NextAuth signIn error:', result.error)
      
      // Handle specific NextAuth errors
      if (result.error === 'CredentialsSignin') {
        return { success: false, error: 'Invalid email or password' }
      }
      return { success: false, error: result.error }
    }

    if (result?.ok && result?.url) {
      // Successful sign in - redirect to the callback URL
      console.log('Successful authentication with URL:', result.url)
      window.location.href = result.url
      return { success: true }
    }

    if (result?.ok) {
      // Successful sign in without redirect URL
      console.log('Successful authentication, redirecting to home')
      window.location.href = '/'
      return { success: true }
    }

    console.log('Authentication result unclear:', result)
    return { success: false, error: 'Authentication failed' }
  } catch (error) {
    console.error('Sign in error:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      // Check for JSON parsing errors
      if (error.message.includes('Unexpected token') && error.message.includes('Internal S')) {
        console.error('Detected HTML response instead of JSON - this is the ClientFetchError')
        return { success: false, error: 'Server configuration issue. Please try refreshing the page.' }
      }
      
      // Handle network errors  
      if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
        return { success: false, error: 'Network error. Please check your connection and try again.' }
      }
    }
    
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}