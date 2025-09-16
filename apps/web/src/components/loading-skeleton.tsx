'use client'

import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  width?: string | number
  height?: string | number
  count?: number
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  count = 1
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%]'
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl'
  }

  const skeletonStyle = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'circular' ? '40px' : variant === 'card' ? '200px' : '20px')
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${baseClasses} ${variantClasses[variant]} ${className} ${count > 1 ? 'mb-2' : ''}`}
          style={skeletonStyle}
        />
      ))}
    </>
  )
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-900/50 border-b border-slate-700/50">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-4 text-left">
                <Skeleton width="80%" height={16} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-slate-700/30">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <Skeleton width={colIndex === 0 ? '60%' : '40%'} height={14} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="flex-1">
              <Skeleton width="60%" height={18} className="mb-2" />
              <Skeleton width="40%" height={14} />
            </div>
          </div>
          <Skeleton variant="rectangular" height={100} className="mb-4" />
          <div className="flex items-center justify-between">
            <Skeleton width="30%" height={14} />
            <Skeleton width="20%" height={24} />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div>
        <Skeleton width="40%" height={40} className="mb-2" />
        <Skeleton width="60%" height={20} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-4">
            <Skeleton variant="circular" width={40} height={40} className="mb-3" />
            <Skeleton width="60%" height={24} className="mb-2" />
            <Skeleton width="40%" height={16} />
          </div>
        ))}
      </div>

      {/* Content Skeleton */}
      <TableSkeleton rows={8} columns={6} />
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <Skeleton width="30%" height={14} className="mb-2" />
          <Skeleton variant="rectangular" height={40} />
        </div>
      ))}
      <div className="flex items-center space-x-3">
        <Skeleton variant="rectangular" width={120} height={40} />
        <Skeleton variant="rectangular" width={120} height={40} />
      </div>
    </div>
  )
}