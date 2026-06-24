import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        {toasts.map((t) => {
          const colors = {
            success: "bg-green text-off-white",
            error: "bg-rose text-dark-purple",
            info: "bg-dark-purple text-off-white",
          }
          const icons = {
            success: <CheckCircle size={16} />,
            error: <AlertCircle size={16} />,
            info: <Info size={16} />,
          }
          return (
            <div key={t.id} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold animate-[fade-in_0.2s_ease-out] ${colors[t.type]}`} style={{ animation: "fade-in 0.2s ease-out" }}>
              {icons[t.type]}
              {t.message}
              <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} className="ml-2 opacity-60 hover:opacity-100">
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}
