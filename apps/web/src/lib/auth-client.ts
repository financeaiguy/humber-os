'use client'

export async function signIn(email: string, password: string) {
  try {
    // Get CSRF token first
    const csrfResponse = await fetch('/api/auth/csrf', {
      credentials: 'include',
    })

    if (!csrfResponse.ok) {
      return { success: false, error: 'Unable to get security token. Please refresh the page and try again.' }
    }

    const { csrfToken } = await csrfResponse.json()

    // Sign in using NextAuth credentials provider
    const response = await fetch('/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      credentials: 'include',
      body: new URLSearchParams({
        email,
        password,
        csrfToken,
        redirect: 'false',
        callbackUrl: '/',
        json: 'true',
      }),
    })

    // Check response - handle both JSON and HTML responses
    if (response.ok) {
      try {
        const data = await response.json()

        if (data?.url && !data.error) {
          // Successful sign in - redirect to the URL provided by NextAuth
          window.location.href = data.url || '/'
          return { success: true }
        }

        if (data?.error) {
          return { success: false, error: data.error === 'CredentialsSignin' ? 'Invalid credentials' : data.error }
        }
      } catch (error) {
        // Handle non-JSON responses (like HTML error pages)
        const text = await response.text().catch(() => '')

        // If it's a redirect response, try to extract the redirect URL
        if (response.status === 302 || response.status === 301) {
          return { success: false, error: 'Authentication failed - invalid request' }
        }

        // Check if response contains error information
        if (text.includes('Internal Server Error') || text.includes('Error')) {
          return { success: false, error: 'Authentication server error. Please try again.' }
        }

        return { success: false, error: 'Unexpected response format' }
      }
    }

    // Handle error responses
    if (response.status === 401) {
      return { success: false, error: 'Invalid credentials' }
    }

    if (response.status === 302) {
      // Handle redirect responses that might contain error information
      return { success: false, error: 'Authentication failed - please check your credentials' }
    }

    // Try to extract error information from non-JSON responses
    try {
      const text = await response.text()
      if (text.includes('CSRF') || text.includes('csrf')) {
        return { success: false, error: 'Security token error. Please refresh the page and try again.' }
      }
      if (text.includes('Internal Server Error') || text.includes('Error')) {
        return { success: false, error: 'Server error. Please try again.' }
      }
    } catch (error) {
      // Ignore text parsing errors
    }

    return { success: false, error: 'Authentication failed' }
  } catch (error) {
    console.error('Sign in error:', error)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}