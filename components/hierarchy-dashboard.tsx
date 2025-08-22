import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Avatar, AvatarFallback } from './ui/avatar'
import { LoadingSpinner } from './loading-spinner'
import { apiFetch } from '@/lib/api'
import { getToken } from '@/utils/auth'
import { DepartmentHierarchy } from '@/types'

export default function HierarchyDashboard() {
  const [loading, setLoading] = useState(true)
  const [hierarchy, setHierarchy] = useState<DepartmentHierarchy[]>([])

  useEffect(() => {
    const fetchHierarchy = async () => {
      setLoading(true)
      try {
        const token = getToken()
        const response = await apiFetch('/hierarchy/structure', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        setHierarchy(data)
      } catch (err) {
        console.error('Error loading hierarchy data', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHierarchy()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Team Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {hierarchy.map((dept) => (
              <div key={dept.department} className="space-y-4">
                {/* Department Title */}
                <h2 className="text-lg font-semibold">{dept.department}</h2>

                {Object.entries(dept.roles).map(([role, users]) => (
                  <div key={role} className="space-y-2 pl-4">
                    {/* Role Title */}
                    <h3 className="text-md font-medium text-gray-700">{role}</h3>

                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-4 p-3 border rounded-lg bg-gray-50"
                      >
                        <Avatar>
                          <AvatarFallback>
                            {user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{user.name}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
