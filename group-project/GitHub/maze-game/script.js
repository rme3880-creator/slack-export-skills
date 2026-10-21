const canvas = document.getElementById('maze');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const statusEl = document.getElementById('status');
const popup = document.getElementById('popup');
const retryBtn = document.getElementById('retryBtn');
const winPopup = document.getElementById('winPopup');
const winRetryBtn = document.getElementById('winRetryBtn');

const PATH_COLOR = [21, 204, 122];
const PATH_WIDTH = 34;
const TOLERANCE = 40;

const points = [
  [60, 60],
  [60, 440],
  [230, 440],
  [230, 120],
  [400, 120],
  [400, 460],
  [570, 460],
  [570, 80],
  [740, 80],
  [740, 300],
];

const start = points[0];
const finish = points[points.length - 1];
const FINISH_RADIUS = 30;

let gameActive = false;
let gameWon = false;

function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0b0c10';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = `rgb(${PATH_COLOR.join(',')})`;
  ctx.lineWidth = PATH_WIDTH;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.stroke();

  // finish flag marker
  ctx.fillStyle = '#ff4d5e';
  ctx.beginPath();
  ctx.arc(finish[0], finish[1], FINISH_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('END', finish[0], finish[1]);
}

function playJumpscareSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctxA = new AudioCtx();
    const osc = ctxA.createOscillator();
    const gain = ctxA.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctxA.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctxA.currentTime + 0.18);
    osc.frequency.exponentialRampToValueAtTime(60, ctxA.currentTime + 0.4);
    gain.gain.setValueAtTime(0.4, ctxA.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctxA.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctxA.destination);
    osc.start();
    osc.stop(ctxA.currentTime + 0.5);
  } catch (e) {
    // audio unsupported, ignore
  }
}

function isOnPath(x, y) {
  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return false;
  const pixel = ctx.getImageData(x, y, 1, 1).data;
  const dr = Math.abs(pixel[0] - PATH_COLOR[0]);
  const dg = Math.abs(pixel[1] - PATH_COLOR[1]);
  const db = Math.abs(pixel[2] - PATH_COLOR[2]);
  return dr < TOLERANCE && dg < TOLERANCE && db < TOLERANCE;
}

function distance(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}

function loseGame() {
  if (!gameActive) return;
  gameActive = false;
  playJumpscareSound();
  popup.classList.remove('hidden');
  statusEl.textContent = 'You touched the wall!';
}

function winGame() {
  if (!gameActive) return;
  gameActive = false;
  gameWon = true;
  winPopup.classList.remove('hidden');
  statusEl.textContent = 'You reached the finish!';
}

function resetGame() {
  gameActive = false;
  gameWon = false;
  popup.classList.add('hidden');
  winPopup.classList.add('hidden');
  startBtn.classList.remove('hidden');
  statusEl.textContent = 'Click START to begin.';
  drawMaze();
}

startBtn.addEventListener('click', () => {
  startBtn.classList.add('hidden');
  gameActive = true;
  gameWon = false;
  statusEl.textContent = 'Go! Follow the path...';
});

canvas.addEventListener('mousemove', (e) => {
  if (!gameActive) return;
  const rect = canvas.getBoundingClientRect();
  const x = Math.round((e.clientX - rect.left) * (canvas.width / rect.width));
  const y = Math.round((e.clientY - rect.top) * (canvas.height / rect.height));

  if (distance(x, y, finish[0], finish[1]) < FINISH_RADIUS) {
    winGame();
    return;
  }

  if (!isOnPath(x, y)) {
    loseGame();
  }
});

canvas.addEventListener('mouseleave', () => {
  if (gameActive) {
    loseGame();
  }
});

retryBtn.addEventListener('click', resetGame);
winRetryBtn.addEventListener('click', resetGame);

drawMaze();

// position the start button exactly over the path's starting point
startBtn.style.left = `${start[0] - 28}px`;
startBtn.style.top = `${start[1] - 28}px`;
