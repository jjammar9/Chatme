import SidebarLogo from "./SidebarLogo"
import SidebarNav from "./SidebarNav"
import SidebarBottom from "./SidebarBottom"

interface SidebarProps {
  activeKey: string
  onNavChange: (key: string) => void
  onViewProfile?: (id: string) => void
}

export default function Sidebar({ activeKey, onNavChange, onViewProfile }: SidebarProps) {
  return (
    <div className="flex flex-col h-full bg-dark-purple text-off-white">
      <SidebarLogo onClick={() => onNavChange("dashboard")} />
      <SidebarNav activeKey={activeKey} onNavChange={onNavChange} />
      <SidebarBottom onNavChange={onNavChange} onViewProfile={onViewProfile || (() => {})} />
    </div>
  )
}
