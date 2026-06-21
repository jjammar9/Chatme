import SidebarLogo from "./SidebarLogo"
import SidebarNav from "./SidebarNav"
import SidebarProfile from "./SidebarProfile"

interface SidebarProps {
  activeKey: string
  onNavChange: (key: string) => void
}

export default function Sidebar({ activeKey, onNavChange }: SidebarProps) {
  return (
    <div className="flex flex-col h-full bg-dark-purple text-off-white">
      <SidebarLogo />
      <SidebarNav activeKey={activeKey} onNavChange={onNavChange} />
      <SidebarProfile />
    </div>
  )
}
