
/**
 * Transiciones exteriores
 *
 * Orden:
 * Norte → Este → Sur → Oeste → Norte
 */

export const ordenFachadas = [
  'norte',
  'este',
  'sur',
  'oeste'
];

export const transiciones = {

  // =====================================
  // SENTIDO ADELANTE
  // =====================================

  'norte-este': 'videos/Clip 1.mp4',

  'este-sur': 'videos/Clip 2.mp4',

  'sur-oeste': 'videos/Clip 4.mp4',

  'oeste-norte': 'videos/Clip 5.mp4',


  // =====================================
  // SENTIDO INVERSO
  // =====================================

  'este-norte': 'videos/Clip-1-inverso.mp4',

  'sur-este': 'videos/Clip-2-inverso.mp4',

  'oeste-sur': 'videos/Clip-4-inverso.mp4',

  'norte-oeste': 'videos/Clip-5-inverso.mp4'
};


// Obtener el video correspondiente
export function obtenerTransicion(origen, destino) {
  const clave = `${origen}-${destino}`;

  return transiciones[clave] ?? null;
}


// Obtener fachada vecina en el recorrido circular
// Norte -> Este -> Sur -> Oeste -> Norte
export function fachadaVecina(id, direccion) {
  const indice = ordenFachadas.indexOf(id);

  if (indice === -1) {
    return null;
  }

  const total = ordenFachadas.length;

  const siguiente = (
    indice + direccion + total
  ) % total;

  return ordenFachadas[siguiente];
}
