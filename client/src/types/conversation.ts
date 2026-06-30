export interface ParticipantDetail {
  name: string
  username: string
  avatarSeed: string
  online?: boolean
}

export interface Conversation {
  _id: string
  participants: string[]
  isGroup: boolean
  groupName?: string
  groupAvatar?: string
  lastMessage?: string
  lastMessageTime?: string
  createdAt: string
  participantDetails: ParticipantDetail[]
  unreadCount?: number
  isFavourite?: boolean
}

export interface Reaction {
  userId: string
  emoji: string
}

export interface ReplyTo {
  messageId: string
  content: string
  senderName: string
}

export interface Message {
  _id: string
  conversationId: string
  senderId: string
  senderName: string
  senderSeed: string
  content: string
  type: "text" | "image" | "file" | "voice" | "system"
  readBy: string[]
  fileUrl?: string
  fileName?: string
  fileSize?: number
  fileMimeType?: string
  editedAt?: string
  isDeleted?: boolean
  createdAt: string
  reactions?: Reaction[]
  replyTo?: ReplyTo
}
