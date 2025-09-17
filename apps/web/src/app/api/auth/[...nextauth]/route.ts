import { handlers } from "@/auth"

// Temporarily disable edge runtime to fix internal server errors
// export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export const { GET, POST } = handlers