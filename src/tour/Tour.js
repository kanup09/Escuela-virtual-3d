import { TOUR } from './tourConfig.js';
import { ExteriorView } from './ExteriorView.js';
import { InteriorView } from './InteriorView.js';

// Coordina las dos pantallas: exterior (con "Ingresar") e interior.
export function createTour(root, { open3D }) {
  root.innerHTML = '<div class="view"></div><div class="view" hidden></div>';
  const [extEl, intEl] = root.children;
  let current = 'ext';

  function show(name) {
    current = name;
    extEl.hidden = name !== 'ext';
    intEl.hidden = name !== 'int';
    if (name === 'int') interior.resume(); else interior.pause();
  }

  const exterior = new ExteriorView(extEl, TOUR.exterior, TOUR.title, {
    on3D: open3D,
    onEnter: async (sceneId) => {
      interior.holdFade = true;
      await interior.open(sceneId);
      show('int');
      interior.holdFade = false;
      requestAnimationFrame(() => interior.fade.classList.remove('on'));
    },
  });

  const interior = new InteriorView(intEl, TOUR, {
    on3D: open3D,
    onExit: () => { exterior.reset(); show('ext'); },
  });

  return {
    show() { root.hidden = false; if (current === 'int') interior.resume(); },
    hide() { root.hidden = true; interior.pause(); },
  };
}
