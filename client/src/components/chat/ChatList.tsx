import { useState } from "react"
import { Heart, Search, Video, Phone, Users } from "lucide-react"
import Avatar from "../ui/Avatar"

const members = [
  { name: "Sarah Johnson", seed: "Sarah" },
  { name: "Alex Chen", seed: "Alex" },
  { name: "Maya Patel", seed: "Maya" },
  { name: "Jordan Kim", seed: "Jordan" },
  { name: "Taylor Reed", seed: "Taylor" },
]

function VideoMessage({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  if (playing) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
        onClick={onToggle}
      >
        <button
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          onClick={onToggle}
          aria-label="Close video"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <div className="w-full max-w-4xl px-4" onClick={(e) => e.stopPropagation()}>
          <video className="w-full max-h-[80vh] object-contain rounded-lg" controls autoPlay playsInline>
            <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    )
  }

  return (
    <div className="relative cursor-pointer group" onClick={onToggle}>
      <img
        src="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=225&fit=crop"
        alt="Play video"
        className="w-full h-44 object-cover"
      />
      <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors">
        <span className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M8 5v14l11-7L8 5z" fill="#1b0036" />
          </svg>
        </span>
      </div>
    </div>
  )
}

export default function ChatList() {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="h-full bg-light-gray flex flex-col">
      <VideoMessage playing={playing} onToggle={() => setPlaying(!playing)} />
      <div className="flex items-center justify-between px-5 py-3 bg-off-white border-b border-light-gray">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {members.slice(0, 4).map((m) => (
              <div key={m.seed} className="ring-2 ring-off-white shrink-0 rounded-lg">
                <Avatar seed={m.seed} alt={m.name} size="md" />
              </div>
            ))}
            <div className="w-10 h-10 rounded-lg bg-dark-purple shrink-0 ring-2 ring-off-white flex items-center justify-center">
              <span className="text-[10px] font-bold text-off-white">+{members.length - 4}</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-dark-purple">Project Squad</p>
            <div className="flex items-center gap-1">
              <Users size={12} className="text-dark-purple/50" />
              <span className="text-xs text-dark-purple/50">{members.length} members, 3 online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-lg bg-dark-purple flex items-center justify-center hover:bg-deep-purple transition-colors" aria-label="Favourite">
            <Heart size={16} className="text-off-white" />
          </button>
          <button className="w-8 h-8 rounded-lg bg-dark-purple flex items-center justify-center hover:bg-deep-purple transition-colors" aria-label="Search">
            <Search size={16} className="text-off-white" />
          </button>
          <button className="w-8 h-8 rounded-lg bg-dark-purple flex items-center justify-center hover:bg-deep-purple transition-colors" aria-label="Video call">
            <Video size={16} className="text-off-white" />
          </button>
          <button className="w-8 h-8 rounded-lg bg-dark-purple flex items-center justify-center hover:bg-deep-purple transition-colors" aria-label="Phone call">
            <Phone size={16} className="text-off-white" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="flex justify-start items-end gap-2">
          <Avatar seed="Sarah" size="sm" />
          <div>
            <span className="text-xs font-bold text-dark-purple/60 block mb-1">Sarah Johnson</span>
            <div className="max-w-[70%] bg-white rounded-2xl rounded-bl-sm px-4 py-2.5">
              <p className="text-sm text-dark-purple">Hey everyone! How's the project coming along?</p>
              <span className="text-[10px] text-dark-purple/40 text-right block mt-1">10:42</span>
            </div>
          </div>
        </div>
        <div className="flex justify-start items-end gap-2">
          <Avatar seed="Maya" size="sm" />
          <div>
            <span className="text-xs font-bold text-dark-purple/60 block mb-1">Maya Patel</span>
            <div className="max-w-[70%] bg-white rounded-2xl rounded-bl-sm px-4 py-2.5">
              <p className="text-sm text-dark-purple">Almost done with the backend! Just need to fix a few bugs 🐛</p>
              <span className="text-[10px] text-dark-purple/40 text-right block mt-1">10:43</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end items-end gap-2">
          <div className="text-right">
            <span className="text-xs font-bold text-dark-purple/60 block mb-1 text-right">You</span>
            <div className="max-w-[70%] bg-dark-purple rounded-2xl rounded-br-sm px-4 py-2.5 ml-auto">
              <p className="text-sm text-off-white">Nice! Frontend is looking clean too. Pushing a update later today.</p>
              <span className="text-[10px] text-off-white/50 text-right block mt-1">10:44</span>
            </div>
          </div>
          <Avatar seed="Alex" size="sm" />
        </div>
        <div className="flex justify-start items-end gap-2">
          <Avatar seed="Jordan" size="sm" />
          <div>
            <span className="text-xs font-bold text-dark-purple/60 block mb-1">Jordan Kim</span>
            <div className="max-w-[70%] bg-white rounded-2xl rounded-bl-sm overflow-hidden">
              <div className="grid grid-cols-2 gap-0.5">
                <img
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop"
                  alt=""
                  className="w-full h-36 object-cover"
                />
                <div className="grid grid-rows-2 gap-0.5">
                  <img
                    src="https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&h=300&fit=crop"
                    alt=""
                    className="w-full h-[71px] object-cover"
                  />
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1549490349-8643362247b5?w=400&h=300&fit=crop"
                      alt=""
                      className="w-full h-[71px] object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">+26</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 pb-2.5 pt-2">
                <p className="text-sm text-dark-purple">Here are some design mockup options! Thoughts? 🤔</p>
                <span className="text-[10px] text-dark-purple/40 text-right block mt-1">10:45</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-start items-end gap-2">
          <Avatar seed="Taylor" size="sm" />
          <div>
            <span className="text-xs font-bold text-dark-purple/60 block mb-1">Taylor Reed</span>
            <div className="max-w-[70%] bg-white rounded-2xl rounded-bl-sm px-4 py-2.5">
              <p className="text-sm text-dark-purple">Love the design! Maybe we can tweak the nav layout a bit?</p>
              <span className="text-[10px] text-dark-purple/40 text-right block mt-1">10:46</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end items-end gap-2">
          <div className="text-right">
            <span className="text-xs font-bold text-dark-purple/60 block mb-1 text-right">You</span>
            <div className="max-w-[70%] bg-dark-purple rounded-2xl rounded-br-sm overflow-hidden ml-auto relative">
              <div className="px-4 pb-2.5 pt-2">
                <p className="text-sm text-off-white">Check out this walkthrough of the new flow I recorded 📹</p>
                <span className="text-[10px] text-off-white/50 text-right block mt-1">10:47</span>
              </div>
            </div>
          </div>
          <Avatar seed="Alex" size="sm" />
        </div>
        <div className="flex justify-start items-end gap-2">
          <Avatar seed="Alex" size="sm" />
          <div>
            <span className="text-xs font-bold text-dark-purple/60 block mb-1">Alex Chen</span>
            <div className="max-w-[70%] bg-white rounded-2xl rounded-bl-sm px-4 py-2.5">
              <p className="text-sm text-dark-purple">Count me in for the review session. Same time tomorrow?</p>
              <span className="text-[10px] text-dark-purple/40 text-right block mt-1">10:48</span>
            </div>
          </div>
        </div>
        <div className="flex justify-start items-end gap-2">
          <Avatar seed="Sarah" size="sm" />
          <div>
            <span className="text-xs font-bold text-dark-purple/60 block mb-1">Sarah Johnson</span>
            <div className="max-w-[70%] bg-white rounded-2xl rounded-bl-sm overflow-hidden">
              <div className="bg-green/20 p-4 flex flex-col items-center gap-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#1b0036" />
                  <circle cx="12" cy="9" r="2.5" fill="white" />
                </svg>
                <div className="bg-white rounded-lg px-3 py-2 w-full text-center shadow-sm">
                  <p className="text-xs font-bold text-dark-purple">Blue Bottle Coffee</p>
                  <p className="text-[10px] text-dark-purple/60">315 Sutter St, San Francisco</p>
                  <p className="text-[10px] text-dark-purple/40 mt-0.5">0.3 mi · Open until 7pm</p>
                </div>
              </div>
              <div className="px-4 pb-2.5 pt-2">
                <p className="text-sm text-dark-purple">Meet us here for the review session! ☕</p>
                <span className="text-[10px] text-dark-purple/40 text-right block mt-1">10:49</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-start items-end gap-2">
          <Avatar seed="Maya" size="sm" />
          <div>
            <span className="text-xs font-bold text-dark-purple/60 block mb-1">Maya Patel</span>
            <div className="max-w-[85%] bg-white rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-light-gray">
                <span className="w-6 h-6 rounded-full bg-rose flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="10" width="18" height="11" rx="2" stroke="white" strokeWidth="2" />
                    <path d="M7 10V7a5 5 0 0110 0v3" stroke="white" strokeWidth="2" />
                  </svg>
                </span>
                <span className="text-xs font-bold text-dark-purple">What time works best?</span>
              </div>
              <div className="space-y-2.5">
                <div className="group cursor-pointer">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-dark-purple">Morning (9-12)</span>
                    <span className="text-[11px] font-bold text-dark-purple">65%</span>
                  </div>
                  <div className="h-2.5 bg-light-gray rounded-full overflow-hidden">
                    <div className="h-full bg-rose rounded-full transition-all duration-500" style={{ width: "65%" }} />
                  </div>
                </div>
                <div className="group cursor-pointer">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-dark-purple">Afternoon (12-5)</span>
                    <span className="text-[11px] font-bold text-dark-purple">25%</span>
                  </div>
                  <div className="h-2.5 bg-light-gray rounded-full overflow-hidden">
                    <div className="h-full bg-light-green rounded-full transition-all duration-500" style={{ width: "25%" }} />
                  </div>
                </div>
                <div className="group cursor-pointer">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-dark-purple">Evening (5-8)</span>
                    <span className="text-[11px] font-bold text-dark-purple">10%</span>
                  </div>
                  <div className="h-2.5 bg-light-gray rounded-full overflow-hidden">
                    <div className="h-full bg-dark-purple/30 rounded-full transition-all duration-500" style={{ width: "10%" }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-light-gray">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green" />
                  <span className="text-[10px] text-dark-purple/50">Open · 8 votes</span>
                </div>
                <span className="text-[10px] font-medium text-dark-purple/50">Tap to vote</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end items-end gap-2">
          <div className="text-right">
            <span className="text-xs font-bold text-dark-purple/60 block mb-1 text-right">You</span>
            <div className="max-w-[75%] bg-dark-purple rounded-2xl rounded-br-sm py-4 ml-auto">
              <div className="flex items-center justify-center gap-4 px-10">
                <button className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors shrink-0" aria-label="Play voice message">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M8 5v14l11-7L8 5z" fill="white" />
                  </svg>
                </button>
                <div className="flex items-end gap-[2px] h-5">
                  {[3,6,2,8,4,7,5,9,4,6,3,7,5,8,4,6,2,9,3,7,5,6,4,8,3,7,5].map((h, i) => (
                    <div
                      key={i}
                      className="w-[2px] bg-white/45 rounded-full"
                      style={{ height: `${h * 11}%`, opacity: i < 12 ? 0.85 : 0.25 }}
                    />
                  ))}
                </div>
              </div>
              <span className="text-[10px] text-off-white/50 font-mono block text-center mt-2 px-10">0:00 / 0:42</span>
            </div>
          </div>
          <Avatar seed="Alex" size="sm" />
        </div>
      </div>
      <div className="flex items-center gap-2 px-4 py-3 bg-off-white border-t border-light-gray">
        <div className="flex items-center gap-1 h-10">
          <button className="w-10 h-10 rounded-lg bg-light-gray flex items-center justify-center hover:bg-gray transition-colors" aria-label="Add emoji">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1b0036" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </button>
          <button className="w-10 h-10 rounded-lg bg-light-gray flex items-center justify-center hover:bg-gray transition-colors" aria-label="Attach file">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1b0036" strokeWidth="1.5" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </button>
          <button className="w-10 h-10 rounded-lg bg-light-gray flex items-center justify-center hover:bg-gray transition-colors" aria-label="Add image">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1b0036" strokeWidth="1.5" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L6 21" />
              <path d="M15 21l-4-4-5 5" />
            </svg>
          </button>
          <button className="w-10 h-10 rounded-lg bg-light-gray flex items-center justify-center hover:bg-gray transition-colors" aria-label="Record video">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1b0036" strokeWidth="1.5" strokeLinecap="round">
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" />
            </svg>
          </button>
          <button className="w-10 h-10 rounded-lg bg-light-gray flex items-center justify-center hover:bg-gray transition-colors" aria-label="Record audio">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1b0036" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
              <path d="M19 10v2a7 7 0 01-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
          <button className="w-10 h-10 rounded-lg bg-light-gray flex items-center justify-center hover:bg-gray transition-colors" aria-label="Share location">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1b0036" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </button>
        </div>
        <div className="flex-1 flex items-center gap-2 bg-light-gray rounded-xl h-10 px-3">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm text-dark-purple placeholder-dark-purple/40 outline-none"
            aria-label="Message input"
          />
          <button className="w-10 h-10 rounded-lg bg-dark-purple flex items-center justify-center hover:bg-deep-purple transition-colors shrink-0" aria-label="Send message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
