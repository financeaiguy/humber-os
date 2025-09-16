import { TableSkeleton, CardSkeleton } from '@/components/loading-skeleton'

export default function Loading() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-10 w-48 bg-slate-800 rounded-lg animate-pulse mb-2" />
        <div className="h-5 w-96 bg-slate-800 rounded animate-pulse" />
      </div>
      <CardSkeleton count={3} />
      <TableSkeleton rows={6} columns={5} />
    </div>
  )
}