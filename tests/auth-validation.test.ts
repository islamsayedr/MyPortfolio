import assert from 'node:assert/strict'
import test from 'node:test'
import { credentials, profileInput, registration, roleInput, userPageInput } from '../src/auth/validation'

test('credentials normalize email without changing passwords', () => {
  assert.deepEqual(credentials({ email: ' test@example.com ', password: ' pass ' }), { email: 'test@example.com', password: ' pass ' })
  for (const value of [null, {}, { email: 'invalid', password: 'x' }, { email: 'a@b.c', password: '' }]) assert.throws(() => credentials(value))
})
test('signup ignores privilege fields and requires a strong-enough password', () => {
  const value = registration({ email: 'test@example.com', password: 'password123', displayName: ' Test ', role: 'admin', id: 'other' })
  assert.deepEqual(value, { email: 'test@example.com', password: 'password123', displayName: 'Test' })
  assert.throws(() => registration({ email: 'test@example.com', password: 'short', displayName: 'Test' }))
})
test('profile edits whitelist display name, never role, email or user ID', () => {
  assert.deepEqual(profileInput({ displayName: ' Test ', role: 'admin', email: 'other@test.com', id: 'other' }), { displayName: 'Test' })
  for (const displayName of ['', ' ', 'x'.repeat(121), 123]) assert.throws(() => profileInput({ displayName }))
})
test('roles and target IDs are constrained', () => {
  assert.deepEqual(roleInput({ userId: '10000000-0000-0000-0000-000000000001', role: 'admin' }), { userId: '10000000-0000-0000-0000-000000000001', role: 'admin' })
  assert.throws(() => roleInput({ userId: 'bad', role: 'admin' }))
  assert.throws(() => roleInput({ userId: '10000000-0000-0000-0000-000000000001', role: 'owner' }))
})
test('pagination rejects negative, fractional and unbounded values', () => {
  assert.deepEqual(userPageInput({}), { page: 0 })
  for (const page of [-1, 0.5, 10001, '1', NaN]) assert.throws(() => userPageInput({ page }))
})
