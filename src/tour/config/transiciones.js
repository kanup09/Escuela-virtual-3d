
/**
 * Movimiento alrededor de la escuela
 *
 * Norte → Este → Sur → Oeste → Norte
 */

export const ordenFachadas = [
  'norte',
  'este',
  'sur',
  'oeste'
];

export const transiciones = {
  // Videos originales
  'norte-este': 'videos/Clip 1.mp4',
  'este-sur': 'videos/Clip 2.mp4',
  'sur-oeste': 'videos/Clip 4.mp4',
  'oeste-norte': 'videos/Clip 5.mp4',

  // Videos inversos
  'este-norte': 'videos/Clip-1-inverso.mp4',
  'sur-este': 'videos/Clip-2-inverso.mp4',
  'oeste-sur': 'videos/Clip-4-inverso.mp4',
  'norte-oeste': 'videos/Clip-5-inverso.mp4'
};

export function obtenerTransicion(origen, destino) {
  return transiciones[`${origen}-${destino}`] ?? null;
}

export function fachadaVecina(id, direccion) {
  const indice = ordenFachadas.indexOf(id);

  if (indice === -1) return null;

  const total = ordenFachadas.length;

  return ordenFachadas[
    (indice + direccion + total) % total
  ];
}
