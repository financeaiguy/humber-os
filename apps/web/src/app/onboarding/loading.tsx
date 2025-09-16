import { CardSkeleton, Skeleton } from '@/components/loading-skeleton'

export default function Loading() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-10 w-56 bg-slate-800 rounded-lg animate-pulse mb-2" />
        <div className="h-5 w-96 bg-slate-800 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="text-center">
            <Skeleton variant="circular" width={48} height={48} className="mx-auto mb-2" />
            <Skeleton width="80%" height={14} className="mx-auto" />
          </div>
        ))}
      </div>
      <CardSkeleton count={6} />
    </div>
  )
}