export default function SidebarProfile() {
  return (
    <div className="pl-7 pr-4 py-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-lg bg-off-white/10 overflow-hidden shrink-0">
          <img
            src="https://api.dicebear.com/9.x/avataaars/svg?seed=John&backgroundColor=eddbda"
            alt="avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold truncate">John Doe</p>
          <p className="text-sm font-semibold text-off-white/50 truncate">@johndoe</p>
        </div>
      </div>
    </div>
  )
}
