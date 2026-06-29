import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { io, Socket } from "socket.io-client"

interface SocketContextValue {
  socket: Socket | null
  connected: boolean
}

const SocketContext = createContext<SocketContextValue>({ socket: null, connected: false })

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    const s = io({ auth: { token } })

    s.on("connect", () => setConnected(true))
    s.on("disconnect", () => setConnected(false))

    setSocket(s)

    return () => { s.close() }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
