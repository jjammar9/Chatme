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

let audioCtx: AudioContext | null = null

export function playMessageSound() {
  try {
    if (!audioCtx) audioCtx = new AudioContext()
    if (audioCtx.state === "suspended") audioCtx.resume()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = "sine"
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.frequency.setValueAtTime(440, audioCtx.currentTime) // A4
    osc.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.08) // C#5
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4)
    osc.start(audioCtx.currentTime)
    osc.stop(audioCtx.currentTime + 0.4)
  } catch { /* audio not supported */ }
}
