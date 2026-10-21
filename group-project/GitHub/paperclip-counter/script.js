const pile = document.getElementById('pile');
const bag = document.getElementById('bag');
const bagCollected = document.getElementById('bagCollected');
const countEl = document.getElementById('count');
const resetBtn = document.getElementById('resetBtn');

const PILE_SIZE = 25;
const CLIP_SIZE = 38;
let count = 0;
let nextId = 0;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function spawnPile() {
  pile.querySelectorAll('.paperclip').forEach((el) => el.remove());

  const rect = pile.getBoundingClientRect();
  const maxX = rect.width - CLIP_SIZE - 10;
  const maxY = rect.height - CLIP_SIZE - 10;

  for (let i = 0; i < PILE_SIZE; i++) {
    const clip = document.createElement('div');
    clip.className = 'paperclip';
    clip.textContent = '📎';
    clip.draggable = true;
    clip.dataset.id = `clip-${nextId++}`;

    const x = randomBetween(10, Math.max(10, maxX));
    const y = randomBetween(30, Math.max(30, maxY));
    const rotation = randomBetween(-50, 50);

    clip.style.left = `${x}px`;
    clip.style.top = `${y}px`;
    clip.style.transform = `rotate(${rotation}deg)`;

    clip.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', clip.dataset.id);
      clip.classList.add('dragging');
    });

    clip.addEventListener('dragend', () => {
      clip.classList.remove('dragging');
    });

    pile.appendChild(clip);
  }
}

function addMiniClipToBag() {
  const mini = document.createElement('div');
  mini.className = 'mini-clip';
  mini.textContent = '📎';
  const rect = bagCollected.getBoundingClientRect();
  const x = randomBetween(10, Math.max(10, rect.width - 24));
  const y = randomBetween(0, Math.max(0, rect.height - 24));
  mini.style.left = `${x}px`;
  mini.style.top = `${y}px`;
  mini.style.transform = `rotate(${randomBetween(-30, 30)}deg)`;
  bagCollected.appendChild(mini);
}

bag.addEventListener('dragover', (e) => {
  e.preventDefault();
  bag.classList.add('drag-over');
});

bag.addEventListener('dragleave', () => {
  bag.classList.remove('drag-over');
});

bag.addEventListener('drop', (e) => {
  e.preventDefault();
  bag.classList.remove('drag-over');

  const id = e.dataTransfer.getData('text/plain');
  const clip = pile.querySelector(`[data-id="${id}"]`);
  if (!clip) return;

  clip.classList.add('removing');
  setTimeout(() => clip.remove(), 200);

  count++;
  countEl.textContent = String(count);
  addMiniClipToBag();
});

resetBtn.addEventListener('click', () => {
  count = 0;
  countEl.textContent = '0';
  bagCollected.innerHTML = '';
  spawnPile();
});

window.addEventListener('load', spawnPile);
