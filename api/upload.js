import { handleUpload } from '@vercel/blob/client'

/*
 * Vercel Function: issues short-lived tokens so the estimate form can upload
 * customer photos straight from the browser to Vercel Blob.
 * Requires the BLOB_READ_WRITE_TOKEN env var (set automatically when a Blob
 * store is connected to the project in Vercel).
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith('estimates/')) throw new Error('Invalid upload path')
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
          maximumSizeInBytes: 15 * 1024 * 1024,
          addRandomSuffix: true,
          validUntil: Date.now() + 10 * 60 * 1000,
        }
      },
    })
    return Response.json(result)
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 })
  }
}
