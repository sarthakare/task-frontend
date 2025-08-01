import type { User } from "@/types"

export class HierarchyManager {
  private users: User[]

  constructor(users: User[]) {
    this.users = users
  }

  // Get all subordinates of a user (recursive)
  getSubordinates(userId: string): User[] {
    const subordinates: User[] = []
    const directReports = this.users.filter((user) => user.parentId === userId)

    for (const report of directReports) {
      subordinates.push(report)
      subordinates.push(...this.getSubordinates(report.id))
    }

    return subordinates
  }

  // Get all superiors of a user
  getSuperiors(userId: string): User[] {
    const superiors: User[] = []
    const user = this.users.find((u) => u.id === userId)

    if (user?.parentId) {
      const parent = this.users.find((u) => u.id === user.parentId)
      if (parent) {
        superiors.push(parent)
        superiors.push(...this.getSuperiors(parent.id))
      }
    }

    return superiors
  }

  // Get peers (same level in hierarchy)
  getPeers(userId: string): User[] {
    const user = this.users.find((u) => u.id === userId)
    if (!user) return []

    return this.users.filter((u) => u.parentId === user.parentId && u.id !== userId)
  }

  // Check if user can assign task to another user
  canAssignTo(assignerId: string, assigneeId: string): boolean {
    const subordinates = this.getSubordinates(assignerId)
    const peers = this.getPeers(assignerId)

    return (
      subordinates.some((s) => s.id === assigneeId) ||
      peers.some((p) => p.id === assigneeId) ||
      assignerId === assigneeId
    )
  }

  // Get user's hierarchy path
  getHierarchyPath(userId: string): User[] {
    const path: User[] = []
    const user = this.users.find((u) => u.id === userId)

    if (user) {
      path.push(user)
      if (user.parentId) {
        path.unshift(...this.getHierarchyPath(user.parentId))
      }
    }

    return path
  }
}
