export interface Contact {
  name: string
  seed: string
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
