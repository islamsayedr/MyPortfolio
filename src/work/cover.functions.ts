import { createServerFn } from '@tanstack/react-start'
import { COVER_BUCKET, validateCoverFile } from './cover-file'

export const uploadWorkCover = createServerFn({ method: 'POST' }).validator((data: FormData) => {
  if (!(data instanceof FormData)) throw new Error('Invalid cover upload.')
  return data
}).handler(async ({ data }) => {
  const { requireAdmin } = await import('../auth/session.server')
  const { client, user } = await requireAdmin()
  const files = data.getAll('file')
  if (files.length !== 1 || !(files[0] instanceof File)) throw new Error('Choose one cover image to upload.')
  const file = files[0]
  const { mime, extension } = await validateCoverFile(file)
  // Never trust the original filename, accept a caller-supplied destination,
  // overwrite another image, or use a service-role key.
  const path = `${user.id}/${crypto.randomUUID()}.${extension}`
  const { error } = await client.storage.from(COVER_BUCKET).upload(path, await file.arrayBuffer(), { contentType: mime, cacheControl: '31536000', upsert: false })
  if (error) throw new Error('Unable to upload the cover. Check the Storage migration and try again.')
  const { data: result } = client.storage.from(COVER_BUCKET).getPublicUrl(path)
  return { url: result.publicUrl }
})
