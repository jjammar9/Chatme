import { useState } from "react"
import AppLayout from "./components/layout/AppLayout"
import Sidebar from "./components/layout/Sidebar"
import ChatList from "./components/chat/ChatList"
import MessagePanel from "./components/chat/MessagePanel"
import Dashboard from "./components/dashboard/Dashboard"
import Communities from "./components/communities/Communities"
import Contacts from "./components/contacts/Contacts"
import Calendar from "./components/calendar/Calendar"

function MainContent({ activeNav, onChat }: { activeNav: string; onChat: () => void }) {
  switch (activeNav) {
    case "dashboard":
      return <Dashboard />
    case "communities":
      return <Communities />
    case "contacts":
      return <Contacts onChat={onChat} />
    case "calendar":
      return <Calendar />
    default:
      return (
        <div className="flex items-center h-full bg-off-white px-8">
          <h2 className="text-2xl font-bold text-deep-purple capitalize">{activeNav}</h2>
        </div>
      )
  }
}

function App() {
  const [activeNav, setActiveNav] = useState("messages")

  return (
    <AppLayout
      sidebar={<Sidebar activeKey={activeNav} onNavChange={setActiveNav} />}
      chatList={<ChatList />}
      messagePanel={<MessagePanel />}
      mainContent={<MainContent activeNav={activeNav} onChat={() => setActiveNav("messages")} />}
      showMessages={activeNav === "messages"}
    />
  )
}

export default App