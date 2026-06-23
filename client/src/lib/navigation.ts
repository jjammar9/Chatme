import { navIcons } from "../lib/icons"

export interface NavItemConfig {
  key: string
  label: string
  icon: React.ReactNode
}

export const sidebarNavItems: NavItemConfig[] = [
  { key: "dashboard", label: "Dashboard", icon: navIcons.dashboard },
  { key: "messages", label: "Messages", icon: navIcons.messages },
  { key: "communities", label: "Communities", icon: navIcons.groups },
  { key: "contacts", label: "Contacts", icon: navIcons.favourites },
  { key: "calendar", label: "Calendar", icon: navIcons.calendar },
  { key: "files", label: "Files", icon: navIcons.files },
  { key: "tasks", label: "Tasks", icon: navIcons.tasks },
  { key: "settings", label: "Settings", icon: navIcons.settings },
  { key: "logout", label: "Logout", icon: navIcons.logout },
]
