
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
  

  },


  // ----------------------------------------
  // Taller
  // ----------------------------------------

  {
    id: 'hall',
    group: 'interior',
    title: 'Hall',
    image: 'tour/Talleres y Galeria_1.jpg', // imagen cambiar

    yaw: 0,
    autoRotate: false,
    hotspots:[
      // Escena de origen: galeria
      // Escena de origen: hall
      {
        "x": 90.62,
        "y": 65,
        "to": "planta-alta-1",
        "style": "wayfinding",
        "direction": "back",
        "rotateX": 0,
        "rotateY": 20,
        "rotateZ": 0,
        "scale": 0.8,
        "label": "Planta Alta A",
        "arrivalYaw": 0
      }
    ],
  },
    
    // ----------------------------------------
    // Espacio ludico
    // ----------------------------------------
  {
    id: 'espacio-ludico',
    group: 'interior',
    title: 'Espacio Ludico',
    image: 'tour/Espacio-Ludico.jpeg',
    
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

  {
    id: 'comedor ext',
    group: 'interior',
    title: 'Comedor Galeria',
    image: 'tour/Comedor.jpeg',

    yaw: 0,
    autoRotate: false,
  },
    {
    id: 'comedor int',
    group: 'interior',
    title: 'Comedor Interior',
    image: 'tour/',

    yaw: 0,
    autoRotate: false,
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
    id: 'aulaPA',
    group: 'interior',
    title: 'Aula PA',
    image: 'tour/Aula Individual.jpg'
  },

  // ----------------------------------------
  // AULAS Compartidas
  // ----------------------------------------
  {
    id: 'aula integrada',
    group: 'interior',
    title: 'Aula Integrada',
    image: 'tour/Aulas Planta Alta.jpg'
  },

  {
    id: 'planta-alta-1',
    group: 'interior',
    title: 'Planta Alta A',
    image: 'tour/PlantaAlta-1.jpeg',

    yaw: 0,
    autoRotate: false,
  },

  {
    id: 'planta-alta-2',
    group: 'interior',
    title: 'Planta Alta B',
    image: 'tour/PlantaAlta-2.jpeg',

    yaw: 0,
    autoRotate: false,
  },
    {
    id: 'espacio-ludicoPA',
    group: 'interior',
    title: 'Espacio Ludico PA',
    image: 'tour/Espacio-Ludico.jpeg',
    
    yaw: 0,
    autoRotate: false,
  },

  {
    id: 'aulaPB',
    group: 'interior',
    title: 'Aulas PB',
    image: 'tour/Aulas-pruebas.jpeg',

    yaw: 0,
    autoRotate: false,
  },


  {
    id: 'huerta',
    group: 'interior',
    title: 'Huerta',
    image: 'tour/Huerta.jpeg',

    yaw: 0,
    autoRotate: false,
  },

  {
    id: 'talleresAfuera',
    group: 'interior',
    title: 'Talleres',
    image: 'tour/Talleres-prueba.jpeg',

    yaw: 0,
    autoRotate: false,
  },

  {
    id: 'tallereArt',
    group: 'interior',
    title: 'T. Arte',
    image: 'tour/Talleres-prueba.jpeg',

    yaw: 0,
    autoRotate: false,
  },
  {
    id: 'tallereMusic',
    group: 'interior',
    title: 'T. Musica',
    image: 'tour/Talleres-prueba.jpeg',

    yaw: 0,
    autoRotate: false,
  },

  {
    id: 'tallereMusic',
    group: 'interior',
    title: 'T. Informatica',
    image: 'tour/Talleres-prueba.jpeg',

    yaw: 0,
    autoRotate: false,
  },
  {
    id: 'biblioteca',
    group: 'interior',
    title: 'Biblioteca',
    image: 'tour/Biblioteca.jpeg',

    yaw: 0,
    autoRotate: false,
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
