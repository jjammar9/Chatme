export interface Contact {
  _id?: string
  linkedUserId?: string
  name: string
  seed: string
  avatarUrl?: string
  email: string
  role: string
  online: boolean
  favorite: boolean
  phone?: string
  address?: string
  relationship?: "friend" | "close-friend" | "family" | "worker" | "colleague" | "other"
  website?: string
  socialLinks?: { platform: string; url: string }[]
}

export interface UserSearchResult {
  _id: string
  name: string
  username: string
  email: string
  avatarSeed: string
  avatarUrl?: string
  role: string
  online: boolean
  createdAt?: string
}
