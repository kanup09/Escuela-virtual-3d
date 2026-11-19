
/**
 * ==========================================
 * CONFIGURACIÓN DE VISTAS EXTERIORES
 * ==========================================
 *
 * Cada objeto representa una vista.
 *
 * Para agregar una nueva:
 * 1. Guardar la imagen en public/tour/
 * 2. Crear un objeto dentro de este arreglo.
 * 3. Asignarle un ID único.
 */

export const exteriores = [

  // ----------------------------------------
  // FACHADA NORTE
  // ----------------------------------------
  {
    id: 'norte',
    group: 'exterior',
    title: 'Norte',
    image: 'tour/Escena Principal.jpg',
    
    hotspots: [
    {
      x: 51,
      y: 66,

      to: 'galeria',

      style: 'arrow',
      direction: 'forward',

      label: 'Entrar a Galería',

      arrivalYaw: 0,
      prominent: true,
    },],

    hoverGlow: true
  },
  
  // ----------------------------------------
  // FACHADA SUR
  // ----------------------------------------
  {
    id: 'sur',
    group: 'exterior',
    title: 'Sur',
    image: 'tour/Fachada-Sur.jpg',

    hotspots: [
      {
        // Coordenadas provisionales
        x: 47,
        y: 65,

        to: 'espacio-ludico',

        style: 'arrow',
        direction: 'forward',

        label: 'Entrar al Espacio Lúdico',

        arrivalYaw: 0,
        prominent: true,
      }
    ],
    hoverGlow: true
  },

  // ----------------------------------------
  // FACHADA ESTE
  // ----------------------------------------
  {
    id: 'este',
    group: 'exterior',
    title: 'Este',
    image: 'tour/Escena SUM.jpg',

    hoverGlow: true
  },


  // ----------------------------------------
  // FACHADA OESTE
  // ----------------------------------------
  {
    id: 'oeste',
    group: 'exterior',
    title: 'Oeste',
    image: 'tour/Fachada-Oeste.jpg',
    hoverGlow: true
  },
];
