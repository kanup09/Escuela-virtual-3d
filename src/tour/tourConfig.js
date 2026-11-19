// ============================================================
//  CONFIGURACIÓN DEL TOUR
//
//  Cada "escena" es una imagen. Hay dos grupos:
//    - exterior: las caras y vistas de afuera (pantalla de inicio)
//    - interior: los lugares a los que se entra
//
//  PARA REEMPLAZAR UNA IMAGEN: poné el archivo nuevo en public/tour/
//  con el MISMO nombre (por ejemplo public/tour/biblioteca.jpg).
//    - Panorama 360° (equirectangular, proporción exacta 2:1, por ejemplo
//      4096×2048 u 8192×4096): se detecta solo y se puede girar.
//    - Cualquier otra proporción: se muestra como imagen con zoom.
//    - Usá JPG (calidad ~85). Un PNG de 4096×2048 pesa 7–12 MB; el mismo en
//      JPG pesa menos de 1,5 MB y la página carga mucho más rápido.
//
//  PARA AGREGAR UN LUGAR: copiá una línea de scenes y poné la imagen en
//  public/tour/. Si la imagen no existe, ese lugar no aparece en los
//  botones (y aparece solo cuando se sube el archivo).
//
//  OPCIONES DE UN PANORAMA 360° (todas opcionales):
//    yaw:        hacia dónde mira al abrir, en grados (0 = centro de la imagen)
//    autoRotate: true para que gire sola (por defecto no gira)
//    minYaw / maxYaw:     límites de giro a izquierda / derecha, en grados
//                         desde el centro inicial (ej. -90 y 90 = media vuelta)
//    minPitch / maxPitch: límites hacia abajo / arriba (ej. -20 y 60)
//
//  hotspots (opcional): botones sobre la imagen.
//    x, y: posición en % de la imagen (0–100).
//    to:   id de la escena a la que lleva.
//    label / sub: texto del botón.
//  Para saber x e y: abrí la página con ?debug al final de la dirección
//  y tocá la imagen. Funciona igual en panoramas.
// ============================================================
export const TOUR = {
  title: 'Escuela',
  start: 'norte',

  scenes: [
    // ---------- Exterior ----------
    {
      id: 'norte', group: 'exterior', title: 'Norte', image: 'tour/exterior-norte.jpg',
      hotspots: [
        { x: 51, y: 66, to: 'entrada', label: 'Ingresar', sub: 'Entrada principal' },
        { x: 27, y: 63, to: 'biblioteca', label: 'Ingresar', sub: 'Biblioteca' },
      ],
    },
    { id: 'este', group: 'exterior', title: 'Este', image: 'tour/exterior-este.jpg' },
    { id: 'sur', group: 'exterior', title: 'Sur', image: 'tour/exterior-sur.jpg' },
    { id: 'oeste', group: 'exterior', title: 'Oeste', image: 'tour/exterior-oeste.jpg' },
    { id: 'vista-exterior-1', group: 'exterior', title: 'Vista exterior 1', image: 'tour/vista-exterior-1.jpg' },
    {
      id: 'vista-exterior-2', group: 'exterior', title: 'Vista exterior 2', image: 'tour/vista-exterior-2.jpg',
      yaw: 0, minYaw: -90, maxYaw: 90,
    },

    // ---------- Interior ----------
    { id: 'entrada', group: 'interior', title: 'Entrada', image: 'tour/entrada.jpg' },
    { id: 'biblioteca', group: 'interior', title: 'Biblioteca', image: 'tour/biblioteca.jpg' },
    { id: 'aulas', group: 'interior', title: 'Aulas', image: 'tour/aulas.jpg' },
    {
      id: 'vista-edificio', group: 'interior', title: 'Vista desde el edificio', image: 'tour/vista-edificio.jpg',
      minYaw: -30, maxYaw: 100,
    },
    { id: 'talleres', group: 'interior', title: 'Talleres', image: 'tour/talleres.jpg' },
    { id: 'comedor', group: 'interior', title: 'Comedor', image: 'tour/comedor.jpg' },
    { id: 'patio', group: 'interior', title: 'Patio', image: 'tour/patio.jpg' },
    { id: 'gimnasio', group: 'interior', title: 'Gimnasio', image: 'tour/gimnasio.jpg' },
  ],
};

export const assetUrl = (path) => `${import.meta.env.BASE_URL}${path}`;
