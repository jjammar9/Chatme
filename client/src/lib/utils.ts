export function getAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=eddbda`
}

export function formatTime(d: Date): string {
  const h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, "0")
  return `${h % 12 || 12}:${m} ${h >= 12 ? "PM" : "AM"}`
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
