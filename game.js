const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

resize();
window.addEventListener("resize", resize);

let player, enemies, score, best, running;
let skill = null;
let skillCooldown = 0;

best = localStorage.getItem("best") || 0;
document.getElementById("best").innerText = best;

// ===== UI =====
document.getElementById("startBtn").addEventListener("pointerdown", () => {
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("skillSelect").classList.remove("hidden");
});

document.querySelectorAll("#skillSelect button").forEach(btn => {
  btn.addEventListener("pointerdown", () => {
    chooseSkill(btn.dataset.skill);
  });
});

// ===== GAME =====
function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}

function chooseSkill(s) {
  skill = s;
  document.getElementById("skillSelect").classList.add("hidden");
  reset();
  running = true;
  requestAnimationFrame(loop);
}

function reset() {
  player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: 14,
    speed: 4
  };
  enemies = [];
  score = 0;
  skillCooldown = 0;
}

function spawnEnemy() {
  let a = Math.random() * Math.PI * 2;
  enemies.push({
    x: canvas.width / 2 + Math.cos(a) * 400,
    y: canvas.height / 2 + Math.sin(a) * 400,
    r: 12,
    speed: 2.5
  });
}

function loop() {
  if (!running) return;

  ctx.clearRect(0,0,canvas.width,canvas.height);
  score++;
  document.getElementById("score").innerText = score;

  if (score % 40 === 0) spawnEnemy();

  drawPlayer();
  updateEnemies();

  requestAnimationFrame(loop);
}

function drawPlayer() {
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI*2);
  ctx.fillStyle = "white";
  ctx.fill();
}

function updateEnemies() {
  enemies.forEach(e => {
    let dx = player.x - e.x;
    let dy = player.y - e.y;
    let d = Math.hypot(dx, dy);
    e.x += dx/d * e.speed;
    e.y += dy/d * e.speed;

    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r, 0, Math.PI*2);
    ctx.fillStyle = "red";
    ctx.fill();

    if (d < e.r + player.r) gameOver();
  });
}

function gameOver() {
  running = false;
  if (score > best) {
    best = score;
    localStorage.setItem("best", best);
  }
  alert("Game Over\nScore: " + score);
  location.reload();
}

// ===== TOUCH MOVE =====
canvas.addEventListener("pointermove", e => {
  player.x = e.clientX;
  player.y = e.clientY;
});
