
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
        image: 'tour/entrada.jpg',

        // Orientación de la cámara
        yaw: 0,
        autoRotate: false,

        
        
        hotspots: [
        {
            x: 50,
            y: 50,

            to: 'biblioteca',

            style: 'arrow',
            direction: 'forward',

            label: 'Ir a Biblioteca',

            // Dirección inicial al llegar
            arrivalYaw: 45
        }
        ]


    },


  // ----------------------------------------
  // BIBLIOTECA
  // ----------------------------------------

    {
        id: 'biblioteca',
        group: 'interior',
        title: 'Biblioteca',
        image: 'tour/biblioteca.jpg',

        yaw: 0,
        autoRotate: false,

        hotspots: [
        {
            x: 50,
            y: 50,

            to: 'entrada',

            style: 'arrow',
            direction: 'back',

            label: 'Volver',
            sub: 'Entrada principal',

            // Dirección inicial al regresar
            arrivalYaw: -60
        }
        ]


    },


  // ----------------------------------------
  // AULAS
  // ----------------------------------------
  {
    id: 'aulas',
    group: 'interior',
    title: 'Aulas',
    image: 'tour/aulas.jpg'
  },

  // ----------------------------------------
  // VISTA DESDE EL EDIFICIO
  // ----------------------------------------
  {
    id: 'vista-edificio',
    group: 'interior',
    title: 'Vista desde el edificio',
    image: 'tour/vista-edificio.jpg',

    minYaw: -30,
    maxYaw: 100
  },

  // ----------------------------------------
  // TALLERES
  // ----------------------------------------
  {
    id: 'talleres',
    group: 'interior',
    title: 'Talleres',
    image: 'tour/talleres.jpg'
  },

  // ----------------------------------------
  // COMEDOR
  // ----------------------------------------
  {
    id: 'comedor',
    group: 'interior',
    title: 'Comedor',
    image: 'tour/comedor.jpg'
  },

  // ----------------------------------------
  // PATIO
  // ----------------------------------------
  {
    id: 'patio',
    group: 'interior',
    title: 'Patio',
    image: 'tour/patio.jpg'
  },

  // ----------------------------------------
  // GIMNASIO
  // ----------------------------------------
  {
    id: 'gimnasio',
    group: 'interior',
    title: 'Gimnasio',
    image: 'tour/gimnasio.jpg'
  }

];
