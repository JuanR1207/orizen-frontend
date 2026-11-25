// src/pages/Cocina.jsx
// Pantalla de COCINA: tablero en tiempo real (WebSocket) con los pedidos del día.
// En cola -> En preparación -> Empaquetado, con cronómetro de cada etapa.
import { useCallback, useEffect, useRef, useState } from 'react'
import { api, urlWebSocketCocina } from '../api'
import { duracion, hora, hoyBogota, segundosDesde } from '../utils'

const COLUMNAS = [
  { estado: 'EN_COLA', titulo: 'En cola' },
  { estado: 'EN_PREPARACION', titulo: 'En preparación' },
  { estado: 'EMPAQUETADO', titulo: 'Empaquetado' },
]

export default function Cocina() {
  const [pedidos, setPedidos] = useState([]) // pedidos con detalle (ítems y cronómetros)
  const [productos, setProductos] = useState({}) // id -> nombre
  const [enVivo, setEnVivo] = useState(false)
  const [error, setError] = useState('')
  const [, setTic] = useState(0) // fuerza a redibujar los relojes cada segundo

  const cargar = useCallback(async () => {
    try {
      const lista = await api(`/orders/?fecha=${hoyBogota()}&limit=100`)
      const activos = lista.filter((p) => COLUMNAS.some((c) => c.estado === p.estado_actual))
      // El detalle trae ítems y cronómetros de cada pedido
      const detalles = await Promise.all(activos.map((p) => api(`/orders/${p.id}`)))
      setPedidos(detalles.sort((a, b) => a.id - b.id)) // el más viejo primero
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    api('/products/?limit=100')
      .then((lista) => setProductos(Object.fromEntries(lista.map((p) => [p.id, p.nombre]))))
      .catch((e) => setError(e.message))
  }, [])

  // Reloj de la pantalla
  useEffect(() => {
    const id = setInterval(() => setTic((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Carga inicial + respaldo cada 30 s por si se pierde algún aviso
  useEffect(() => {
    cargar()
    const id = setInterval(cargar, 30000)
    return () => clearInterval(id)
  }, [cargar])

  // WebSocket: cada aviso (pedido_creado / estado_cambiado) recarga el tablero.
  // Si la conexión se cae, se vuelve a conectar a los 3 segundos.
  const ws = useRef(null)
  useEffect(() => {
    let cerrado = false
    let reintento
    function conectar() {
      const socket = new WebSocket(urlWebSocketCocina())
      ws.current = socket
      socket.onopen = () => setEnVivo(true)
      socket.onmessage = () => setTimeout(cargar, 300)
      socket.onclose = () => {
        setEnVivo(false)
        if (!cerrado) reintento = setTimeout(conectar, 3000)
      }
    }
    conectar()
    return () => {
      cerrado = true
      clearTimeout(reintento)
      ws.current?.close()
    }
  }, [cargar])

  async function avanzar(pedido) {
    setError('')
    const activo = (proceso) =>
      pedido.cronometros.find((c) => c.nombre_proceso === proceso && c.estado_proceso === 'EN_CURSO')
    try {
      if (pedido.estado_actual === 'EN_COLA') {
        await api(`/orders/${pedido.id}/statuses`, { method: 'POST', body: { estado: 'EN_PREPARACION' } })
        await api(`/orders/${pedido.id}/process-timers`, { method: 'POST', body: { nombre_proceso: 'PREPARACION' } })
      } else if (pedido.estado_actual === 'EN_PREPARACION') {
        const prep = activo('PREPARACION')
        if (prep) await api(`/process-timers/${prep.id}/stop`, { method: 'PATCH' })
        await api(`/orders/${pedido.id}/statuses`, { method: 'POST', body: { estado: 'EMPAQUETADO' } })
        await api(`/orders/${pedido.id}/process-timers`, { method: 'POST', body: { nombre_proceso: 'EMPAQUETADO' } })
      } else if (pedido.estado_actual === 'EMPAQUETADO') {
        const emp = activo('EMPAQUETADO')
        if (emp) await api(`/process-timers/${emp.id}/stop`, { method: 'PATCH' })
      }
      await cargar()
    } catch (err) {
      setError(err.message)
      await cargar()
    }
  }

  return (
    <>
      <div className="entre" style={{ marginBottom: 16 }}>
        <h2>Cocina</h2>
        <span className="muted">{enVivo ? '🟢 En vivo' : '🔴 Reconectando…'}</span>
      </div>
      {error && <p className="error">{error}</p>}

      <div className="grid-3">
        {COLUMNAS.map((col) => {
          const deEstaColumna = pedidos.filter((p) => p.estado_actual === col.estado)
          return (
            <section key={col.estado} className="pila">
              <h3>
                {col.titulo} <span className="muted">({deEstaColumna.length})</span>
              </h3>
              {deEstaColumna.length === 0 && <p className="muted">Nada por aquí.</p>}
              {deEstaColumna.map((p) => (
                <TarjetaPedido key={p.id} pedido={p} productos={productos} onAvanzar={() => avanzar(p)} />
              ))}
            </section>
          )
        })}
      </div>
    </>
  )
}

function TarjetaPedido({ pedido, productos, onAvanzar }) {
  const [ocupado, setOcupado] = useState(false)
  const enCurso = pedido.cronometros.find((c) => c.estado_proceso === 'EN_CURSO')
  const empaqueListo =
    pedido.estado_actual === 'EMPAQUETADO' &&
    !enCurso &&
    pedido.cronometros.some((c) => c.nombre_proceso === 'EMPAQUETADO')

  // Qué reloj se muestra: el cronómetro en curso, o el tiempo en cola
  const segundos = enCurso ? segundosDesde(enCurso.timestamp_inicio) : segundosDesde(pedido.fecha_creacion)
  const etiqueta = enCurso ? (enCurso.nombre_proceso === 'PREPARACION' ? 'Preparando' : 'Empacando') : 'Esperando'

  const boton = {
    EN_COLA: 'Empezar a preparar',
    EN_PREPARACION: 'Pasar a empaque',
    EMPAQUETADO: 'Empaque listo',
  }[pedido.estado_actual]

  async function click() {
    setOcupado(true)
    await onAvanzar()
    setOcupado(false)
  }

  return (
    <article className="card pila">
      <div className="entre">
        <b>#{pedido.codigo_orden.slice(-6)}</b>
        <span className="muted">
          {hora(pedido.fecha_creacion)} · {pedido.tipo_pedido === 'DOMICILIO' ? '🛵 Domicilio' : '🏪 Recoger'}
        </span>
      </div>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {pedido.items.map((i) => (
          <li key={i.id}>
            <b>{i.cantidad}×</b> {productos[i.producto_id] ?? `Producto ${i.producto_id}`}
          </li>
        ))}
      </ul>
      {empaqueListo ? (
        <p className="muted" style={{ margin: 0 }}>✅ Listo para salir</p>
      ) : (
        <>
          <div className="entre">
            <span className="muted">{etiqueta}</span>
            <b style={{ fontSize: '1.4rem', fontVariantNumeric: 'tabular-nums' }}>{duracion(segundos)}</b>
          </div>
          <button className="btn btn-primary" disabled={ocupado} onClick={click}>
            {ocupado ? 'Guardando…' : boton}
          </button>
        </>
      )}
    </article>
  )
}
