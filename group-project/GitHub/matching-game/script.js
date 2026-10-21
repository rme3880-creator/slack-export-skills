const REASONS = [
  { title: "Consistent Effort", desc: "I completed every assignment on time and always put my best foot forward." },
  { title: "Active Participation", desc: "I regularly contributed to class discussions and engaged with the material." },
  { title: "Improvement", desc: "My grades and understanding of the subject have steadily improved throughout the semester." },
  { title: "Extra Help", desc: "I attended office hours and sought out extra help whenever I was struggling." },
  { title: "Deep Understanding", desc: "I have demonstrated a strong grasp of the core concepts, even if my test scores don't always reflect it." },
  { title: "Leadership", desc: "I helped my classmates understand difficult topics and led group projects effectively." },
  { title: "Perfect Attendance", desc: "I never missed a single class and was always on time." },
  { title: "Passion for the Subject", desc: "I genuinely care about this field of study and it shows in my work." },
  { title: "Overcoming Obstacles", desc: "I managed to keep up with my coursework despite facing significant personal challenges this semester." },
  { title: "The Caffeine Budget", desc: "I spent my life savings on coffee just to stay awake for your 8:00 AM lectures." },
  { title: "The Nod of Agreement", desc: "I nodded along to everything you said, even when I had absolutely no idea what was going on." },
  { title: "The Front Row Sacrifice", desc: "I sat in the front row, which meant I couldn't secretly browse the internet on my laptop." },
  { title: "The \"I Tried\" Factor", desc: "I didn't cry once during the midterm, which I think shows incredible emotional maturity." },
  { title: "The Tech Support", desc: "I was the one who always reminded you to unmute yourself on Zoom." },
  { title: "The Moral Support", desc: "I laughed at all of your jokes, even the ones about the syllabus." },
  { title: "The Aesthetic", desc: "My color-coded notes were so beautiful they practically deserve their own art exhibit." },
  { title: "The Attendance Award", desc: "I showed up to class in the rain, which basically makes me a hero." },
  { title: "The Future Bribery", desc: "If you give me an A, I promise to name my firstborn child after you (or at least my next pet)." },
];

const board = document.getElementById('board');
const matchCountEl = document.getElementById('matchCount');
const collectedList = document.getElementById('collectedList');
const newGameBtn = document.getElementById('newGameBtn');
const winBanner = document.getElementById('winBanner');
const winCloseBtn = document.getElementById('winCloseBtn');

let firstPick = null;
let lock = false;
let matchCount = 0;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildDeck() {
  const deck = [];
  REASONS.forEach((r, idx) => {
    deck.push({ id: idx, title: r.title, desc: r.desc });
    deck.push({ id: idx, title: r.title, desc: r.desc });
  });
  return shuffle(deck);
}

function renderBoard() {
  board.innerHTML = '';
  collectedList.innerHTML = '';
  matchCount = 0;
  matchCountEl.textContent = '0';
  firstPick = null;
  lock = false;
  winBanner.classList.add('hidden');

  const deck = buildDeck();

  deck.forEach((card, i) => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.dataset.id = card.id;
    tile.dataset.index = i;

    tile.innerHTML = `
      <div class="tile-inner">
        <div class="tile-face tile-back">?</div>
        <div class="tile-face tile-front">${card.title}</div>
      </div>
    `;

    tile.addEventListener('click', () => onTileClick(tile, card));
    board.appendChild(tile);
  });
}

function onTileClick(tile, card) {
  if (lock) return;
  if (tile.classList.contains('flipped') || tile.classList.contains('matched')) return;

  tile.classList.add('flipped');

  if (!firstPick) {
    firstPick = { tile, card };
    return;
  }

  const secondPick = { tile, card };
  lock = true;

  if (firstPick.card.id === secondPick.card.id) {
    firstPick.tile.classList.add('matched');
    secondPick.tile.classList.add('matched');
    matchCount++;
    matchCountEl.textContent = String(matchCount);
    addCollected(card);
    firstPick = null;
    lock = false;

    if (matchCount === REASONS.length) {
      setTimeout(() => winBanner.classList.remove('hidden'), 400);
    }
  } else {
    setTimeout(() => {
      firstPick.tile.classList.remove('flipped');
      secondPick.tile.classList.remove('flipped');
      firstPick = null;
      lock = false;
    }, 800);
  }
}

function addCollected(card) {
  const li = document.createElement('li');
  li.innerHTML = `<strong>${card.title}:</strong> ${card.desc}`;
  collectedList.appendChild(li);
}

newGameBtn.addEventListener('click', renderBoard);
winCloseBtn.addEventListener('click', () => winBanner.classList.add('hidden'));

renderBoard();
