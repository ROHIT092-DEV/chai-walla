'use client'

import { useUser } from '@clerk/nextjs'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function MakeAdminPage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const makeAdmin = async () => {
    if (!user?.emailAddresses[0]?.emailAddress) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/make-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.emailAddresses[0].emailAddress,
          secret: 'make-me-admin-123'
        })
      })
      
      const result = await response.json()
      setMessage(result.success ? 'You are now an admin! Refresh the page.' : result.error)
    } catch (error) {
      setMessage('Error making admin')
    }
    setLoading(false)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please sign in first</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Make Admin</h2>
          <p className="text-gray-600 mt-2">
            Current user: {user.emailAddresses[0]?.emailAddress}
          </p>
        </div>
        
        <Button 
          onClick={makeAdmin}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Processing...' : 'Make Me Admin'}
        </Button>
        
        {message && (
          <div className={`p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
        
        <div className="text-center">
          <a href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}