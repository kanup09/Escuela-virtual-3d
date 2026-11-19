
/**
 * VIDEOS DE TRANSICIÓN ENTRE FACHADAS
 *
 * El recorrido de los videos originales es un círculo:
 *   Norte -> Sur -> Oeste -> Este -> Norte
 * (se comprobó con el primer y el último cuadro de cada video).
 *
 * Flecha derecha = sigue el círculo (videos originales).
 * Flecha izquierda = lo recorre al revés (mismos videos invertidos).
 *
 * Si la flecha de un lado se siente al revés, intercambiá
 * 'siguiente' y 'anterior' en el orden de abajo (ordenFachadas).
 */

export const transiciones = {
  // Hacia adelante (videos originales)
  'norte-este': 'videos/Clip 1.mp4',
  'este-sur': 'videos/Clip 2.mp4',
  'sur-oeste': 'videos/Clip 4.mp4',
  'oeste-norte': 'videos/Clip 5.mp4',

  // Hacia atrás (los mismos videos, invertidos)
  'norte-este': 'videos/Clip-1-inverso.mp4',
  'este-sur': 'videos/Clip-2-inverso.mp4',
  'sur-oeste': 'videos/Clip-4-inverso.mp4',
  'oeste-norte': 'videos/Clip-5-inverso.mp4'
};

// Orden del círculo de fachadas
export const ordenFachadas = ['norte', 'este', 'oeste', 'sur'];

export function obtenerTransicion(origen, destino) {
  return transiciones[`${origen}-${destino}`] ?? null;
}

// dir = 1 -> siguiente fachada, dir = -1 -> anterior
export function fachadaVecina(id, dir) {
  const i = ordenFachadas.indexOf(id);
  if (i === -1) return null;
  const n = ordenFachadas.length;
  return ordenFachadas[(i + dir + n) % n];
}
