
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
    image: 'tour/Escena Principal.png',
    
    hotspots: [
    {
      x: 51,
      y: 66,

      to: 'galeria',

      style: 'arrow',
      direction: 'forward',

      label: 'Entrar a Galería',

      arrivalYaw: 0,

      style: 'arrow',
      direction: 'forward',
      prominent: true,
      label: 'Entrar a Galería',
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
    image: 'tour/Fachada-Sur.png',

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

        style: 'arrow',
        direction: 'forward',
        prominent: true,
        label: 'Espacio Lúdico',
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
    image: 'tour/Escena SUM.png',

    hoverGlow: true
  },


  // ----------------------------------------
  // FACHADA OESTE
  // ----------------------------------------
  {
    id: 'oeste',
    group: 'exterior',
    title: 'Oeste',
    image: 'tour/Fachada-Oeste.png',
    hoverGlow: true
  },

 
    //ejemplo
  // ----------------------------------------
  // PANORÁMICA EXTERIOR 2
  // ----------------------------------------
  {
    id: 'vista-exterior-2',
    group: 'exterior',
    title: 'Vista exterior 2',
    image: 'tour/vista-exterior-2.jpg',

    yaw: 0,
    autoRotate: false,

    minYaw: -90,
    maxYaw: 90
  }

];
