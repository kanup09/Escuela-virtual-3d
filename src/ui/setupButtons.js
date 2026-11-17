export function setupButtons(navigation) {
  const orbitButton = document.querySelector('#orbit');
  const walkButton = document.querySelector('#walk');
  const resetButton = document.querySelector('#reset');
  const pickButton = document.querySelector('#pick');
  const hint = document.querySelector('#hint');

  function updateMode(mode) {
    const isWalking = mode === 'walk';
    orbitButton.classList.toggle('active', !isWalking);
    walkButton.classList.toggle('active', isWalking);
    pickButton.disabled = isWalking;
    hint.textContent = isWalking
      ? 'W A S D para moverte · Shift para correr · R para volver al inicio · ESC para salir'
      : 'Arrastrá para girar · Rueda para zoom';
  }

  orbitButton.addEventListener('click', () => navigation.setMode('orbit'));
  walkButton.addEventListener('click', () => navigation.setMode('walk'));
  resetButton.addEventListener('click', navigation.reset);
  pickButton.addEventListener('click', navigation.startPicking);

  updateMode(navigation.getMode());
  return updateMode;
}
