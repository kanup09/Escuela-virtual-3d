
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
    image: 'tour/Hall.jpg', // imagen cambiar

    yaw: 0,
    autoRotate: false,
    hotspots:[
      // Escena de origen: galeria
      // Escena de origen: hall
      {
        "x": 99.32,
        "y": 57.69,
        "to": "norte",
        "style": "wayfinding",
        "direction": "back",
        "rotateX": 0,
        "rotateY": 12,
        "rotateZ": 0,
        "scale": 1,
        "label": "Entrada",
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
        "x": 51.79,
        "y": 61.67,
        "to": "talleresAfuera",
        "style": "wayfinding",
        "direction": "back",
        "rotateX": 0,
        "rotateY": -16,
        "rotateZ": 0,
        "scale": 1,
        "label": "Talleres",
        "arrivalYaw": 0
      },
      // Escena de origen: hall

      {
        "x": 63.89,
        "y": 55.81,
        "to": "patio",
        "style": "wayfinding",
        "direction": "right",
        "rotateX": 0,
        "rotateY": 0,
        "rotateZ": 0,
        "scale": 1,
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

    image: 'tour/Planta Alta B.jpg',

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
    image: 'tour/Comedor Galeria.jpeg',

    yaw: 0,
    autoRotate: false,

    hotspots : [
      // Escena de origen: hall
      {
        "x": 76.34,
        "y": 55.64,
        "to": "comedor ext",
        "style": "wayfinding",
        "direction": "forward",
        "rotateX": 0,
        "rotateY": 0,
        "rotateZ": 0,
        "scale": 1,
        "label": "Comedor Galeria",
        "arrivalYaw": 0
      },
    ]
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
  // GIMNASIO
  // ----------------------------------------
  {
    id: 'gimnasio',
    group: 'interior',
    title: 'Gimnasio',
    image: 'tour/Sum Panoramica.png',
    yaw: 0,
    autoRotate: false,

    hotspots : [
      // Escena de origen: gimnasio
      {
        "x": 39.74,
        "y": 54.21,
        "to": "comedor ext",
        "style": "wayfinding",
        "direction": "back",
        "rotateX": 0,
        "rotateY": 32,
        "rotateZ": 0,
        "scale": 1,
        "label": "Comedor Galeria",
        "arrivalYaw": 0
      },
      // Escena de origen: gimnasio
      {
        "x": 56.33,
        "y": 53.62,
        "to": "patio",
        "style": "wayfinding",
        "direction": "back",
        "rotateX": 0,
        "rotateY": -36,
        "rotateZ": 0,
        "scale": 1,
        "label": "Patio",
        "arrivalYaw": 0
      }
    ]

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
    image: 'tour/Aula Individual Planta Alta.jpg'
  },

  // ----------------------------------------
  // AULAS Compartidas
  // ----------------------------------------
  {
    id: 'aula integrada',
    group: 'interior',
    title: 'Aula Integrada',
    image: 'tour/Aula 3 Planta Alta.jpg'
  },

  {
    id: 'planta-alta-1',
    group: 'interior',
    title: 'Planta Alta A',
    image: 'tour/Planta Alta A.jpg',

    yaw: 0,
    autoRotate: false,
  },

  {
    id: 'planta-alta-2',
    group: 'interior',
    title: 'Planta Alta B',
    image: 'tour/',

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
    image: 'tour/Huerto.png',

    yaw: 0,
    autoRotate: false,
  },

  {
    id: 'talleresAfuera',
    group: 'interior',
    title: 'Talleres',
    image: 'tour/Talleres.jpg',

    yaw: 0,
    autoRotate: false,
  },

  {
    id: 'tallereArt',
    group: 'interior',
    title: 'T. Arte',
    image: 'tour/',

    yaw: 0,
    autoRotate: false,
  },
  {
    id: 'tallereMusic',
    group: 'interior',
    title: 'T. Musica',
    image: 'tour/',

    yaw: 0,
    autoRotate: false,
  },

  {
    id: 'tallereMusic',
    group: 'interior',
    title: 'T. Informatica',
    image: 'tour/',

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

];
