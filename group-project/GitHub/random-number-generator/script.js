const minInput = document.getElementById('minInput');
const maxInput = document.getElementById('maxInput');
const generateBtn = document.getElementById('generateBtn');
const output = document.getElementById('output');
const sirenOverlay = document.getElementById('sirenOverlay');

const JOKES_BY_LAST_DIGIT = [
  "Ends in 0 — just like my motivation on a Monday.",
  "Ends in 1, bold and alone, convinced it's the main character.",
  "Ends in 2. Guess it takes two to make a joke this bad land.",
  "Ends in 3! Third time's the charm... for disappointing puns.",
  "Ends in 4. That's one 4 too many for a joke this dumb.",
  "Ends in 5 — go ahead, high-five yourself, nobody else will.",
  "Ends in 6. Half a dozen reasons this joke isn't funny.",
  "Ends in 7 — lucky number, deeply unlucky joke.",
  "Ends in 8. Looks like an infinity symbol standing up, still lazier than this joke.",
  "Ends in 9 — one shy of a perfect 10, much like this joke."
];

function isDecimalString(value) {
  return value.includes('.');
}

function showSiren() {
  document.body.classList.add('alarm');
  sirenOverlay.hidden = false;
}

function hideSiren() {
  document.body.classList.remove('alarm');
  sirenOverlay.hidden = true;
}

function showError(message) {
  output.innerHTML = `<p class="error-text">${message}</p>`;
}

function generateNumber() {
  hideSiren();

  const minRaw = minInput.value.trim();
  const maxRaw = maxInput.value.trim();

  if (isDecimalString(minRaw) || isDecimalString(maxRaw)) {
    showSiren();
    return;
  }

  const min = parseInt(minRaw, 10);
  const max = parseInt(maxRaw, 10);

  if (isNaN(min) || isNaN(max)) {
    showError('Enter whole numbers for both min and max.');
    return;
  }

  const low = Math.min(min, max);
  const high = Math.max(min, max);

  const result = Math.floor(Math.random() * (high - low + 1)) + low;
  const lastDigit = Math.abs(result) % 10;
  const joke = JOKES_BY_LAST_DIGIT[lastDigit];

  output.innerHTML = `
    <p class="result-number">${result}</p>
    <p class="result-joke">${joke}</p>
  `;
}

generateBtn.addEventListener('click', generateNumber);

sirenOverlay.addEventListener('click', hideSiren);
