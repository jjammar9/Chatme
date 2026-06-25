import { useState, useEffect } from "react"
import NavItem from "../ui/NavItem"
import { sidebarNavItems } from "../../lib/navigation"
import { conversations } from "../../lib/api"

interface SidebarNavProps {
  activeKey: string
  onNavChange: (key: string) => void
}

export default function SidebarNav({ activeKey, onNavChange }: SidebarNavProps) {
  const [totalUnread, setTotalUnread] = useState(0)

  const fetchUnread = async () => {
    try {
      const data = await conversations.list()
      const total = (data.conversations || []).reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0)
      setTotalUnread(total)
    } catch { /* ignore */ }
  }

  useEffect(() => {
    fetchUnread()
    const id = setInterval(fetchUnread, 10000)

    const handleUnreadCleared = (e: Event) => {
      const detail = (e as CustomEvent).detail
      setTotalUnread((prev) => Math.max(0, prev - detail))
    }
    window.addEventListener("unread-cleared", handleUnreadCleared)
    return () => { clearInterval(id); window.removeEventListener("unread-cleared", handleUnreadCleared) }
  }, [])

  return (
    <nav className="flex-1 px-3 space-y-1">
      {sidebarNavItems.map((item) => {
        const isLogout = item.key === "logout"
        return (
          <NavItem
            key={item.key}
            icon={item.icon}
            label={item.label}
            active={item.key === activeKey}
            variant="dark"
            onClick={() => onNavChange(item.key)}
            className={isLogout ? "text-off-white/50 hover:text-off-white hover:bg-off-white/10" : ""}
            badge={item.key === "messages" ? totalUnread : undefined}
          />
        )
      })}
    </nav>
  )
}