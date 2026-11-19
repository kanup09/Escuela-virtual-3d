import { TOUR } from './tourConfig.js';
import { TourView } from './TourView.js';

export function createTour(root, { open3D }) {
  const view = new TourView(root, TOUR, { on3D: open3D });
  return {
    show() { root.hidden = false; view.resume(); },
    hide() { root.hidden = true; view.pause(); },
  };
}
