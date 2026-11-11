export const COVER_BUCKET = 'work-covers'
export const COVER_MAX_BYTES = 5 * 1024 * 1024
export const COVER_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const COVER_ACCEPT = COVER_MIME_TYPES.join(',')
export type CoverMime = typeof COVER_MIME_TYPES[number]

export function validateCoverMetadata(file: { size: number; type: string }): CoverMime {
  if (!Number.isInteger(file.size) || file.size <= 0 || file.size > COVER_MAX_BYTES) throw new Error('Choose a cover image between 1 byte and 5 MB.')
  if (!COVER_MIME_TYPES.includes(file.type as CoverMime)) throw new Error('Choose a JPEG, PNG, or WebP cover image.')
  return file.type as CoverMime
}

export async function validateCoverFile(file: File): Promise<{ mime: CoverMime; extension: string }> {
  const mime = validateCoverMetadata(file)
  const bytes = new Uint8Array(await file.slice(0, 32).arrayBuffer())
  const ascii = (start: number, value: string) => [...value].every((letter, index) => bytes[start + index] === letter.charCodeAt(0))
  const valid = mime === 'image/jpeg' ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    : mime === 'image/png' ? [137,80,78,71,13,10,26,10].every((value, index) => bytes[index] === value)
      : bytes.length >= 12 && ascii(0, 'RIFF') && ascii(8, 'WEBP')
  if (!valid) throw new Error('The selected file does not match its image type.')
  return { mime, extension: mime === 'image/jpeg' ? 'jpg' : mime === 'image/png' ? 'png' : 'webp' }
}
