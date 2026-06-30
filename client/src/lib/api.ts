const BASE = "/api"

function headers() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

// Auth
export const auth = {
  login: (email: string, password: string) =>
    fetch(`${BASE}/auth/login`, { method: "POST", headers: headers(), body: JSON.stringify({ email, password }) }).then(handleResponse),
  register: (name: string, username: string, email: string, password: string) =>
    fetch(`${BASE}/auth/register`, { method: "POST", headers: headers(), body: JSON.stringify({ name, username, email, password }) }).then(handleResponse),
  me: () =>
    fetch(`${BASE}/auth/me`, { headers: headers() }).then(handleResponse),
}

// Tasks
export const tasks = {
  list: () =>
    fetch(`${BASE}/tasks`, { headers: headers() }).then(handleResponse),
  create: (data: Record<string, unknown>) =>
    fetch(`${BASE}/tasks`, { method: "POST", headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
  update: (id: string, data: Record<string, unknown>) =>
    fetch(`${BASE}/tasks/${id}`, { method: "PUT", headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
  remove: (id: string) =>
    fetch(`${BASE}/tasks/${id}`, { method: "DELETE", headers: headers() }).then(handleResponse),
}

// Calendar
export const calendar = {
  list: (month?: number, year?: number) => {
    const params = new URLSearchParams()
    if (month !== undefined) params.set("month", String(month))
    if (year !== undefined) params.set("year", String(year))
    return fetch(`${BASE}/calendar?${params}`, { headers: headers() }).then(handleResponse)
  },
  create: (data: Record<string, unknown>) =>
    fetch(`${BASE}/calendar`, { method: "POST", headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
  update: (id: string, data: Record<string, unknown>) =>
    fetch(`${BASE}/calendar/${id}`, { method: "PUT", headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
  remove: (id: string) =>
    fetch(`${BASE}/calendar/${id}`, { method: "DELETE", headers: headers() }).then(handleResponse),
  createMeeting: (data: Record<string, unknown>) =>
    fetch(`${BASE}/calendar/meeting`, { method: "POST", headers: headers(), body: JSON.stringify(data) }).then((r) => r.json()),
}

// Contacts
export const contacts = {
  list: () =>
    fetch(`${BASE}/contacts`, { headers: headers() }).then(handleResponse),
  create: (data: Record<string, unknown>) =>
    fetch(`${BASE}/contacts`, { method: "POST", headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
  update: (id: string, data: Record<string, unknown>) =>
    fetch(`${BASE}/contacts/${id}`, { method: "PUT", headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
  remove: (id: string) =>
    fetch(`${BASE}/contacts/${id}`, { method: "DELETE", headers: headers() }).then(handleResponse),
}

// Files
export const files = {
  list: () =>
    fetch(`${BASE}/files`, { headers: headers() }).then(handleResponse),
  create: (data: Record<string, unknown>) =>
    fetch(`${BASE}/files`, { method: "POST", headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
  update: (id: string, data: Record<string, unknown>) =>
    fetch(`${BASE}/files/${id}`, { method: "PUT", headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
  remove: (id: string) =>
    fetch(`${BASE}/files/${id}`, { method: "DELETE", headers: headers() }).then(handleResponse),
}

// Users
export const users = {
  search: (q: string) =>
    fetch(`${BASE}/users/search?q=${encodeURIComponent(q)}`, { headers: headers() }).then(handleResponse),
  byId: (id: string) =>
    fetch(`${BASE}/users/by-id/${id}`, { headers: headers() }).then(handleResponse),
  batch: (ids: string[]) =>
    fetch(`${BASE}/users/batch`, { method: "POST", headers: headers(), body: JSON.stringify({ ids }) }).then(handleResponse),
}

// Friend Requests
export const friendRequests = {
  send: (receiverId: string) =>
    fetch(`${BASE}/friend-requests`, { method: "POST", headers: headers(), body: JSON.stringify({ receiverId }) }).then(handleResponse),
  list: () =>
    fetch(`${BASE}/friend-requests`, { headers: headers() }).then(handleResponse),
  accept: (id: string) =>
    fetch(`${BASE}/friend-requests/${id}/accept`, { method: "PUT", headers: headers() }).then(handleResponse),
  decline: (id: string) =>
    fetch(`${BASE}/friend-requests/${id}/decline`, { method: "PUT", headers: headers() }).then(handleResponse),
}

// Notifications
export const notifications = {
  list: () =>
    fetch(`${BASE}/notifications`, { headers: headers() }).then(handleResponse),
  markRead: (id: string) =>
    fetch(`${BASE}/notifications/${id}/read`, { method: "PUT", headers: headers() }).then(handleResponse),
  markAllRead: () =>
    fetch(`${BASE}/notifications/read-all`, { method: "PUT", headers: headers() }).then(handleResponse),
}

// Communities
export const communities = {
  list: () =>
    fetch(`${BASE}/communities`, { headers: headers() }).then(handleResponse),
  create: (data: Record<string, unknown>) =>
    fetch(`${BASE}/communities`, { method: "POST", headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
  get: (id: string) =>
    fetch(`${BASE}/communities/${id}`, { headers: headers() }).then(handleResponse),
  update: (id: string, data: Record<string, unknown>) =>
    fetch(`${BASE}/communities/${id}`, { method: "PUT", headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
  remove: (id: string) =>
    fetch(`${BASE}/communities/${id}`, { method: "DELETE", headers: headers() }).then(handleResponse),
  leave: (id: string) =>
    fetch(`${BASE}/communities/${id}/leave`, { method: "POST", headers: headers() }).then(handleResponse),
  requestJoin: (id: string) =>
    fetch(`${BASE}/communities/${id}/request-join`, { method: "POST", headers: headers() }).then(handleResponse),
  cancelRequest: (id: string) =>
    fetch(`${BASE}/communities/${id}/cancel-request`, { method: "POST", headers: headers() }).then(handleResponse),
  acceptRequest: (id: string, userId: string) =>
    fetch(`${BASE}/communities/${id}/accept-request/${userId}`, { method: "POST", headers: headers() }).then(handleResponse),
  declineRequest: (id: string, userId: string) =>
    fetch(`${BASE}/communities/${id}/decline-request/${userId}`, { method: "POST", headers: headers() }).then(handleResponse),
  invite: (id: string, userId: string) =>
    fetch(`${BASE}/communities/${id}/invite`, { method: "POST", headers: headers(), body: JSON.stringify({ userId }) }).then(handleResponse),
  acceptInvite: (id: string) =>
    fetch(`${BASE}/communities/${id}/accept-invite`, { method: "POST", headers: headers() }).then(handleResponse),
  declineInvite: (id: string) =>
    fetch(`${BASE}/communities/${id}/decline-invite`, { method: "POST", headers: headers() }).then(handleResponse),
}

// Upload
export const upload = {
  file: (file: File) => {
    const token = localStorage.getItem("token")
    const formData = new FormData()
    formData.append("file", file)
    return fetch(`${BASE}/upload`, {
      method: "POST",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    }).then(handleResponse)
  },
}

// Conversations
export const conversations = {
  list: () =>
    fetch(`${BASE}/conversations`, { headers: headers() }).then(handleResponse),
  create: (data: Record<string, unknown>) =>
    fetch(`${BASE}/conversations`, { method: "POST", headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
  messages: (id: string) =>
    fetch(`${BASE}/conversations/${id}/messages`, { headers: headers() }).then(handleResponse),
  sendMessage: (id: string, data: Record<string, unknown>) =>
    fetch(`${BASE}/conversations/${id}/messages`, { method: "POST", headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
  markRead: (id: string) =>
    fetch(`${BASE}/conversations/${id}/read`, { method: "PUT", headers: headers() }).then(handleResponse),
  toggleFavourite: (id: string) =>
    fetch(`${BASE}/conversations/${id}/favourite`, { method: "PUT", headers: headers() }).then(handleResponse),
  editMessage: (convId: string, msgId: string, content: string) =>
    fetch(`${BASE}/conversations/${convId}/messages/${msgId}`, { method: "PUT", headers: headers(), body: JSON.stringify({ content }) }).then(handleResponse),
  deleteMessage: (convId: string, msgId: string, mode: "me" | "everyone") =>
    fetch(`${BASE}/conversations/${convId}/messages/${msgId}?mode=${mode}`, { method: "DELETE", headers: headers() }).then(handleResponse),
  addReaction: (convId: string, msgId: string, emoji: string) =>
    fetch(`${BASE}/conversations/${convId}/messages/${msgId}/reaction`, { method: "POST", headers: headers(), body: JSON.stringify({ emoji }) }).then(handleResponse),
  removeReaction: (convId: string, msgId: string) =>
    fetch(`${BASE}/conversations/${convId}/messages/${msgId}/reaction`, { method: "DELETE", headers: headers() }).then(handleResponse),
}
