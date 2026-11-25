// src/components/EstadoBadge.jsx
import { NOMBRE_ESTADO } from '../utils'

// Etiqueta de color con el estado del pedido (los colores están en styles.css)
export default function EstadoBadge({ estado }) {
  return <span className={`badge estado-${estado}`}>{NOMBRE_ESTADO[estado] ?? estado}</span>
}
