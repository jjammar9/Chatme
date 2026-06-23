import { useState } from "react"
import AppLayout from "./components/layout/AppLayout"
import Sidebar from "./components/layout/Sidebar"
import ChatList from "./components/chat/ChatList"
import MessagePanel from "./components/chat/MessagePanel"
import Dashboard from "./components/dashboard/Dashboard"

function MainContent({ activeNav }: { activeNav: string }) {
  switch (activeNav) {
    case "dashboard":
      return <Dashboard />
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
      mainContent={<MainContent activeNav={activeNav} />}
      showMessages={activeNav === "messages"}
    />
  )
}

export default App