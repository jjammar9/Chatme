import { useState, useEffect } from "react"
import { LogOut, X } from "lucide-react"
import { ThemeProvider } from "./context/ThemeContext"
import { ToastProvider } from "./context/ToastContext"
import AppLayout from "./components/layout/AppLayout"
import Sidebar from "./components/layout/Sidebar"
import ChatList from "./components/chat/ChatList"
import MessagePanel from "./components/chat/MessagePanel"
import Dashboard from "./components/dashboard/Dashboard"
import Communities from "./components/communities/Communities"
import Contacts from "./components/contacts/Contacts"
import Calendar from "./components/calendar/Calendar"
import Files from "./components/files/Files"
import Tasks from "./components/tasks/Tasks"
import Settings from "./components/settings/Settings"
import Auth from "./components/auth/Auth"
import UserProfile from "./components/profile/UserProfile"

function MainContent({ activeNav, onChat, settingsKey, onViewProfile }: { activeNav: string; onChat: () => void; settingsKey: number; onViewProfile: (id: string) => void }) {
  switch (activeNav) {
    case "dashboard":
      return <Dashboard onViewProfile={onViewProfile} />
    case "communities":
      return <Communities />
    case "contacts":
      return <Contacts onChat={onChat} />
    case "calendar":
      return <Calendar />
    case "files":
      return <Files />
    case "tasks":
      return <Tasks />
    case "settings":
      return <Settings key={settingsKey} />
    default:
      return (
        <div className="flex items-center h-full bg-off-white px-8">
          <h2 className="text-2xl font-bold text-deep-purple capitalize">{activeNav}</h2>
        </div>
      )
  }
}

function LogoutModal({ open, onClose, onLogout }: { open: boolean; onClose: () => void; onLogout: () => void }) {
  if (!open) return null
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Logout confirmation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div className="bg-off-white rounded-2xl p-6 w-80 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-dark-purple">Logout</h3>
          <button onClick={onClose} aria-label="Cancel logout"><X size={18} className="text-dark-purple/50" /></button>
        </div>
        <p className="text-sm text-dark-purple/60 mb-6">Are you sure you want to logout?</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 text-sm font-semibold text-dark-purple bg-light-gray py-2.5 rounded-xl hover:bg-gray/20 transition-colors">Cancel</button>
          <button onClick={onLogout} className="flex-1 text-sm font-semibold text-off-white bg-rose py-2.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeNav, setActiveNav] = useState("dashboard")
  const [settingsKey, setSettingsKey] = useState(0)
  const [showLogout, setShowLogout] = useState(false)
  const [viewProfileUserId, setViewProfileUserId] = useState<string | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<import("./types/conversation").Conversation | null>(null)

  const handleLogin = () => {
    setIsLoggedIn(true)
    setActiveNav("dashboard")
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
    if (storedUser.id) localStorage.setItem("userId", storedUser.id)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("userId")
    setIsLoggedIn(false)
    setActiveNav("dashboard")
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => { if (res.ok) return res.json(); throw new Error() })
        .then((data) => {
          localStorage.setItem("user", JSON.stringify(data.user))
          localStorage.setItem("userId", data.user.id)
          setIsLoggedIn(true)
        })
        .catch(() => {})
    }
  }, [])

  const handleNavChange = (key: string) => {
    if (key === "logout") { setShowLogout(true); return }
    if (key === "settings") setSettingsKey((k) => k + 1)
    setActiveNav(key)
  }

  return (
    <ThemeProvider>
      <ToastProvider>
      {!isLoggedIn ? (
        <Auth onLogin={handleLogin} />
      ) : viewProfileUserId ? (
        <div style={{ animation: "fade-in 0.2s ease-out" }} className="h-full">
          <AppLayout
            sidebar={<Sidebar activeKey={activeNav} onNavChange={(key) => { setViewProfileUserId(null); handleNavChange(key) }} onViewProfile={setViewProfileUserId} />}
            mainContent={<UserProfile userId={viewProfileUserId} onBack={() => setViewProfileUserId(null)} />}
            chatList={null}
            messagePanel={null}
            showMessages={false}
          />
        </div>
      ) : (
        <div style={{ animation: "fade-in 0.4s ease-out" }}>
          <AppLayout
            sidebar={<Sidebar activeKey={activeNav} onNavChange={handleNavChange} onViewProfile={setViewProfileUserId} />}
            mainContent={<MainContent activeNav={activeNav} onChat={() => setActiveNav("messages")} settingsKey={settingsKey} onViewProfile={setViewProfileUserId} />}
            chatList={<ChatList selectedConversation={selectedConversation} />}
            messagePanel={<MessagePanel selectedConversationId={selectedConversation?._id || null} onSelectConversation={setSelectedConversation} />}
            showMessages={activeNav === "messages"}
          />
          <LogoutModal open={showLogout} onClose={() => setShowLogout(false)} onLogout={handleLogout} />
        </div>
      )}
    </ToastProvider>
    </ThemeProvider>
  )
}

export default App
