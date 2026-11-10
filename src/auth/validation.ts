function record(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid request.')
  return input as Record<string, unknown>
}

export function credentials(input: unknown) {
  const value = record(input)
  if (typeof value.email !== 'string' || value.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim())) throw new Error('Enter a valid email address.')
  if (typeof value.password !== 'string' || value.password.length < 1 || value.password.length > 256) throw new Error('Enter a valid password.')
  return { email: value.email.trim(), password: value.password }
}

export function profileInput(input: unknown) {
  const value = record(input)
  if (typeof value.displayName !== 'string' || !value.displayName.trim() || value.displayName.trim().length > 120) throw new Error('Name must contain 1 to 120 characters.')
  return { displayName: value.displayName.trim() }
}

export function registration(input: unknown) {
  const auth = credentials(input)
  if (auth.password.length < 8) throw new Error('Use a password with at least 8 characters.')
  return { ...auth, ...profileInput(input) }
}

export function userPageInput(input: unknown) {
  const value = record(input)
  const page = value.page ?? 0
  if (typeof page !== 'number' || !Number.isInteger(page) || page < 0 || page > 10000) throw new Error('Invalid page.')
  return { page }
}

export function roleInput(input: unknown) {
  const value = record(input)
  if (typeof value.userId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.userId)) throw new Error('Invalid user.')
  if (value.role !== 'admin' && value.role !== 'user') throw new Error('Invalid role.')
  return { userId: value.userId, role: value.role }
}
