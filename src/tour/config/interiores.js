
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
    image: 'tour/Escena Ingreso.jg',

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
      },
      // Escena de origen: hall
      {
        "x": 87.68,
        "y": 56.35,
        "to": "planta-alta-1",
        "style": "wayfinding",
        "direction": "left",
        "rotateX": 0,
        "rotateY": -47,
        "rotateZ": 0,
        "scale": 1,
        "label": "Planta Alta A",
        "arrivalYaw": 180
      },
   
 
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
      },
      // Escena de origen: espacio-ludico
      {
        "x": 17.11,
        "y": 53.57,
        "to": "talleresAfuera",
        "style": "wayfinding",
        "direction": "forward",
        "rotateX": 0,
        "rotateY": 58,
        "rotateZ": 0,
        "scale": 1,
        "label": "Talleres",
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
      
      // Escena de origen: espacio-ludicoPA
      {
        "x": 85.92,
        "y": 56.1,
        "to": "aula integrada",
        "style": "wayfinding",
        "direction": "left",
        "rotateX": 0,
        "rotateY": 10,
        "rotateZ": 0,
        "scale": 1,
        "label": "Aula Integrada",
        "arrivalYaw": 0
      }
      

    ]
  },

  // ----------------------------------------
  // PATIO
  // ----------------------------------------
  {
    id: 'patio',
    group: 'interior',
    title: 'Patio',
    image: 'tour/Patio.jpg',

    hotspots:[
      // Escena de origen: patio
      {
        "x": 3.8,
        "y": 55.56,
        "to": "gimnasio",
        "style": "wayfinding",
        "direction": "back",
        "rotateX": 0,
        "rotateY": -23,
        "rotateZ": 0,
        "scale": 1,
        "label": "Gimnasio",
        "arrivalYaw": 0
      },
      

      // Escena de origen: patio
      {
        "x": 45.5,
        "y": 52.98,
        "to": "talleresAfuera",
        "style": "wayfinding",
        "direction": "back",
        "rotateX": 0,
        "rotateY": 38,
        "rotateZ": 0,
        "scale": 1,
        "label": "Talleres",
        "arrivalYaw": 0
      },

      // Escena de origen: patio
      {
        "x": 30.53,
        "y": 55.57,
        "to": "comedor ext",
        "style": "wayfinding",
        "direction": "left",
        "rotateX": 0,
        "rotateY": 45,
        "rotateZ": 0,
        "scale": 1,
        "label": "Comedor Galeria",
        "arrivalYaw": 0
      },
    
      // Escena de origen: patio
      {
        "x": 76.84,
        "y": 53.39,
        "to": "aulaPB",
        "style": "wayfinding",
        "direction": "forward",
        "rotateX": 0,
        "rotateY": 0,
        "rotateZ": 0,
        "scale": 1,
        "label": "Aulas PB",
        "arrivalYaw": 0
      }
    ]
  },

  {
    id: 'comedor ext',
    group: 'interior',
    title: 'Comedor Galeria',
    image: 'tour/Comedor galeria.jpg',

    yaw: 0,
    autoRotate: false,

    hotspots : [
      // Escena de origen: hall
      
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
    image: 'tour/Rampa.jpg',
    
    hotspots : [
      // Escena de origen: rampa
      {
        "x": 70.49,
        "y": 56.39,
        "to": "talleresAfuera",
        "style": "wayfinding",
        "direction": "forward",
        "rotateX": 0,
        "rotateY": 22,
        "rotateZ": 0,
        "scale": 1,
        "label": "Talleres",
        "arrivalYaw": 0
      },
      // Escena de origen: rampa
      {
        "x": 75.09,
        "y": 55.83,
        "to": "espacio-ludicoPA",
        "style": "wayfinding",
        "direction": "forward",
        "rotateX": 0,
        "rotateY": 25,
        "rotateZ": 0,
        "scale": 1,
        "label": "Espacio Lúdico PA",
        "arrivalYaw": 0
      }

    ]
    
  },
  // ----------------------------------------
  // AULAS
  // ----------------------------------------
  {
    id: 'aulaPA',
    group: 'interior',
    title: 'Aula PA',
    image: 'tour/Aula Individual Planta Alta.jpg',
    hotspots:[
    // Escena de origen: aulaPA
    {
      "x": 30.77,
      "y": 55.91,
      "to": "planta-alta-1",
      "style": "wayfinding",
      "direction": "left",
      "rotateX": 0,
      "rotateY": 38,
      "rotateZ": 0,
      "scale": 1,
      "label": "Planta Alta A",
      "arrivalYaw": 0
    }
    ]
  },

  // ----------------------------------------
  // AULAS Compartidas
  // ----------------------------------------
  {
    id: 'aula integrada',
    group: 'interior',
    title: 'Aula Integrada',
    image: 'tour/Aula 3 Planta Alta.jpg',
    hotspots:[
      // Escena de origen: aula integrada
      {
        "x": 31.2,
        "y": 56.29,
        "to": "espacio-ludicoPA",
        "style": "wayfinding",
        "direction": "left",
        "rotateX": 0,
        "rotateY": -22,
        "rotateZ": 0,
        "scale": 1,
        "label": "Espacio Lúdico PA",
        "arrivalYaw": 0
      }
    ]
  },

  {
    id: 'planta-alta-1',
    group: 'interior',
    title: 'Planta Alta A',
    image: 'tour/Planta Alta A.jpg',

    yaw: 0,
    autoRotate: false,
    hotspots:[
      // Escena de origen: planta-alta-1
      {
        "x": 94.18,
        "y": 55.29,
        "to": "aulaPA",
        "style": "wayfinding",
        "direction": "back",
        "rotateX": 0,
        "rotateY": 41,
        "rotateZ": 0,
        "scale": 1,
        "label": "Aula PA",
        "arrivalYaw": 0
      },
      // Escena de origen: planta-alta-1
      {
        "x": 2.26,
        "y": 57.05,
        "to": "huerta",
        "style": "wayfinding",
        "direction": "right",
        "rotateX": 0,
        "rotateY": 0,
        "rotateZ": 0,
        "scale": 1,
        "label": "Huerta",
        "arrivalYaw": 0
      },
      // Escena de origen: planta-alta-1
      {
        "x": 64.75,
        "y": 60.8,
        "to": "hall",
        "style": "wayfinding",
        "direction": "right",
        "rotateX": 0,
        "rotateY": -27,
        "rotateZ": 0,
        "scale": 1,
        "label": "Hall",
        "arrivalYaw": 0
      }
    ]
  },


  {
    id: 'aulaPB',
    group: 'interior',
    title: 'Aulas PB',
    image: 'tour/Aula Planta Baja.jpg',

    yaw: 0,
    autoRotate: false,
    hotspots:[
      // Escena de origen: aulaPB
  {
    "x": 49.65,
    "y": 56.21,
    "to": "espacio-ludico",
    "style": "wayfinding",
    "direction": "right",
    "rotateX": 0,
    "rotateY": 32,
    "rotateZ": 0,
    "scale": 1,
    "label": "Espacio Ludico",
    "arrivalYaw": 0
  }
    ]
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
    hotspots:[
      // Escena de origen: talleresAfuera
      {
        "x": 99.92,
        "y": 56.93,
        "to": "entrada",
        "style": "wayfinding",
        "direction": "back",
        "rotateX": 0,
        "rotateY": 8,
        "rotateZ": 0,
        "scale": 1,
        "label": "Entrada",
        "arrivalYaw": 0
      },
      // Escena de origen: talleresAfuera
      {
        "x": 0.22,
        "y": 57.1,
        "to": "hall",
        "style": "wayfinding",
        "direction": "back",
        "rotateX": 0,
        "rotateY": 0,
        "rotateZ": 0,
        "scale": 1,
        "label": "Hall",
        "arrivalYaw": 0
      },
      {
        "x": 74.04,
        "y": 60.61,
        "to": "patio",
        "style": "wayfinding",
        "direction": "forward",
        "rotateX": 0,
        "rotateY": 0,
        "rotateZ": 0,
        "scale": 1,
        "label": "Patio",
        "arrivalYaw": 0
      },
      // Escena de origen: talleresAfuera
      {
        "x": 48.73,
        "y": 54.37,
        "to": "biblioteca",
        "style": "wayfinding",
        "direction": "back",
        "rotateX": 0,
        "rotateY": 0,
        "rotateZ": 0,
        "scale": 1,
        "label": "Biblioteca",
        "arrivalYaw": 0
      },
      // Escena de origen: talleresAfuera
      {
        "x": 52.16,
        "y": 54.63,
        "to": "rampa",
        "style": "wayfinding",
        "direction": "back",
        "rotateX": 0,
        "rotateY": -32,
        "rotateZ": 0,
        "scale": 1,
        "label": "Rampa",
        "arrivalYaw": 0
      }
    ]
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
    image: 'tour/Biblioteca.png',

    yaw: 0,
    autoRotate: false,
  },

];
