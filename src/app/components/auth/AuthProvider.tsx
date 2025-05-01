'use client'

import { useEffect } from 'react'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useKindeBrowserClient()

  useEffect(() => {
    if (isAuthenticated && user) {
      // Sync user with database via API
      if (user.id && user.email && user.given_name) {
        fetch('/api/sync-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: user.id,
            email: user.email,
            given_name: user.given_name,
            family_name: user.family_name || '',
            picture: user.picture || '',
          }),
        })
          .then(response => response.json())
          .then(data => console.log('User sync status:', data.message))
          .catch(error => console.error('Error syncing user:', error));
      }
    }
  }, [isAuthenticated, user])

  return <>{children}</>
} 