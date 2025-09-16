'use client'

import { useState, useEffect } from 'react'

interface ClientTimeDisplayProps {
  className?: string
  dateClassName?: string
}

export function ClientTimeDisplay({ className, dateClassName }: ClientTimeDisplayProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
    
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted || !currentTime) {
    return (
      <div>
        <p className={className}>--:--:-- --</p>
        <p className={dateClassName}>Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <p className={className}>
        {currentTime.toLocaleTimeString()}
      </p>
      <p className={dateClassName}>
        {currentTime.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </p>
    </div>
  )
}