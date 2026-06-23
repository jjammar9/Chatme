import { navIcons } from "../lib/icons"

export interface NavItemConfig {
  key: string
  label: string
  icon: React.ReactNode
}

export const sidebarNavItems: NavItemConfig[] = [
  { key: "dashboard", label: "Dashboard", icon: navIcons.dashboard },
  { key: "messages", label: "Messages", icon: navIcons.messages },
  { key: "groups", label: "Groups", icon: navIcons.groups },
  { key: "favourites", label: "Favourites", icon: navIcons.favourites },
  { key: "calendar", label: "Calendar", icon: navIcons.calendar },
  { key: "files", label: "Files", icon: navIcons.files },
  { key: "tasks", label: "Tasks", icon: navIcons.tasks },
  { key: "settings", label: "Settings", icon: navIcons.settings },
]
