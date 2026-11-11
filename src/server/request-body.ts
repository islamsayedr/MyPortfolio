export const SERVER_FUNCTION_MAX_BYTES = 6 * 1024 * 1024

// TanStack parses multipart bodies before a server function can authenticate.
// Bound the actual stream, not just Content-Length, before parsing any payload.
export async function boundedServerFunctionRequest(request: Request): Promise<Request | Response> {
  const reject = (status: number, message: string) => new Response(message, { status, headers: { 'Cache-Control': 'private, no-store' } })
  if (Number(request.headers.get('content-length')) > SERVER_FUNCTION_MAX_BYTES) return reject(413, 'Request body is too large.')
  if (!request.body) return request
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > SERVER_FUNCTION_MAX_BYTES) {
        await reader.cancel().catch(() => {})
        return reject(413, 'Request body is too large.')
      }
      chunks.push(value)
    }
  } catch { return reject(400, 'Invalid request body.') } finally { reader.releaseLock() }
  const body = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength }
  return new Request(request, { body: body.buffer })
}
