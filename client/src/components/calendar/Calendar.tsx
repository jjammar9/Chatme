import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus, CalendarDays, X, MapPin, Clock, Users, ArrowLeft, Trash2, Edit3, Star, Gift, Heart } from "lucide-react"

interface CalendarEvent {
  date: number
  month: number
  year: number
  title: string
  time: string
  seed: string
  status: "confirmed" | "tentative" | "cancelled"
  location?: string
  description?: string
  attendees?: string[]
}

const seeds = ["Sarah", "Jordan", "Maya", "Taylor", "Alex", "Emily", "Marcus", "Priya"]

const initialEvents: CalendarEvent[] = [
  { date: 23, month: 5, year: 2026, title: "Project Squad standup", time: "9:00 AM", seed: "Sarah", status: "confirmed", location: "Conference Room A, 3rd Floor", description: "Daily standup to discuss progress, blockers, and next steps for the project.", attendees: ["Jordan", "Alex", "Maya"] },
  { date: 23, month: 5, year: 2026, title: "Design review w/ Jordan", time: "11:30 AM", seed: "Jordan", status: "confirmed", location: "Design Lab, Building B", description: "Review the new UI mockups for the dashboard redesign.", attendees: ["Maya"] },
  { date: 24, month: 5, year: 2026, title: "Lunch w/ Sarah", time: "12:00 PM", seed: "Sarah", status: "confirmed", location: "Blue Bottle Coffee, Downtown", description: "Catch up over lunch and brainstorm ideas for the next sprint.", attendees: [] },
  { date: 24, month: 5, year: 2026, title: "Backend sync — Maya", time: "3:00 PM", seed: "Maya", status: "tentative", location: "Zoom", description: "Sync on the API architecture and database schema changes.", attendees: ["Alex"] },
  { date: 25, month: 5, year: 2026, title: "ML sprint review", time: "10:00 AM", seed: "Alex", status: "confirmed", location: "Meeting Room 2, HQ", description: "Review the latest ML model performance and discuss deployment timeline.", attendees: ["Maya", "Emily"] },
  { date: 26, month: 5, year: 2026, title: "QA walkthrough — Priya", time: "1:00 PM", seed: "Priya", status: "confirmed", location: "Testing Lab, 2nd Floor", description: "Walkthrough of the new test suite and QA pipeline improvements.", attendees: ["Emily"] },
  { date: 27, month: 5, year: 2026, title: "Product roadmap session", time: "9:30 AM", seed: "Taylor", status: "confirmed", location: "Board Room, 5th Floor", description: "Quarterly roadmap planning.", attendees: ["Sarah", "Jordan", "Maya"] },
  { date: 27, month: 5, year: 2026, title: "Data review — Marcus", time: "2:00 PM", seed: "Marcus", status: "cancelled", location: "Data Lab, Bldg C", description: "Review analytics dashboard performance.", attendees: ["Priya"] },
  { date: 30, month: 5, year: 2026, title: "Design critique", time: "4:00 PM", seed: "Taylor", status: "tentative", location: "Design Lab, Building B", description: "Open design critique session.", attendees: ["Jordan", "Sarah"] },
  { date: 2, month: 6, year: 2026, title: "Sprint planning", time: "10:00 AM", seed: "Emily", status: "confirmed", location: "Conference Room A", description: "Plan the next sprint.", attendees: ["Alex", "Maya", "Jordan"] },
  { date: 4, month: 6, year: 2026, title: "Team offsite", time: "All day", seed: "Jordan", status: "confirmed", location: "Lakeside Retreat Center", description: "Full-day team building and strategy session.", attendees: ["Sarah", "Alex", "Maya", "Taylor", "Priya", "Emily", "Marcus"] },
  { date: 5, month: 6, year: 2026, title: "Sarah's Birthday 🎂", time: "6:00 PM", seed: "Sarah", status: "confirmed", location: "Olive Garden, Downtown", description: "Birthday dinner for Sarah!", attendees: ["Jordan", "Maya", "Taylor"] },
  { date: 8, month: 6, year: 2026, title: "Family Dinner", time: "7:00 PM", seed: "Jordan", status: "confirmed", location: "Mom's House", description: "Weekly family dinner.", attendees: ["Sarah"] },
  { date: 15, month: 6, year: 2026, title: "Family BBQ", time: "2:00 PM", seed: "Jordan", status: "tentative", location: "Backyard", description: "Summer BBQ with the whole family.", attendees: ["Sarah", "Emily"] },
]

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function todayDate() {
  const d = new Date()
  return { date: d.getDate(), month: d.getMonth(), year: d.getFullYear() }
}

export default function Calendar() {
  const today = todayDate()
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>(initialEvents)
  const [viewMonth, setViewMonth] = useState(today.month)
  const [viewYear, setViewYear] = useState(today.year)
  const [selected, setSelected] = useState<{ date: number; month: number; year: number }>(today)
  const [showAdd, setShowAdd] = useState(false)
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null)
  const [filter, setFilter] = useState<"important" | "birthdays" | "family" | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [newTime, setNewTime] = useState("")
  const [newSeed, setNewSeed] = useState(seeds[0])
  const [newStatus, setNewStatus] = useState<"confirmed" | "tentative" | "cancelled">("confirmed")

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  const goToday = () => {
    setViewMonth(today.month)
    setViewYear(today.year)
    setSelected(today)
    setFilter(null)
  }

  const addEvent = () => {
    if (!newTitle.trim()) return
    setAllEvents((prev) => [...prev, { date: selected.date, month: selected.month, year: selected.year, title: newTitle.trim(), time: newTime || "All day", seed: newSeed, status: newStatus, location: "", description: "", attendees: [] }])
    setNewTitle("")
    setNewTime("")
    setShowAdd(false)
  }

  const deleteEvent = (e: CalendarEvent) => {
    setAllEvents((prev) => prev.filter((ev) => ev !== e))
    setDetailEvent(null)
  }

  const selectedEvents = allEvents
    .filter((e) => e.date === selected.date && e.month === selected.month && e.year === selected.year)
    .sort((a, b) => (a.time === "All day" ? -1 : b.time === "All day" ? 1 : a.time.localeCompare(b.time)))

  const filteredEvents: CalendarEvent[] = (() => {
    const now = new Date(today.year, today.month, today.date)
    if (filter === "important") {
      return allEvents.filter((e) => {
        const d = new Date(e.year, e.month, e.date)
        return e.status === "confirmed" && (e.attendees?.length ?? 0) >= 2 && d >= now
      }).sort((a, b) => new Date(a.year, a.month, a.date).getTime() - new Date(b.year, b.month, b.date).getTime())
    }
    if (filter === "birthdays") {
      return allEvents.filter((e) => {
        const d = new Date(e.year, e.month, e.date)
        return e.title.toLowerCase().includes("birthday") && d >= now
      }).sort((a, b) => new Date(a.year, a.month, a.date).getTime() - new Date(b.year, b.month, b.date).getTime())
    }
    if (filter === "family") {
      return allEvents.filter((e) => {
        const d = new Date(e.year, e.month, e.date)
        return (e.title.toLowerCase().includes("family") || e.title.toLowerCase().includes("dinner") || e.title.toLowerCase().includes("lunch")) && d >= now
      }).sort((a, b) => new Date(a.year, a.month, a.date).getTime() - new Date(b.year, b.month, b.date).getTime())
    }
    return []
  })()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const allAttendees = detailEvent ? [detailEvent.seed, ...(detailEvent.attendees ?? [])] : []

  return (
    <div className="h-full bg-light-gray flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="bg-off-white px-8 pt-5 pb-3 border-b border-gray/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-dark-purple flex items-center justify-center">
              <CalendarDays size={16} className="text-off-white" />
            </div>
            <h1 className="text-lg font-bold text-dark-purple">Calendar</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-light-gray transition-colors"><ChevronLeft size={15} className="text-dark-purple/50" /></button>
            <span className="text-sm font-bold text-dark-purple min-w-[124px] text-center">{monthNames[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-light-gray transition-colors"><ChevronRight size={15} className="text-dark-purple/50" /></button>
            <div className="w-px h-5 bg-gray/30 mx-1" />
            <button onClick={goToday} className="text-xs font-semibold text-dark-purple border border-gray/30 px-3 py-1 rounded-lg hover:bg-light-gray transition-colors">Today</button>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 bg-dark-purple text-off-white text-xs font-semibold px-3.5 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
              <Plus size={14} /> Event
            </button>
          </div>
        </div>
      </div>

      {/* Quick nav pills */}
      <div className="bg-off-white px-8 pb-3 border-b border-gray/20 flex items-center gap-2 overflow-x-auto">
        {[
          { label: "Today", days: 0 },
          { label: "Tomorrow", days: 1 },
          { label: "In 3 days", days: 3 },
          { label: "In 7 days", days: 7 },
          { label: "In 15 days", days: 15 },
        ].map((item) => {
          const d = new Date(today.year, today.month, today.date + item.days)
          const isActive = selected.date === d.getDate() && selected.month === d.getMonth() && selected.year === d.getFullYear()
          return (
            <button
              key={item.label}
              onClick={() => { setSelected({ date: d.getDate(), month: d.getMonth(), year: d.getFullYear() }); setViewMonth(d.getMonth()); setViewYear(d.getFullYear()); setFilter(null) }}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                isActive ? "bg-dark-purple text-off-white" : "bg-light-gray text-dark-purple/60 hover:text-dark-purple"
              }`}
            >
              {item.label}
            </button>
          )
        })}
        <button
          onClick={() => setFilter(filter === "important" ? null : "important")}
          className={`flex items-center gap-1 text-xs font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors ${
            filter === "important" ? "bg-amber-800 text-white" : "bg-amber-100 text-amber-800 hover:bg-amber-200"
          }`}
        >
          <Star size={12} className={`shrink-0 ${filter === "important" ? "" : "fill-amber-800"}`} /> Important
        </button>
        <button
          onClick={() => setFilter(filter === "birthdays" ? null : "birthdays")}
          className={`flex items-center gap-1 text-xs font-semibold pl-3 pr-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors ${
            filter === "birthdays" ? "bg-rose text-off-white" : "bg-rose/20 text-dark-purple hover:bg-rose/30"
          }`}
        >
          <Gift size={12} /> Birthdays
        </button>
        <button
          onClick={() => setFilter(filter === "family" ? null : "family")}
          className={`flex items-center gap-1 text-xs font-semibold pl-3 pr-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors ${
            filter === "family" ? "bg-green text-off-white" : "bg-light-green text-dark-purple hover:opacity-80"
          }`}
        >
          <Heart size={12} /> Family
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl p-6 w-96 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-dark-purple">Add Event</h3>
              <button onClick={() => setShowAdd(false)}><X size={18} className="text-dark-purple/50" /></button>
            </div>
            <p className="text-xs text-dark-purple/50 mb-4">for <strong>{monthNames[selected.month]} {selected.date}, {selected.year}</strong></p>
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Event title" className="w-full bg-light-gray text-dark-purple text-sm px-3 py-2.5 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-dark-purple/30" />
            <input value={newTime} onChange={(e) => setNewTime(e.target.value)} placeholder="Time (e.g. 2:00 PM)" className="w-full bg-light-gray text-dark-purple text-sm px-3 py-2.5 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-dark-purple/30" />
            <div className="flex gap-3 mb-4">
              <select value={newSeed} onChange={(e) => setNewSeed(e.target.value)} className="flex-1 bg-light-gray text-dark-purple text-sm px-3 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-dark-purple/30">
                {seeds.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as typeof newStatus)} className="flex-1 bg-light-gray text-dark-purple text-sm px-3 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-dark-purple/30">
                <option value="confirmed">Confirmed</option>
                <option value="tentative">Tentative</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <button onClick={addEvent} className="w-full bg-dark-purple text-off-white text-sm font-semibold py-2.5 rounded-lg hover:opacity-90 transition-opacity">Add Event</button>
          </div>
        </div>
      )}

      {detailEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDetailEvent(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray/20 px-6 py-4 flex items-center justify-between z-10">
              <button onClick={() => setDetailEvent(null)} className="flex items-center gap-1.5 text-sm font-semibold text-dark-purple hover:opacity-70 transition-opacity">
                <ArrowLeft size={16} /> Back
              </button>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg hover:bg-light-gray transition-colors"><Edit3 size={15} className="text-dark-purple/50" /></button>
                <button onClick={() => deleteEvent(detailEvent)} className="p-2 rounded-lg hover:bg-light-gray transition-colors"><Trash2 size={15} className="text-red-500" /></button>
                <button onClick={() => setDetailEvent(null)} className="p-2 rounded-lg hover:bg-light-gray transition-colors"><X size={16} className="text-dark-purple/50" /></button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-light-gray shrink-0">
                  <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${detailEvent.seed}&backgroundColor=eddbda`} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-dark-purple">{detailEvent.title}</h2>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className={`text-xs text-white px-2 py-0.5 rounded-full ${detailEvent.status === "confirmed" ? "bg-green" : detailEvent.status === "tentative" ? "bg-dark-purple" : "bg-dark-purple/40"}`}>
                      {detailEvent.status === "confirmed" ? "Confirmed" : detailEvent.status === "tentative" ? "Tentative" : "Cancelled"}
                    </span>
                    <span className="text-xs text-dark-purple/50">Hosted by <strong>{detailEvent.seed}</strong></span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-light-gray rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={14} className="text-dark-purple/40" />
                    <span className="text-xs font-bold text-dark-purple">Date & Time</span>
                  </div>
                  <p className="text-sm text-dark-purple">{monthNames[detailEvent.month]} {detailEvent.date}, {detailEvent.year}</p>
                  <p className="text-sm text-dark-purple/70">{detailEvent.time}</p>
                </div>
                <div className="bg-light-gray rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDays size={14} className="text-dark-purple/40" />
                    <span className="text-xs font-bold text-dark-purple">Type</span>
                  </div>
                  <p className="text-sm text-dark-purple capitalize">{detailEvent.status}</p>
                  {detailEvent.time === "All day" && <p className="text-sm text-dark-purple/70">Full-day event</p>}
                </div>
              </div>
              {detailEvent.location && (
                <div className="bg-light-gray rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={14} className="text-dark-purple/40" />
                    <span className="text-xs font-bold text-dark-purple">Location</span>
                  </div>
                  <div className="bg-white rounded-lg p-4 flex items-center gap-3 border border-gray/20">
                    <div className="w-10 h-10 rounded-lg bg-rose/30 flex items-center justify-center shrink-0">
                      <MapPin size={18} className="text-dark-purple" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-dark-purple">{detailEvent.location}</p>
                      <p className="text-xs text-dark-purple/50">Tap to open in maps</p>
                    </div>
                  </div>
                </div>
              )}
              {detailEvent.description && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-dark-purple mb-2">Description</h3>
                  <p className="text-sm text-dark-purple/70 leading-relaxed">{detailEvent.description}</p>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users size={14} className="text-dark-purple/40" />
                  <span className="text-xs font-bold text-dark-purple">Attendees ({allAttendees.length})</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {allAttendees.map((name) => (
                    <div key={name} className="flex items-center gap-2 bg-light-gray rounded-lg px-3 py-2">
                      <div className="w-7 h-7 rounded-lg overflow-hidden bg-light-gray shrink-0">
                        <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${name}&backgroundColor=eddbda`} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-sm font-semibold text-dark-purple">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-y-auto">
        <div className="flex-1 p-8 pb-0">
          {/* Weekday header */}
          <div className="grid grid-cols-7 mb-4">
            {dayNames.map((d) => (
              <div key={d} className="text-center text-[11px] font-semibold text-dark-purple/30 uppercase tracking-widest">{d}</div>
            ))}
          </div>

          {/* Calendar grid using flexbox with gap */}
          <div className="flex flex-wrap">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="w-[calc(100%/7)] p-1" />
            ))}
            {/* Day cells */}
            {cells.filter((d): d is number => d !== null).map((d) => {
              const evs = allEvents.filter((e) => e.date === d && e.month === viewMonth && e.year === viewYear)
              const isSel = selected.date === d && selected.month === viewMonth && selected.year === viewYear
              const isToday = d === today.date && viewMonth === today.month && viewYear === today.year
              return (
                <div key={d} className="w-[calc(100%/7)] p-1">
                  <button
                    onClick={() => { setSelected({ date: d, month: viewMonth, year: viewYear }); setFilter(null) }}
                    className={`w-full min-h-[88px] rounded-2xl flex flex-col items-center p-3 transition-all ${
                      isSel
                        ? "bg-dark-purple text-off-white shadow-lg shadow-dark-purple/20"
                        : "bg-off-white hover:bg-white hover:shadow-md hover:shadow-dark-purple/5 text-dark-purple border border-gray/10"
                    }`}
                    >
                      {(() => {
                        const diff = Math.round((new Date(viewYear, viewMonth, d).getTime() - new Date(today.year, today.month, today.date).getTime()) / 86400000)
                        let label = ""
                        if (diff === 0) label = "Today"
                        else if (diff === 1) label = "Tomorrow"
                        else if (diff === 2) label = "In 2 days"
                        else if (diff === 3) label = "In 3 days"
                        else if (diff > 3 && diff <= 7) label = `In ${diff} days`
                        if (label) {
                          return <span className={`text-[8px] font-semibold uppercase tracking-wider mb-1.5 ${isSel ? "text-off-white/60" : "text-dark-purple/30"}`}>{label}</span>
                        }
                        return null
                      })()}
                      <span className={`text-sm font-bold leading-none mb-2 ${
                        isSel ? "text-off-white" : isToday ? "text-dark-purple" : "text-dark-purple/50"
                      }`}>
                        {d}
                      </span>
                    {evs.length > 0 && (
                      <div className="w-full space-y-1">
                        {evs.slice(0, 2).map((ev, ei) => (
                          <div key={ei} className={`flex items-center gap-1.5 px-1.5 py-1 rounded-lg ${
                            isSel ? "bg-off-white/15" : "bg-light-gray"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              ev.status === "confirmed" ? "bg-green" : ev.status === "tentative" ? "bg-dark-purple" : "bg-dark-purple/30"
                            } ${isSel ? "bg-off-white" : ""}`} />
                            <span className={`text-[9px] font-medium truncate leading-tight ${
                              isSel ? "text-off-white/90" : "text-dark-purple/60"
                            }`}>
                              {ev.title.length > 12 ? ev.title.slice(0, 12) + "…" : ev.title}
                            </span>
                          </div>
                        ))}
                        {evs.length > 2 && (
                          <span className={`text-[9px] font-semibold px-1 ${isSel ? "text-off-white/50" : "text-dark-purple/30"}`}>
                            +{evs.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                </div>
              )
            })}
          </div>

          <p className="text-[10px] text-dark-purple/20 text-center py-4">Tap a day to see events</p>
        </div>

        {/* Right panel */}
        <div className="w-80 shrink-0 p-8 pb-0 pl-4">
          <div className="sticky top-0">
            {filter ? (
              <>
                <div className="flex items-center gap-2 mb-5">
                  <div className={"w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-off-white " + (filter === "important" ? "bg-amber-800" : filter === "birthdays" ? "bg-rose" : "bg-green")}>
                    {filter === "important" ? <Star size={16} /> : filter === "birthdays" ? <Gift size={16} /> : <Heart size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-dark-purple capitalize">{filter} events</p>
                    <p className="text-[11px] text-dark-purple/40">{filteredEvents.length} upcoming</p>
                  </div>
                  <button onClick={() => setFilter(null)} className="text-xs text-dark-purple/30 hover:text-dark-purple transition-colors">Clear</button>
                </div>
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarDays size={32} className="text-dark-purple/10 mx-auto mb-3" />
                    <p className="text-sm text-dark-purple/30">No upcoming events</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredEvents.map((e, i) => (
                      <button key={i} onClick={() => setDetailEvent(e)} className="w-full text-left bg-white rounded-xl p-3.5 border border-gray/10 hover:shadow-md hover:shadow-dark-purple/5 transition-all">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 ring-2 ring-off-white shadow-sm">
                            <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${e.seed}&backgroundColor=eddbda`} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-dark-purple truncate">{e.title}</p>
                            <p className="text-[11px] text-dark-purple/50 mt-0.5">{monthNames[e.month]} {e.date}, {e.year} · {e.time}</p>
                            <span className={`inline-block mt-1 text-[9px] text-white px-1.5 py-[2px] rounded-full ${
                              e.status === "confirmed" ? "bg-green" : e.status === "tentative" ? "bg-dark-purple" : "bg-dark-purple/40"
                            }`}>
                              {e.status === "confirmed" ? "Confirmed" : e.status === "tentative" ? "Tentative" : "Cancelled"}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                    selected.date === today.date && selected.month === today.month && selected.year === today.year
                      ? "bg-green text-off-white"
                      : "bg-dark-purple text-off-white"
                  }`}>
                    {selected.date}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-dark-purple">{["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date(selected.year, selected.month, selected.date).getDay()]}</p>
                    <p className="text-[11px] text-dark-purple/40">{monthNames[selected.month]} {selected.date}, {selected.year}</p>
                  </div>
                  <span className="text-xs text-dark-purple/30 ml-auto">{selectedEvents.length}</span>
                </div>
                {selectedEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarDays size={32} className="text-dark-purple/10 mx-auto mb-3" />
                    <p className="text-sm text-dark-purple/30">No events</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {selectedEvents.map((e, i) => (
                      <button key={i} onClick={() => setDetailEvent(e)} className="w-full text-left bg-white rounded-xl p-3.5 border border-gray/10 hover:shadow-md hover:shadow-dark-purple/5 transition-all">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 ring-2 ring-off-white shadow-sm">
                            <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${e.seed}&backgroundColor=eddbda`} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-dark-purple truncate">{e.title}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-dark-purple/50">{e.time}</span>
                              <span className={`text-[9px] text-white px-1.5 py-[2px] rounded-full ${
                                e.status === "confirmed" ? "bg-green" : e.status === "tentative" ? "bg-dark-purple" : "bg-dark-purple/40"
                              }`}>
                                {e.status === "confirmed" ? "Confirmed" : e.status === "tentative" ? "Tentative" : "Cancelled"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
