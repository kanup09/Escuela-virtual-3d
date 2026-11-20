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

/**
 * ==========================================
 * CONFIGURACIÓN GENERAL DEL TOUR
 * ==========================================
 *
 * Reúne las vistas exteriores e interiores.
 * No contiene imágenes ni escenas definidas
 * directamente.
 */

import { exteriores } from './config/exteriores.js';
import { interiores } from './config/interiores.js';

// ==========================================
// CONFIGURACIÓN PRINCIPAL
// ==========================================

export const TOUR = {

  // Nombre de la escuela
  title: 'ESCUELA NUEVA SALTA Recorrido Virtual',

  // Vista inicial al abrir el recorrido
  start: 'entrada',

  // Todas las vistas disponibles
  scenes: [
    ...exteriores,
    ...interiores
  ]

};

// ==========================================
// RUTAS DE LOS ARCHIVOS
// ==========================================

export const assetUrl = (path) => {
  return `${import.meta.env.BASE_URL}${path}`;
};
