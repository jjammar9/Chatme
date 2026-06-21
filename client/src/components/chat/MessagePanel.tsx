import { Avatar, Input, Badge, Separator } from "../ui"

const currentChat = {
  name: "Alice Johnson",
  online: true,
}

const messages = [
  { text: "Hey! How's it going?", sent: false, time: "10:30 AM" },
  { text: "I'm good thanks! Ready for tonight?", sent: true, time: "10:31 AM" },
  { text: "Absolutely! What time should I be there?", sent: false, time: "10:32 AM" },
  { text: "Around 7pm works for me 🎉", sent: true, time: "10:33 AM" },
  { text: "Perfect, I'll see you then!", sent: false, time: "10:34 AM" },
]

const pinnedMessages = [
  "Sarah: Mockups are ready for review",
  "Reminder: Team meeting at 3pm",
]

export default function MessagePanel() {
  return (
    <div className="flex flex-col h-full bg-off-white">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray/30">
        <Avatar size="md" alt={currentChat.name} status={currentChat.online ? "online" : "offline"} />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-deep-purple">{currentChat.name}</h3>
          <p className="text-xs text-green">{currentChat.online ? "Online" : "Offline"}</p>
        </div>
        <button className="text-gray hover:text-deep-purple transition-colors cursor-pointer">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
          </svg>
        </button>
      </div>

      {pinnedMessages.length > 0 && (
        <div className="px-5 py-3 bg-light-green/30 border-b border-gray/20">
          <p className="text-xs font-medium text-green mb-2">📌 Pinned</p>
          {pinnedMessages.map((msg, i) => (
            <p key={i} className="text-sm text-deep-purple/80 truncate">{msg}</p>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}>
            <div
              className={`
                max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                ${msg.sent
                  ? "bg-dark-purple text-off-white rounded-br-md"
                  : "bg-light-gray text-deep-purple rounded-bl-md"
                }
              `}
            >
              <p>{msg.text}</p>
              <p className={`text-[10px] mt-1 ${msg.sent ? "text-off-white/50" : "text-gray"}`}>{msg.time}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-4 border-t border-gray/30">
        <div className="flex items-center gap-2">
          <button className="text-gray hover:text-deep-purple transition-colors cursor-pointer shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
            </svg>
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-light-gray rounded-lg px-4 py-2.5 text-sm text-deep-purple placeholder:text-gray/60 focus:outline-none focus:ring-2 focus:ring-dark-purple/20"
          />
          <button className="bg-dark-purple text-off-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-deep-purple transition-colors cursor-pointer shrink-0">
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
