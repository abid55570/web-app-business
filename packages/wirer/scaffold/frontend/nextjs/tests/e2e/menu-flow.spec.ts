/**
 * E2E — admin menu CRUD flow.
 *
 * Talks to the backend directly via the API (rather than driving the admin
 * dashboard UI which isn't shipped by the scaffold yet) and asserts the
 * full lifecycle: admin creates item → public list shows it → admin toggles
 * availability → public list hides it.
 *
 * Pre-reqs: an admin user exists. Either run a seeder before E2E or swap
 * `email` to a known admin in your local DB. This spec is skipped if the
 * env var ADMIN_EMAIL is unset, so CI doesn't break before seeding lands.
 */
import { test, expect, BACKEND } from './fixtures'


const adminEmail = process.env.ADMIN_EMAIL
const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin-password-e2e'


test.skip(
  !adminEmail,
  'ADMIN_EMAIL not set — provide a pre-seeded admin to run this flow',
)


test('admin creates item → public list shows it → toggle hides it', async ({
  request,
}) => {
  // Login as admin
  const login = await request.post(`${BACKEND}/api/auth/login`, {
    data: { email: adminEmail, password: adminPassword },
  })
  expect(login.ok()).toBeTruthy()
  const { session } = await login.json()
  const auth = { authorization: `Bearer ${session.token}` }

  // Create a unique menu item
  const name = `E2E Pizza ${Date.now()}`
  const created = await request.post(`${BACKEND}/api/admin/menu`, {
    headers: auth,
    data: { name, price: '9.50', currency: 'USD', category: 'pizza' },
  })
  expect(created.status()).toBe(201)
  const item = await created.json()
  expect(item.name).toBe(name)
  expect(item.isAvailable).toBe(true)

  // Public list should include it
  const publicListed = await request.get(`${BACKEND}/api/menu`)
  expect(publicListed.ok()).toBeTruthy()
  const publicNames = (await publicListed.json()).items.map(
    (i: { name: string }) => i.name,
  )
  expect(publicNames).toContain(name)

  // Toggle availability off
  const toggle = await request.patch(
    `${BACKEND}/api/admin/menu/${item.id}/availability`,
    { headers: auth, data: { isAvailable: false } },
  )
  expect(toggle.ok()).toBeTruthy()

  // Public list should drop it
  const publicListed2 = await request.get(`${BACKEND}/api/menu`)
  const publicNames2 = (await publicListed2.json()).items.map(
    (i: { name: string }) => i.name,
  )
  expect(publicNames2).not.toContain(name)

  // Cleanup
  await request.delete(`${BACKEND}/api/admin/menu/${item.id}`, { headers: auth })
})
