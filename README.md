# ORIZEN · Frontend

Frontend de **ORIZEN Kitchen & Delivery Flow**. Es una app en React + Vite que consume la API del proyecto:
[santme17/api-design-ORIZEN-Kitchen-Delivery-Flow-API](https://github.com/santme17/api-design-ORIZEN-Kitchen-Delivery-Flow-API).

## Pantallas

| Pantalla | Rol | Qué hace |
|----------|-----|----------|
| Login | Todos | Inicia sesión con JWT y lleva a la pantalla de su rol |
| Caja | CAJERO | Busca o registra clientes, crea pedidos, asigna repartidor, entrega los de recoger y cancela |
| Cocina | COCINA | Tablero en tiempo real (WebSocket): en cola → en preparación → empaquetado, con cronómetros |
| Entregas | REPARTIDOR | Pedidos a domicilio listos: salir a entregar y marcar entregado |
| Admin | ADMIN | Reporte del día, productos y repartidores (el admin puede entrar a todas) |

## Cómo correrlo

Necesitas Node.js 22 (o 20.19+) y la API corriendo (por ejemplo con `docker compose up` en el repo de la API).

```bash
cp .env.example .env    # VITE_API_URL = URL de la API, sin /api/v1
npm install
npm run dev             # http://localhost:5173
```

Para que el navegador pueda llamar la API, el dominio del frontend tiene que estar en `CORS_ORIGINS` de la API. En local, `http://localhost:5173` ya viene incluido.

## Usuarios de demo

Los crea `python -m app.seed` en el repo de la API: `cajero@orizen.com`, `cocina@orizen.com` y `repartidor@orizen.com` con la contraseña `orizen2026`. El admin es `admin@orizen.com`, con la contraseña de `FIRST_ADMIN_PASSWORD` de la API.

## Estructura

```
src/
  api.js           llamadas a la API (URL base, token y errores)
  auth.jsx         sesión: login, /auth/me y logout
  utils.js         pesos, tiempos y nombres de estados
  App.jsx          rutas protegidas por rol
  components/      barra superior, etiqueta de estado y piezas de Caja
  pages/           una pantalla por rol
```

## Despliegue

En Render, como **Static Site**: build `npm ci && npm run build`, carpeta `dist` y un rewrite de `/*` a `/index.html`. La variable `VITE_API_URL` se lee al compilar, así que si cambia hay que volver a desplegar.

## Equipo

Santiago Muñoz Estrada ([@santme17](https://github.com/santme17)), Juan José Rendón Guzmán ([@JuanR1207](https://github.com/JuanR1207)), Steeven Grajales Flórez ([@stevenflorez2304-oss](https://github.com/stevenflorez2304-oss)) y Juan José Roldán Rivas ([@majurivas0330-beep](https://github.com/majurivas0330-beep)).
