import { Skeleton } from '@/components/loading-skeleton'

export default function Loading() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-10 w-48 bg-slate-800 rounded-lg animate-pulse mb-2" />
        <div className="h-5 w-80 bg-slate-800 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl bg-slate-800/50 p-4">
            <Skeleton variant="circular" width={40} height={40} className="mb-3" />
            <Skeleton width="60%" height={24} className="mb-2" />
            <Skeleton width="40%" height={16} />
          </div>
        ))}
      </div>
      <Skeleton variant="rectangular" height={400} />
    </div>
  )
}