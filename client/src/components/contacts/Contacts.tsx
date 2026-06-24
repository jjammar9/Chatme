import { useState } from "react"
import { Star, MessageCircle, Mail, Search, Plus, X, Users, Globe, Link, MapPin, Phone, Image, ChevronDown, Send } from "lucide-react"
import type { Contact } from "../../types"
import Avatar from "../ui/Avatar"
import Badge from "../ui/Badge"
import Button from "../ui/Button"
import Modal from "../ui/Modal"

const communities = [
  { name: "Project Squad", seeds: ["Sarah", "Alex", "Maya"] },
  { name: "Design Talks", seeds: ["Jordan", "Taylor", "Maya", "Chloe", "Mia"] },
  { name: "Weekend Hikers", seeds: ["Taylor", "Sarah", "Alex", "Liam", "Ryan"] },
  { name: "Book Club", seeds: ["Maya", "Jordan", "Taylor", "Ava", "Sophia"] },
  { name: "Dev Ops", seeds: ["Alex", "Emily", "Sarah", "Ethan", "Lucas"] },
  { name: "Photography Club", seeds: ["Jordan", "Taylor", "Maya", "Zoe", "Isabella"] },
  { name: "Gaming Night", seeds: ["Alex", "Chris", "Jordan", "Noah", "Mason"] },
  { name: "Startup Ideas", seeds: ["Maya", "Taylor", "Emily", "Ryan", "Lucas"] },
  { name: "Music Lovers", seeds: ["Sarah", "Jordan", "Chris", "Chloe", "Mia"] },
  { name: "Fitness Crew", seeds: ["Taylor", "Alex", "Sarah", "Ethan", "Noah"] },
  { name: "AI Research", seeds: ["Emily", "Maya", "Chris", "Ryan", "Lucas"] },
  { name: "Movie Club", seeds: ["Jordan", "Taylor", "Sarah", "Ava", "Zoe"] },
  { name: "Foodies", seeds: ["Chloe", "Liam", "Mia", "Sophia"] },
  { name: "Travel Buddies", seeds: ["Isabella", "Ethan", "Lucas", "Ava"] },
  { name: "Remote Crew", seeds: ["Zoe", "Noah", "Mason", "Ryan"] },
]

const seedCommunities: Record<string, string[]> = {}
for (const c of communities) {
  for (const s of c.seeds) {
    if (!seedCommunities[s]) seedCommunities[s] = []
    seedCommunities[s].push(c.name)
  }
}

const allContacts: Contact[] = [
  { name: "Sarah Johnson", seed: "Sarah", email: "sarah.j@design.co", role: "Lead Designer", online: true, favorite: true, phone: "+1 555-0101", address: "123 Design St, NYC", relationship: "close-friend", website: "https://sarahj.design", socialLinks: [{ platform: "Twitter", url: "https://x.com/sarahj" }, { platform: "Dribbble", url: "https://dribbble.com/sarahj" }] },
  { name: "Jordan Kim", seed: "Jordan", email: "jordan.k@dev.io", role: "Full-Stack Dev", online: true, favorite: true, phone: "+1 555-0102", relationship: "friend", socialLinks: [{ platform: "GitHub", url: "https://github.com/jordank" }] },
  { name: "Maya Patel", seed: "Maya", email: "maya.p@backend.dev", role: "Backend Engineer", online: false, favorite: true, phone: "+1 555-0103", address: "456 Oak Ave, SF", relationship: "family", website: "https://mayapatel.dev" },
  { name: "Taylor Reed", seed: "Taylor", email: "taylor.r@product.org", role: "Product Manager", online: true, favorite: true, phone: "+1 555-0104", relationship: "worker" },
  { name: "Alex Chen", seed: "Alex", email: "alex.c@ml.dev", role: "ML Engineer", online: false, favorite: true, phone: "+1 555-0105", address: "789 Pine Rd, Seattle", relationship: "colleague", socialLinks: [{ platform: "LinkedIn", url: "https://linkedin.com/in/alexchen" }] },
  { name: "Emily Davis", seed: "Emily", email: "emily.d@frontend.dev", role: "Frontend Dev", online: true, favorite: true, phone: "+1 555-0106", relationship: "friend", website: "https://emilyd.dev" },
  { name: "Marcus Lee", seed: "Marcus", email: "marcus.l@data.dev", role: "Data Analyst", online: false, favorite: false, phone: "+1 555-0107", address: "321 Elm St, Austin", relationship: "worker" },
  { name: "Priya Sharma", seed: "Priya", email: "priya.s@qa.dev", role: "QA Lead", online: true, favorite: false, phone: "+1 555-0108", relationship: "colleague", socialLinks: [{ platform: "Twitter", url: "https://x.com/priyas" }] },
  { name: "Liam O'Brien", seed: "Liam", email: "liam.o@mobile.dev", role: "iOS Developer", online: true, favorite: false, phone: "+1 555-0109", address: "654 Birch Ln, Portland", relationship: "friend", website: "https://liamob.dev" },
  { name: "Zoe Williams", seed: "Zoe", email: "zoe.w@creative.co", role: "UX Designer", online: false, favorite: false, phone: "+1 555-0110", relationship: "colleague", socialLinks: [{ platform: "Dribbble", url: "https://dribbble.com/zoew" }] },
  { name: "Ethan Brown", seed: "Ethan", email: "ethan.b@sysadmin.io", role: "DevOps Engineer", online: true, favorite: false, phone: "+1 555-0111", address: "987 Cedar Ct, Denver", relationship: "worker" },
  { name: "Chloe Garcia", seed: "Chloe", email: "chloe.g@marketing.co", role: "Marketing Lead", online: false, favorite: false, phone: "+1 555-0112", relationship: "close-friend", website: "https://chloeg.design", socialLinks: [{ platform: "Instagram", url: "https://instagram.com/chloeg" }] },
  { name: "Ryan Martinez", seed: "Ryan", email: "ryan.m@data.co", role: "Data Scientist", online: true, favorite: false, phone: "+1 555-0113", address: "111 Walnut Ave, Chicago", relationship: "colleague" },
  { name: "Ava Thompson", seed: "Ava", email: "ava.t@support.io", role: "Customer Success", online: false, favorite: false, phone: "+1 555-0114", relationship: "friend", socialLinks: [{ platform: "LinkedIn", url: "https://linkedin.com/in/avat" }] },
  { name: "Noah White", seed: "Noah", email: "noah.w@security.dev", role: "Security Engineer", online: true, favorite: false, phone: "+1 555-0115", address: "222 Pine St, Boston", relationship: "worker" },
  { name: "Isabella King", seed: "Isabella", email: "isabella.k@legal.co", role: "Legal Counsel", online: false, favorite: false, phone: "+1 555-0116", relationship: "family" },
  { name: "Mason Clark", seed: "Mason", email: "mason.c@finance.io", role: "Finance Manager", online: true, favorite: false, phone: "+1 555-0117", address: "333 Lake Dr, Miami", relationship: "worker" },
  { name: "Sophia Hall", seed: "Sophia", email: "sophia.h@hr.co", role: "HR Director", online: false, favorite: false, phone: "+1 555-0118", relationship: "colleague", website: "https://sophiah.co" },
  { name: "Lucas Young", seed: "Lucas", email: "lucas.y@consulting.io", role: "Strategy Consultant", online: true, favorite: false, phone: "+1 555-0119", address: "444 Oak St, Dallas", relationship: "friend", socialLinks: [{ platform: "Twitter", url: "https://x.com/lucasy" }] },
  { name: "Mia Turner", seed: "Mia", email: "mia.t@health.io", role: "Product Designer", online: false, favorite: false, phone: "+1 555-0120", relationship: "close-friend", website: "https://miaturner.design" },
]

export default function Contacts({ onChat }: { onChat: () => void }) {
  const [contacts, setContacts] = useState<Contact[]>(allContacts)
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newAddress, setNewAddress] = useState("")
  const [newRelationship, setNewRelationship] = useState<Contact["relationship"]>(undefined)
  const [newSeed, setNewSeed] = useState("")
  const [newWebsite, setNewWebsite] = useState("")
  const [newSocials, setNewSocials] = useState<{ platform: string; url: string }[]>([])
  const [filter, setFilter] = useState<"all" | "favorites">("all")
  const [favOpen, setFavOpen] = useState(true)
  const [allOpen, setAllOpen] = useState(true)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  const toggleFavorite = (name: string) => {
    setContacts((prev) => prev.map((c) => (c.name === name ? { ...c, favorite: !c.favorite } : c)))
  }

  const addContact = () => {
    if (!newName.trim()) return
    const seed = newSeed.trim() || newName.split(" ")[0]
    setContacts((prev) => [
      ...prev,
      {
        name: newName.trim(),
        seed,
        email: newEmail.trim() || `${seed.toLowerCase()}@email.com`,
        role: "Contact",
        online: false,
        favorite: false,
        phone: newPhone.trim() || undefined,
        address: newAddress.trim() || undefined,
        relationship: newRelationship,
        website: newWebsite.trim() || undefined,
        socialLinks: newSocials.filter((s) => s.platform && s.url) || undefined,
      },
    ])
    setNewName("")
    setNewEmail("")
    setNewPhone("")
    setNewAddress("")
    setNewRelationship(undefined)
    setNewSeed("")
    setNewWebsite("")
    setNewSocials([])
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
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-3xl font-bold text-dark-purple">Contacts</h1>
            <p className="text-base text-dark-purple/50 mt-1">{contacts.length} contacts · {contacts.filter((c) => c.online).length} online</p>
          </div>
          <Button onClick={() => setShowAdd(true)}>
            <Plus size={18} /> <span>Add Contact</span>
          </Button>
        </div>
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-purple/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-light-gray rounded-xl pl-10 pr-4 py-2.5 text-sm text-dark-purple placeholder-dark-purple/40 outline-none focus:ring-2 focus:ring-dark-purple/10"
            aria-label="Search contacts"
          />
        </div>
        <div className="flex items-center gap-2">
          {(["all", "favorites"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`text-sm font-medium px-4 py-1.5 rounded-full capitalize transition-colors ${filter === f ? "bg-dark-purple text-off-white" : "bg-light-gray text-dark-purple/60 hover:bg-gray/30"}`}>
              {f === "all" ? "All" : "⭐ Favourites"}
            </button>
          ))}
        </div>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Contact" size="md">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <Avatar seed={newSeed.trim() || newName.trim() || "user"} size="xl" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-dark-purple/50 mb-1.5 block">Full Name *</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. John Doe" className="w-full bg-light-gray text-dark-purple text-sm px-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-dark-purple/30" aria-label="Contact name" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-dark-purple/50 mb-1.5 block"><Image size="12" className="inline mr-1" />Avatar seed (optional)</label>
            <input value={newSeed} onChange={(e) => setNewSeed(e.target.value)} placeholder="Custom avatar name (defaults to first name)" className="w-full bg-light-gray text-dark-purple text-sm px-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-dark-purple/30" aria-label="Avatar seed" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-dark-purple/50 mb-1.5 block">Email</label>
              <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@example.com" className="w-full bg-light-gray text-dark-purple text-sm px-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-dark-purple/30" aria-label="Contact email" />
            </div>
            <div>
              <label className="text-xs font-semibold text-dark-purple/50 mb-1.5 block"><Phone size="12" className="inline mr-1" />Phone</label>
              <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+1 555-0000" className="w-full bg-light-gray text-dark-purple text-sm px-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-dark-purple/30" aria-label="Contact phone" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-dark-purple/50 mb-1.5 block"><MapPin size="12" className="inline mr-1" />Address</label>
            <input value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder="123 Main St, City" className="w-full bg-light-gray text-dark-purple text-sm px-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-dark-purple/30" aria-label="Contact address" />
          </div>
          <div>
            <label className="text-xs font-semibold text-dark-purple/50 mb-1.5 block">Relationship</label>
            <div className="flex flex-wrap gap-1.5">
              {(["friend", "close-friend", "family", "worker", "colleague", "other"] as const).map((r) => (
                <button key={r} onClick={() => setNewRelationship(newRelationship === r ? undefined : r)} className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize transition-colors ${newRelationship === r ? "bg-dark-purple text-off-white" : "bg-light-gray text-dark-purple/60 hover:bg-gray/30"}`}>
                  {r.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-dark-purple/50 mb-1.5 block"><Globe size="12" className="inline mr-1" />Website</label>
            <input value={newWebsite} onChange={(e) => setNewWebsite(e.target.value)} placeholder="https://example.com" className="w-full bg-light-gray text-dark-purple text-sm px-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-dark-purple/30" aria-label="Contact website" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-dark-purple/50"><Link size="12" className="inline mr-1" />Social Links</label>
              <button onClick={() => setNewSocials([...newSocials, { platform: "", url: "" }])} className="text-xs font-medium text-dark-purple/50 hover:text-dark-purple" aria-label="Add social link">+ Add</button>
            </div>
            <div className="space-y-2">
              {newSocials.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={s.platform} onChange={(e) => { const copy = [...newSocials]; copy[i] = { ...copy[i], platform: e.target.value }; setNewSocials(copy) }} placeholder="Platform" className="w-24 bg-light-gray text-dark-purple text-sm px-3 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-dark-purple/30" aria-label="Social platform" />
                  <input value={s.url} onChange={(e) => { const copy = [...newSocials]; copy[i] = { ...copy[i], url: e.target.value }; setNewSocials(copy) }} placeholder="https://..." className="flex-1 bg-light-gray text-dark-purple text-sm px-3 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-dark-purple/30" aria-label="Social URL" />
                  <button onClick={() => setNewSocials(newSocials.filter((_, j) => j !== i))} className="p-1.5 rounded-lg hover:bg-light-gray text-dark-purple/40 hover:text-dark-purple transition-colors" aria-label="Remove social link"><X size="14" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-light-gray">
          <Button fullWidth variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
          <Button fullWidth onClick={addContact}>Add Contact</Button>
        </div>
      </Modal>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 px-8 py-6 space-y-5 overflow-y-auto">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold text-dark-purple/50">{contacts.length} total</span>
            <span className="w-1 h-1 rounded-full bg-green" />
            <span className="text-dark-purple/60">{contacts.filter((c) => c.online).length} online</span>
            <span className="w-px h-3 bg-gray/30" />
            <span className="text-dark-purple/60">{contacts.filter((c) => c.relationship === "friend" || c.relationship === "close-friend").length} friends</span>
            <span className="text-dark-purple/40">·</span>
            <span className="text-dark-purple/60">{contacts.filter((c) => c.relationship === "family").length} family</span>
            <span className="text-dark-purple/40">·</span>
            <span className="text-dark-purple/60">{contacts.filter((c) => c.relationship === "worker" || c.relationship === "colleague").length} work</span>
          </div>
          {favorites.length > 0 && (
            <div>
              <button onClick={() => setFavOpen(!favOpen)} aria-expanded={favOpen} className="flex items-center gap-2 mb-3 w-full text-left" aria-label={favOpen ? "Collapse favourites" : "Expand favourites"}>
                <ChevronDown size={16} className={`text-dark-purple/30 transition-transform ${favOpen ? "" : "-rotate-90"}`} />
                <Star size={16} className="text-dark-purple/30 fill-dark-purple/20" />
                <h2 className="text-base font-bold text-dark-purple">Favourites</h2>
                <span className="text-xs text-dark-purple/40">{favorites.length}</span>
              </button>
              {favOpen && (
                <div className="space-y-0 bg-off-white rounded-xl border border-gray/20 overflow-hidden">
                  {favorites.map((c) => (
                    <ContactRow key={c.name} contact={c} onSelect={setSelectedContact} onToggleFavorite={toggleFavorite} onChat={onChat} selected={selectedContact?.name === c.name} />
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <button onClick={() => setAllOpen(!allOpen)} aria-expanded={allOpen} className="flex items-center gap-2 mb-3 w-full text-left" aria-label={allOpen ? "Collapse all contacts" : "Expand all contacts"}>
              <ChevronDown size={16} className={`text-dark-purple/30 transition-transform ${allOpen ? "" : "-rotate-90"}`} />
              <Mail size={16} className="text-dark-purple/50" />
              <h2 className="text-base font-bold text-dark-purple">All Contacts</h2>
              <span className="text-xs text-dark-purple/40">{others.length}</span>
            </button>
            {allOpen && (
              <div className="space-y-0 bg-off-white rounded-xl border border-gray/20 overflow-hidden">
                {others.length > 0 ? others.map((c) => (
                  <ContactRow key={c.name} contact={c} onSelect={setSelectedContact} onToggleFavorite={toggleFavorite} onChat={onChat} selected={selectedContact?.name === c.name} />
                )) : (
                  <div className="px-5 py-8 text-center text-base text-dark-purple/40">No contacts match your search</div>
                )}
              </div>
            )}
          </div>
        </div>

        {selectedContact && (
          <ContactDetail contact={selectedContact} onClose={() => setSelectedContact(null)} onChat={onChat} />
        )}
      </div>
    </div>
  )
}

const relationshipColors: Record<string, string> = {
  friend: "bg-light-green text-dark-purple",
  "close-friend": "bg-rose/40 text-dark-purple",
  family: "bg-green/20 text-dark-purple",
  worker: "bg-dark-purple/10 text-dark-purple",
  colleague: "bg-rose/20 text-dark-purple",
  other: "bg-light-gray text-dark-purple/60",
}

function ContactDetail({ contact, onClose, onChat }: { contact: Contact; onClose: () => void; onChat: () => void }) {
  const shared = seedCommunities[contact.seed] ?? []
  return (
    <div className="w-80 shrink-0 border-l border-gray/20 bg-off-white flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray/20">
        <h3 className="text-sm font-bold text-dark-purple">Contact Info</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-light-gray text-dark-purple/40 hover:text-dark-purple transition-colors" aria-label="Close detail panel">
          <X size="16" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="flex flex-col items-center mb-6">
          <Avatar seed={contact.seed} size="xl" status={contact.online ? "online" : undefined} />
          <h2 className="text-lg font-bold text-dark-purple mt-3">{contact.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="info" size="sm">{contact.role}</Badge>
            {contact.relationship && (
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${relationshipColors[contact.relationship] || ""}`}>
                {contact.relationship.replace("-", " ")}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {contact.email && (
            <div className="flex items-center gap-2.5 text-sm text-dark-purple/70">
              <Mail size="14" className="text-dark-purple/30 shrink-0" />
              <span className="truncate">{contact.email}</span>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-2.5 text-sm text-dark-purple/70">
              <Phone size="14" className="text-dark-purple/30 shrink-0" />
              <span>{contact.phone}</span>
            </div>
          )}
          {contact.address && (
            <div className="flex items-center gap-2.5 text-sm text-dark-purple/70">
              <MapPin size="14" className="text-dark-purple/30 shrink-0" />
              <span>{contact.address}</span>
            </div>
          )}
          {contact.website && (
            <a href={contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-dark-purple/70 hover:text-dark-purple">
              <Globe size="14" className="text-dark-purple/30 shrink-0" />
              <span className="truncate">{contact.website}</span>
            </a>
          )}
          {contact.socialLinks && contact.socialLinks.length > 0 && (
            <div className="pt-3 border-t border-light-gray">
              <p className="text-xs font-semibold text-dark-purple/50 mb-2">Social Links</p>
              <div className="space-y-2">
                {contact.socialLinks.map((s) => (
                  <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-dark-purple/70 hover:text-dark-purple">
                    <Link size="14" className="text-dark-purple/30 shrink-0" />
                    <span>{s.platform}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
          {shared.length > 0 && (
            <div className="pt-3 border-t border-light-gray">
              <p className="text-xs font-semibold text-dark-purple/50 mb-2">Shared Groups ({shared.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {shared.map((cn) => (
                  <Badge key={cn} variant="success" size="sm">{cn}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="px-5 py-4 border-t border-gray/20">
        <Button fullWidth onClick={onChat}><Send size="16" /> Send Message</Button>
      </div>
    </div>
  )
}

function ContactRow({ contact, onSelect, onToggleFavorite, onChat, selected }: { contact: Contact; onSelect: (c: Contact) => void; onToggleFavorite: (name: string) => void; onChat: () => void; selected: boolean }) {
  const shared = seedCommunities[contact.seed] ?? []
  return (
    <div onClick={() => onSelect(contact)} className={`flex items-center gap-3 px-5 py-4 border-b border-light-gray last:border-0 transition-colors group cursor-pointer ${selected ? "bg-rose/20" : "hover:bg-light-gray/50"}`}>
      <div className="relative shrink-0">
        <Avatar seed={contact.seed} alt={contact.name} size="lg" status={contact.online ? "online" : undefined} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-dark-purple">{contact.name}</span>
          <Badge variant="info" size="sm">{contact.role}</Badge>
          {contact.relationship && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${relationshipColors[contact.relationship] || ""}`}>
              {contact.relationship.replace("-", " ")}
            </span>
          )}
        </div>
        <p className="text-sm text-dark-purple/50 truncate">{contact.email}{contact.phone && ` · ${contact.phone}`}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {contact.address && (
            <span className="text-[10px] text-dark-purple/40 flex items-center gap-0.5"><MapPin size="10" />{contact.address}</span>
          )}
          {contact.website && (
            <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-[10px] text-dark-purple/40 hover:text-dark-purple flex items-center gap-0.5"><Globe size="10" />Website</a>
          )}
          {contact.socialLinks?.slice(0, 2).map((s) => (
            <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-dark-purple/40 hover:text-dark-purple">{s.platform}</a>
          ))}
          {contact.socialLinks && contact.socialLinks.length > 2 && (
            <span className="text-[10px] text-dark-purple/30">+{contact.socialLinks.length - 2}</span>
          )}
          {shared.length > 0 && (
            <>
              <span className="w-px h-3 bg-gray/30" />
              <Users size="10" className="text-dark-purple/30 shrink-0" />
              {shared.slice(0, 2).map((cn) => (
                <Badge key={cn} variant="success" size="sm">{cn}</Badge>
              ))}
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onChat} className="p-2 rounded-lg hover:bg-light-gray transition-colors" aria-label="Chat with {contact.name}">
          <MessageCircle size={18} className="text-dark-purple/60" />
        </button>
        <button onClick={() => onToggleFavorite(contact.name)} className="p-2 rounded-lg hover:bg-light-gray transition-colors" aria-label={contact.favorite ? "Remove from favourites" : "Add to favourites"}>
          <Star size={18} className={contact.favorite ? "text-dark-purple/50 fill-dark-purple/20" : "text-dark-purple/30"} />
        </button>
      </div>
    </div>
  )
}
