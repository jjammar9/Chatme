import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

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
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-dark-purple items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]">
          <svg className="w-full h-full" viewBox="0 0 400 800" preserveAspectRatio="none">
            <path d="M0 100 Q100 0 200 100 T400 100" stroke="#f8f7f9" strokeWidth="40" fill="none" />
            <path d="M0 200 Q100 100 200 200 T400 200" stroke="#f8f7f9" strokeWidth="40" fill="none" />
            <path d="M0 300 Q100 200 200 300 T400 300" stroke="#f8f7f9" strokeWidth="40" fill="none" />
            <path d="M0 400 Q100 300 200 400 T400 400" stroke="#f8f7f9" strokeWidth="40" fill="none" />
            <path d="M0 500 Q100 400 200 500 T400 500" stroke="#f8f7f9" strokeWidth="40" fill="none" />
            <path d="M0 600 Q100 500 200 600 T400 600" stroke="#f8f7f9" strokeWidth="40" fill="none" />
            <path d="M0 700 Q100 600 200 700 T400 700" stroke="#f8f7f9" strokeWidth="40" fill="none" />
            <path d="M0 800 Q100 700 200 800 T400 800" stroke="#f8f7f9" strokeWidth="40" fill="none" />
          </svg>
        </div>
        <div className="relative flex flex-col items-center gap-12">
          <svg width="220" height="120" viewBox="0 0 220 120" fill="none" className="drop-shadow-2xl">
            <path d="M10 30Q30 10 50 30Q70 50 90 30Q110 10 130 30Q150 50 170 30Q190 10 210 30" stroke="#f8f7f9" strokeWidth="8" strokeLinecap="round" fill="none" />
            <path d="M10 60Q30 40 50 60Q70 80 90 60Q110 40 130 60Q150 80 170 60Q190 40 210 60" stroke="#f8f7f9" strokeWidth="8" strokeLinecap="round" fill="none" />
            <path d="M10 90Q30 70 50 90Q70 110 90 90Q110 70 130 90Q150 110 170 90Q190 70 210 90" stroke="#f8f7f9" strokeWidth="8" strokeLinecap="round" fill="none" />
          </svg>
          <div className="text-center">
            <p className="text-off-white/70 text-xs font-semibold tracking-[0.3em] uppercase">Chatme</p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-off-white flex items-center justify-center px-8">
        <div className="w-full max-w-xs">
          <div className="lg:hidden flex justify-center mb-10">
            <div className="w-fit bg-dark-purple rounded-2xl rounded-br-none p-3 shadow-lg">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M2 7Q5 3 8 7Q11 11 14 7Q17 3 20 7Q23 11 26 7" stroke="#f8f7f9" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M2 14Q5 10 8 14Q11 18 14 14Q17 10 20 14Q23 18 26 14" stroke="#f8f7f9" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M2 21Q5 17 8 21Q11 25 14 21Q17 17 20 21Q23 25 26 21" stroke="#f8f7f9" strokeWidth="3" strokeLinecap="round" fill="none" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-dark-purple tracking-tight mb-1">
            {mode === "login" ? "Sign in" : "Create account"}
          </h1>
          <p className="text-sm text-dark-purple/50 mb-8">
            {mode === "login" ? "Stay connected with your team." : "Join thousands on Chatme."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <input
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full bg-transparent text-dark-purple text-sm px-4 py-3.5 rounded-2xl border border-[#cfd9de] outline-none focus:border-dark-purple/40 transition-colors placeholder:text-dark-purple/30"
              />
            )}
            <input
              value={email} onChange={(e) => setEmail(e.target.value)}
              type="email" placeholder="Phone, email, or username"
              className="w-full bg-transparent text-dark-purple text-sm px-4 py-3.5 rounded-2xl border border-[#cfd9de] outline-none focus:border-dark-purple/40 transition-colors placeholder:text-dark-purple/30"
            />
            <div className="relative">
              <input
                value={password} onChange={(e) => setPassword(e.target.value)}
                type={showPw ? "text" : "password"} placeholder="Password"
                className="w-full bg-transparent text-dark-purple text-sm px-4 py-3.5 rounded-2xl border border-[#cfd9de] outline-none focus:border-dark-purple/40 transition-colors placeholder:text-dark-purple/30"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2">
                {showPw ? <EyeOff size={16} className="text-dark-purple/35" /> : <Eye size={16} className="text-dark-purple/35" />}
              </button>
            </div>

            <button type="submit" className="w-full bg-dark-purple text-off-white text-sm font-bold py-3.5 rounded-full hover:opacity-90 transition-all shadow-lg shadow-dark-purple/15">
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          {mode === "login" && (
            <button className="text-sm text-dark-purple/50 hover:text-dark-purple mt-3 transition-colors">
              Forgot password?
            </button>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#e1e8ed]" /></div>
            <div className="relative flex justify-center"><span className="bg-off-white px-3 text-sm text-dark-purple/40">or</span></div>
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-2.5 bg-transparent text-dark-purple text-sm font-semibold py-3 rounded-full border border-[#cfd9de] hover:bg-[#f7f7f7] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Sign in with Google
            </button>
            <button className="w-full flex items-center justify-center gap-2.5 bg-transparent text-dark-purple text-sm font-semibold py-3 rounded-full border border-[#cfd9de] hover:bg-[#f7f7f7] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              Sign in with Apple
            </button>
          </div>

          <p className="text-sm text-dark-purple/50 mt-8 text-center">
            {mode === "login" ? (
              <>Don't have an account?{" "}<button onClick={() => setMode("register")} className="text-dark-purple hover:underline font-semibold">Sign up</button></>
            ) : (
              <>Already have an account?{" "}<button onClick={() => setMode("login")} className="text-dark-purple hover:underline font-semibold">Sign in</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
