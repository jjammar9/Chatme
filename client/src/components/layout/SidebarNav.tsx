import NavItem from "../ui/NavItem"
import { sidebarNavItems } from "../../lib/navigation"

interface SidebarNavProps {
  activeKey: string
  onNavChange: (key: string) => void
}

export default function SidebarNav({ activeKey, onNavChange }: SidebarNavProps) {
  return (
    <nav className="flex-1 px-3 space-y-1">
      {sidebarNavItems.map((item) => (
        <NavItem
          key={item.key}
          icon={item.icon}
          label={item.label}
          active={item.key === activeKey}
          variant="dark"
          onClick={() => onNavChange(item.key)}
        />
      ))}
    </nav>
  )
}
