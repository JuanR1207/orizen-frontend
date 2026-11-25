// src/auth.jsx
// Guarda quién inició sesión (token + datos de /auth/me) y lo comparte con toda la app.
import { createContext, useContext, useEffect, useState } from 'react'
import { api, clearToken, getToken, setToken } from './api'

const AuthContext = createContext(null)

// Pantalla de inicio de cada rol
export const INICIO_POR_ROL = {
  ADMIN: '/admin',
  CAJERO: '/caja',
  COCINA: '/cocina',
  REPARTIDOR: '/entregas',
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(Boolean(getToken()))

  // Si ya había un token guardado, se pide el usuario para saber su rol
  useEffect(() => {
    if (!getToken()) return
    api('/auth/me')
      .then(setUsuario)
      .catch(() => clearToken())
      .finally(() => setCargando(false))
  }, [])

  async function login(email, password) {
    const { access_token } = await api('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    setToken(access_token)
    const yo = await api('/auth/me')
    setUsuario(yo)
    return yo
  }

  function logout() {
    clearToken()
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
