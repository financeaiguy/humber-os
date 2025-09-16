import { Skeleton, CardSkeleton } from '@/components/loading-skeleton'

export default function Loading() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-10 w-64 bg-slate-800 rounded-lg animate-pulse mb-2" />
        <div className="h-5 w-96 bg-slate-800 rounded animate-pulse" />
      </div>
      <div className="rounded-2xl bg-slate-800/50 p-6">
        <Skeleton variant="rectangular" height={120} />
      </div>
      <CardSkeleton count={3} />
    </div>
  )
}