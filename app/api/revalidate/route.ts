import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

/**
 * API route to force revalidation of cached pages
 * Usage: POST /api/revalidate?path=/companies or POST /api/revalidate?path=/
 * 
 * This can be called after data updates to immediately refresh the cache
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path') || '/'
    const secret = searchParams.get('secret')
    
    // Optional: Add a secret token for security
    // For now, we'll allow it without auth, but you should add this in production
    // if (secret !== process.env.REVALIDATE_SECRET) {
    //   return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    // }
    
    revalidatePath(path)
    
    return NextResponse.json({ 
      revalidated: true, 
      path,
      now: Date.now() 
    })
  } catch (error) {
    console.error('Error revalidating:', error)
    return NextResponse.json(
      { error: 'Error revalidating' },
      { status: 500 }
    )
  }
}
