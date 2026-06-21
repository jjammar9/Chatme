interface AppLayoutProps {
  sidebar: React.ReactNode
  chatList: React.ReactNode
  messagePanel: React.ReactNode
}

export default function AppLayout({ sidebar, chatList, messagePanel }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-off-white">
      <div className="w-[20%] min-w-[200px] max-w-[280px] border-r border-gray/30">
        {sidebar}
      </div>
      <div className="w-[50%] min-w-[320px] max-w-[600px] border-r border-gray/30">
        {chatList}
      </div>
      <div className="flex-1 min-w-0">
        {messagePanel}
      </div>
    </div>
  )
}
