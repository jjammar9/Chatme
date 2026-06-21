import { Avatar, Badge, Input } from "../ui"

const chats = [
  { name: "Alice Johnson", lastMsg: "Hey, are you coming tonight?", time: "2m", unread: 3, online: true },
  { name: "Design Team", lastMsg: "Sarah: Mockups are ready for review", time: "15m", unread: 0, online: false, group: true },
  { name: "Bob Smith", lastMsg: "Sure, sounds good!", time: "1h", unread: 0, online: true },
  { name: "Project Alpha", lastMsg: "Mike: Deploy scheduled for tomorrow", time: "2h", unread: 1, online: false, group: true },
  { name: "Carol White", lastMsg: "Thanks for the help!", time: "3h", unread: 0, online: false },
  { name: "David Park", lastMsg: "Let me check and get back to you", time: "5h", unread: 0, online: false },
]

export default function ChatList() {
  return (
    <div className="flex flex-col h-full bg-off-white">
      <div className="px-5 py-4 border-b border-gray/30">
        <h2 className="text-lg font-semibold text-deep-purple mb-3">Messages</h2>
        <Input placeholder="Search conversations..." />
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <button
            key={chat.name}
            className="w-full flex items-start gap-3 px-5 py-4 hover:bg-light-gray transition-colors duration-150 cursor-pointer text-left border-b border-gray/20"
          >
            <Avatar size="md" alt={chat.name} status={chat.online ? "online" : "offline"} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-deep-purple truncate">{chat.name}</h3>
                <span className="text-xs text-gray shrink-0 ml-2">{chat.time}</span>
              </div>
              <p className="text-sm text-gray truncate mt-0.5">{chat.lastMsg}</p>
            </div>
            {chat.unread > 0 && (
              <Badge variant="info" size="sm" className="ml-auto shrink-0 mt-1">
                {chat.unread}
              </Badge>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
