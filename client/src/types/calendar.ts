export interface CalendarEvent {
  _id?: string
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
  duration?: number
  isMeeting?: boolean
}
