# Escuela Virtual 3D — versión modular

Proyecto para recorrer un modelo de escuela con Three.js y Vite.

## Iniciar

```bash
npm install
npm run dev
```

## Controles

- **Vista órbita:** arrastrar para girar, rueda para zoom.
- **Caminar:** W A S D (o flechas) para moverte, mouse para mirar, **Shift** para correr,
  **R** para volver al punto de inicio, **ESC** para salir.
- El visitante choca con paredes y barandas, se apoya en el piso y sube rampas.

## Elegir dónde se empieza a caminar (la entrada)

1. En la vista órbita, tocar **📍 Fijar inicio**.
2. Tocar en el modelo el lugar de la entrada (aparece un marcador rojo).
3. Se muestran y copian las coordenadas, con este formato:
   `walkStart: { x: 232, y: 0.15, z: -262, yaw: 0 }`
4. Pegarlas en `src/config/settings.js` para que queden fijas para todos
   los visitantes. (Mientras tanto se guardan solo en tu navegador.)

`yaw` es hacia dónde mira, en grados: 0 = hacia -Z, 90 = hacia -X,
180 = hacia +Z, -90 = hacia +X. Al fijar el inicio con el botón, mira hacia el centro de la escuela.

## Ajustes

Todo está en `src/config/settings.js`: velocidad, altura de los ojos,
tamaño del cuerpo, zona de la escuela para la vista inicial y punto de inicio.
Las medidas son metros.

## El modelo

`public/models/escuela.glb` (convertido desde el .obj de SketchUp, con los
polígonos re-triangulados). Los colores son provisionales: el .mtl original
no estaba disponible, así que se asignaron por nombre de material.
También se admite `escuela.dae`.

## Estructura

- `src/core/`: escena, luces y cámara.
- `src/config/`: valores editables.
- `src/controls/`: movimiento, cámara y cambio de modos.
- `src/physics/`: choques y gravedad (cápsula + BVH).
- `src/models/`: carga del modelo y maqueta de demostración.
- `src/ui/`: botones e indicaciones.
- `src/styles/`: estilos.
