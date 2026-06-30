import { useState, useEffect, useMemo } from "react"
import { Search, Users, Plus, X, Loader, UserPlus, LogOut, Send } from "lucide-react"
import Avatar from "../ui/Avatar"
import Badge from "../ui/Badge"
import Button from "../ui/Button"
import CommunityDetail from "./CommunityDetail"
import { communities as communitiesApi, contacts as contactsApi } from "../../lib/api"
import { useToast } from "../../context/ToastContext"
import type { Community } from "../../types"

export default function Communities() {
  const { toast } = useToast()
  const [list, setList] = useState<Community[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)
  const [activeTag, setActiveTag] = useState("All")
  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState("")
  const [createDesc, setCreateDesc] = useState("")
  const [createTags, setCreateTags] = useState("")
  const [creating, setCreating] = useState(false)
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})
  const [showInvite, setShowInvite] = useState<{ communityId: string; communityName: string } | null>(null)
  const currentUserId = localStorage.getItem("userId") || ""

  const fetchCommunities = () => {
    setLoading(true)
    communitiesApi.list().then((data) => {
      setList(data.communities || [])
      setLoading(false)
    }).catch(() => { setLoading(false); toast("Failed to load communities", "error") })
  }

  useEffect(() => { fetchCommunities() }, [])

  useEffect(() => {
    if (!showInvite) return
    contactsApi.list().then((data) => setContacts(data.contacts || [])).catch(() => {})
  }, [showInvite])

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    for (const c of list) c.tags.forEach((t) => tags.add(t))
    return ["All", ...Array.from(tags).sort()]
  }, [list])

  const filtered = useMemo(() => {
    let result = list
    if (activeTag !== "All") result = result.filter((c) => c.tags.includes(activeTag))
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
    }
    return result
  }, [list, activeTag, searchQuery])

  const handleCreate = async () => {
    if (!createName.trim() || creating) return
    setCreating(true)
    try {
      const data = await communitiesApi.create({
        name: createName.trim(),
        description: createDesc.trim(),
        tags: createTags.split(",").map((t) => t.trim()).filter(Boolean),
      })
      if (data.community) {
        setList((prev) => [data.community, ...prev])
        toast("Community created!", "success")
        setShowCreate(false)
        setCreateName("")
        setCreateDesc("")
        setCreateTags("")
      }
    } catch { toast("Failed to create community", "error") }
    setCreating(false)
  }

  const requestJoin = async (id: string) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }))
    try {
      await communitiesApi.requestJoin(id)
      setList((prev) => prev.map((c) => c._id === id ? { ...c, pendingRequest: "pending" } : c))
      toast("Join request sent!", "success")
    } catch { toast("Failed to send request", "error") }
    setActionLoading((prev) => ({ ...prev, [id]: false }))
  }

  const cancelRequest = async (id: string) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }))
    try {
      await communitiesApi.cancelRequest(id)
      setList((prev) => prev.map((c) => c._id === id ? { ...c, pendingRequest: null } : c))
      toast("Join request cancelled", "info")
    } catch { toast("Failed to cancel request", "error") }
    setActionLoading((prev) => ({ ...prev, [id]: false }))
  }

  const handleLeave = async (id: string) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }))
    try {
      await communitiesApi.leave(id)
      setList((prev) => prev.map((c) => c._id === id ? { ...c, isMember: false, isAdmin: false } : c))
      toast("Left community", "info")
    } catch { toast("Failed to leave", "error") }
    setActionLoading((prev) => ({ ...prev, [id]: false }))
  }

  const handleInvite = async (communityId: string, userId: string) => {
    setActionLoading((prev) => ({ ...prev, [`invite-${userId}`]: true }))
    try {
      await communitiesApi.invite(communityId, userId)
      toast("Invitation sent!", "success")
    } catch { toast("Failed to invite", "error") }
    setActionLoading((prev) => ({ ...prev, [`invite-${userId}`]: false }))
  }

  const totalOnline = list.reduce((s, c) => s + c.onlineCount, 0)

  if (selectedCommunity) {
    return <CommunityDetail community={selectedCommunity} onBack={() => setSelectedCommunity(null)} />
  }

  return (
    <div className="h-full bg-light-gray flex flex-col overflow-y-auto">
      <div className="bg-off-white border-b border-gray/30 px-8 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-dark-purple">Communities</h1>
            <p className="text-sm text-dark-purple/50 mt-1">{filtered.length} communities · {totalOnline} online</p>
          </div>
          <Button onClick={() => setShowCreate(true)}><Plus size="18" /> <span>Create</span></Button>
        </div>
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-purple/40" />
          <input
            type="text"
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-light-gray rounded-xl pl-10 pr-4 py-2.5 text-sm text-dark-purple placeholder-dark-purple/40 outline-none"
            aria-label="Search communities"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {allTags.map((t) => (
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
        {loading ? (
          <div className="flex justify-center py-20"><Loader size="24" className="animate-spin text-dark-purple/30" /></div>
        ) : list.length === 0 && !searchQuery.trim() ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users size="40" className="text-dark-purple/20 mb-4" />
            <p className="text-lg font-bold text-dark-purple/40">No communities yet</p>
            <p className="text-sm text-dark-purple/30 mt-1">Create the first community to get started</p>
          </div>
        ) : filtered.length === 0 && searchQuery.trim() ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search size="36" className="text-dark-purple/20 mb-4" />
            <p className="text-lg font-bold text-dark-purple/40">No communities matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {filtered.map((c) => {
              const pendingCount = 0 // We'll track this from joinRequests in a future update
              return (
              <div key={c._id} onClick={() => setSelectedCommunity(c)} className="bg-off-white rounded-xl border border-gray/20 p-5 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex -space-x-2">
                    {c.memberDetails.slice(0, 3).map((m, i) => (
                      <div key={i} className="ring-2 ring-off-white rounded-xl shrink-0">
                        <Avatar seed={m.avatarSeed} size="md" />
                      </div>
                    ))}
                    {c.memberCount > 3 && (
                      <div className="w-10 h-10 rounded-xl bg-dark-purple ring-2 ring-off-white flex items-center justify-center">
                        <span className="text-sm font-bold text-off-white">+{c.memberCount - 3}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={14} className="text-dark-purple/40" />
                    <span className="text-sm text-dark-purple/60 font-medium">{c.memberCount}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green ml-1" />
                    <span className="text-sm text-dark-purple/60 font-medium">{c.onlineCount}</span>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-dark-purple">{c.name}</h3>
                    {c.isAdmin && <span className="text-[10px] font-semibold bg-dark-purple/10 text-dark-purple px-2 py-0.5 rounded-full">Admin</span>}
                  </div>
                  {c.description && <p className="text-sm text-dark-purple/50 mt-1 line-clamp-2">{c.description}</p>}
                </div>
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {c.tags.map((tag) => (
                    <Badge key={tag} variant="default" size="sm">{tag}</Badge>
                  ))}
                </div>
                <div className="pt-3 border-t border-light-gray space-y-2">
                  {c.isMember ? (
                    <div className="flex gap-2">
                      {c.isAdmin && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowInvite({ communityId: c._id, communityName: c.name }) }}
                          className="flex-1 py-2 rounded-lg bg-dark-purple/10 text-sm font-semibold text-dark-purple hover:bg-dark-purple/20 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <UserPlus size="14" /> Invite
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleLeave(c._id) }}
                        disabled={actionLoading[c._id]}
                        className={`${c.isAdmin ? "flex-none px-3" : "w-full"} py-2 rounded-lg border border-gray/30 text-sm font-semibold text-dark-purple/60 hover:bg-light-gray transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40`}
                      >
                        {actionLoading[c._id] ? <Loader size="14" className="animate-spin" /> : <LogOut size="14" />}
                        {actionLoading[c._id] ? "..." : "Leave"}
                      </button>
                    </div>
                  ) : c.pendingRequest === "pending" ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); cancelRequest(c._id) }}
                      disabled={actionLoading[c._id]}
                      className="w-full py-2 rounded-lg border border-gray/30 text-sm font-semibold text-dark-purple/60 hover:bg-light-gray transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
                    >
                      {actionLoading[c._id] ? <Loader size="14" className="animate-spin" /> : <X size="14" />}
                      {actionLoading[c._id] ? "..." : "Cancel Request"}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); requestJoin(c._id) }}
                      disabled={actionLoading[c._id]}
                      className="w-full py-2 rounded-lg bg-dark-purple text-sm font-semibold text-off-white hover:bg-deep-purple transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
                    >
                      {actionLoading[c._id] ? <Loader size="14" className="animate-spin" /> : <UserPlus size="14" />}
                      {actionLoading[c._id] ? "Sending..." : "Request to Join"}
                    </button>
                  )}
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" onClick={() => setShowCreate(false)}>
          <div className="bg-off-white rounded-2xl w-96 shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-dark-purple">Create Community</h3>
              <button onClick={() => setShowCreate(false)} aria-label="Close"><X size="18" className="text-dark-purple/50 hover:text-dark-purple" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-dark-purple/50 uppercase tracking-wider block mb-1.5">Name</label>
                <input type="text" placeholder="Community name" value={createName} onChange={(e) => setCreateName(e.target.value)}
                  className="w-full h-10 rounded-lg bg-light-gray px-3 text-sm text-dark-purple placeholder:text-dark-purple/40 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-dark-purple/50 uppercase tracking-wider block mb-1.5">Description</label>
                <textarea placeholder="What's this community about?" value={createDesc} onChange={(e) => setCreateDesc(e.target.value)}
                  rows={3} className="w-full rounded-lg bg-light-gray p-3 text-sm text-dark-purple placeholder:text-dark-purple/40 outline-none resize-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-dark-purple/50 uppercase tracking-wider block mb-1.5">Tags (comma separated)</label>
                <input type="text" placeholder="e.g. Design, Dev, Social" value={createTags} onChange={(e) => setCreateTags(e.target.value)}
                  className="w-full h-10 rounded-lg bg-light-gray px-3 text-sm text-dark-purple placeholder:text-dark-purple/40 outline-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="flex-1 h-10 rounded-lg bg-light-gray text-sm font-semibold text-dark-purple hover:bg-gray/30 transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={!createName.trim() || creating}
                className="flex-1 h-10 rounded-lg bg-dark-purple text-sm font-semibold text-off-white hover:bg-deep-purple transition-colors flex items-center justify-center gap-2 disabled:opacity-40">
                {creating ? <Loader size="14" className="animate-spin" /> : <Plus size="14" />}
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showInvite && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" onClick={() => setShowInvite(null)}>
          <div className="bg-off-white rounded-2xl w-96 shadow-xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-light-gray">
              <h3 className="text-lg font-bold text-dark-purple">Invite to {showInvite.communityName}</h3>
              <button onClick={() => setShowInvite(null)} aria-label="Close"><X size="18" className="text-dark-purple/50 hover:text-dark-purple" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {contacts.length === 0 ? (
                <p className="text-sm text-dark-purple/40 text-center py-10">No contacts yet</p>
              ) : contacts.map((ct) => (
                <div key={ct.linkedUserId} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-light-gray/50 transition-colors">
                  <Avatar seed={ct.seed || ct.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-dark-purple truncate">{ct.name}</p>
                  </div>
                  <button
                    onClick={() => handleInvite(showInvite.communityId, ct.linkedUserId)}
                    disabled={actionLoading[`invite-${ct.linkedUserId}`]}
                    className="w-8 h-8 rounded-lg bg-dark-purple flex items-center justify-center hover:bg-deep-purple transition-colors disabled:opacity-40 shrink-0"
                    aria-label={`Invite ${ct.name}`}
                  >
                    {actionLoading[`invite-${ct.linkedUserId}`] ? <Loader size="14" className="animate-spin text-off-white" /> : <Send size="14" className="text-off-white" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
