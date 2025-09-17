import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  // Allow all requests to pass through - we handle authentication in the client
  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}