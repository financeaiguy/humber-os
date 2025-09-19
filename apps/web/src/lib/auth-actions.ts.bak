'use server'

import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

export async function authenticate(email: string, password: string) {
  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      return { 
        success: false, 
        error: result.error === 'CredentialsSignin' ? 'Invalid credentials' : result.error 
      }
    }

    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, error: 'Invalid credentials' }
        default:
          return { success: false, error: 'Authentication failed' }
      }
    }
    return { success: false, error: 'Something went wrong' }
  }
}

export async function authenticateAndRedirect(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          redirect('/auth/signin?error=Invalid credentials')
        default:
          redirect('/auth/signin?error=Authentication failed')
      }
    }
    throw error
  }
}