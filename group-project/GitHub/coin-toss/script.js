const coin = document.getElementById('coin');
const flipBtn = document.getElementById('flipBtn');
const resultEl = document.getElementById('result');

let isFlipping = false;
let currentTurns = 0; // tracks total full rotations applied so far, in degrees

function flipCoin() {
  if (isFlipping) return;
  isFlipping = true;
  flipBtn.disabled = true;
  resultEl.textContent = 'Flipping...';

  const isHeads = Math.random() < 0.5;

  // Always spin at least 5 extra full turns, landing on the correct face.
  const extraSpins = 5 * 360;
  const landingOffset = isHeads ? 0 : 180;
  const finalRotation = currentTurns + extraSpins + landingOffset;
  currentTurns = finalRotation;

  coin.style.setProperty('--final-rotation', `${finalRotation}deg`);

  // Restart the animation each time.
  coin.classList.remove('flipping');
  void coin.offsetWidth; // force reflow
  coin.classList.add('flipping');

  coin.addEventListener('animationend', function handler() {
    coin.removeEventListener('animationend', handler);
    coin.classList.remove('flipping');
    coin.style.transform = `rotateY(${finalRotation}deg)`;

    resultEl.textContent = isHeads ? 'Heads!' : 'Tails!';
    isFlipping = false;
    flipBtn.disabled = false;
  });
}

flipBtn.addEventListener('click', flipCoin);
