// visitor counter (purely cosmetic, stored per-browser)
const visitorCountEl = document.getElementById('visitorCount');
const visitorNumEl = document.getElementById('visitorNum');

let visits = parseInt(localStorage.getItem('smg_visits') || '1337042', 10);
visits += 1;
localStorage.setItem('smg_visits', String(visits));

visitorCountEl.textContent = String(visits).padStart(7, '0');
visitorNumEl.textContent = visits.toLocaleString();

// fake "offer expires in" countdown that loops forever
const countdownEl = document.getElementById('countdown');
let secondsLeft = 2 * 60 * 60;

function formatTime(totalSeconds) {
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

setInterval(() => {
  secondsLeft -= 1;
  if (secondsLeft < 0) secondsLeft = 2 * 60 * 60;
  countdownEl.textContent = formatTime(secondsLeft);
}, 1000);

// last updated date, styled like an old static page that "updates" every visit
const lastUpdatedEl = document.getElementById('lastUpdated');
lastUpdatedEl.textContent = new Date().toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric'
});

// order button gag
const orderBtn = document.getElementById('orderBtn');
const orderMessages = [
  "Processing order via dial-up... please wait...",
  "Adding 1 scoop of RAW POWER to your cart...",
  "Our one warehouse employee has been notified!",
  "Congratulations on your upcoming gains!",
];
let msgIndex = 0;

orderBtn.addEventListener('click', () => {
  orderBtn.textContent = orderMessages[msgIndex % orderMessages.length];
  msgIndex++;
  setTimeout(() => {
    orderBtn.textContent = '💥 ORDER NOW!! 💥';
  }, 1800);
});
