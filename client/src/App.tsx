import AppLayout from "./components/layout/AppLayout"
import Sidebar from "./components/layout/Sidebar"
import ChatList from "./components/chat/ChatList"
import MessagePanel from "./components/chat/MessagePanel"

function App() {
  return (
    <AppLayout
      sidebar={<Sidebar />}
      chatList={<ChatList />}
      messagePanel={<MessagePanel />}
    />
  )
}

export default App
