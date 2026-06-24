import { useState } from "react"
import { Search, Plus, X, FileText, Image, Video, Music, Link as LinkIcon, File, Download, Forward, Clock, CalendarDays, ChevronDown, FolderOpen } from "lucide-react"
import type { FileItem } from "../../types"
import { formatTime, formatDate, isSameDay, getAvatarUrl } from "../../lib/utils"
import Avatar from "../ui/Avatar"
import Button from "../ui/Button"
import Badge from "../ui/Badge"

const seeds = ["Sarah", "Jordan", "Maya", "Taylor", "Alex", "Emily", "Marcus", "Priya"]

const now = new Date()
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
const yesterday = new Date(today)
yesterday.setDate(yesterday.getDate() - 1)
const twoDaysAgo = new Date(today)
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
const lastWeek = new Date(today)
lastWeek.setDate(lastWeek.getDate() - 6)
const threeDaysAgo = new Date(today)
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

const allFiles: FileItem[] = [
  { id: "1", name: "Q3 Brand Guidelines.pdf", type: "document", size: "2.4 MB", timestamp: new Date(today.getTime() + 2 * 3600000), sender: "Jordan Kim", seed: "Jordan", preview: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop", description: "Complete brand guidelines for Q3 including color palette, typography, and logo usage." },
  { id: "2", name: "Dashboard Mockup v2.png", type: "image", size: "4.1 MB", timestamp: new Date(today.getTime() + 5 * 3600000), sender: "Maya Patel", seed: "Maya", preview: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop", description: "Updated dashboard mockup with new analytics widget layout." },
  { id: "3", name: "Sprint Demo Recording.mp4", type: "video", size: "28 MB", timestamp: new Date(today.getTime() + 8 * 3600000), sender: "Alex Chen", seed: "Alex", preview: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop", description: "Recording of the sprint demo showcasing the new features." },
  { id: "4", name: "Team Standup Notes.docx", type: "document", size: "1.2 MB", timestamp: yesterday, sender: "Sarah Johnson", seed: "Sarah", description: "Notes from the daily standup covering progress and blockers." },
  { id: "5", name: "Product Roadmap Q4.pptx", type: "document", size: "5.7 MB", timestamp: yesterday, sender: "Taylor Reed", seed: "Taylor", description: "Quarterly product roadmap presentation for stakeholders." },
  { id: "6", name: "Team Photo - Offsite.jpg", type: "image", size: "3.3 MB", timestamp: yesterday, sender: "Emily Davis", seed: "Emily", preview: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop", description: "Group photo from the team offsite at Lakeside Retreat." },
  { id: "7", name: "UI Animation.mov", type: "video", size: "15 MB", timestamp: twoDaysAgo, sender: "Jordan Kim", seed: "Jordan", preview: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=400&h=300&fit=crop", description: "Animation prototype for the new onboarding flow." },
  { id: "8", name: "Interview Feedback.pdf", type: "document", size: "0.8 MB", timestamp: twoDaysAgo, sender: "Priya Sharma", seed: "Priya", description: "Feedback forms from the recent candidate interviews." },
  { id: "9", name: "Podcast Episode 12.mp3", type: "audio", size: "45 MB", timestamp: threeDaysAgo, sender: "Marcus Lee", seed: "Marcus", description: "Internal tech podcast episode covering ML best practices." },
  { id: "10", name: "API Documentation.html", type: "link", size: "—", timestamp: threeDaysAgo, sender: "Alex Chen", seed: "Alex", preview: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop", description: "Link to the internal API documentation portal." },
  { id: "11", name: "Design System Specs.fig", type: "document", size: "6.2 MB", timestamp: lastWeek, sender: "Maya Patel", seed: "Maya", description: "Figma design system file with all components and variants." },
  { id: "12", name: "Conference Talk Slides.pdf", type: "document", size: "3.9 MB", timestamp: lastWeek, sender: "Sarah Johnson", seed: "Sarah", description: "Slides from the tech conference presentation." },
  { id: "13", name: "Background Loop.wav", type: "audio", size: "8.5 MB", timestamp: lastWeek, sender: "Taylor Reed", seed: "Taylor", description: "Background music loop for the product launch video." },
  { id: "14", name: "Bug Tracker Export.csv", type: "document", size: "0.3 MB", timestamp: lastWeek, sender: "Priya Sharma", seed: "Priya", description: "CSV export of all open bugs from the tracker." },
  { id: "15", name: "Marketing Assets.zip", type: "document", size: "12 MB", timestamp: lastWeek, sender: "Emily Davis", seed: "Emily", description: "ZIP archive of all marketing materials for the release." },
]

function getDayLabel(date: Date): string {
  if (isSameDay(date, today)) return "Today"
  if (isSameDay(date, yesterday)) return "Yesterday"
  return formatDate(date)
}

function groupByDay(files: FileItem[]): { label: string; items: FileItem[] }[] {
  const groups: { label: string; items: FileItem[] }[] = []
  let currentLabel = ""
  let currentItems: FileItem[] = []
  for (const f of files) {
    const label = getDayLabel(f.timestamp)
    if (label !== currentLabel) {
      if (currentItems.length > 0) groups.push({ label: currentLabel, items: currentItems })
      currentLabel = label
      currentItems = []
    }
    currentItems.push(f)
  }
  if (currentItems.length > 0) groups.push({ label: currentLabel, items: currentItems })
  return groups
}

const filterTabs = [
  { key: "all", label: "All", icon: File },
  { key: "document", label: "Documents", icon: FileText },
  { key: "image", label: "Images", icon: Image },
  { key: "video", label: "Videos", icon: Video },
  { key: "audio", label: "Audio", icon: Music },
  { key: "link", label: "Links", icon: LinkIcon },
] as const

const typeConfig: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; color: string; bg: string }> = {
  document: { icon: FileText, color: "text-dark-purple", bg: "bg-dark-purple/10" },
  image: { icon: Image, color: "text-dark-purple", bg: "bg-rose/30" },
  video: { icon: Video, color: "text-dark-purple", bg: "bg-light-green" },
  audio: { icon: Music, color: "text-dark-purple", bg: "bg-dark-purple/10" },
  link: { icon: LinkIcon, color: "text-dark-purple", bg: "bg-rose/20" },
}

function FileSizeBar({ size }: { size: string }) {
  const num = parseFloat(size)
  const pct = isNaN(num) ? 50 : Math.min((num / 50) * 100, 100)
  return (
    <div className="w-full h-1.5 rounded-full bg-light-gray overflow-hidden">
      <div className="h-full rounded-full bg-dark-purple/20" style={{ width: `${pct}%` }} />
    </div>
  )
}

export default function Files() {
  const [activeFilter, setActiveFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [sortNewest, setSortNewest] = useState(true)

  const filtered = allFiles.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.sender.toLowerCase().includes(search.toLowerCase())
    const matchFilter = activeFilter === "all" || f.type === activeFilter
    return matchSearch && matchFilter
  })

  const sorted = [...filtered].sort((a, b) =>
    sortNewest ? b.timestamp.getTime() - a.timestamp.getTime() : a.timestamp.getTime() - b.timestamp.getTime()
  )

  const groups = groupByDay(sorted)
  const previewFile = selectedFile ?? sorted[0] ?? null

  return (
    <div className="h-full bg-light-gray flex flex-col">
      <div className="bg-off-white border-b border-gray/20 px-8 py-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-dark-purple flex items-center justify-center shadow-sm">
              <FolderOpen size={17} className="text-off-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-dark-purple">Files</h1>
              <p className="text-[11px] text-dark-purple/40">{allFiles.length} files</p>
            </div>
          </div>
          <Button size="sm"><Plus size={14} /> Upload</Button>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-purple/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search files..." className="w-full bg-light-gray rounded-xl pl-10 pr-4 py-2.5 text-sm text-dark-purple placeholder-dark-purple/40 outline-none focus:ring-2 focus:ring-dark-purple/10" aria-label="Search files" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="bg-off-white border-b border-gray/20 px-7 py-3 flex items-center gap-1.5 overflow-x-auto">
            {filterTabs.map((tab) => {
              const Icon = tab.icon
              const count = allFiles.filter((f) => f.type === tab.key).length
              return (
                <button
                  key={tab.key}
                  onClick={() => { setActiveFilter(tab.key); setSelectedFile(null) }}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                    activeFilter === tab.key
                      ? "bg-dark-purple text-off-white"
                      : "bg-light-gray text-dark-purple/60 hover:text-dark-purple hover:bg-gray/20"
                  }`}
                >
                  <Icon size={13} />
                  {tab.label}
                  {tab.key !== "all" && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                      activeFilter === tab.key ? "bg-off-white/20" : "bg-off-white"
                    }`}>{count}</span>
                  )}
                </button>
              )
            })}
            <div className="w-px h-5 bg-gray/20 mx-2" />
            <button onClick={() => setSortNewest(!sortNewest)} className="flex items-center gap-1 text-xs font-medium text-dark-purple/50 hover:text-dark-purple px-2 py-1.5 rounded-lg hover:bg-light-gray transition-colors whitespace-nowrap" aria-label="Sort files">
              <Clock size={12} />
              {sortNewest ? "Newest" : "Oldest"}
              <ChevronDown size={11} className={`transition-transform ${sortNewest ? "" : "rotate-180"}`} />
            </button>
          </div>
          <div className="px-7 py-5 space-y-6">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <File size={48} className="text-dark-purple/10 mb-4" />
              <p className="text-sm font-medium text-dark-purple/30">No files found</p>
              <p className="text-xs text-dark-purple/20 mt-1">Try a different filter or search term</p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.label}>
                <div className="flex items-center gap-2 mb-2.5 px-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-dark-purple/20" />
                  <span className="text-[11px] font-semibold text-dark-purple/40 uppercase tracking-wider">{group.label}</span>
                  <span className="text-[10px] text-dark-purple/20">· {group.items.length}</span>
                </div>
                <div className="bg-off-white rounded-2xl border border-gray/10 overflow-hidden shadow-sm">
                  {group.items.map((f) => {
                    const tc = typeConfig[f.type]
                    const Icon = tc.icon
                    const isSel = previewFile?.id === f.id
                    return (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFile(f)}
                        className={`group w-full flex items-center gap-3.5 px-5 py-3.5 border-b border-light-gray last:border-0 transition-all text-left ${
                          isSel ? "bg-dark-purple/5" : "hover:bg-light-gray/50"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl ${tc.bg} flex items-center justify-center shrink-0 ring-1 ring-black/5`}>
                          <Icon size={18} className={tc.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-dark-purple truncate">{f.name}</p>
                          <p className="text-xs text-dark-purple/50 mt-0.5">{f.sender} · {f.size}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] text-dark-purple/30 font-medium">{formatTime(f.timestamp)}</span>
                          <div className="p-1.5 rounded-lg hover:bg-light-gray transition-colors opacity-0 group-hover:opacity-100">
                            <Download size={14} className="text-dark-purple/40" />
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
        </div>

        <div className="w-[340px] shrink-0 border-l border-gray/20 bg-off-white overflow-y-auto">
          {previewFile ? (
            <div className="p-5">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-5 bg-light-gray shadow-inner">
                {["image", "video"].includes(previewFile.type) && previewFile.preview ? (
                  <>
                    <img src={previewFile.preview} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 ring-1 ring-black/5 rounded-2xl pointer-events-none" />
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    {(() => {
                      const PIcon = typeConfig[previewFile.type].icon
                      return <PIcon size={44} className="text-dark-purple/20" />
                    })()}
                    <span className="text-xs font-medium text-dark-purple/30">{previewFile.type.toUpperCase()} file</span>
                  </div>
                )}
                <Badge variant="info" size="sm" className="absolute top-3 left-3">{previewFile.type}</Badge>
              </div>

              <h2 className="text-base font-bold text-dark-purple leading-snug break-words mb-1">{previewFile.name}</h2>
              {previewFile.description && (
                <p className="text-xs text-dark-purple/50 leading-relaxed mb-5">{previewFile.description}</p>
              )}

              <div className="bg-light-gray rounded-2xl p-4 space-y-4 mb-5">
                <div className="flex items-center gap-3">
                  <Avatar seed={previewFile.seed} size="md" className="ring-2 ring-off-white" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-dark-purple">{previewFile.sender}</p>
                    <p className="text-[11px] text-dark-purple/40">Shared this file</p>
                  </div>
                </div>
                <div className="h-px bg-gray/20" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={14} className="text-dark-purple/30" />
                    <div>
                      <p className="text-xs font-semibold text-dark-purple">{formatDate(previewFile.timestamp)}</p>
                      <p className="text-[10px] text-dark-purple/40">at {formatTime(previewFile.timestamp)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-dark-purple">{previewFile.size}</p>
                    <p className="text-[10px] text-dark-purple/40">Size</p>
                  </div>
                </div>
                <FileSizeBar size={previewFile.size} />
              </div>

              <div className="flex gap-2.5">
                <Button size="sm" fullWidth><Download size={14} /> Download</Button>
                <Button size="sm" variant="outline" fullWidth><Forward size={14} /> Forward</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center px-6">
                <File size={44} className="text-dark-purple/10 mx-auto mb-3" />
                <p className="text-sm font-medium text-dark-purple/30">Select a file</p>
                <p className="text-xs text-dark-purple/20 mt-1">Choose a file from the list to preview</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
