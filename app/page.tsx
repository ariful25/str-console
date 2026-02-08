'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

export default function Home() {
  const router = useRouter()
  const { isLoaded } = useUser()

  useEffect(() => {
    if (isLoaded) {
      router.push('/dashboard')
    }
  }, [isLoaded, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">STR Operations Console</h1>
        <p className="text-gray-500">Redirecting to dashboard...</p>
      </div>
    </div>
  )
}
