import mongoose, { Document, Schema } from "mongoose"

export interface ICalendarEvent extends Document {
  userId: string
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
  createdAt: Date
}

const calendarEventSchema = new Schema<ICalendarEvent>({
  userId: { type: String, required: true, index: true },
  date: { type: Number, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  title: { type: String, required: true },
  time: { type: String, required: true },
  seed: { type: String, default: "" },
  status: { type: String, enum: ["confirmed", "tentative", "cancelled"], default: "confirmed" },
  location: { type: String, default: "" },
  description: { type: String, default: "" },
  attendees: [{ type: String }],
  duration: { type: Number },
  isMeeting: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model<ICalendarEvent>("CalendarEvent", calendarEventSchema)
