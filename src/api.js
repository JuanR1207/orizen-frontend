// src/api.js
// Todas las llamadas a la API pasan por aquí: pone la URL base, el token y
// convierte los errores de FastAPI en un mensaje legible.

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')
const PREFIJO = '/api/v1'
const CLAVE_TOKEN = 'orizen_token'

export const getToken = () => localStorage.getItem(CLAVE_TOKEN)
export const setToken = (token) => localStorage.setItem(CLAVE_TOKEN, token)
export const clearToken = () => localStorage.removeItem(CLAVE_TOKEN)

// FastAPI devuelve { detail: "texto" } o { detail: [ {msg, loc}, ... ] } (errores 422)
function mensajeDeError(data, status) {
  const detail = data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((e) => `${e.loc?.at(-1) ?? ''}: ${e.msg}`).join(' · ')
  return `Error ${status}`
}

/**
 * Llama la API.  Ej: api('/orders/')   api('/orders/', { method: 'POST', body: {...} })
 * Lanza un Error con el mensaje de la API si la respuesta no es 2xx.
 */
export async function api(ruta, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${API_URL}${PREFIJO}${ruta}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new Error('No hay conexión con la API (puede estar despertando, intenta de nuevo)')
  }

  if (res.status === 401 && token) {
    // Token vencido o inválido: se cierra la sesión
    clearToken()
    window.location.href = '/login'
  }
  if (res.status === 204) return null

  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(mensajeDeError(data, res.status))
  return data
}

// URL del WebSocket de cocina: http -> ws, https -> wss
export function urlWebSocketCocina() {
  return `${API_URL.replace(/^http/, 'ws')}${PREFIJO}/ws/kitchen?token=${getToken()}`
}
