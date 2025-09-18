'use client'

export async function signIn(email: string, password: string) {
  try {
    // SECURITY: Removed // SECURITY: Removed console.log('Attempting sign in for:', email)
    
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    const result = await response.json()
    
    // SECURITY: Removed // SECURITY: Removed console.log('Sign in result:', result)

    if (response.ok && result.success) {
      // Redirect on successful authentication
      window.location.href = '/'
      return { success: true }
    }

    return { success: false, error: result.error || 'Authentication failed' }
  } catch (error) {
    // SECURITY: Removed console.error('Sign in error:', error)
    return { success: false, error: 'Something went wrong' }
  }
}