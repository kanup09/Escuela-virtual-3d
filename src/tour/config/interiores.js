
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
    id: 'galeria',
    group: 'interior',
    title: 'Galeria',
    image: 'tour/Talleres y Galeria_1.jpg',

    yaw: 0,
    autoRotate: false,
    hotspots:[
      // Escena de origen: galeria
      {
        "x": 13.58,
        "y": 61.22,
        "to": "entrada",
        "style": "wayfinding",
        "direction": "forward",
        "label": "Entrada",
        "arrivalYaw": 0
      },
      // Escena de origen: galeria
      {
        "x": 93.41,
        "y": 52.83,
        "to": "planta-alta-1",
        "style": "wayfinding",
        "direction": "left",
        "label": "Planta Alta 1",
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
    id: 'comedor',
    group: 'interior',
    title: 'Comedor',
    image: 'tour/Comedor.jpeg',

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

  {
    id: 'planta-alta-1',
    group: 'interior',
    title: 'Planta Alta 1',
    image: 'tour/PlantaAlta-1.jpeg',

    yaw: 0,
    autoRotate: false,
  },

  {
    id: 'planta-alta-2',
    group: 'interior',
    title: 'Planta Alta 2',
    image: 'tour/PlantaAlta-2.jpeg',

    yaw: 0,
    autoRotate: false,
  },

  {
    id: 'aulas-pruebas',
    group: 'interior',
    title: 'Aulas Pruebas',
    image: 'tour/Aulas-pruebas.jpeg',

    yaw: 0,
    autoRotate: false,
  },

  {
    id: 'planta-baja',
    group: 'interior',
    title: 'Planta Baja',
    image: 'tour/Aula-plantaBaja.jpeg',

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
    id: 'talleres-prueba',
    group: 'interior',
    title: 'Talleres Prueba',
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

  {
    id: 'entrada-biblioteca',
    group: 'interior',
    title: 'Entrada Biblioteca',
    image: 'tour/Entrada-biblioteca.jpeg',

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
