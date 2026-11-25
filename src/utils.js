// src/utils.js
// Funciones pequeñas que usan varias pantallas.

// 68000.5 -> "$ 68.001"
export const pesos = (valor) =>
  Number(valor).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

// Segundos -> "04:35" (o "1:02:10" si pasa de una hora)
export function duracion(segundos) {
  const s = Math.max(0, Math.floor(segundos))
  const h = Math.floor(s / 3600)
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const seg = String(s % 60).padStart(2, '0')
  return h > 0 ? `${h}:${m}:${seg}` : `${m}:${seg}`
}

// Segundos transcurridos desde una fecha ISO que manda la API
export const segundosDesde = (fechaIso) => (Date.now() - new Date(fechaIso).getTime()) / 1000

// Hora corta en hora de Colombia: "3:45 p. m."
export const hora = (fechaIso) =>
  new Date(fechaIso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Bogota' })

// Fecha de hoy en Colombia como "2026-11-25" (para ?fecha= de la API)
export const hoyBogota = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })

export const NOMBRE_ESTADO = {
  EN_COLA: 'En cola',
  EN_PREPARACION: 'En preparación',
  EMPAQUETADO: 'Empaquetado',
  EN_TRANSITO: 'En tránsito',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

export const ESTADOS_FINALES = ['ENTREGADO', 'CANCELADO']
