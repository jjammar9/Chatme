import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type ThemeMode = "light" | "dark" | "system"

interface ThemeContextType {
  theme: ThemeMode
  accentColor: string
  fontSize: number
  setTheme: (t: ThemeMode) => void
  setAccentColor: (c: string) => void
  setFontSize: (s: number) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

function getStored<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    return v !== null ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(() => getStored("chatme-theme", "light"))
  const [accentColor, setAccentColor] = useState(() => getStored("chatme-accent", "#1b0036"))
  const [fontSize, setFontSize] = useState(() => getStored("chatme-font-size", 16))

  useEffect(() => { localStorage.setItem("chatme-theme", JSON.stringify(theme)) }, [theme])
  useEffect(() => { localStorage.setItem("chatme-accent", JSON.stringify(accentColor)) }, [accentColor])
  useEffect(() => { localStorage.setItem("chatme-font-size", JSON.stringify(fontSize)) }, [fontSize])

  useEffect(() => {
    const root = document.documentElement
    const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    root.classList.toggle("dark", isDark)
    root.style.setProperty("--accent", accentColor)
    root.style.setProperty("--font-size-base", `${fontSize}px`)
  }, [theme, accentColor, fontSize])

  return (
    <ThemeContext.Provider value={{ theme, accentColor, fontSize, setTheme, setAccentColor, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}
