import { useState, useEffect } from "react"
import { Search, ChevronLeft, ChevronRight, Plus, CalendarDays, X, MapPin, Clock, Users, ArrowLeft, Trash2, Edit3, Star, Gift, Heart } from "lucide-react"
import type { CalendarEvent } from "../../types"
import { calendar as calendarApi } from "../../lib/api"
import Avatar from "../ui/Avatar"
import Badge from "../ui/Badge"
import Button from "../ui/Button"
import Modal from "../ui/Modal"

const seeds = ["Sarah", "Jordan", "Maya", "Taylor", "Alex", "Emily", "Marcus", "Priya"]

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function todayDate() {
  const d = new Date()
  return { date: d.getDate(), month: d.getMonth(), year: d.getFullYear() }
}

export default function Calendar() {
  const today = todayDate()
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMonth, setViewMonth] = useState(today.month)
  const [viewYear, setViewYear] = useState(today.year)
  const [selected, setSelected] = useState<{ date: number; month: number; year: number }>(today)
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState("")
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null)
  const [filter, setFilter] = useState<"important" | "birthdays" | "family" | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [newTime, setNewTime] = useState("")
  const [newSeed, setNewSeed] = useState(seeds[0])
  const [newStatus, setNewStatus] = useState<"confirmed" | "tentative" | "cancelled">("confirmed")

  useEffect(() => {
    calendarApi.list(viewMonth, viewYear).then((data) => { setAllEvents(data.events); setLoading(false) }).catch(() => setLoading(false))
  }, [viewMonth, viewYear])

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
    calendarApi.create({ date: selected.date, month: selected.month, year: selected.year, title: newTitle.trim(), time: newTime || "All day", seed: newSeed, status: newStatus }).then(() => {
      calendarApi.list(viewMonth, viewYear).then((data) => setAllEvents(data.events))
      setNewTitle(""); setNewTime(""); setShowAdd(false)
    })
  }

  const deleteEvent = (e: CalendarEvent) => {
    if (!e._id) { setAllEvents((prev) => prev.filter((ev) => ev !== e)); setDetailEvent(null); return }
    calendarApi.remove(e._id).then(() => {
      setAllEvents((prev) => prev.filter((ev) => ev._id !== e._id))
      setDetailEvent(null)
    })
  }

  const query = search.toLowerCase().trim()
  const visibleEvents = query ? allEvents.filter((e) => e.title.toLowerCase().includes(query)) : allEvents

  const selectedEvents = visibleEvents
    .filter((e) => e.date === selected.date && e.month === selected.month && e.year === selected.year)
    .sort((a, b) => (a.time === "All day" ? -1 : b.time === "All day" ? 1 : a.time.localeCompare(b.time)))

  const filteredEvents: CalendarEvent[] = (() => {
    const now = new Date(today.year, today.month, today.date)
    if (filter === "important") {
      return visibleEvents.filter((e) => {
        const d = new Date(e.year, e.month, e.date)
        return e.status === "confirmed" && (e.attendees?.length ?? 0) >= 2 && d >= now
      }).sort((a, b) => new Date(a.year, a.month, a.date).getTime() - new Date(b.year, b.month, b.date).getTime())
    }
    if (filter === "birthdays") {
      return visibleEvents.filter((e) => {
        const d = new Date(e.year, e.month, e.date)
        return e.title.toLowerCase().includes("birthday") && d >= now
      }).sort((a, b) => new Date(a.year, a.month, a.date).getTime() - new Date(b.year, b.month, b.date).getTime())
    }
    if (filter === "family") {
      return visibleEvents.filter((e) => {
        const d = new Date(e.year, e.month, e.date)
        return (e.title.toLowerCase().includes("family") || e.title.toLowerCase().includes("dinner") || e.title.toLowerCase().includes("lunch")) && d >= now
      }).sort((a, b) => new Date(a.year, a.month, a.date).getTime() - new Date(b.year, b.month, b.date).getTime())
    }
    return []
  })()

  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const allAttendees = detailEvent ? [detailEvent.seed, ...(detailEvent.attendees ?? [])] : []

  const statusBadge = (s: string) => {
    if (s === "confirmed") return { variant: "success" as const, label: "Confirmed" }
    if (s === "tentative") return { variant: "info" as const, label: "Tentative" }
    return { variant: "default" as const, label: "Cancelled" }
  }

  return (
    <div className="h-full bg-light-gray flex flex-col overflow-y-auto">
      <div className="bg-off-white px-8 pt-5 pb-3 border-b border-gray/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-dark-purple flex items-center justify-center">
              <CalendarDays size={16} className="text-off-white" />
            </div>
            <h1 className="text-lg font-bold text-dark-purple">Calendar</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-light-gray transition-colors" aria-label="Previous month"><ChevronLeft size={15} className="text-dark-purple/50" /></button>
            <span className="text-sm font-bold text-dark-purple min-w-[124px] text-center">{monthNames[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-light-gray transition-colors" aria-label="Next month"><ChevronRight size={15} className="text-dark-purple/50" /></button>
            <div className="w-px h-5 bg-gray/30 mx-1" />
            <button onClick={goToday} className="text-xs font-semibold text-dark-purple border border-gray/30 px-3 py-1 rounded-lg hover:bg-light-gray transition-colors">Today</button>
            <Button size="sm" onClick={() => setShowAdd(true)}><Plus size={14} /> Event</Button>
          </div>
        </div>
        <div className="relative my-3">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-purple/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events..."
            className="w-full bg-light-gray rounded-xl pl-10 pr-4 py-2.5 text-sm text-dark-purple placeholder-dark-purple/40 outline-none focus:ring-2 focus:ring-dark-purple/10"
            aria-label="Search events"
          />
        </div>
      </div>

      <div className="bg-off-white px-8 pb-3 flex items-center gap-2 overflow-x-auto">
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
            filter === "important" ? "bg-dark-purple text-off-white" : "bg-light-gray text-dark-purple/60 hover:text-dark-purple"
          }`}
        >
          <Star size={12} /> Important
        </button>
        <button
          onClick={() => setFilter(filter === "birthdays" ? null : "birthdays")}
          className={`flex items-center gap-1 text-xs font-semibold pl-3 pr-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors ${
            filter === "birthdays" ? "bg-rose text-off-white" : "bg-light-gray text-dark-purple/60 hover:text-dark-purple"
          }`}
        >
          <Gift size={12} /> Birthdays
        </button>
        <button
          onClick={() => setFilter(filter === "family" ? null : "family")}
          className={`flex items-center gap-1 text-xs font-semibold pl-3 pr-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors ${
            filter === "family" ? "bg-green text-off-white" : "bg-light-gray text-dark-purple/60 hover:text-dark-purple"
          }`}
        >
          <Heart size={12} /> Family
        </button>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Event" size="sm">
        <p className="text-xs text-dark-purple/50 mb-4">for <strong>{monthNames[selected.month]} {selected.date}, {selected.year}</strong></p>
        <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Event title" className="w-full bg-light-gray text-dark-purple text-sm px-3 py-2.5 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-dark-purple/30" aria-label="Event title" />
        <input value={newTime} onChange={(e) => setNewTime(e.target.value)} placeholder="Time (e.g. 2:00 PM)" className="w-full bg-light-gray text-dark-purple text-sm px-3 py-2.5 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-dark-purple/30" aria-label="Event time" />
        <div className="flex gap-3 mb-4">
          <select value={newSeed} onChange={(e) => setNewSeed(e.target.value)} className="flex-1 bg-light-gray text-dark-purple text-sm px-3 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-dark-purple/30" aria-label="Host">
            {seeds.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as typeof newStatus)} className="flex-1 bg-light-gray text-dark-purple text-sm px-3 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-dark-purple/30" aria-label="Status">
            <option value="confirmed">Confirmed</option>
            <option value="tentative">Tentative</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <Button fullWidth onClick={addEvent}>Add Event</Button>
      </Modal>

      <Modal open={!!detailEvent} onClose={() => setDetailEvent(null)} size="lg">
        {detailEvent && (
          <>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setDetailEvent(null)} className="flex items-center gap-1.5 text-sm font-semibold text-dark-purple hover:opacity-70 transition-opacity" aria-label="Back">
                <ArrowLeft size={16} /> Back
              </button>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg hover:bg-light-gray transition-colors" aria-label="Edit event"><Edit3 size={15} className="text-dark-purple/50" /></button>
                <button onClick={() => deleteEvent(detailEvent)} className="p-2 rounded-lg hover:bg-light-gray transition-colors" aria-label="Delete event"><Trash2 size={15} className="text-dark-purple/50" /></button>
              </div>
            </div>
            <div className="flex items-start gap-4 mb-6">
              <Avatar seed={detailEvent.seed} size="lg" />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-dark-purple">{detailEvent.title}</h2>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <Badge variant={statusBadge(detailEvent.status).variant as "success" | "info" | "default"} size="sm">{statusBadge(detailEvent.status).label}</Badge>
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
                <div className="bg-off-white rounded-lg p-4 flex items-center gap-3 border border-gray/20">
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
                    <Avatar seed={name} size="sm" />
                    <span className="text-sm font-semibold text-dark-purple">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </Modal>

      <div className="flex-1 flex overflow-y-auto">
        <div className="flex-1 p-8 pb-0">
          <div className="grid grid-cols-7 mb-4">
            {dayNames.map((d) => (
              <div key={d} className="text-center text-[11px] font-semibold text-dark-purple/30 uppercase tracking-widest">{d}</div>
            ))}
          </div>

          <div className="flex flex-wrap">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="w-[calc(100%/7)] p-1" />
            ))}
            {dayNumbers.map((d) => {
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
                    aria-label={`${monthNames[viewMonth]} ${d}`}
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

        <div className="w-80 shrink-0 p-8 pb-0 pl-4">
          <div className="sticky top-0">
            {filter ? (
              <>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-dark-purple text-off-white flex items-center justify-center text-sm font-bold">
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
                      <button key={i} onClick={() => setDetailEvent(e)} className="w-full text-left bg-off-white rounded-xl p-3.5 border border-gray/10 hover:shadow-md hover:shadow-dark-purple/5 transition-all">
                        <div className="flex items-start gap-3">
                          <Avatar seed={e.seed} size="sm" className="ring-2 ring-off-white shadow-sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-dark-purple truncate">{e.title}</p>
                            <p className="text-[11px] text-dark-purple/50 mt-0.5">{monthNames[e.month]} {e.date}, {e.year} · {e.time}</p>
                            <Badge variant={statusBadge(e.status).variant as "success" | "info" | "default"} size="sm">{statusBadge(e.status).label}</Badge>
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
                      <button key={i} onClick={() => setDetailEvent(e)} className="w-full text-left bg-off-white rounded-xl p-3.5 border border-gray/10 hover:shadow-md hover:shadow-dark-purple/5 transition-all">
                        <div className="flex items-start gap-3">
                          <Avatar seed={e.seed} size="sm" className="ring-2 ring-off-white shadow-sm" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-dark-purple truncate">{e.title}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-dark-purple/50">{e.time}</span>
                              <Badge variant={statusBadge(e.status).variant as "success" | "info" | "default"} size="sm">{statusBadge(e.status).label}</Badge>
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
