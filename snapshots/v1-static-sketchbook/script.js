const poem = "A quiet page turns into weather. Notes gather on the branches, loosen, fall, and keep their shape in the soft dust below.";

const canvas = document.querySelector("#treeCanvas");
const ctx = canvas.getContext("2d");
const links = [...document.querySelectorAll(".branch-link")];
const particles = [];
let poemIndex = 0;
let hoverFrames = 0;
let sway = 0;
let ground = [];

const branchSeeds = [
  [340, 760], [330, 680], [320, 600], [305, 525], [290, 455], [280, 395],
  [300, 500], [245, 430], [195, 365], [138, 310],
  [315, 525], [380, 455], [450, 375], [520, 295],
  [335, 610], [250, 560], [175, 525], [118, 480],
  [338, 650], [405, 610], [475, 570], [540, 530],
  [315, 420], [350, 340], [395, 255]
];

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ground = Array(Math.round(rect.width)).fill(rect.height * 0.94);
}

function sx(x) {
  return x * canvas.clientWidth / 720;
}

function sy(y) {
  return y * canvas.clientHeight / 900;
}

function drawBranch(points, width) {
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(sx(points[0][0]), sy(points[0][1]));
  for (let i = 1; i < points.length - 1; i += 2) {
    ctx.quadraticCurveTo(sx(points[i][0]), sy(points[i][1]), sx(points[i + 1][0]), sy(points[i + 1][1]));
  }
  ctx.stroke();
}

function drawTree() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.save();
  ctx.clearRect(0, 0, w, h);
  ctx.translate(w / 2, h);
  ctx.transform(1, 0, sway, 1, 0, 0);
  ctx.translate(-w / 2, -h);
  ctx.strokeStyle = "rgba(74, 73, 68, 0.78)";

  drawBranch([[350, 835], [330, 695], [322, 565], [312, 415], [330, 240], [360, 92]], 7);
  drawBranch([[327, 580], [260, 498], [180, 430], [108, 350], [78, 274]], 4);
  drawBranch([[312, 470], [392, 412], [478, 348], [570, 260], [632, 205]], 4);
  drawBranch([[334, 665], [275, 620], [190, 584], [92, 548], [42, 500]], 3);
  drawBranch([[338, 690], [412, 660], [506, 618], [640, 558], [688, 505]], 3);
  drawBranch([[318, 410], [282, 344], [238, 282], [182, 220], [150, 170]], 3);
  drawBranch([[325, 365], [365, 310], [435, 238], [500, 158], [532, 96]], 3);

  ctx.globalAlpha = 0.7;
  for (let i = 0; i < 34; i++) {
    const p = branchSeeds[i % branchSeeds.length];
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(sx(p[0] + Math.sin(i) * 18), sy(p[1] + Math.cos(i * 1.7) * 16), sx(2 + (i % 3)), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

class Letter {
  constructor(x, y, char) {
    this.x = x;
    this.y = y;
    this.char = char;
    this.vx = (Math.random() - 0.5) * 0.8;
    this.vy = 0.2 + Math.random() * 0.55;
    this.angle = Math.random() * Math.PI;
    this.resting = false;
  }

  update() {
    if (this.resting) return;
    this.vx += Math.sin((performance.now() * 0.001) + this.y * 0.04) * 0.012;
    this.vy = Math.min(this.vy + 0.035, 1.65);
    this.x += this.vx;
    this.y += this.vy;
    this.angle += 0.025 + Math.abs(this.vx) * 0.018;

    const gx = Math.max(0, Math.min(ground.length - 1, Math.round(this.x)));
    if (this.y >= ground[gx]) {
      this.y = ground[gx];
      this.resting = true;
      for (let i = -8; i <= 8; i++) {
        const ix = Math.max(0, Math.min(ground.length - 1, gx + i));
        ground[ix] -= (8 - Math.abs(i)) * 0.45;
      }
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.resting ? Math.sin(this.x) * 0.22 : this.angle);
    ctx.fillStyle = this.resting ? "rgba(76, 75, 70, 0.76)" : "rgba(76, 75, 70, 0.58)";
    ctx.font = `${Math.max(12, canvas.clientWidth * 0.029)}px Georgia, serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.char, 0, 0);
    ctx.restore();
  }
}

function spawnLetters() {
  for (let i = 0; i < 7; i++) {
    if (poemIndex >= poem.length) return;
    const char = poem[poemIndex++];
    if (char !== " ") {
      const seed = branchSeeds[Math.floor(Math.random() * branchSeeds.length)];
      particles.push(new Letter(sx(seed[0]), sy(seed[1]), char));
    }
  }
}

function animate() {
  const target = hoverFrames > 0 ? Math.sin(performance.now() * 0.003) * 0.035 : 0;
  sway += (target - sway) * 0.055;
  if (hoverFrames > 0) {
    hoverFrames -= 1;
    spawnLetters();
  }

  drawTree();
  particles.forEach((particle) => {
    particle.update();
    particle.draw();
  });

  links.forEach((link, index) => {
    const heightFactor = [0.7, 0.48, 0.32][index];
    const wind = Math.sin(performance.now() * 0.0016 + index * 1.8) * 2.2;
    const offset = -canvas.clientHeight * heightFactor * sway;
    link.style.transform = `translateX(${offset}px) rotate(${sway * 46 + wind}deg)`;
  });

  requestAnimationFrame(animate);
}

function triggerTree() {
  hoverFrames = 180;
}

function splitFloatingText() {
  document.querySelectorAll("[data-float-text]").forEach((el, blockIndex) => {
    const text = el.textContent;
    el.textContent = "";
    for (let i = 0; i < text.length; i++) {
      const span = document.createElement("span");
      span.className = "char";
      span.textContent = text[i];
      const enterDelay = blockIndex * 0.18 + Math.random() * 0.5 + i * 0.018;
      span.style.animationDelay = `${enterDelay}s`;
      if (el.classList.contains("intro-cta")) {
        span.style.animationDelay = `${enterDelay}s, ${enterDelay + 3.9 + Math.random() * 0.4}s`;
      }
      el.append(span);
    }
  });
}

window.addEventListener("resize", resizeCanvas);
canvas.addEventListener("pointerenter", triggerTree);
canvas.addEventListener("pointermove", triggerTree);
canvas.addEventListener("pointerdown", triggerTree);

splitFloatingText();
resizeCanvas();
animate();
