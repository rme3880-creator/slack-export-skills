const itemInput = document.getElementById('itemInput');
const addBtn = document.getElementById('addBtn');
const itemList = document.getElementById('itemList');
const wheelCanvas = document.getElementById('wheelCanvas');
const spinBtn = document.getElementById('spinBtn');
const statusMsg = document.getElementById('statusMsg');
const winnerBanner = document.getElementById('winnerBanner');
const winnerName = document.getElementById('winnerName');

const ctx = wheelCanvas.getContext('2d');
const CANVAS_SIZE = wheelCanvas.width;
const CENTER = CANVAS_SIZE / 2;
const RADIUS = CENTER - 8;

const COLORS = [
  '#f59e0b', '#ef4444', '#3b82f6', '#10b981',
  '#a855f7', '#ec4899', '#14b8a6', '#f97316',
  '#6366f1', '#84cc16', '#e11d48', '#0ea5e9'
];

let items = [];
let currentRotation = 0;
let isSpinning = false;

function renderList() {
  itemList.innerHTML = '';
  items.forEach((item, index) => {
    const li = document.createElement('li');

    const label = document.createElement('span');
    label.className = 'label';

    const swatch = document.createElement('span');
    swatch.className = 'swatch';
    swatch.style.background = COLORS[index % COLORS.length];

    const text = document.createElement('span');
    text.textContent = item;

    label.appendChild(swatch);
    label.appendChild(text);

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '×';
    removeBtn.setAttribute('aria-label', `Remove ${item}`);
    removeBtn.addEventListener('click', () => removeItem(index));

    li.appendChild(label);
    li.appendChild(removeBtn);
    itemList.appendChild(li);
  });
}

function drawWheel() {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  if (items.length === 0) {
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 18px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Add options to build', CENTER, CENTER - 12);
    ctx.fillText('your wheel', CENTER, CENTER + 14);
    return;
  }

  const sliceAngle = (Math.PI * 2) / items.length;

  items.forEach((item, index) => {
    const startAngle = index * sliceAngle - Math.PI / 2;
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.moveTo(CENTER, CENTER);
    ctx.arc(CENTER, CENTER, RADIUS, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = COLORS[index % COLORS.length];
    ctx.fill();
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.translate(CENTER, CENTER);
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0f172a';
    ctx.font = '600 16px Segoe UI, sans-serif';
    const maxWidth = RADIUS - 30;
    let label = item;
    while (ctx.measureText(label).width > maxWidth && label.length > 1) {
      label = label.slice(0, -1);
    }
    if (label !== item) label = label.slice(0, -1) + '…';
    ctx.fillText(label, RADIUS - 12, 0);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(CENTER, CENTER, 22, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function updateSpinAvailability() {
  const ready = items.length >= 2 && !isSpinning;
  spinBtn.disabled = !ready;
  if (isSpinning) {
    statusMsg.textContent = 'Spinning...';
  } else if (items.length < 2) {
    statusMsg.textContent = 'Add at least 2 options to spin';
  } else {
    statusMsg.textContent = 'Ready to spin!';
  }
}

function addItem() {
  const value = itemInput.value.trim();
  if (!value) return;
  items.push(value);
  itemInput.value = '';
  itemInput.focus();
  resetWheel();
}

function removeItem(index) {
  items.splice(index, 1);
  resetWheel();
}

function resetWheel() {
  winnerBanner.hidden = true;
  renderList();
  drawWheel();
  updateSpinAvailability();
}

function spin() {
  if (items.length < 2 || isSpinning) return;

  isSpinning = true;
  winnerBanner.hidden = true;
  addBtn.disabled = true;
  itemInput.disabled = true;
  updateSpinAvailability();

  const winnerIndex = Math.floor(Math.random() * items.length);
  const sliceAngleDeg = 360 / items.length;
  const sliceCenterDeg = winnerIndex * sliceAngleDeg + sliceAngleDeg / 2;

  const maxJitter = sliceAngleDeg * 0.35;
  const jitter = (Math.random() - 0.5) * 2 * maxJitter;
  const targetAngle = sliceCenterDeg + jitter;

  const currentMod = currentRotation % 360;
  const neededRotation = (360 - targetAngle - currentMod + 360) % 360;
  const extraSpins = 6 + Math.floor(Math.random() * 3);

  currentRotation += extraSpins * 360 + neededRotation;
  wheelCanvas.style.transform = `rotate(${currentRotation}deg)`;

  wheelCanvas.addEventListener('transitionend', function handler() {
    wheelCanvas.removeEventListener('transitionend', handler);
    isSpinning = false;
    addBtn.disabled = false;
    itemInput.disabled = false;
    updateSpinAvailability();
    winnerName.textContent = items[winnerIndex];
    winnerBanner.hidden = false;
  });
}

addBtn.addEventListener('click', addItem);
itemInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addItem();
});
spinBtn.addEventListener('click', spin);

drawWheel();
updateSpinAvailability();
