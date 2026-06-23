import { useState } from "react"
import { LogOut, X } from "lucide-react"
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

function MainContent({ activeNav, onChat, settingsKey }: { activeNav: string; onChat: () => void; settingsKey: number }) {
  switch (activeNav) {
    case "dashboard":
      return <Dashboard />
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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeNav, setActiveNav] = useState("dashboard")
  const [settingsKey, setSettingsKey] = useState(0)
  const [showLogout, setShowLogout] = useState(false)

  const handleLogin = () => {
    setIsLoggedIn(true)
    setActiveNav("dashboard")
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setActiveNav("dashboard")
  }

  const handleNavChange = (key: string) => {
    if (key === "logout") { setShowLogout(true); return }
    if (key === "settings") setSettingsKey((k) => k + 1)
    setActiveNav(key)
  }

  if (!isLoggedIn) return <Auth onLogin={handleLogin} />

  return (
    <div style={{ animation: "fade-in 0.4s ease-out" }}>
      <AppLayout
        sidebar={<Sidebar activeKey={activeNav} onNavChange={handleNavChange} />}
        mainContent={<MainContent activeNav={activeNav} onChat={() => setActiveNav("messages")} settingsKey={settingsKey} />}
        chatList={<ChatList />}
        messagePanel={<MessagePanel />}
        showMessages={activeNav === "messages"}
      />
      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowLogout(false)}>
          <div className="bg-off-white rounded-2xl p-6 w-80 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-dark-purple">Logout</h3>
              <button onClick={() => setShowLogout(false)}><X size={18} className="text-dark-purple/50" /></button>
            </div>
            <p className="text-sm text-dark-purple/60 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogout(false)} className="flex-1 text-sm font-semibold text-dark-purple bg-light-gray py-2.5 rounded-xl hover:bg-gray/20 transition-colors">Cancel</button>
              <button onClick={handleLogout} className="flex-1 text-sm font-semibold text-off-white bg-rose py-2.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5">
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App