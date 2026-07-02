// Client-side-only auth (no backend) — demo credentials for the three roles.
const USERS = {
  admin:      { password: 'admin123', role: 'admin' },
  appuser:    { password: 'appuser123', role: 'appuser' },
  fieldalert: { password: 'field123', role: 'mobileuser' },
}

const SESSION_KEY = 'astrikos_session'

export function authenticate(username, password) {
  const u = USERS[(username || '').trim().toLowerCase()]
  if (!u || u.password !== password) return null
  return u.role
}

export function loadSession() {
  return localStorage.getItem(SESSION_KEY)
}

export function saveSession(role) {
  localStorage.setItem(SESSION_KEY, role)
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}
