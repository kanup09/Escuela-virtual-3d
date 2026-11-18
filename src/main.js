import './styles/main.css';
import './tour/tour.css';
import { createTour } from './tour/Tour.js';

let viewer3d = null;

const tour = createTour(document.querySelector('#tour'), {
  // El visor 3D se descarga recién cuando alguien toca "Recorrido 3D"
  open3D: async () => {
    tour.hide();
    viewer3d ??= await import('./viewer3d.js');
    viewer3d.setBackHandler(() => {
      viewer3d.hideViewer3D();
      tour.show();
    });
    await viewer3d.showViewer3D();
  },
});
