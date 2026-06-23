export default function SidebarProfile({ onNavChange }: { onNavChange: (key: string) => void }) {
  return (
    <button onClick={() => onNavChange("settings")} className="w-full pl-7 pr-4 py-4 hover:bg-off-white/5 transition-colors text-left">
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
    </button>
  )
}
