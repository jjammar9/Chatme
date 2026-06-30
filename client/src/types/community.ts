export interface Community {
  _id: string
  name: string
  description: string
  avatarSeed: string
  tags: string[]
  members: string[]
  admins: string[]
  createdBy: string
  createdAt: string
  memberCount: number
  onlineCount: number
  memberDetails: { name: string; avatarSeed: string; online: boolean; linkedUserId?: string }[]
  pendingRequestsCount?: number
  announcement?: string
  isMember: boolean
  isAdmin: boolean
  pendingRequest: "pending" | null
  conversationId?: string
}

export interface JoinRequest {
  userId: string
  status: "pending" | "accepted" | "declined"
  createdAt: string
}
