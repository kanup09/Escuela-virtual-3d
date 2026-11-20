// Pantalla de cuenta regresiva: tapa el tour hasta la hora de apertura
// y se retira sola cuando llega el momento.
const pad = (n) => String(n).padStart(2, '0');

export function mountCountdown(root, { fecha, texto }, onOpen) {
  const target = new Date(fecha).getTime();
  let offset = 0; // diferencia entre el reloj del servidor y el del usuario

  const el = document.createElement('div');
  el.className = 'tour-countdown';
  el.innerHTML = `
    <div class="tour-countdown-box">
      <img class="tour-countdown-logo" src="./IconoDePrueba.jpeg" alt="Logo de la escuela" />
      <div class="tour-countdown-title">Escuela Nueva Salta · Recorrido Virtual</div>
      <p class="tour-countdown-text"></p>
      <div class="tour-countdown-timer" aria-live="off">--:--:--</div>
      <div class="tour-countdown-credit">Palacio Gerez Pablo · UCASAL</div>
    </div>
  `;
  el.querySelector('.tour-countdown-text').textContent = texto;
  root.appendChild(el);

  const timer = el.querySelector('.tour-countdown-timer');
  let id = 0;

  const tick = () => {
    const ms = target - (Date.now() + offset);

    if (ms <= 0) {
      clearInterval(id);
      el.classList.add('leaving');
      setTimeout(() => el.remove(), 500);
      onOpen();
      return;
    }

    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    timer.textContent =
      (d ? `${d}d ` : '') + `${pad(h)}:${pad(m)}:${pad(s % 60)}`;
  };

  tick();
  id = setInterval(tick, 250);

  // Corrige el reloj del usuario con la hora del servidor (si responde)
  fetch(location.href, { method: 'HEAD', cache: 'no-store' })
    .then((r) => {
      const date = r.headers.get('Date');
      if (date) offset = new Date(date).getTime() - Date.now();
    })
    .catch(() => {});
}
