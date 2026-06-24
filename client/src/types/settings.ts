import type { ComponentType } from "react"

export type SettingsCategory = "profile" | "account" | "notifications" | "appearance" | "privacy" | "chat" | "storage" | "about"

export interface CategoryConfig {
  key: SettingsCategory
  label: string
  icon: ComponentType<{ size?: number; className?: string }>
}
