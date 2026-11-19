# Escuela Virtual — entrega visual optimizada

## Qué se modificó

- Las 12 imágenes de `public/tour/` se convirtieron de PNG a JPG progresivo (calidad 84), sin reducir las dimensiones de origen.
- Se actualizaron las rutas JPG en `src/tour/config/exteriores.js` y `interiores.js`.
- Se quitaron una escena exterior de ejemplo sin imagen y una escena de talleres sin archivo (la escena `galeria` sí permanece).
- Se limpiaron propiedades duplicadas de los hotspots de acceso principal y sur.
- La portada abre usando `entrada` y al pulsar «Iniciar tour» pasa a `norte`.
- Portada y detalles visuales con acento rojo, etiqueta del lugar actual y controles compactos.
- El botón de Recorrido 3D no se presenta al público. La funcionalidad sigue en el código y se conserva `public/models/escuela.glb`.
- Botón «Plano» que muestra la lámina original aportada (no hay marcadores de ubicación inventados).

## Para probar localmente

1. Descomprimir el ZIP.
2. Abrir la carpeta `escuela-virtual` en Visual Studio Code.
3. Ejecutar `npm install` (no se incluye `node_modules`).
4. Ejecutar `npm run dev` y abrir la URL indicada por Vite.
5. Comprobar portada, transición Norte, entradas Galería y Espacio Lúdico, flechas, historial, indicador de carga y botón Plano.
6. Probar en tamaño móvil desde DevTools de Chrome.
7. Ejecutar `npm run build` y publicar `dist/` en GitHub Pages según la configuración de Vite.

## Importante

- `Escena Ingreso.jpg` es una fotografía plana de 1440 × 959, no una panorámica equirectangular. La portada usa esa imagen tal como viene en el material.
- El botón Plano enseña la lámina arquitectónica como referencia; no permite saltar por sectores porque todavía no se definieron coordenadas fiables.
- No se incluyó el archivo `escuela.obj` (15 MB) porque el recorrido utiliza `escuela.glb` (4,5 MB). El OBJ se conserva en el ZIP original del usuario.
- El nombre de la institución no aparece en los materiales como un título inequívoco: en `src/tour/tourConfig.js` se dejó `Escuela · Recorrido Virtual`. Modificar `title` para indicar el nombre oficial.
- Los cambios pasaron verificación de sintaxis JavaScript y de existencia de las 12 imágenes; falta la prueba visual completa en navegador/dispositivos.
