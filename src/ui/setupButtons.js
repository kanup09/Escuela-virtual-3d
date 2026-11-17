export function setupButtons(navigation) {
  const orbitButton = document.querySelector('#orbit');
  const walkButton = document.querySelector('#walk');
  const resetButton = document.querySelector('#reset');
  const hint = document.querySelector('#hint');

  function updateMode(mode) {
    const isWalking = mode === 'walk';
    orbitButton.classList.toggle('active', !isWalking);
    walkButton.classList.toggle('active', isWalking);
    hint.textContent = isWalking
      ? 'W A S D para moverte · Mouse para mirar · ESC para salir'
      : 'Arrastrá para girar · Rueda para zoom';
  }

  orbitButton.addEventListener('click', () => navigation.setMode('orbit'));
  walkButton.addEventListener('click', () => navigation.setMode('walk'));
  resetButton.addEventListener('click', navigation.reset);

  updateMode(navigation.getMode());
  return updateMode;
}
