
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
    hotspots:[
      {
        "x": 0,
        "y": 0,
        "to": "hall",
        "style": "wayfinding",
        "direction": "forward",

        "label": "Entrada",
        "arrivalYaw": 0
      },
    ],

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
      },
      // Escena de origen: hall
      {
        "x": 81.68,
        "y": 57.33,
        "to": "comedor ext",
        "style": "wayfinding",
        "direction": "forward",
        "rotateX": 0,
        "rotateY": -45,
        "rotateZ": 0,
        "scale": 1.15,
        "label": "Comedor Galeria",
        "arrivalYaw": 0
      },
      // Escena de origen: hall
      {
        "x": 11.64,
        "y": 64.38,
        "to": "entrada",
        "style": "wayfinding",
        "direction": "right",
        "rotateX": 0,
        "rotateY": 31,
        "rotateZ": 0,
        "scale": 0.7,
        "label": "Entrada",
        "arrivalYaw": 0
      },
      // Escena de origen: hall
      {
        "x": 50.91,
        "y": 58.23,
        "to": "talleresAfuera",
        "style": "wayfinding",
        "direction": "back",
        "rotateX": 0,
        "rotateY": -39,
        "rotateZ": 0,
        "scale": 1,
        "label": "Talleres",
        "arrivalYaw": 0
      },
      // Escena de origen: hall
      {
        "x": 66.2,
        "y": 57.61,
        "to": "patio",
        "style": "wayfinding",
        "direction": "right",
        "rotateX": 0,
        "rotateY": -27,
        "rotateZ": 0,
        "scale": 1.15,
        "label": "Patio",
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
    image: 'tour/Espacio Ludico.jpg',
    
    yaw: 0,
    autoRotate: false,

    hotspots:[
      // Escena de origen: espacio-ludico
      {
        "x": 56.55,
        "y": 58.52,
        "to": "espacio-ludicoPA",
        "style": "wayfinding",
        "direction": "back",
        "rotateX": 0,
        "rotateY": 5,
        "rotateZ": 0,
        "scale": 0.8,
        "label": "Espacio Ludico PA",
        "arrivalYaw": 0
      },
      // Escena de origen: espacio-ludico
      {
        "x": 17.04,
        "y": 51.92,
        "to": "biblioteca",
        "style": "wayfinding",
        "direction": "right",
        "rotateX": 0,
        "rotateY": -38,
        "rotateZ": 0,
        "scale": 1.2,
        "label": "Biblioteca",
        "arrivalYaw": 0
      },
      // Escena de origen: espacio-ludico
      {
        "x": 66.94,
        "y": 56.72,
        "to": "aulaPB",
        "style": "wayfinding",
        "direction": "right",
        "rotateX": 0,
        "rotateY": -35,
        "rotateZ": 0,
        "scale": 1,
        "label": "Aula PB",
        "arrivalYaw": 0
      }
    ],
  },


  {
    id: 'espacio-ludicoPA',
    group: 'interior',
    title: 'Espacio Lúdico PA',

    image: 'tour/Espacio-LudicoPA.jpg',

    yaw: 0,
    autoRotate: false,

    hotspots: [
      

    ]
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
