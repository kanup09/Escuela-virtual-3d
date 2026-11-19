
/**
 * ==========================================
 * CONFIGURACIÓN DE VISTAS INTERIORES
 * ==========================================
 *
 * Aquí se organizan las salas, los pasillos
 * y los espacios interiores de la escuela.
 *
 * Las escenas sin imagen disponible
 * no aparecerán en el menú.
 */

export const interiores = [

  // ----------------------------------------
  // ENTRADA PRINCIPAL
  // ----------------------------------------
 
  {
    id: 'entrada',
    group: 'interior',
    title: 'Entrada',
    image: 'tour/Escena Ingreso.jpg',

    // Orientación de la cámara
    yaw: 0,
    autoRotate: false,
    hotspots: [
    {
      x: 51,
      y: 66,

      to: 'galeria',

      style: 'arrow',
      direction: 'forward',

      label: 'Entrar a Galería',

      arrivalYaw: 0
    },]

  },


  // ----------------------------------------
  // Taller
  // ----------------------------------------

  {
    id: 'galeria',
    group: 'interior',
    title: 'Talleres y Galeria',
    image: 'tour/Talleres y Galeria_1.jpg',

    yaw: 0,
    autoRotate: false,

  },
    
    // ----------------------------------------
    // Espacio ludico
    // ----------------------------------------
  {
    id: 'espacio-ludico',
    group: 'interior',
    title: 'Espacio Ludico',
    image: 'tour/Espacio Ludico.jpg',
    
    yaw: 0,
    autoRotate: false,
  },
  // ----------------------------------------
  // PATIO
  // ----------------------------------------
  {
    id: 'patio',
    group: 'interior',
    title: 'Patio',
    image: 'tour/Patio.jpg'
  },
  
  // ----------------------------------------
  // Rampa
  // ----------------------------------------
  {
    id: 'rampa',
    group: 'interior',
    title: 'Rampa',
    image: 'tour/Rampa.jpg'
  },
  // ----------------------------------------
  // AULAS
  // ----------------------------------------
  {
    id: 'aula individual',
    group: 'interior',
    title: 'Aula Individual',
    image: 'tour/Aula Individual.jpg'
  },

  // ----------------------------------------
  // AULAS Compartidas
  // ----------------------------------------
  {
    id: 'aula compartida',
    group: 'interior',
    title: 'Aula Compartida',
    image: 'tour/Aulas Planta Alta.jpg'
  },



  // ----------------------------------------
  // GIMNASIO
  // ----------------------------------------
  {
    id: 'gimnasio',
    group: 'interior',
    title: 'Gimnasio',
    image: 'tour/Escena 5_1.jpg'
  }

];
