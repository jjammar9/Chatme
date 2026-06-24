import { Inbox } from "lucide-react"

export default function EmptyState({ icon: Icon, title, description }: { icon?: React.ComponentType<{ size?: number; className?: string }>; title: string; description?: string }) {
  const I = Icon || Inbox
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-light-gray flex items-center justify-center mb-4">
        <I size={24} className="text-dark-purple/30" />
      </div>
      <p className="text-sm font-semibold text-dark-purple/60">{title}</p>
      {description && <p className="text-xs text-dark-purple/40 mt-1 max-w-xs">{description}</p>}
    </div>
  )
}
