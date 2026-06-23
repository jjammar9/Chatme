import { useState } from "react"
import { User, Shield, Bell, Palette, EyeOff, MessageCircle, Database, Info, Sun, Moon, Smartphone, Monitor, Camera, Check, X, Circle, Trash2, ChevronRight, Globe, Lock, Eye, Wifi, Download } from "lucide-react"

type SettingsCategory = "profile" | "account" | "notifications" | "appearance" | "privacy" | "chat" | "storage" | "about"

interface CategoryConfig {
  key: SettingsCategory
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const categories: CategoryConfig[] = [
  { key: "profile", label: "Profile", icon: User },
  { key: "account", label: "Account", icon: Shield },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "appearance", label: "Appearance", icon: Palette },
  { key: "privacy", label: "Privacy", icon: EyeOff },
  { key: "chat", label: "Chat", icon: MessageCircle },
  { key: "storage", label: "Storage & Data", icon: Database },
  { key: "about", label: "About", icon: Info },
]

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className={`relative w-9 h-5 rounded-full transition-colors ${on ? "bg-green" : "bg-gray/30"}`}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  )
}

function ColorSwatch({ color, label, active, onClick }: { color: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5">
      <div className={`w-8 h-8 rounded-xl transition-all ${active ? "ring-2 ring-off-white ring-offset-2 ring-dark-purple/40 scale-110" : ""}`} style={{ backgroundColor: color }}>
        {active && <Check size={16} className="text-white w-full h-full p-1.5" />}
      </div>
      <span className="text-[10px] text-dark-purple/50">{label}</span>
    </button>
  )
}

export default function Settings() {
  const [activeCat, setActiveCat] = useState<SettingsCategory>("profile")

  const [name, setName] = useState("Jamie Rivera")
  const [email, setEmail] = useState("jamie.r@chatme.app")
  const [status, setStatus] = useState("Building something cool ✨")
  const [notifMessages, setNotifMessages] = useState(true)
  const [notifGroups, setNotifGroups] = useState(true)
  const [notifMentions, setNotifMentions] = useState(true)
  const [notifTasks, setNotifTasks] = useState(true)
  const [notifFiles, setNotifFiles] = useState(false)
  const [notifSound, setNotifSound] = useState(true)
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light")
  const [accentColor, setAccentColor] = useState("#1b0036")
  const [fontSize, setFontSize] = useState(16)
  const [onlineStatus, setOnlineStatus] = useState<"everyone" | "contacts" | "nobody">("everyone")
  const [readReceipts, setReadReceipts] = useState(true)
  const [lastSeen, setLastSeen] = useState(true)
  const [enterToSend, setEnterToSend] = useState(true)
  const [mediaWifi, setMediaWifi] = useState(true)
  const [mediaCellular, setMediaCellular] = useState(false)
  const [mediaRoaming, setMediaRoaming] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [editingStatus, setEditingStatus] = useState(false)
  const [tempName, setTempName] = useState(name)
  const [tempStatus, setTempStatus] = useState(status)

  const saveName = () => { if (tempName.trim()) setName(tempName.trim()); setEditingName(false) }
  const saveStatus = () => { if (tempStatus.trim()) setStatus(tempStatus.trim()); setEditingStatus(false) }

  const colors = [
    { color: "#1b0036", label: "Deep purple" },
    { color: "#db2828", label: "Red" },
    { color: "#e07c1f", label: "Orange" },
    { color: "#f5a623", label: "Amber" },
    { color: "#058630", label: "Green" },
    { color: "#2563eb", label: "Blue" },
    { color: "#7c3aed", label: "Violet" },
    { color: "#db2777", label: "Pink" },
  ]

  const Icon = categories.find((c) => c.key === activeCat)?.icon

  return (
    <div className="h-full bg-light-gray flex flex-col">
      <div className="bg-off-white border-b border-gray/20 px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-dark-purple flex items-center justify-center shadow-sm">
            {Icon && <Icon size={17} className="text-off-white" />}
          </div>
          <div>
            <h1 className="text-lg font-bold text-dark-purple">Settings</h1>
            <p className="text-[11px] text-dark-purple/40">{categories.find((c) => c.key === activeCat)?.label}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="bg-off-white border-b border-gray/20 px-7 py-3 flex items-center gap-1.5 overflow-x-auto">
            {categories.map((cat) => {
              const CatIcon = cat.icon
              return (
                <button key={cat.key} onClick={() => setActiveCat(cat.key)} className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors ${activeCat === cat.key ? "bg-dark-purple text-off-white" : "bg-light-gray text-dark-purple/60 hover:text-dark-purple hover:bg-gray/20"}`}>
                  <CatIcon size={13} />
                  {cat.label}
                </button>
              )
            })}
          </div>
          <div className="px-8 py-6">
          {activeCat === "profile" && (
            <div className="max-w-2xl space-y-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-light-gray ring-2 ring-off-white shadow-md">
                    <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=Jamie&backgroundColor=eddbda`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-dark-purple text-off-white flex items-center justify-center shadow-sm">
                    <Camera size={12} />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input value={tempName} onChange={(e) => setTempName(e.target.value)} className="bg-light-gray text-dark-purple text-lg font-bold px-3 py-1.5 rounded-lg outline-none focus:ring-2 focus:ring-dark-purple/20 flex-1" autoFocus onKeyDown={(e) => e.key === "Enter" && saveName()} />
                      <button onClick={saveName} className="p-1.5 rounded-lg hover:bg-light-gray"><Check size={16} className="text-green" /></button>
                      <button onClick={() => { setEditingName(false); setTempName(name) }} className="p-1.5 rounded-lg hover:bg-light-gray"><X size={16} className="text-dark-purple/40" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => { setTempName(name); setEditingName(true) }}>
                      <h2 className="text-xl font-bold text-dark-purple">{name}</h2>
                      <EditPen className="text-dark-purple/30 group-hover:text-dark-purple/60 transition-colors" />
                    </div>
                  )}
                  <p className="text-sm text-dark-purple/50">{email}</p>
                  {editingStatus ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input value={tempStatus} onChange={(e) => setTempStatus(e.target.value)} className="bg-light-gray text-dark-purple text-sm px-3 py-1.5 rounded-lg outline-none focus:ring-2 focus:ring-dark-purple/20 flex-1" autoFocus onKeyDown={(e) => e.key === "Enter" && saveStatus()} />
                      <button onClick={saveStatus} className="p-1.5 rounded-lg hover:bg-light-gray"><Check size={14} className="text-green" /></button>
                      <button onClick={() => { setEditingStatus(false); setTempStatus(status) }} className="p-1.5 rounded-lg hover:bg-light-gray"><X size={14} className="text-dark-purple/40" /></button>
                    </div>
                  ) : (
                    <p className="text-sm text-dark-purple/40 mt-0.5 cursor-pointer hover:text-dark-purple/60" onClick={() => { setTempStatus(status); setEditingStatus(true) }}>{status}</p>
                  )}
                </div>
              </div>

              <div className="bg-off-white rounded-2xl border border-gray/10 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-bold text-dark-purple">Contact Info</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-dark-purple/60">Email</span>
                    <span className="text-sm font-semibold text-dark-purple">{email}</span>
                  </div>
                  <div className="h-px bg-light-gray" />
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-dark-purple/60">Phone</span>
                    <span className="text-sm font-semibold text-dark-purple">+1 (555) 0123-456</span>
                  </div>
                  <div className="h-px bg-light-gray" />
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-dark-purple/60">Location</span>
                    <span className="text-sm font-semibold text-dark-purple">San Francisco, CA</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeCat === "account" && (
            <div className="max-w-2xl space-y-5">
              <div className="bg-off-white rounded-2xl border border-gray/10 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-bold text-dark-purple">Security</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-semibold text-dark-purple">Password</p>
                      <p className="text-xs text-dark-purple/50">Last changed 3 months ago</p>
                    </div>
                    <button className="text-xs font-semibold text-dark-purple bg-light-gray px-3 py-1.5 rounded-lg hover:bg-gray/20 transition-colors">Change</button>
                  </div>
                  <div className="h-px bg-light-gray" />
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-semibold text-dark-purple">Two-factor auth</p>
                      <p className="text-xs text-dark-purple/50">Add an extra layer of security</p>
                    </div>
                    <Toggle on={false} onChange={() => {}} />
                  </div>
                  <div className="h-px bg-light-gray" />
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-semibold text-dark-purple">Active sessions</p>
                      <p className="text-xs text-dark-purple/50">2 devices currently active</p>
                    </div>
                    <button className="text-xs font-semibold text-dark-purple bg-light-gray px-3 py-1.5 rounded-lg hover:bg-gray/20 transition-colors">Manage</button>
                  </div>
                </div>
              </div>

              <div className="bg-off-white rounded-2xl border border-gray/10 shadow-sm p-5">
                <h3 className="text-sm font-bold text-dark-purple/80 mb-3">Danger Zone</h3>
                <p className="text-xs text-dark-purple/50 mb-4">Once you delete your account, there is no going back.</p>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-dark-purple/80 border border-dark-purple/20 px-4 py-2 rounded-lg hover:bg-dark-purple/5 transition-colors">
                  <Trash2 size={14} /> Delete Account
                </button>
              </div>
            </div>
          )}

          {activeCat === "notifications" && (
            <div className="max-w-2xl space-y-5">
              <div className="bg-off-white rounded-2xl border border-gray/10 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-bold text-dark-purple">Notifications</h3>
                <div className="space-y-0">
                  {[
                    { label: "Messages", desc: "New direct messages from contacts", value: notifMessages, set: setNotifMessages },
                    { label: "Group chats", desc: "Activity in your group conversations", value: notifGroups, set: setNotifGroups },
                    { label: "Mentions", desc: "When someone @mentions you", value: notifMentions, set: setNotifMentions },
                    { label: "Task reminders", desc: "Upcoming task due dates", value: notifTasks, set: setNotifTasks },
                    { label: "File shares", desc: "Files shared with you", value: notifFiles, set: setNotifFiles },
                  ].map((n, i) => (
                    <div key={n.label}>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-semibold text-dark-purple">{n.label}</p>
                          <p className="text-xs text-dark-purple/50">{n.desc}</p>
                        </div>
                        <Toggle on={n.value} onChange={n.set} />
                      </div>
                      {i < 4 && <div className="h-px bg-light-gray" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-off-white rounded-2xl border border-gray/10 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-bold text-dark-purple">Sound</h3>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-semibold text-dark-purple">Notification sound</p>
                    <p className="text-xs text-dark-purple/50">Play a sound when new notifications arrive</p>
                  </div>
                  <Toggle on={notifSound} onChange={setNotifSound} />
                </div>
              </div>
            </div>
          )}

          {activeCat === "appearance" && (
            <div className="max-w-2xl space-y-5">
              <div className="bg-off-white rounded-2xl border border-gray/10 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-bold text-dark-purple">Theme</h3>
                <div className="flex items-center gap-3">
                  {[
                    { key: "light", label: "Light", icon: Sun },
                    { key: "dark", label: "Dark", icon: Moon },
                    { key: "system", label: "System", icon: Monitor },
                  ].map((t) => {
                    const TIcon = t.icon
                    return (
                      <button key={t.key} onClick={() => setTheme(t.key as typeof theme)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${theme === t.key ? "bg-dark-purple text-off-white shadow-sm" : "bg-light-gray text-dark-purple/60 hover:text-dark-purple"}`}>
                        <TIcon size={16} /> {t.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="bg-off-white rounded-2xl border border-gray/10 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-bold text-dark-purple">Accent Color</h3>
                <div className="flex items-center gap-4 flex-wrap">
                  {colors.map((c) => <ColorSwatch key={c.color} color={c.color} label={c.label} active={accentColor === c.color} onClick={() => setAccentColor(c.color)} />)}
                </div>
              </div>

              <div className="bg-off-white rounded-2xl border border-gray/10 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-bold text-dark-purple">Font Size</h3>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-dark-purple/50">A</span>
                  <input type="range" min="12" max="22" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="flex-1 accent-dark-purple h-1.5 rounded-full appearance-none bg-light-gray [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-dark-purple [&::-webkit-slider-thumb]:shadow-sm" />
                  <span className="text-lg text-dark-purple/50 font-bold">A</span>
                </div>
                <p className="text-xs text-dark-purple/40 text-center">Preview: <span style={{ fontSize }} className="font-semibold text-dark-purple">The quick brown fox jumps over the lazy dog</span></p>
              </div>
            </div>
          )}

          {activeCat === "privacy" && (
            <div className="max-w-2xl space-y-5">
              <div className="bg-off-white rounded-2xl border border-gray/10 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-bold text-dark-purple">Online Status</h3>
                <div className="flex items-center gap-3">
                  {[
                    { key: "everyone", label: "Everyone", icon: Globe },
                    { key: "contacts", label: "My Contacts", icon: User },
                    { key: "nobody", label: "Nobody", icon: EyeOff },
                  ].map((opt) => {
                    const OIcon = opt.icon
                    return (
                      <button key={opt.key} onClick={() => setOnlineStatus(opt.key as typeof onlineStatus)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${onlineStatus === opt.key ? "bg-dark-purple text-off-white shadow-sm" : "bg-light-gray text-dark-purple/60 hover:text-dark-purple"}`}>
                        <OIcon size={16} /> {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="bg-off-white rounded-2xl border border-gray/10 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-bold text-dark-purple">Visibility</h3>
                <div className="space-y-0">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-semibold text-dark-purple">Read receipts</p>
                      <p className="text-xs text-dark-purple/50">Let others know you've read their messages</p>
                    </div>
                    <Toggle on={readReceipts} onChange={setReadReceipts} />
                  </div>
                  <div className="h-px bg-light-gray" />
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-semibold text-dark-purple">Last seen</p>
                      <p className="text-xs text-dark-purple/50">Show when you were last active</p>
                    </div>
                    <Toggle on={lastSeen} onChange={setLastSeen} />
                  </div>
                </div>
              </div>

              <div className="bg-off-white rounded-2xl border border-gray/10 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-bold text-dark-purple">Blocked Users</h3>
                <p className="text-xs text-dark-purple/50">No blocked users</p>
                <button className="text-xs font-semibold text-dark-purple bg-light-gray px-3 py-1.5 rounded-lg hover:bg-gray/20 transition-colors">Block User</button>
              </div>
            </div>
          )}

          {activeCat === "chat" && (
            <div className="max-w-2xl space-y-5">
              <div className="bg-off-white rounded-2xl border border-gray/10 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-bold text-dark-purple">Chat Settings</h3>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-semibold text-dark-purple">Enter to send</p>
                    <p className="text-xs text-dark-purple/50">Press Enter to send, Shift+Enter for new line</p>
                  </div>
                  <Toggle on={enterToSend} onChange={setEnterToSend} />
                </div>
              </div>

              <div className="bg-off-white rounded-2xl border border-gray/10 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-bold text-dark-purple">Wallpaper</h3>
                <div className="flex items-center gap-3">
                  {["#f8f7f9", "#f1f1f3", "#eddbda", "#d8edbe", "#1b0036", "#2563eb", "#7c3aed", "#db2777"].map((w) => (
                    <button key={w} onClick={() => {}} className={`w-9 h-9 rounded-xl transition-all ring-off-white ${w === "#1b0036" ? "ring-2 ring-dark-purple/40 ring-offset-2" : ""}`} style={{ backgroundColor: w }} />
                  ))}
                </div>
              </div>

              <div className="bg-off-white rounded-2xl border border-gray/10 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-bold text-dark-purple">Message Retention</h3>
                <select className="w-full bg-light-gray text-dark-purple text-sm px-3.5 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-dark-purple/20">
                  <option>Forever</option>
                  <option>30 days</option>
                  <option>90 days</option>
                  <option>1 year</option>
                </select>
              </div>
            </div>
          )}

          {activeCat === "storage" && (
            <div className="max-w-2xl space-y-5">
              <div className="bg-off-white rounded-2xl border border-gray/10 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-dark-purple">Cache</h3>
                  <span className="text-xs font-semibold text-dark-purple">128 MB</span>
                </div>
                <div className="w-full h-2 rounded-full bg-light-gray overflow-hidden">
                  <div className="h-full rounded-full bg-dark-purple/20" style={{ width: "32%" }} />
                </div>
                <p className="text-xs text-dark-purple/50">Clear cached images and files to free up space</p>
                <button className="text-xs font-semibold text-dark-purple bg-light-gray px-4 py-2 rounded-lg hover:bg-gray/20 transition-colors">Clear Cache</button>
              </div>

              <div className="bg-off-white rounded-2xl border border-gray/10 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-bold text-dark-purple">Auto-Download Media</h3>
                <div className="space-y-0">
                  {[
                    { label: "Wi-Fi", desc: "Download on Wi-Fi connections", icon: Wifi, value: mediaWifi, set: setMediaWifi },
                    { label: "Cellular", desc: "Download on mobile data", icon: Smartphone, value: mediaCellular, set: setMediaCellular },
                    { label: "Roaming", desc: "Download while roaming", icon: Globe, value: mediaRoaming, set: setMediaRoaming },
                  ].map((opt, i) => {
                    const OIcon = opt.icon
                    return (
                      <div key={opt.label}>
                        <div className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-3">
                            <OIcon size={16} className="text-dark-purple/30" />
                            <div>
                              <p className="text-sm font-semibold text-dark-purple">{opt.label}</p>
                              <p className="text-xs text-dark-purple/50">{opt.desc}</p>
                            </div>
                          </div>
                          <Toggle on={opt.value} onChange={opt.set} />
                        </div>
                        {i < 2 && <div className="h-px bg-light-gray" />}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-off-white rounded-2xl border border-gray/10 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-bold text-dark-purple">Data Usage</h3>
                <p className="text-xs text-dark-purple/50">Total data consumed: 1.2 GB</p>
                <div className="w-full h-2 rounded-full bg-light-gray overflow-hidden">
                  <div className="flex h-full rounded-full overflow-hidden">
                    <div className="bg-blue-400" style={{ width: "40%" }} />
                    <div className="bg-purple-400" style={{ width: "25%" }} />
                    <div className="bg-amber-400" style={{ width: "20%" }} />
                    <div className="bg-rose-400" style={{ width: "15%" }} />
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-dark-purple/40">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> Images</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400" /> Videos</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Audio</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" /> Documents</span>
                </div>
              </div>
            </div>
          )}

          {activeCat === "about" && (
            <div className="max-w-2xl space-y-5">
              <div className="bg-off-white rounded-2xl border border-gray/10 shadow-sm p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-dark-purple flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-dark-purple">Chatme</h2>
                <p className="text-sm text-dark-purple/50 mb-2">Version 1.0.0</p>
                <p className="text-xs text-dark-purple/40 max-w-xs mx-auto">Built with React, TypeScript, Vite, and Tailwind CSS. Powered by passion.</p>
              </div>

              <div className="bg-off-white rounded-2xl border border-gray/10 shadow-sm p-5 space-y-3">
                {[
                  { label: "License", value: "MIT" },
                  { label: "Open source libraries", value: "24 used" },
                  { label: "Feedback", value: "Send feedback" },
                  { label: "Privacy Policy", value: "" },
                  { label: "Terms of Service", value: "" },
                ].map((item, i) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between py-2 cursor-pointer hover:opacity-70 transition-opacity">
                      <span className="text-sm font-semibold text-dark-purple">{item.label}</span>
                      <div className="flex items-center gap-2">
                        {item.value && <span className="text-xs text-dark-purple/50">{item.value}</span>}
                        <ChevronRight size={14} className="text-dark-purple/30" />
                      </div>
                    </div>
                    {i < 4 && <div className="h-px bg-light-gray" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

    </div>
  )
}

function EditPen({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 3a2.85 2.85 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  )
}
