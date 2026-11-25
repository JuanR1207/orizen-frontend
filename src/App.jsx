// src/App.jsx
// Rutas de la app. Cada pantalla solo la ven los roles que la necesitan.
import { Navigate, Route, Routes } from 'react-router-dom'
import { INICIO_POR_ROL, useAuth } from './auth'
import Layout from './components/Layout'
import Admin from './pages/Admin'
import Caja from './pages/Caja'
import Cocina from './pages/Cocina'
import Entregas from './pages/Entregas'
import Login from './pages/Login'

// Si no hay sesión -> /login. Si el rol no puede entrar -> su pantalla de inicio.
function Protegida({ roles, children }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return <p className="contenido muted">Cargando…</p>
  if (!usuario) return <Navigate to="/login" replace />
  if (roles && !roles.includes(usuario.rol)) return <Navigate to={INICIO_POR_ROL[usuario.rol]} replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <Protegida>
            <Layout />
          </Protegida>
        }
      >
        <Route path="/caja" element={<Protegida roles={['ADMIN', 'CAJERO']}><Caja /></Protegida>} />
        <Route path="/cocina" element={<Protegida roles={['ADMIN', 'COCINA']}><Cocina /></Protegida>} />
        <Route path="/entregas" element={<Protegida roles={['ADMIN', 'REPARTIDOR']}><Entregas /></Protegida>} />
        <Route path="/admin" element={<Protegida roles={['ADMIN']}><Admin /></Protegida>} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
