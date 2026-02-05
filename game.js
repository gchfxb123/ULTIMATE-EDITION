const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

resize();
window.addEventListener("resize", resize);

let player, enemies, score, best, running;
let skill = null;
let skillCooldown = 0;
let time = 0;
let shrinkRadius;

best = localStorage.getItem("best") || 0;
document.getElementById("best").innerText = best;

const keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}

function startGame() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("skillSelect").classList.remove("hidden");
  canvas.style.display = "block";
  document.getElementById("hud").style.display = "flex";
  reset();
  running = false; // 等选技能
}

function reset() {
  player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: 14,
    speed: 4,
    shield: false
  };
  enemies = [];
  score = 0;
  time = 0;
  skillCooldown = 0;
  shrinkRadius = Math.min(canvas.width, canvas.height) / 2;
}

function spawnEnemy(type = "normal") {
  let angle = Math.random() * Math.PI * 2;
  let dist = shrinkRadius + 80;
  enemies.push({
    x: canvas.width / 2 + Math.cos(angle) * dist,
    y: canvas.height / 2 + Math.sin(angle) * dist,
    r: type === "boss" ? 28 : 12,
    speed: type === "boss" ? 1.4 : 2.6,
    type
  });
}

function chooseSkill(s) {
  skill = s;

  if (s === "shield") {
    player.shield = true;
  }

  document.getElementById("skillSelect").classList.add("hidden");

  running = true;
  requestAnimationFrame(loop); // ✅ 关键修复点
}

function loop() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  time++;
  score++;

  document.getElementById("score").innerText = score;

  if (time % 50 === 0) spawnEnemy();
  if (score % 400 === 0) spawnEnemy("boss");

  shrinkRadius -= 0.025;

  drawArena();
  movePlayer();
  drawPlayer();
  updateEnemies();
  handleSkill();

  requestAnimationFrame(loop);
}

function drawArena() {
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, shrinkRadius, 0, Math.PI * 2);
  ctx.strokeStyle = "#333";
  ctx.stroke();

  let dx = player.x - canvas.width / 2;
  let dy = player.y - canvas.height / 2;
  if (Math.hypot(dx, dy) > shrinkRadius - player.r) {
    endGame();
  }
}

function movePlayer() {
  if (keys["w"] || keys["ArrowUp"]) player.y -= player.speed;
  if (keys["s"] || keys["ArrowDown"]) player.y += player.speed;
  if (keys["a"] || keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["d"] || keys["ArrowRight"]) player.x += player.speed;
}

function drawPlayer() {
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fillStyle = player.shield ? "#00ffff" : "#ffffff";
  ctx.fill();
}

function updateEnemies() {
  enemies.forEach((e, i) => {
    let dx = player.x - e.x;
    let dy = player.y - e.y;
    let d = Math.hypot(dx, dy);

    e.x += dx / d * e.speed;
    e.y += dy / d * e.speed;

    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
    ctx.fillStyle = e.type === "boss" ? "#8b00ff" : "#ff3333";
    ctx.fill();

    if (d < e.r + player.r) {
      if (player.shield) {
        player.shield = false;
        enemies.splice(i, 1);
      } else {
        endGame();
      }
    }
  });
}

function handleSkill() {
  if (skillCooldown > 0) {
    skillCooldown--;
    document.getElementById("cooldown").innerText = Math.ceil(skillCooldown / 60);
    return;
  }

  document.getElementById("cooldown").innerText = "Ready";

  if (keys[" "] && skill) {
    if (skill === "dash") {
      player.speed = 9;
      setTimeout(() => player.speed = 4, 250);
    }

    if (skill === "slow") {
      enemies.forEach(e => e.speed *= 0.5);
      setTimeout(() => enemies.forEach(e => e.speed *= 2), 300);
    }

    skillCooldown = 360;
  }
}

function endGame() {
  running = false;

  if (score > best) {
    best = score;
    localStorage.setItem("best", best);
  }

  alert("GAME OVER\nScore: " + score);
  location.reload();
}
