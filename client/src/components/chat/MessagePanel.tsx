import { Pin, ExternalLink } from "lucide-react"
import Avatar from "../ui/Avatar"

const avatars = [
  { name: "Alex", seed: "Alex" },
  { name: "Sarah", seed: "Sarah" },
  { name: "Mike", seed: "Mike" },
  { name: "Emma", seed: "Emma" },
]

const pinnedChats = [
  { name: "Emily Johnson", seed: "Emily", message: "Hey, are you coming to the party tonight?", time: "10:42", unread: 3 },
  { name: "David Chen", seed: "David", message: "The project presentation is scheduled for Friday", time: "09:15", unread: 0 },
  { name: "Sofia Martinez", seed: "Sofia", message: "Thanks for your help with the design review", time: "08:30", unread: 7 },
]

const allChats = [
  { name: "Jessica Williams", seed: "Jessica", message: "Sounds good! I'll see you there", time: "Yesterday", unread: 0 },
  { name: "Marcus Brown", seed: "Marcus", message: "Can you send me the file again?", time: "Yesterday", unread: 2 },
  { name: "Olivia Taylor", seed: "Olivia", message: "Great meeting with the team today", time: "Monday", unread: 0 },
]

function AvatarCircle({ seed, online }: { seed: string; online: boolean }) {
  return (
    <div className="relative w-11 h-11 shrink-0">
      <Avatar seed={seed} size="md" />
      {online && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green rounded-full border-2 border-off-white" />
      )}
    </div>
  )
}

function ChatItem({ chat }: { chat: { name: string; seed: string; message: string; time: string; unread: number } }) {
  return (
    <div className="flex items-start gap-3 pl-5 pr-1 py-2.5 hover:bg-light-gray/50 cursor-pointer">
      <Avatar seed={chat.seed} alt={chat.name} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-bold text-dark-purple truncate">{chat.name}</span>
          <span className="text-xs text-dark-purple/40 shrink-0 ml-2">{chat.time}</span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-xs text-dark-purple/50 truncate">{chat.message}</span>
          <div className="flex items-center shrink-0 ml-2">
            {chat.unread > 0 ? (
              <span className="w-5 h-5 rounded-full bg-dark-purple text-off-white text-[10px] font-bold flex items-center justify-center">{chat.unread}</span>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3.5 7L6 9.5L10.5 4.5" stroke="#1b0036" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.5 7L9 9.5L13.5 4.5" stroke="#1b0036" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MoreCircle() {
  return (
    <div className="w-11 h-11 shrink-0 rounded-lg bg-dark-purple flex flex-col items-center justify-center">
      <span className="text-sm font-bold text-off-white leading-none">+15</span>
    </div>
  )
}

export default function MessagePanel() {
  return (
    <div className="flex flex-col h-full bg-off-white">
      <div className="flex items-center justify-between pl-5 pr-1 py-6">
        <h2 className="text-lg font-bold text-dark-purple">Messages</h2>
        <button className="text-dark-purple hover:text-deep-purple transition-colors cursor-pointer" aria-label="New message">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="0.5" y="0.5" width="23" height="23" rx="3" fill="#d2d2d2" />
            <path d="M12 7v10M7 12h10" stroke="#1b0036" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="flex items-center gap-2.5 px-5 pb-5">
        {avatars.map((a) => (
          <AvatarCircle key={a.seed} seed={a.seed} online={true} />
        ))}
        <MoreCircle />
      </div>
      <div className="pl-5 pr-1 pb-5">
        <div className="relative">
          <input
            type="text"
            placeholder="Search or start a message"
            className="w-full h-9 rounded-lg bg-light-gray pl-3 pr-9 text-sm text-dark-purple placeholder:text-dark-purple/40 outline-none"
            aria-label="Search messages"
          />
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-purple/40"
          >
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center pl-5 pr-1 pb-2">
          <span className="text-lg font-bold text-dark-purple">Pinned Chats</span>
          <Pin size={16} className="ml-1.5 text-dark-purple" />
        </div>
        {pinnedChats.map((chat) => (
          <ChatItem key={chat.name} chat={chat} />
        ))}
        <div className="flex items-center pl-5 pr-1 pb-2 pt-4">
          <span className="text-lg font-bold text-dark-purple">All Chats</span>
          <ExternalLink size={16} className="ml-1.5 text-dark-purple" />
        </div>
        {allChats.map((chat) => (
          <ChatItem key={chat.name} chat={chat} />
        ))}
      </div>
    </div>
  )
}
