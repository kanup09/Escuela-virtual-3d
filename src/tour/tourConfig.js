// ============================================================
//  CONFIGURACIÓN DEL TOUR
//  Para reemplazar una imagen: poné el archivo nuevo en public/tour/
//  con el MISMO nombre (por ejemplo public/tour/aulas.jpg).
//  Si la imagen es un panorama 360° (formato equirectangular, proporción
//  2:1, por ejemplo 8192×4096) se detecta sola y se puede girar.
//  Cualquier otra proporción se muestra como imagen normal con zoom.
// ============================================================
export const TOUR = {
  title: 'Escuela',

  // Pantalla de inicio: imagen exterior con zonas tocables.
  // x, y: posición en % sobre la imagen (0–100).
  // zoom: cuánto se acerca al tocar. scene: a qué vista lleva "Ingresar".
  // Truco: abrí la página con ?debug al final y tocá la imagen: muestra x e y.
  exterior: {
    image: 'tour/exterior.jpg',
    intro: 'Entrada', // zona a la que se acerca sola al abrir la página
    hotspots: [
      { label: 'Entrada', x: 51, y: 66, zoom: 2.3, scene: 'entrada' },
      { label: 'Aulas', x: 46, y: 36, zoom: 2.2, scene: 'aulas' },
      { label: 'Gimnasio', x: 89, y: 50, zoom: 2.4, scene: 'gimnasio' },
    ],
  },

  // Vistas del interior, en el orden del menú.
  // yaw (opcional, solo panoramas): hacia dónde mira al abrir, en grados.
  scenes: [
    { id: 'entrada', title: 'Entrada', image: 'tour/entrada.jpg' },
    { id: 'aulas', title: 'Aulas', image: 'tour/aulas.jpg' },
    { id: 'biblioteca', title: 'Biblioteca', image: 'tour/biblioteca.jpg' },
    { id: 'gimnasio', title: 'Gimnasio', image: 'tour/gimnasio.jpg' },
    { id: 'patio', title: 'Patio', image: 'tour/patio.jpg' },
  ],
};

export const assetUrl = (path) => `${import.meta.env.BASE_URL}${path}`;
