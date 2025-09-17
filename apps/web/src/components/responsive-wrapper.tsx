'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveWrapperProps {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full'
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  full: 'max-w-full',
}

export function ResponsiveWrapper({ 
  children, 
  className,
  maxWidth = 'full'
}: ResponsiveWrapperProps) {
  return (
    <div className={cn(
      'w-full mx-auto px-4 sm:px-6 lg:px-8',
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  )
}

// Responsive Grid Component
interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  cols?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: 'tight' | 'normal' | 'wide'
}

const gridColClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
}

const gapClasses = {
  tight: 'gap-2 sm:gap-3 lg:gap-4',
  normal: 'gap-4 sm:gap-6 lg:gap-8',
  wide: 'gap-6 sm:gap-8 lg:gap-10',
}

export function ResponsiveGrid({ 
  children, 
  className,
  cols = 3,
  gap = 'normal'
}: ResponsiveGridProps) {
  return (
    <div className={cn(
      'grid',
      gridColClasses[cols],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  )
}

// Responsive Table Wrapper
interface ResponsiveTableProps {
  children: ReactNode
  className?: string
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className={cn('overflow-x-auto -mx-4 sm:-mx-6 lg:mx-0', className)}>
      <div className="inline-block min-w-full align-middle px-4 sm:px-6 lg:px-0">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          {children}
        </div>
      </div>
    </div>
  )
}

// Responsive Card Component
interface ResponsiveCardProps {
  children: ReactNode
  className?: string
  padding?: 'tight' | 'normal' | 'wide'
}

const paddingClasses = {
  tight: 'p-3 sm:p-4',
  normal: 'p-4 sm:p-6',
  wide: 'p-6 sm:p-8',
}

export function ResponsiveCard({ 
  children, 
  className,
  padding = 'normal'
}: ResponsiveCardProps) {
  return (
    <div className={cn(
      'bg-slate-800/50 border border-slate-700 rounded-lg',
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  )
}

// Responsive Heading Component
interface ResponsiveHeadingProps {
  children: ReactNode
  level?: 1 | 2 | 3 | 4
  className?: string
}

const headingClasses = {
  1: 'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold',
  2: 'text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold',
  3: 'text-lg sm:text-xl lg:text-2xl font-semibold',
  4: 'text-base sm:text-lg lg:text-xl font-semibold',
}

export function ResponsiveHeading({ 
  children, 
  level = 1,
  className
}: ResponsiveHeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements
  
  return (
    <Tag className={cn(headingClasses[level], className)}>
      {children}
    </Tag>
  )
}

// Mobile-First Container
export function MobileContainer({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <div className={cn('w-full px-4 sm:px-0', className)}>
      {children}
    </div>
  )
}

// Responsive Button Group
interface ResponsiveButtonGroupProps {
  children: ReactNode
  className?: string
  vertical?: boolean
}

export function ResponsiveButtonGroup({ 
  children, 
  className,
  vertical = false
}: ResponsiveButtonGroupProps) {
  return (
    <div className={cn(
      vertical
        ? 'flex flex-col gap-2 sm:flex-row sm:gap-3'
        : 'flex flex-col sm:flex-row gap-2 sm:gap-3',
      className
    )}>
      {children}
    </div>
  )
}