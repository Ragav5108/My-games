const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// SETTINGS
let gravity = 0.5;
let lift = -9;
let speed = 2;

let score = 0;
let highScore = localStorage.getItem("flappyHighScore") || 0;
let gameOver = false;
let frames = 0;

// SOUND
const clickSound = new Audio("click.mp3");
const gameOverSound = new Audio("gameover.mp3");

clickSound.volume = 0.5;
gameOverSound.volume = 0.7;

let playedGameOverSound = false;

// BIRD
const bird = {
  x: 80,
  y: canvas.height / 2,
  w: 30,
  h: 30,
  dy: 0
};

// PIPES
let pipes = [];

// BUTTON
let btn = { x: 0, y: 0, w: 200, h: 60 };

// INPUT (FIXED)
window.addEventListener("keydown", () => handleInput());

canvas.addEventListener("touchstart", handleInput, { passive: false });
canvas.addEventListener("click", handleInput);

function handleInput(e) {
  if (e && e.type === "touchstart") e.preventDefault();

  let rect = canvas.getBoundingClientRect();
  let clientX = e?.touches ? e.touches[0].clientX : e?.clientX;
  let clientY = e?.touches ? e.touches[0].clientY : e?.clientY;

  let mx = clientX ? clientX - rect.left : 0;
  let my = clientY ? clientY - rect.top : 0;

  if (gameOver) {
    if (
      mx >= btn.x &&
      mx <= btn.x + btn.w &&
      my >= btn.y &&
      my <= btn.y + btn.h
    ) {
      resetGame();
    }
  } else {
    // FLAP + SOUND
    bird.dy = lift;
    clickSound.currentTime = 0;
    clickSound.play();
  }
}

// RESET
function resetGame() {
  score = 0;
  pipes = [];
  bird.y = canvas.height / 2;
  bird.dy = 0;
  gameOver = false;
  frames = 0;
  playedGameOverSound = false;
}

// SPAWN PIPE
function spawnPipe() {
  let gap = 170;
  let topHeight = Math.random() * (canvas.height - gap - 100) + 50;

  pipes.push({
    x: canvas.width,
    top: topHeight,
    bottom: topHeight + gap,
    w: 60,
    passed: false
  });
}

// COLLISION
function collision(p) {
  return (
    bird.x < p.x + p.w &&
    bird.x + bird.w > p.x &&
    (bird.y < p.top || bird.y + bird.h > p.bottom)
  );
}

// DRAW BUTTON
function drawButton() {
  btn.w = 200;
  btn.h = 60;
  btn.x = canvas.width / 2 - btn.w / 2;
  btn.y = canvas.height / 2 + 100;

  ctx.fillStyle = "#00c853";
  ctx.fillRect(btn.x, btn.y, btn.w, btn.h);

  ctx.fillStyle = "white";
  ctx.font = "22px Arial";
  ctx.fillText("RESTART", btn.x + 45, btn.y + 38);
}

// LOOP
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameOver) {
    // SAVE HIGH SCORE
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("flappyHighScore", highScore);
    }

    // PLAY GAME OVER SOUND (ONCE)
    if (!playedGameOverSound) {
      gameOverSound.currentTime = 0;
      gameOverSound.play();
      playedGameOverSound = true;
    }

    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 80, canvas.height / 2);

    ctx.font = "22px Arial";
    ctx.fillText("Score: " + score, canvas.width / 2 - 50, canvas.height / 2 + 40);
    ctx.fillText("High Score: " + highScore, canvas.width / 2 - 90, canvas.height / 2 + 80);

    drawButton();
    return;
  }

  frames++;

  // BIRD
  bird.dy += gravity;
  bird.y += bird.dy;

  ctx.fillStyle = "yellow";
  ctx.fillRect(bird.x, bird.y, bird.w, bird.h);

  // SPAWN
  if (frames % 110 === 0) spawnPipe();

  // PIPES
  for (let i = 0; i < pipes.length; i++) {
    let p = pipes[i];
    p.x -= speed;

    ctx.fillStyle = "green";
    ctx.fillRect(p.x, 0, p.w, p.top);
    ctx.fillRect(p.x, p.bottom, p.w, canvas.height - p.bottom);

    // COLLISION
    if (collision(p)) {
      gameOver = true;
    }

    // SCORE
    if (!p.passed && (p.x + p.w) < bird.x) {
      score++;
      p.passed = true;
    }
  }

  pipes = pipes.filter(p => p.x > -60);

  // BOUNDS
  if (bird.y < 0 || bird.y + bird.h > canvas.height) {
    gameOver = true;
  }

  // UI
  ctx.fillStyle = "white";
  ctx.font = "22px Arial";
  ctx.fillText("Score: " + score, 20, 40);
  ctx.fillText("High: " + highScore, 20, 70);

  requestAnimationFrame(update);
}

// UNLOCK AUDIO (mobile fix)
document.body.addEventListener("touchstart", () => {
  clickSound.play().then(() => clickSound.pause());
}, { once: true });

update();