import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'

export function useUserRole() {
  const { user, isLoaded } = useUser()
  const [role, setRole] = useState<'admin' | 'user' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && user) {
      fetch('/api/user')
        .then(res => res.json())
        .then(data => {
          setRole(data.role)
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    } else if (isLoaded && !user) {
      setLoading(false)
    }
  }, [user, isLoaded])

  return { role, loading, isLoaded }
}