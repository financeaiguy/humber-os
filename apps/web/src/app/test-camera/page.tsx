'use client'

import { useState } from 'react'

export default function TestCameraPage() {
  const [status, setStatus] = useState<string>('Not started')
  const [error, setError] = useState<string | null>(null)

  const testCamera = async () => {
    setStatus('Testing camera...')
    setError(null)

    try {
      // Test 1: Check if API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported')
      }
      setStatus('API available ✓')

      // Test 2: Try simplest request
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        setStatus('Camera access granted! ✓')

        // Stop the stream
        stream.getTracks().forEach(track => track.stop())
      } catch (err: any) {
        throw new Error(`Camera request failed: ${err.name} - ${err.message}`)
      }
    } catch (err: any) {
      setError(err.message)
      setStatus('Failed ✗')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-8">Camera Permission Test</h1>

      <div className="space-y-4 max-w-2xl">
        <div className="p-4 bg-slate-800 rounded">
          <p className="text-sm text-slate-400 mb-2">Current URL:</p>
          <p className="font-mono">{typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
        </div>

        <div className="p-4 bg-slate-800 rounded">
          <p className="text-sm text-slate-400 mb-2">Protocol:</p>
          <p className="font-mono">{typeof window !== 'undefined' ? window.location.protocol : 'Loading...'}</p>
        </div>

        <div className="p-4 bg-slate-800 rounded">
          <p className="text-sm text-slate-400 mb-2">Status:</p>
          <p className={`font-mono ${status.includes('✓') ? 'text-green-400' : status.includes('✗') ? 'text-red-400' : 'text-white'}`}>
            {status}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-900/50 rounded">
            <p className="text-sm text-red-400 mb-2">Error:</p>
            <p className="font-mono text-red-300">{error}</p>
          </div>
        )}

        <button
          onClick={testCamera}
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test Camera Permission
        </button>

        <div className="p-4 bg-slate-800 rounded">
          <p className="text-sm text-slate-400 mb-2">Instructions:</p>
          <ol className="text-sm space-y-1">
            <li>1. Click "Test Camera Permission"</li>
            <li>2. Your browser should show a permission prompt</li>
            <li>3. Click "Allow" to grant permission</li>
            <li>4. If no prompt appears, check browser console for errors</li>
          </ol>
        </div>
      </div>
    </div>
  )
}