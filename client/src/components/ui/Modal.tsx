import { useEffect, useCallback, useRef } from "react"

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  size?: "sm" | "md" | "lg"
  className?: string
  children: React.ReactNode
}

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
}

export default function Modal({
  open,
  onClose,
  title,
  size = "md",
  className = "",
  children,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div
        className={`
          w-full ${sizeStyles[size]} bg-off-white rounded-2xl shadow-xl
          animate-in fade-in zoom-in-95
          ${className}
        `}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray/20">
            <h2 className="text-lg font-semibold text-deep-purple">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray hover:text-deep-purple transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
