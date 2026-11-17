# Escuela Virtual 3D — versión modular

Proyecto para recorrer un modelo de escuela con Three.js y Vite.

## Iniciar

```bash
npm install
npm run dev
```

## Cambiar la velocidad

Abrir `src/config/settings.js` y cambiar `walkSpeed` (unidades por segundo).

## Incorporar el edificio

Guardar `escuela.glb` en `public/models/` y recargar la página.
También se admite `escuela.dae` en esa carpeta, incluyendo las rutas de las texturas.

## Estructura

- `src/core/`: escena, luces y cámara.
- `src/config/`: valores editables.
- `src/controls/`: movimiento, cámara y cambio de modos.
- `src/models/`: carga y maqueta de demostración.
- `src/ui/`: botones e indicaciones.
- `src/styles/`: estilos.

Nota: la navegación inicial no tiene colisiones ni ajuste de escaleras.
