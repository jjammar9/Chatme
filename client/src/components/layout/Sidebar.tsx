import SidebarLogo from "./SidebarLogo"
import SidebarNav from "./SidebarNav"
import SidebarProfile from "./SidebarProfile"

export default function Sidebar() {
  return (
    <div className="flex flex-col h-full bg-dark-purple text-off-white">
      <SidebarLogo />
      <SidebarNav />
      <SidebarProfile />
    </div>
  )
}
