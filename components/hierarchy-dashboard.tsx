import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Avatar, AvatarFallback } from './ui/avatar'
import { LoadingSpinner } from './loading-spinner'
import { apiFetch } from '@/lib/api'
import { getToken } from '@/utils/auth'
import { DepartmentHierarchy } from '@/types'
import { ChevronDown } from 'lucide-react'

export default function HierarchyDashboard() {
  const [loading, setLoading] = useState(true)
  const [hierarchy, setHierarchy] = useState<DepartmentHierarchy[]>([])
  // hold collapsed state per department+role key
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

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
          <div className="text-sm text-gray-500">Browse departments, roles and members</div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {hierarchy.map((dept) => {
              const deptKey = `dept:${dept.department}`
              const deptCollapsed = !!collapsed[deptKey]
              return (
                <div key={dept.department} className="space-y-4">
                  <div className="bg-white border rounded-lg shadow-sm p-4">
                    <button
                      type="button"
                      onClick={() =>
                        setCollapsed((s) => ({ ...s, [deptKey]: !s[deptKey] }))
                      }
                      className="flex items-center justify-between w-full text-left"
                      aria-expanded={!deptCollapsed}
                    >
                      <h2 className="text-lg font-semibold">{dept.department}</h2>
                      <span className={`ml-3 transition-transform duration-200 ${deptCollapsed ? '' : 'rotate-180'}`}>
                        <ChevronDown className="size-4 opacity-70" />
                      </span>
                    </button>
                  </div>

                  {!deptCollapsed && (
                    <>
                      {Object.entries(dept.roles).map(([role, users]) => {
                        const roleKey = `${dept.department}::${role}`
                        const roleCollapsed = !!collapsed[roleKey]
                        return (
                          <div key={role} className="space-y-2 pl-4">
                            <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-md hover:bg-slate-100 cursor-pointer">
                              <div className="flex items-center gap-3">
                                <span className="text-md font-medium text-gray-800">{role}</span>
                                <span className="text-sm text-gray-500">{users.length} member{users.length>1?'s':''}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setCollapsed((s) => ({ ...s, [roleKey]: !s[roleKey] }))
                                }
                                className="ml-3 transition-transform duration-200"
                                aria-expanded={!roleCollapsed}
                              >
                                <ChevronDown className={`size-4 opacity-70 ${roleCollapsed ? '' : 'rotate-180'}`} />
                              </button>
                            </div>

                            {!roleCollapsed && (
                              <div className="mt-2 space-y-2">
                                {users.map((user) => (
                                  <div
                                    key={user.id}
                                    className="flex items-center gap-4 p-3 border rounded-lg bg-white hover:shadow-md transition-shadow"
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
                            )}
                          </div>
                        )
                      })}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
