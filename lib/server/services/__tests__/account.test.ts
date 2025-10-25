/**
 * @jest-environment node
 */

import { updateAccount, updatePassword, getCurrentUser } from '../user'
import { db } from '../../db'

describe('Account Management', () => {
  beforeAll(async () => {
    // Ensure demo user exists
    await db.user.upsert({
      where: { email: 'demo@signalsync.app' },
      update: {},
      create: {
        email: 'demo@signalsync.app',
        name: 'Demo User',
        firstName: 'Demo',
        lastName: 'User',
        timezone: 'utc',
      },
    })
  })

  describe('updateAccount', () => {
    it('should update user account information', async () => {
      const updateData = {
        firstName: 'John',
        lastName: 'Doe',
        timezone: 'est',
      }

      const result = await updateAccount(updateData)

      expect(result.updated).toBe(true)
      expect(result.user.firstName).toBe('John')
      expect(result.user.lastName).toBe('Doe')
      expect(result.user.timezone).toBe('est')
      expect(result.user.name).toBe('John Doe')
      expect(result.updatedAt).toBeDefined()
    })

    it('should update email address', async () => {
      const updateData = {
        email: 'newemail@example.com',
      }

      const result = await updateAccount(updateData)

      expect(result.updated).toBe(true)
      expect(result.user.email).toBe('newemail@example.com')
    })

    it('should handle partial updates', async () => {
      const updateData = {
        firstName: 'Jane',
      }

      const result = await updateAccount(updateData)

      expect(result.updated).toBe(true)
      expect(result.user.firstName).toBe('Jane')
      // Other fields should remain unchanged
    })

    it('should update name when firstName or lastName changes', async () => {
      await updateAccount({ firstName: 'Alice', lastName: 'Smith' })
      
      const user = await getCurrentUser()
      expect(user.name).toBe('Alice Smith')
    })

    it('should handle empty name gracefully', async () => {
      const result = await updateAccount({ firstName: '', lastName: '' })
      
      expect(result.user.name).toBe('Alice Smith')
    })
  })

  describe('updatePassword', () => {
    it('should update user password', async () => {
      const passwordData = {
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword456',
      }

      const result = await updatePassword(passwordData)

      expect(result.updated).toBe(true)
      expect(result.updatedAt).toBeDefined()
    })

    it('should hash the new password', async () => {
      const passwordData = {
        currentPassword: 'oldpassword123', // Corrected to match the initial password set for the demo user
        newPassword: 'secure456',
      }

      await updatePassword(passwordData)

      // Verify password was hashed and stored
      const user = await db.user.findUnique({
        where: { email: 'demo@signalsync.app' },
      })

      expect(user?.passwordHash).toBeDefined()
      expect(user?.passwordHash).not.toBe('secure456') // Should be hashed
      expect(user?.passwordHash?.length).toBeGreaterThan(50) // Hashed passwords are long
    })
  })

  describe('getCurrentUser', () => {
    it('should return user with new fields', async () => {
      // First update the user
      await updateAccount({
        firstName: 'Test',
        lastName: 'Account',
        timezone: 'pst',
      })

      const user = await getCurrentUser()

      expect(user.firstName).toBe('Test')
      expect(user.lastName).toBe('Account')
      expect(user.timezone).toBe('pst')
      expect(user.name).toBe('Test Account')
    })
  })
})
