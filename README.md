# Escuela Virtual

Tour virtual de una escuela. Empieza en el exterior, se entra por la entrada
principal o por la biblioteca (botones "Ingresar") y adentro se pasa de un
lugar a otro con la barra de abajo. Aparte hay un recorrido libre en 3D.

## Probarlo

    npm install
    npm run dev

## Cambiar las imágenes

Están en `public/tour/`. Para reemplazar una, poné la nueva con el **mismo nombre**.
Usá **JPG** (calidad ~85): un PNG 360° pesa 7–12 MB y el mismo JPG menos de 1,5 MB.

- Exterior: `exterior-norte.jpg`, `exterior-este.jpg`, `exterior-sur.jpg`,
  `exterior-oeste.jpg`, `vista-exterior-1.jpg`, `vista-exterior-2.jpg`
- Interior: `entrada.jpg`, `biblioteca.jpg`, `aulas.jpg`, `vista-edificio.jpg`,
  `talleres.jpg`, `comedor.jpg`, `patio.jpg`, `gimnasio.jpg`

Reglas:

- **Panorama 360°**: proporción exacta 2:1 (por ejemplo 4096×2048). Se detecta
  solo y se puede girar.
- **Imagen común** (otra proporción): se muestra con zoom y arrastre.
- Si falta una imagen (hoy `talleres.jpg` y `comedor.jpg`), ese lugar no aparece
  en los botones. Aparece solo cuando se sube el archivo.

## Límites de giro de un panorama

En `src/tour/tourConfig.js`, en la línea de la escena:

    minYaw: -90, maxYaw: 90        // hasta dónde gira a izquierda y derecha (grados)
    minPitch: -20, maxPitch: 60    // hasta dónde mira abajo y arriba
    autoRotate: true               // gira sola (por defecto no)

Los límites se miden desde el centro de la imagen y limitan hacia dónde
**apunta el centro de la pantalla**: en el borde se ve un poco más (unos 50°
más en pantalla horizontal).

## Botones "Ingresar" y botones dentro de una imagen

Cada escena puede tener `hotspots` con `x`, `y` (posición en % de la imagen),
`to` (a qué lugar lleva) y el texto. Para saber `x` e `y`: abrir la página con
`?debug` al final de la dirección y tocar la imagen. Funciona igual en panoramas.

## Recorrido 3D

Botón **Recorrido 3D**. El modelo está en `public/models/escuela.glb` y el
punto de inicio al caminar se ajusta en `src/config/settings.js`.
