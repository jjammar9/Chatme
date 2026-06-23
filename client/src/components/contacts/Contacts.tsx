import { useState } from "react"
import { Star, MessageCircle, Mail, Search, Plus, X, Users } from "lucide-react"

const communities = [
  { name: "Project Squad", seeds: ["Sarah", "Alex", "Maya"] },
  { name: "Design Talks", seeds: ["Jordan", "Taylor", "Maya"] },
  { name: "Weekend Hikers", seeds: ["Taylor", "Sarah", "Alex"] },
  { name: "Book Club", seeds: ["Maya", "Jordan", "Taylor"] },
  { name: "Dev Ops", seeds: ["Alex", "Emily", "Sarah"] },
  { name: "Photography Club", seeds: ["Jordan", "Taylor", "Maya"] },
  { name: "Gaming Night", seeds: ["Alex", "Chris", "Jordan"] },
  { name: "Startup Ideas", seeds: ["Maya", "Taylor", "Emily"] },
  { name: "Music Lovers", seeds: ["Sarah", "Jordan", "Chris"] },
  { name: "Fitness Crew", seeds: ["Taylor", "Alex", "Sarah"] },
  { name: "AI Research", seeds: ["Emily", "Maya", "Chris"] },
  { name: "Movie Club", seeds: ["Jordan", "Taylor", "Sarah"] },
]

const seedCommunities: Record<string, string[]> = {}
for (const c of communities) {
  for (const s of c.seeds) {
    if (!seedCommunities[s]) seedCommunities[s] = []
    seedCommunities[s].push(c.name)
  }
}

interface Contact {
  name: string
  seed: string
  email: string
  role: string
  online: boolean
  favorite: boolean
  phone?: string
}

const allContacts: Contact[] = [
  { name: "Sarah Johnson", seed: "Sarah", email: "sarah.j@design.co", role: "Lead Designer", online: true, favorite: true, phone: "+1 555-0101" },
  { name: "Jordan Kim", seed: "Jordan", email: "jordan.k@dev.io", role: "Full-Stack Dev", online: true, favorite: true, phone: "+1 555-0102" },
  { name: "Maya Patel", seed: "Maya", email: "maya.p@backend.dev", role: "Backend Engineer", online: false, favorite: true, phone: "+1 555-0103" },
  { name: "Taylor Reed", seed: "Taylor", email: "taylor.r@product.org", role: "Product Manager", online: true, favorite: false, phone: "+1 555-0104" },
  { name: "Alex Chen", seed: "Alex", email: "alex.c@ml.dev", role: "ML Engineer", online: false, favorite: false, phone: "+1 555-0105" },
  { name: "Emily Davis", seed: "Emily", email: "emily.d@frontend.dev", role: "Frontend Dev", online: true, favorite: false, phone: "+1 555-0106" },
  { name: "Marcus Lee", seed: "Marcus", email: "marcus.l@data.dev", role: "Data Analyst", online: false, favorite: false, phone: "+1 555-0107" },
  { name: "Priya Sharma", seed: "Priya", email: "priya.s@qa.dev", role: "QA Lead", online: true, favorite: false, phone: "+1 555-0108" },
]

export default function Contacts({ onChat }: { onChat: () => void }) {
  const [contacts, setContacts] = useState<Contact[]>(allContacts)
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [filter, setFilter] = useState<"all" | "favorites">("all")

  const toggleFavorite = (name: string) => {
    setContacts((prev) => prev.map((c) => (c.name === name ? { ...c, favorite: !c.favorite } : c)))
  }

  const addContact = () => {
    if (!newName.trim()) return
    const seed = newName.split(" ")[0]
    setContacts((prev) => [
      ...prev,
      { name: newName.trim(), seed, email: newEmail.trim() || `${seed.toLowerCase()}@email.com`, role: "Contact", online: false, favorite: false },
    ])
    setNewName("")
    setNewEmail("")
    setShowAdd(false)
  }

  const filtered = contacts.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "all" || c.favorite
    return matchSearch && matchFilter
  })

  const favorites = filtered.filter((c) => c.favorite)
  const others = filtered.filter((c) => !c.favorite)

  return (
    <div className="h-full bg-light-gray flex flex-col overflow-y-auto">
      <div className="bg-off-white border-b border-gray/30 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-dark-purple">Contacts</h1>
            <p className="text-base text-dark-purple/50 mt-1">{contacts.length} contacts · {contacts.filter((c) => c.online).length} online</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 bg-dark-purple text-off-white text-base font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
            <Plus size={18} /> Add Contact
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAdd(false)}>
          <div className="bg-off-white rounded-2xl p-6 w-96 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-dark-purple">Add Contact</h3>
              <button onClick={() => setShowAdd(false)}><X size={20} className="text-dark-purple/50" /></button>
            </div>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full name" className="w-full bg-light-gray text-dark-purple text-base px-3 py-2.5 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-dark-purple/30" />
            <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email (optional)" className="w-full bg-light-gray text-dark-purple text-base px-3 py-2.5 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-dark-purple/30" />
            <button onClick={addContact} className="w-full bg-dark-purple text-off-white text-base font-semibold py-2.5 rounded-lg hover:opacity-90 transition-opacity">Add</button>
          </div>
        </div>
      )}

      <div className="px-8 py-4">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-purple/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-off-white text-dark-purple text-base pl-9 pr-3 py-2.5 rounded-lg border border-gray/20 outline-none focus:ring-2 focus:ring-dark-purple/30"
          />
        </div>
        <div className="flex items-center gap-2 mt-3">
          {(["all", "favorites"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`text-sm font-medium px-4 py-1.5 rounded-full capitalize transition-colors ${filter === f ? "bg-dark-purple text-off-white" : "bg-off-white text-dark-purple/60 border border-gray/20"}`}>
              {f === "all" ? "All" : "⭐ Favourites"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-8 pb-6 space-y-6">
        {favorites.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star size={16} className="text-dark-purple/30 fill-dark-purple/20" />
              <h2 className="text-base font-bold text-dark-purple">Favourites</h2>
              <span className="text-xs text-dark-purple/40">{favorites.length}</span>
            </div>
            <div className="space-y-0 bg-off-white rounded-xl border border-gray/20 overflow-hidden">
              {favorites.map((c) => (
                <ContactRow key={c.name} contact={c} onToggleFavorite={toggleFavorite} onChat={onChat} />
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Mail size={16} className="text-dark-purple/50" />
            <h2 className="text-base font-bold text-dark-purple">All Contacts</h2>
            <span className="text-xs text-dark-purple/40">{others.length}</span>
          </div>
          <div className="space-y-0 bg-off-white rounded-xl border border-gray/20 overflow-hidden">
            {others.length > 0 ? others.map((c) => (
              <ContactRow key={c.name} contact={c} onToggleFavorite={toggleFavorite} onChat={onChat} />
            )) : (
              <div className="px-5 py-8 text-center text-base text-dark-purple/40">No contacts match your search</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ContactRow({ contact, onToggleFavorite, onChat }: { contact: Contact; onToggleFavorite: (name: string) => void; onChat: () => void }) {
  const shared = seedCommunities[contact.seed] ?? []
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-light-gray last:border-0 hover:bg-light-gray/50 transition-colors group">
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-light-gray">
          <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${contact.seed}&backgroundColor=eddbda`} alt="" className="w-full h-full object-cover" />
        </div>
        {contact.online && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green ring-2 ring-off-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-dark-purple">{contact.name}</span>
          <span className="text-xs text-dark-purple/40 bg-light-gray px-2 py-0.5 rounded-full">{contact.role}</span>
        </div>
        <p className="text-sm text-dark-purple/50 truncate">{contact.email}{contact.phone && ` · ${contact.phone}`}</p>
        {shared.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <Users size={12} className="text-dark-purple/30 shrink-0" />
            {shared.slice(0, 3).map((cn) => (
              <span key={cn} className="text-xs text-dark-purple bg-light-green px-2 py-0.5 rounded-full">{cn}</span>
            ))}
            {shared.length > 3 && <span className="text-xs text-dark-purple/40">+{shared.length - 3}</span>}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onChat} className="p-2 rounded-lg hover:bg-light-gray transition-colors" title="Chat">
          <MessageCircle size={18} className="text-dark-purple/60" />
        </button>
        <button onClick={() => onToggleFavorite(contact.name)} className="p-2 rounded-lg hover:bg-light-gray transition-colors" title={contact.favorite ? "Unfavourite" : "Favourite"}>
          <Star size={18} className={contact.favorite ? "text-dark-purple/50 fill-dark-purple/20" : "text-dark-purple/30"} />
        </button>
      </div>
    </div>
  )
}
