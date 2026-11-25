// src/components/Layout.jsx
// Barra superior con el menú según el rol y el botón de salir.
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'

const MENU = [
  { ruta: '/caja', texto: 'Caja', roles: ['ADMIN', 'CAJERO'] },
  { ruta: '/cocina', texto: 'Cocina', roles: ['ADMIN', 'COCINA'] },
  { ruta: '/entregas', texto: 'Entregas', roles: ['ADMIN', 'REPARTIDOR'] },
  { ruta: '/admin', texto: 'Admin', roles: ['ADMIN'] },
]

export default function Layout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  function salir() {
    logout()
    navigate('/login')
  }

  return (
    <>
      <header className="topbar">
        <span className="marca">ORIZEN</span>
        <nav>
          {MENU.filter((m) => m.roles.includes(usuario.rol)).map((m) => (
            <NavLink key={m.ruta} to={m.ruta}>
              {m.texto}
            </NavLink>
          ))}
        </nav>
        <div className="usuario">
          <span>
            {usuario.email} · <b>{usuario.rol}</b>
          </span>
          <button className="btn btn-ghost" onClick={salir}>
            Salir
          </button>
        </div>
      </header>
      <main className="contenido">
        <Outlet />
      </main>
    </>
  )
}
