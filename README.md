# Escuela Virtual

Tour virtual de una escuela: imagen exterior que se acerca a la entrada,
botón **Ingresar**, vistas interiores (aulas, biblioteca, gimnasio, patio)
y, aparte, un recorrido libre en 3D.

## Probarlo

    npm install
    npm run dev

## Cambiar las imágenes

Las imágenes están en `public/tour/`. Para reemplazar una, poné la nueva con
el **mismo nombre**:

| Archivo | Qué es |
| --- | --- |
| `exterior.jpg` | Imagen de inicio (la fachada) |
| `entrada.jpg`, `aulas.jpg`, `biblioteca.jpg`, `gimnasio.jpg`, `patio.jpg` | Vistas del interior |

- Si la imagen es un **panorama 360°** (equirectangular, proporción 2:1,
  por ejemplo 8192×4096) se detecta sola y se puede girar.
- Cualquier otra proporción se muestra como imagen normal con zoom.
- Si falta un archivo, esa vista muestra un aviso en vez de romperse.

Para agregar o quitar vistas, o cambiar los nombres y las zonas tocables del
exterior, editar `src/tour/tourConfig.js`. Para ubicar una zona, abrir la
página con `?debug` al final de la dirección y tocar la imagen: muestra x e y.

## Recorrido 3D

Botón **Recorrido 3D**. El modelo está en `public/models/escuela.glb` y el punto
de inicio al caminar se ajusta en `src/config/settings.js`.
