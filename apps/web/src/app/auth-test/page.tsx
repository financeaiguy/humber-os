'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function AuthTestPage() {
  const { data: session, status } = useSession()
  const [testResult, setTestResult] = useState<string>('')

  const testAuth = async () => {
    try {
      // Test NextAuth session
      const response = await fetch('/api/auth/session')
      const sessionData = await response.json()
      
      setTestResult(`
        Status: ${response.status}
        Session Data: ${JSON.stringify(sessionData, null, 2)}
        Hook Status: ${status}
        Hook Session: ${JSON.stringify(session, null, 2)}
      `)
    } catch (error) {
      setTestResult(`Error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>
        
        <div className="space-y-6">
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Session Status</h2>
            <div className="space-y-2">
              <p><strong>Status:</strong> {status}</p>
              <p><strong>User:</strong> {session?.user?.email || 'Not logged in'}</p>
              <p><strong>Role:</strong> {session?.user?.role || 'N/A'}</p>
              <p><strong>Partner:</strong> {session?.user?.partnerName || 'N/A'}</p>
            </div>
          </div>

          <div className="space-x-4">
            <button
              onClick={testAuth}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test Auth API
            </button>
            
            {session && (
              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Sign Out
              </button>
            )}
          </div>

          {testResult && (
            <div className="bg-slate-900 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Test Result:</h3>
              <pre className="text-sm text-green-400 whitespace-pre-wrap">{testResult}</pre>
            </div>
          )}

          <div className="bg-yellow-500/20 border border-yellow-500/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-yellow-400">Important Notes:</h3>
            <ul className="text-sm space-y-1">
              <li>• Frontend auth should only use NextAuth routes (/api/auth/*)</li>
              <li>• Worker auth endpoints (port 8787) are separate and not for frontend use</li>
              <li>• The failing tests in your screenshot are testing worker endpoints directly</li>
              <li>• For frontend apps, use NextAuth session management</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}