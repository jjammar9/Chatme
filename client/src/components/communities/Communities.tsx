import { useState } from "react"
import { Search, Users, Plus } from "lucide-react"
import Avatar from "../ui/Avatar"
import Badge from "../ui/Badge"
import Button from "../ui/Button"

const communities = [
  {
    name: "Project Squad",
    members: 8,
    online: 3,
    lastMessage: "Alex Chen: Count me in for the review session",
    time: "10:48",
    tags: ["Design", "Dev"],
    unread: 3,
    seeds: ["Sarah", "Alex", "Maya"],
  },
  {
    name: "Design Talks",
    members: 24,
    online: 7,
    lastMessage: "Jordan Kim: New UI kit dropped! Check it out 🔥",
    time: "1h ago",
    tags: ["Design"],
    unread: 0,
    seeds: ["Jordan", "Taylor", "Maya"],
  },
  {
    name: "Weekend Hikers",
    members: 15,
    online: 2,
    lastMessage: "Taylor Reed: Who's in for Saturday morning?",
    time: "3h ago",
    tags: ["Social"],
    unread: 5,
    seeds: ["Taylor", "Sarah", "Alex"],
  },
  {
    name: "Book Club",
    members: 12,
    online: 4,
    lastMessage: "Maya Patel: Halfway through the chapter, loving it so far",
    time: "5h ago",
    tags: ["Social"],
    unread: 0,
    seeds: ["Maya", "Jordan", "Taylor"],
  },
  {
    name: "Dev Ops",
    members: 31,
    online: 12,
    lastMessage: "Emily: Deployed the new build to staging 🚀",
    time: "2h ago",
    tags: ["Dev", "Work"],
    unread: 2,
    seeds: ["Alex", "Emily", "Sarah"],
  },
  {
    name: "Photography Club",
    members: 19,
    online: 6,
    lastMessage: "Jordan Kim: Who's up for a photo walk this weekend?",
    time: "6h ago",
    tags: ["Social", "Art"],
    unread: 0,
    seeds: ["Jordan", "Taylor", "Maya"],
  },
  {
    name: "Gaming Night",
    members: 22,
    online: 9,
    lastMessage: "Chris: Who's down for some Valorant tonight?",
    time: "30m ago",
    tags: ["Social", "Gaming"],
    unread: 7,
    seeds: ["Alex", "Chris", "Jordan"],
  },
  {
    name: "Startup Ideas",
    members: 14,
    online: 5,
    lastMessage: "Maya Patel: I think AI-powered chat is the next big thing",
    time: "4h ago",
    tags: ["Work", "Dev"],
    unread: 1,
    seeds: ["Maya", "Taylor", "Emily"],
  },
  {
    name: "Music Lovers",
    members: 43,
    online: 11,
    lastMessage: "Sarah Johnson: Anyone going to the concert next week?",
    time: "1h ago",
    tags: ["Social", "Art"],
    unread: 0,
    seeds: ["Sarah", "Jordan", "Chris"],
  },
  {
    name: "Fitness Crew",
    members: 17,
    online: 4,
    lastMessage: "Taylor Reed: New PR on deadlifts today! 💪",
    time: "2h ago",
    tags: ["Social"],
    unread: 0,
    seeds: ["Taylor", "Alex", "Sarah"],
  },
  {
    name: "AI Research",
    members: 28,
    online: 8,
    lastMessage: "Emily: Just published a new paper on transformers",
    time: "8h ago",
    tags: ["Dev", "Work"],
    unread: 4,
    seeds: ["Emily", "Maya", "Chris"],
  },
  {
    name: "Movie Club",
    members: 35,
    online: 14,
    lastMessage: "Jordan Kim: Saw Dune 2 last night — masterpiece 🎬",
    time: "12h ago",
    tags: ["Social", "Art"],
    unread: 12,
    seeds: ["Jordan", "Taylor", "Sarah"],
  },
]

const tags = ["All", "Design", "Dev", "Social", "Work", "Art"]

export default function Communities() {
  const [activeTag, setActiveTag] = useState("All")

  const filtered = activeTag === "All"
    ? communities
    : communities.filter((c) => c.tags.includes(activeTag))
  return (
    <div className="h-full bg-light-gray flex flex-col overflow-y-auto">
      <div className="bg-off-white border-b border-gray/30 px-8 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-dark-purple">Communities</h1>
            <p className="text-sm text-dark-purple/50 mt-1">{filtered.length} communities · 34 online</p>
          </div>
          <Button><Plus size="18" /> <span>Create</span></Button>
        </div>
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-purple/40" />
          <input
            type="text"
            placeholder="Search communities..."
            className="w-full bg-light-gray rounded-xl pl-10 pr-4 py-2.5 text-sm text-dark-purple placeholder-dark-purple/40 outline-none"
            aria-label="Search communities"
          />
        </div>
        <div className="flex items-center gap-2">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTag(t)}
              className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
                activeTag === t ? "bg-dark-purple text-off-white" : "bg-light-gray text-dark-purple/70 hover:bg-gray/30"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 px-8 py-6">
        <div className="grid grid-cols-3 gap-5">
          {filtered.map((c) => (
            <div key={c.name} className="bg-off-white rounded-xl border border-gray/20 p-5 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex -space-x-2">
                  {c.seeds.map((seed) => (
                    <div key={seed} className="ring-2 ring-off-white rounded-xl shrink-0">
                      <Avatar seed={seed} size="md" />
                    </div>
                  ))}
                  {c.members > 3 && (
                    <div className="w-10 h-10 rounded-xl bg-dark-purple ring-2 ring-off-white flex items-center justify-center">
                      <span className="text-sm font-bold text-off-white">+{c.members - 3}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={14} className="text-dark-purple/40" />
                  <span className="text-sm text-dark-purple/60 font-medium">{c.members}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green ml-1" />
                  <span className="text-sm text-dark-purple/60 font-medium">{c.online}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-dark-purple">{c.name}</h3>
                {c.unread > 0 && (
                  <Badge variant="warning">{c.unread} new</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mb-3">
                {c.tags.map((tag) => (
                  <Badge key={tag} variant="default" size="sm">{tag}</Badge>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-light-gray">
                <p className="text-sm text-dark-purple/60 truncate flex-1 min-w-0">{c.lastMessage}</p>
                <span className="text-xs text-dark-purple/40 shrink-0 ml-3">{c.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
