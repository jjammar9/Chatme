import { useState } from "react"
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react"

export default function Auth({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [showPw, setShowPw] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || (mode === "register" && !name)) return
    onLogin()
  }

  return (
    <div className="min-h-screen bg-dark-purple flex">
      <div className="hidden lg:flex flex-1 flex-col justify-between p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-rose blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-amber blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-green blur-3xl" />
        </div>

        <div className="relative">
          <div className="w-fit bg-off-white rounded-2xl rounded-br-none p-3">
            <svg width="40" height="40" viewBox="0 0 28 28" fill="none">
              <path d="M2 7Q5 3 8 7Q11 11 14 7Q17 3 20 7Q23 11 26 7" stroke="#1b0036" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M2 14Q5 10 8 14Q11 18 14 14Q17 10 20 14Q23 18 26 14" stroke="#1b0036" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M2 21Q5 17 8 21Q11 25 14 21Q17 17 20 21Q23 25 26 21" stroke="#1b0036" strokeWidth="3" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>

        <div className="relative space-y-6 max-w-lg">
          <h1 className="text-5xl font-bold text-off-white leading-tight">
            Where conversations<br />
            <span className="text-rose">come to life.</span>
          </h1>
          <p className="text-lg text-off-white/50 leading-relaxed">
            Chat, collaborate, and stay connected with your team in a beautifully simple space.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <div className="flex -space-x-2">
              {["Sarah", "Jordan", "Maya", "Taylor"].map((s) => (
                <div key={s} className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-dark-purple">
                  <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${s}&backgroundColor=eddbda`} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <span className="text-sm text-off-white/40">Join 4,000+ teams</span>
          </div>
        </div>

        <div className="relative text-sm text-off-white/30">
          &copy; 2026 Chatme. All rights reserved.
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-fit bg-off-white rounded-2xl rounded-br-none p-2.5">
              <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
                <path d="M2 7Q5 3 8 7Q11 11 14 7Q17 3 20 7Q23 11 26 7" stroke="#1b0036" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M2 14Q5 10 8 14Q11 18 14 14Q17 10 20 14Q23 18 26 14" stroke="#1b0036" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M2 21Q5 17 8 21Q11 25 14 21Q17 17 20 21Q23 25 26 21" stroke="#1b0036" strokeWidth="3" strokeLinecap="round" fill="none" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-off-white mb-1">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-sm text-off-white/40 mb-8">
            {mode === "login" ? "Sign in to continue to Chatme" : "Start your journey with Chatme"}
          </p>

          <div className="flex gap-2 mb-8 bg-off-white/5 rounded-xl p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all ${mode === "login" ? "bg-off-white text-dark-purple shadow-sm" : "text-off-white/50 hover:text-off-white"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all ${mode === "register" ? "bg-off-white text-dark-purple shadow-sm" : "text-off-white/50 hover:text-off-white"}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-off-white/30" />
                <input
                  value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full bg-transparent border border-off-white/15 text-off-white text-sm pl-10 pr-3.5 py-3 rounded-xl outline-none focus:border-off-white/40 transition-colors placeholder:text-off-white/25"
                />
              </div>
            )}
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-off-white/30" />
              <input
                value={email} onChange={(e) => setEmail(e.target.value)}
                type="email" placeholder="Email address"
                className="w-full bg-transparent border border-off-white/15 text-off-white text-sm pl-10 pr-3.5 py-3 rounded-xl outline-none focus:border-off-white/40 transition-colors placeholder:text-off-white/25"
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-off-white/30" />
              <input
                value={password} onChange={(e) => setPassword(e.target.value)}
                type={showPw ? "text" : "password"} placeholder="Password"
                className="w-full bg-transparent border border-off-white/15 text-off-white text-sm pl-10 pr-10 py-3 rounded-xl outline-none focus:border-off-white/40 transition-colors placeholder:text-off-white/25"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                {showPw ? <EyeOff size={16} className="text-off-white/30" /> : <Eye size={16} className="text-off-white/30" />}
              </button>
            </div>

            <button type="submit" className="w-full bg-off-white text-dark-purple text-sm font-bold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg">
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-off-white/10" /></div>
            <div className="relative flex justify-center"><span className="bg-dark-purple px-3 text-xs text-off-white/30">or continue with</span></div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 border border-off-white/15 text-off-white text-sm font-semibold py-2.5 rounded-xl hover:bg-off-white/5 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 border border-off-white/15 text-off-white text-sm font-semibold py-2.5 rounded-xl hover:bg-off-white/5 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              Apple
            </button>
          </div>

          <p className="text-xs text-off-white/25 text-center mt-8 leading-relaxed">
            By continuing, you agree to our{" "}
            <a href="#" className="text-off-white/40 hover:text-off-white/60">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="text-off-white/40 hover:text-off-white/60">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
