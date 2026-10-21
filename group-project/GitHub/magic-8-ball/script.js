const askScreen = document.getElementById('askScreen');
const ballScreen = document.getElementById('ballScreen');
const questionInput = document.getElementById('questionInput');
const askBtn = document.getElementById('askBtn');
const questionDisplay = document.getElementById('questionDisplay');
const ball = document.getElementById('ball');
const answerText = document.getElementById('answerText');
const hint = document.getElementById('hint');
const newQuestionBtn = document.getElementById('newQuestionBtn');

const ANSWERS = [
  "It is certain.",
  "It is decidedly so.",
  "Without a doubt.",
  "Yes definitely.",
  "You may rely on it.",
  "As I see it, yes.",
  "Most likely.",
  "Outlook good.",
  "Yes.",
  "Signs point to yes.",
  "Reply hazy, try again.",
  "Ask again later.",
  "Better not tell you now.",
  "Cannot predict now.",
  "Concentrate and ask again.",
  "Don't count on it.",
  "My reply is no.",
  "My sources say no.",
  "Outlook not so good.",
  "Very doubtful.",
];

let isShaking = false;

function startGame() {
  const question = questionInput.value.trim();
  if (!question) {
    questionInput.focus();
    return;
  }
  questionDisplay.textContent = `"${question}"`;
  askScreen.classList.add('hidden');
  ballScreen.classList.remove('hidden');
  answerText.textContent = '';
  answerText.classList.remove('visible');
  hint.textContent = 'Click the ball to get your answer';
}

function shakeBall() {
  if (isShaking) return;
  isShaking = true;
  answerText.classList.remove('visible');
  hint.textContent = 'Shaking...';
  ball.classList.add('shaking');

  setTimeout(() => {
    const answer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
    answerText.textContent = answer;
    answerText.classList.remove('size-md', 'size-sm');
    if (answer.length > 22) {
      answerText.classList.add('size-sm');
    } else if (answer.length > 14) {
      answerText.classList.add('size-md');
    }
    answerText.classList.add('visible');
    hint.textContent = 'Click the ball to ask again';
  }, 600);
}

ball.addEventListener('animationend', () => {
  ball.classList.remove('shaking');
  isShaking = false;
});

askBtn.addEventListener('click', startGame);

questionInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') startGame();
});

ball.addEventListener('click', shakeBall);

newQuestionBtn.addEventListener('click', () => {
  ballScreen.classList.add('hidden');
  askScreen.classList.remove('hidden');
  questionInput.value = '';
  questionInput.focus();
});

window.addEventListener('load', () => {
  questionInput.focus();
});
