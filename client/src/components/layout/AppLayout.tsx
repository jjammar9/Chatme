interface AppLayoutProps {
  sidebar: React.ReactNode
  chatList: React.ReactNode
  messagePanel: React.ReactNode
  mainContent: React.ReactNode
  showMessages: boolean
}

export default function AppLayout({ sidebar, chatList, messagePanel, mainContent, showMessages }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-off-white">
      <div className="w-[20%] min-w-[200px] max-w-[280px] border-r border-gray/30">
        {sidebar}
      </div>
      {showMessages ? (
        <>
          <div className="w-[60%] min-w-0 border-r border-gray/30">
            {chatList}
          </div>
          <div className="w-[20%] min-w-[200px] max-w-[280px]">
            {messagePanel}
          </div>
        </>
      ) : (
        <div className="flex-1 min-w-0">
          {mainContent}
        </div>
      )}
    </div>
  )
}
