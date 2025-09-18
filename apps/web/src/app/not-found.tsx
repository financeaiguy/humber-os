import Link from 'next/link'

// export const runtime = 'edge'

export default function NotFound() {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center">
      <h2 className="text-3xl font-bold text-white mb-4">404 - Page Not Found</h2>
      <p className="text-slate-400 mb-6">Could not find the requested resource</p>
      <Link
        href="/"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Return Home
      </Link>
    </div>
  )
}