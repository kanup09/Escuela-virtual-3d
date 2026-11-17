// Ajustes del recorrido. Cambiá estos valores cuando quieras.
// Todas las medidas están en metros (como el modelo de SketchUp).
export const SETTINGS = {
  walkSpeed: 5,            // metros por segundo al caminar
  runMultiplier: 2,        // se multiplica al mantener Shift
  mouseSensitivity: 1,     // 1 = sensibilidad normal
  cameraHeight: 1.6,       // altura de los ojos sobre el piso
  fieldOfView: 65,
  backgroundColor: '#dbe8f1',

  // Cuerpo del visitante (para choques con paredes y barandas)
  playerRadius: 0.3,
  playerHeight: 1.75,
  gravity: 20,

  // Zona de la escuela dentro del modelo (el resto es calle y terreno).
  // Define hacia dónde mira la vista de órbita al iniciar.
  school: { center: [222, 0, -264], radius: 70 },

  // Dónde aparece el visitante al tocar "Caminar".
  //   x, z: posición en metros.
  //   y:    altura del piso (null = se detecta sola).
  //   yaw:  hacia dónde mira, en grados
  //         (0 = hacia -Z, 90 = hacia -X, 180 = hacia +Z, -90 = hacia +X).
  // Para encontrar las coordenadas de la entrada: botón "Fijar inicio" en la
  // vista de órbita, tocar el punto y copiar los valores que aparecen.
  walkStart: { x: 232, y: null, z: -262, yaw: 0 },
};
