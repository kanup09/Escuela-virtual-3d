
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

      to: 'entrada',

      style: 'arrow',
      direction: 'forward',

      label: 'Entrar a la escuela',

      arrivalYaw: 0,
      prominent: true,
    },],

    hoverGlow: true,
    
    hoverArea: {
      // Límites iniciales de la zona del edificio
      xMin: 0,
      xMax: 100,
      yMin: 27,
      yMax: 77
    }

  },
  
  // ----------------------------------------
  // FACHADA ESTE
  // ----------------------------------------
  {
    id: 'este',
    group: 'exterior',
    title: 'Este',
    image: 'tour/Fachad Este.jpg',

    hotspots: [
      {
        // Coordenadas provisionales
        x: 47,
        y: 65,

        to: 'biblioteca',

        style: 'arrow',
        direction: 'forward',

        label: 'Entrar a la biblioteca',

        arrivalYaw: 0,
        prominent: true,
      }
    ],
    hoverGlow: true,

    hoverArea: {
      // Límites iniciales de la zona del edificio
      xMin: 0,
      xMax: 100,
      yMin: 27,
      yMax: 77
    }


    
  },

  // ----------------------------------------
  // FACHADA SUR
  // ----------------------------------------
  {
    id: 'sur',
    group: 'exterior',
    title: 'Sur',
    image: 'tour/Fachada-Oeste.jpg', // Sin cambiar aun

    hoverGlow: true
  },


  // ----------------------------------------
  // FACHADA OESTE
  // ----------------------------------------
  {
    id: 'oeste',
    group: 'exterior',
    title: 'Oeste',
    image: 'tour/Escena SUM_2.jpg',
    hoverGlow: true
  },
];
