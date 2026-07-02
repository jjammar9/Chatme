import { useState, useEffect, useContext } from "react"
import { Star, MessageCircle, Mail, Search, Plus, X, Users, Globe, Link, MapPin, Phone, Image, ChevronDown, Send, UserPlus, Calendar, ArrowLeft, Trash2, Pencil, Camera, Loader as LoaderIcon } from "lucide-react"
import type { Contact, UserSearchResult } from "../../types"
import { contacts as contactsApi, users as usersApi, conversations as conversationsApi, upload as uploadApi } from "../../lib/api"
import { SocketContext } from "../../context/SocketContext"
import Avatar from "../ui/Avatar"
import Badge from "../ui/Badge"
import Button from "../ui/Button"
import Modal from "../ui/Modal"

export default function Contacts({ onChat }: { onChat: () => void }) {
  const { socket } = useContext(SocketContext)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [editContact, setEditContact] = useState<Contact | null>(null)
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
  const [showFindUsers, setShowFindUsers] = useState(false)
  const [findQuery, setFindQuery] = useState("")
  const [findResults, setFindResults] = useState<UserSearchResult[]>([])
  const [findLoading, setFindLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [sharedGroups, setSharedGroups] = useState<Record<string, string[]>>({})
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoUrl, setPhotoUrl] = useState("")

  const currentUserId = localStorage.getItem("userId") || ""

  const fetchSharedGroups = () => {
    conversationsApi.list().then((data) => {
      const convs = data.conversations || []
      const groups: Record<string, string[]> = {}
      for (const c of contacts) {
        if (!c.linkedUserId) continue
        const shared = convs
          .filter((conv: any) => conv.isGroup && conv.participants?.includes(c.linkedUserId) && conv.participants?.includes(currentUserId))
          .map((conv: any) => conv.groupName || "Unnamed")
        groups[c._id || c.name] = shared
      }
      setSharedGroups(groups)
    }).catch(() => {})
  }

  useEffect(() => {
    contactsApi.list().then((data) => { setContacts(data.contacts); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (contacts.length === 0) return
    fetchSharedGroups()
  }, [contacts.length])

  useEffect(() => {
    if (!socket) return
    const handleOnline = (data: { userId: string }) => {
      setContacts((prev) => prev.map((c) => c.linkedUserId === data.userId ? { ...c, online: true } : c))
    }
    const handleOffline = (data: { userId: string }) => {
      setContacts((prev) => prev.map((c) => c.linkedUserId === data.userId ? { ...c, online: false } : c))
    }
    socket.on("user:online", handleOnline)
    socket.on("user:offline", handleOffline)
    return () => {
      socket.off("user:online", handleOnline)
      socket.off("user:offline", handleOffline)
    }
  }, [socket])

  const refresh = () => contactsApi.list().then((data) => { setContacts(data.contacts); fetchSharedGroups() })

  const toggleFavorite = (contact: Contact) => {
    if (!contact._id) return
    contactsApi.update(contact._id, { favorite: !contact.favorite }).then(() => refresh())
  }

  const searchUsers = async () => {
    if (!findQuery.trim()) return
    setFindLoading(true)
    try {
      const data = await usersApi.search(findQuery)
      setFindResults(data.users)
    } catch {
      setFindResults([])
    } finally {
      setFindLoading(false)
    }
  }

  const addUserAsContact = (user: UserSearchResult) => {
    contactsApi.create({
      name: user.name,
      seed: user.avatarSeed || user.username,
      email: user.email,
      role: "User",
      online: user.online,
      favorite: false,
      linkedUserId: user._id,
    }).then(() => {
      refresh()
      setFindQuery("")
      setFindResults([])
      setShowFindUsers(false)
    })
  }

  const deleteContact = (id: string) => {
    contactsApi.remove(id).then(() => {
      setContacts((prev) => prev.filter((c) => c._id !== id))
      if (selectedContact?._id === id) setSelectedContact(null)
      setShowDeleteConfirm(null)
    })
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoUploading(true)
    try {
      const data = await uploadApi.file(file)
      setPhotoUrl(data.url)
    } catch {
      // upload failed
    }
    setPhotoUploading(false)
  }

  const openEdit = (contact: Contact) => {
    setEditContact(contact)
    setNewName(contact.name)
    setNewSeed(contact.seed)
    setPhotoUrl(contact.avatarUrl || "")
    setNewEmail(contact.email)
    setNewPhone(contact.phone || "")
    setNewAddress(contact.address || "")
    setNewRelationship(contact.relationship)
    setNewWebsite(contact.website || "")
    setNewSocials(contact.socialLinks || [])
    setShowAdd(true)
  }

  const addContact = () => {
    if (!newName.trim()) return
    const seed = newSeed.trim() || newName.split(" ")[0]
    const data = {
      name: newName.trim(), seed,
      avatarUrl: photoUrl || undefined,
      email: newEmail.trim() || `${seed.toLowerCase()}@email.com`,
      role: "Contact", online: false, favorite: false,
      phone: newPhone.trim() || undefined,
      address: newAddress.trim() || undefined,
      relationship: newRelationship,
      website: newWebsite.trim() || undefined,
      socialLinks: newSocials.filter((s) => s.platform && s.url) || undefined,
    }
    const finish = () => {
      refresh()
      setNewName(""); setNewEmail(""); setNewPhone(""); setNewAddress("")
      setNewRelationship(undefined); setNewSeed(""); setNewWebsite(""); setNewSocials([])
      setPhotoUrl("")
      setEditContact(null)
      setShowAdd(false)
    }
    if (editContact?._id) {
      contactsApi.update(editContact._id, data).then(finish)
    } else {
      contactsApi.create(data).then(finish)
    }
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
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setShowFindUsers(true)}>
              <UserPlus size={18} /> <span>Find Users</span>
            </Button>
            <Button onClick={() => setShowAdd(true)}>
              <Plus size={18} /> <span>Add Contact</span>
            </Button>
          </div>
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

      <Modal open={showAdd} onClose={() => { setShowAdd(false); setEditContact(null); setNewName(""); setNewEmail(""); setNewPhone(""); setNewAddress(""); setNewRelationship(undefined); setNewSeed(""); setNewWebsite(""); setNewSocials([]); setPhotoUrl("") }} title={editContact ? "Edit Contact" : "Add Contact"} size="md">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="flex items-start gap-4">
            <div className="shrink-0 relative group">
              <Avatar seed={newSeed.trim() || newName.trim() || "user"} imageUrl={photoUrl} size="xl" />
              <label className="absolute inset-0 rounded-lg bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                {photoUploading ? <LoaderIcon size="16" className="animate-spin text-white" /> : <Camera size="16" className="text-white" />}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" aria-label="Upload photo" />
              </label>
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
          <Button fullWidth onClick={addContact}>{editContact ? "Update Contact" : "Add Contact"}</Button>
        </div>
      </Modal>

      <Modal open={showFindUsers} onClose={() => { setShowFindUsers(false); setFindQuery(""); setFindResults([]); setSelectedUser(null) }} title={selectedUser ? selectedUser.name : "Find Users"} size="md">
        {selectedUser ? (
          <div className="space-y-5">
            <button onClick={() => setSelectedUser(null)} className="flex items-center gap-1.5 text-xs font-medium text-dark-purple/50 hover:text-dark-purple transition-colors" aria-label="Back to search">
              <ArrowLeft size="14" /> Back to search
            </button>

            <div className="flex flex-col items-center py-2">
              <Avatar seed={selectedUser.avatarSeed || selectedUser.username} size="xl" status={selectedUser.online ? "online" : undefined} />
              <h2 className="text-lg font-bold text-dark-purple mt-3">{selectedUser.name}</h2>
              <p className="text-sm text-dark-purple/50">@{selectedUser.username}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="info" size="sm">{selectedUser.role}</Badge>
                {selectedUser.online && <span className="flex items-center gap-1 text-[10px] font-medium text-green"><span className="w-1.5 h-1.5 rounded-full bg-green" />Online</span>}
              </div>
            </div>

            <div className="space-y-3 bg-light-gray rounded-xl p-4">
              <div className="flex items-center gap-2.5 text-sm text-dark-purple/70">
                <Mail size="14" className="text-dark-purple/30 shrink-0" />
                <span>{selectedUser.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-dark-purple/70">
                <Calendar size="14" className="text-dark-purple/30 shrink-0" />
                <span>Joined {new Date(selectedUser.createdAt || Date.now()).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {contacts.some((c) => c.linkedUserId === selectedUser._id) ? (
                <Button fullWidth variant="secondary" disabled>Already a contact</Button>
              ) : (
                <Button fullWidth onClick={() => addUserAsContact(selectedUser)}>
                  <UserPlus size="16" /> Add to Contacts
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size="16" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-purple/40" />
                <input
                  value={findQuery}
                  onChange={(e) => setFindQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchUsers()}
                  placeholder="Search by username, name or email..."
                  className="w-full bg-light-gray rounded-xl pl-10 pr-4 py-2.5 text-sm text-dark-purple placeholder-dark-purple/40 outline-none focus:ring-2 focus:ring-dark-purple/10"
                  aria-label="Search users"
                />
              </div>
              <Button onClick={searchUsers} disabled={!findQuery.trim() || findLoading}>
                {findLoading ? "Searching..." : "Search"}
              </Button>
            </div>

            {findResults.length > 0 && (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                <p className="text-xs font-semibold text-dark-purple/50">{findResults.length} user{findResults.length !== 1 ? "s" : ""} found</p>
                {findResults.map((u) => (
                  <div key={u._id} onClick={() => setSelectedUser(u)} className="flex items-center gap-3 p-3 rounded-xl bg-light-gray hover:bg-light-gray/70 transition-colors cursor-pointer">
                    <Avatar seed={u.avatarSeed || u.username} size="md" status={u.online ? "online" : undefined} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-dark-purple">{u.name}</p>
                      <p className="text-xs text-dark-purple/50">@{u.username} · {u.email}</p>
                    </div>
                    <Button size="sm" onClick={(e) => { e.stopPropagation(); addUserAsContact(u) }} aria-label={`Add ${u.name} as contact`}>
                      <UserPlus size="14" /> <span>Add</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {findQuery && !findLoading && findResults.length === 0 && (
              <p className="text-sm text-dark-purple/50 text-center py-8">No users found. Try a different search.</p>
            )}
          </div>
        )}
      </Modal>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 px-8 py-6 space-y-5 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoaderIcon size="24" className="animate-spin text-dark-purple/30" />
            </div>
          ) : (
          <>
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
                    <ContactRow key={c._id || c.name} contact={c} onSelect={setSelectedContact} onToggleFavorite={toggleFavorite} onChat={onChat} selected={selectedContact?._id === c._id} sharedGroups={sharedGroups[c._id || c.name] || []} />
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
                  <ContactRow key={c._id || c.name} contact={c} onSelect={setSelectedContact} onToggleFavorite={toggleFavorite} onChat={onChat} selected={selectedContact?._id === c._id} sharedGroups={sharedGroups[c._id || c.name] || []} />
                )) : (
                  <div className="px-5 py-8 text-center text-base text-dark-purple/40">No contacts match your search</div>
                )}
              </div>
            )}
          </div>
        </>
        )}
        </div>

        {selectedContact && (
           <ContactDetail contact={selectedContact} onClose={() => setSelectedContact(null)} onChat={onChat} onEdit={openEdit} onDelete={(id) => setShowDeleteConfirm(id)} />
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-off-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-dark-purple mb-2">Delete Contact?</h3>
            <p className="text-sm text-dark-purple/60 mb-4">This will permanently remove this contact from your list.</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 h-10 rounded-lg bg-light-gray text-dark-purple text-sm font-semibold hover:bg-gray/30 transition-colors">Cancel</button>
              <button onClick={() => deleteContact(showDeleteConfirm)} className="flex-1 h-10 rounded-lg bg-red text-off-white text-sm font-semibold hover:bg-red/80 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
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

function ContactDetail({ contact, onClose, onChat, onEdit, onDelete }: { contact: Contact; onClose: () => void; onChat: () => void; onEdit: (c: Contact) => void; onDelete: (id: string) => void }) {
  return (
    <div className="w-80 shrink-0 border-l border-gray/20 bg-off-white flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray/20">
        <h3 className="text-sm font-bold text-dark-purple">Contact Info</h3>
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(contact)} className="p-1.5 rounded-lg hover:bg-light-gray text-dark-purple/40 hover:text-dark-purple transition-colors" aria-label="Edit contact">
            <Pencil size="14" />
          </button>
          <button onClick={() => onDelete(contact._id!)} className="p-1.5 rounded-lg hover:bg-light-gray text-dark-purple/40 hover:text-red transition-colors" aria-label="Delete contact">
            <Trash2 size="14" />
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-light-gray text-dark-purple/40 hover:text-dark-purple transition-colors" aria-label="Close detail panel">
            <X size="16" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="flex flex-col items-center mb-6">
          <Avatar seed={contact.seed} imageUrl={contact.avatarUrl} size="xl" status={contact.online ? "online" : undefined} />
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
        </div>
      </div>
      <div className="px-5 py-4 border-t border-gray/20 flex gap-2">
        <div className="flex-1">
          <Button fullWidth onClick={onChat}><Send size="16" /> Message</Button>
        </div>
      </div>
    </div>
  )
}

function ContactRow({ contact, onSelect, onToggleFavorite, onChat, selected, sharedGroups }: { contact: Contact; onSelect: (c: Contact) => void; onToggleFavorite: (c: Contact) => void; onChat: () => void; selected: boolean; sharedGroups: string[] }) {
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
          {sharedGroups.length > 0 && (
            <>
              <span className="w-px h-3 bg-gray/30" />
              <Users size="10" className="text-dark-purple/30 shrink-0" />
              <span className="text-[10px] text-dark-purple/50">{sharedGroups.length} shared group{sharedGroups.length > 1 ? "s" : ""}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onChat} className="p-2 rounded-lg hover:bg-light-gray transition-colors" aria-label={`Chat with ${contact.name}`}>
          <MessageCircle size={18} className="text-dark-purple/60" />
        </button>
        <button onClick={() => onToggleFavorite(contact)} className="p-2 rounded-lg hover:bg-light-gray transition-colors" aria-label={contact.favorite ? "Remove from favourites" : "Add to favourites"}>
          <Star size={18} className={contact.favorite ? "text-dark-purple/50 fill-dark-purple/20" : "text-dark-purple/30"} />
        </button>
      </div>
    </div>
  )
}
