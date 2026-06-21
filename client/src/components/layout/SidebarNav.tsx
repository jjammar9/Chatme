import NavItem from "../ui/NavItem"
import { sidebarNavItems } from "../../lib/navigation"

const activeKey = "messages"

export default function SidebarNav() {
  return (
    <nav className="flex-1 px-3 space-y-1">
      {sidebarNavItems.map((item) => (
        <NavItem
          key={item.key}
          icon={item.icon}
          label={item.label}
          active={item.key === activeKey}
          variant="dark"
        />
      ))}
    </nav>
  )
}
