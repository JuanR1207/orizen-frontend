// src/pages/Login.jsx
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { INICIO_POR_ROL, useAuth } from '../auth'

export default function Login() {
  const { usuario, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (usuario) return <Navigate to={INICIO_POR_ROL[usuario.rol]} replace />

  async function entrar(e) {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      const yo = await login(email, password)
      navigate(INICIO_POR_ROL[yo.rol])
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="login">
      <form className="card login-card" onSubmit={entrar}>
        <h1 className="marca">ORIZEN</h1>
        <p className="muted">Kitchen & Delivery Flow</p>

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>

        {error && <p className="error">{error}</p>}

        <button className="btn btn-primary" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
