
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
        to: 'entrada',
        label: 'Ingresar',
        sub: 'Entrada principal'
      },]
     /*  {
        x: 27,
        y: 63,
        to: 'biblioteca',
        label: 'Ingresar',
        sub: 'Biblioteca'
      }
    ]
    */
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
        x: 51,
        y: 66,
        to: 'entrada',
        label: 'Ingresar',
        sub: 'Entrada secundaria'
      },
    
    ]
    
  },

  // ----------------------------------------
  // FACHADA ESTE
  // ----------------------------------------
  {
    id: 'este',
    group: 'exterior',
    title: 'Este',
    image: 'tour/Escena SUM.png'
  },


  // ----------------------------------------
  // FACHADA OESTE
  // ----------------------------------------
  {
    id: 'oeste',
    group: 'exterior',
    title: 'Oeste',
    image: 'tour/Fachada-Oeste.png'
  },

  // ----------------------------------------
  // PANORÁMICA EXTERIOR 1
  // ----------------------------------------
  {
    id: 'vista-exterior-1',
    group: 'exterior',
    title: 'Vista exterior 1',
    image: 'tour/vista-exterior-1.jpg'
  },

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
