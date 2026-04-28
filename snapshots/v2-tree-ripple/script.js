const poem = "A quiet page turns into weather. Notes gather on the branches, loosen, fall, and keep their shape in the soft dust below.";

const canvas = document.querySelector("#treeCanvas");
const ctx = canvas.getContext("2d");
const links = [...document.querySelectorAll(".branch-link")];
const particles = [];
const ripples = [];
let poemIndex = 0;
let hoverFrames = 0;
let sway = 0;
let waterY = 0;

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
  waterY = rect.height * 0.88;
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

function drawWater() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const surface = waterY;

  ctx.save();
  const wash = ctx.createLinearGradient(0, surface - 24, 0, h);
  wash.addColorStop(0, "rgba(122, 142, 150, 0.02)");
  wash.addColorStop(0.32, "rgba(122, 142, 150, 0.08)");
  wash.addColorStop(1, "rgba(122, 142, 150, 0.15)");
  ctx.fillStyle = wash;
  ctx.beginPath();
  ctx.moveTo(w * 0.03, surface + 4);
  ctx.bezierCurveTo(w * 0.24, surface - 18, w * 0.76, surface - 18, w * 0.97, surface + 4);
  ctx.bezierCurveTo(w * 1.01, surface + 42, w * 0.86, h - 18, w * 0.5, h - 12);
  ctx.bezierCurveTo(w * 0.14, h - 18, w * -0.01, surface + 42, w * 0.03, surface + 4);
  ctx.fill();

  ctx.strokeStyle = "rgba(91, 110, 116, 0.24)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = w * 0.02; x <= w * 0.98; x += 8) {
    let y = surface;
    for (const ripple of ripples) {
      const dx = Math.abs(x - ripple.x);
      const ring = Math.abs(dx - ripple.radius);
      const influence = Math.max(0, 1 - ring / 38) * ripple.alpha;
      y += Math.sin(dx * 0.055 - ripple.radius * 0.08) * influence * 7;
    }
    if (x === w * 0.02) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  for (const ripple of ripples) {
    ctx.strokeStyle = `rgba(91, 110, 116, ${ripple.alpha * 0.32})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(ripple.x, surface + ripple.depth, ripple.radius, ripple.radius * 0.18, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(150, 91, 80, ${ripple.alpha * 0.11})`;
    ctx.beginPath();
    ctx.ellipse(ripple.x, surface + ripple.depth + 2, ripple.radius * 0.55, ripple.radius * 0.1, 0, 0, Math.PI * 2);
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
    this.inWater = false;
    this.rippled = false;
    this.floatOffset = Math.random() * Math.PI * 2;
    this.fade = 1;
    this.waterTime = 0;
    this.dead = false;
  }

  update() {
    if (this.inWater) {
      const elapsed = performance.now() - this.waterTime;
      this.x += this.vx * 0.08;
      this.y += Math.sin(performance.now() * 0.0018 + this.floatOffset) * 0.035;
      this.angle += Math.sin(performance.now() * 0.001 + this.floatOffset) * 0.002;
      if (elapsed > 8000) {
        this.fade = Math.max(0, 1 - ((elapsed - 8000) / 2000));
      }
      if (elapsed > 10000) {
        this.dead = true;
      }
      return;
    }

    this.vx += Math.sin((performance.now() * 0.001) + this.y * 0.04) * 0.012;
    this.vy = Math.min(this.vy + 0.035, 1.65);
    this.x += this.vx;
    this.y += this.vy;
    this.angle += 0.025 + Math.abs(this.vx) * 0.018;

    if (this.y >= waterY) {
      this.y = waterY + Math.random() * 6;
      this.vx *= 0.28;
      this.vy = 0;
      this.inWater = true;
      this.waterTime = performance.now();
      if (!this.rippled) {
        ripples.push({ x: this.x, radius: 4, alpha: 1, depth: Math.random() * 8 });
        this.rippled = true;
      }
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.inWater ? Math.sin(this.x) * 0.18 : this.angle);
    ctx.fillStyle = this.inWater ? `rgba(76, 75, 70, ${0.34 * this.fade})` : "rgba(76, 75, 70, 0.58)";
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
  if (poemIndex >= poem.length && particles.length === 0) {
    poemIndex = 0;
  }

  const target = hoverFrames > 0 ? Math.sin(performance.now() * 0.003) * 0.035 : 0;
  sway += (target - sway) * 0.055;
  if (hoverFrames > 0) {
    hoverFrames -= 1;
    spawnLetters();
  }

  drawTree();
  drawWater();
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    particle.update();
    if (particle.dead) {
      particles.splice(i, 1);
      continue;
    }
    particle.draw();
  }

  for (let i = ripples.length - 1; i >= 0; i--) {
    ripples[i].radius += 1.15;
    ripples[i].alpha *= 0.982;
    if (ripples[i].alpha < 0.035 || ripples[i].radius > canvas.clientWidth * 0.52) {
      ripples.splice(i, 1);
    }
  }

  links.forEach((link, index) => {
    const heightFactor = [0.7, 0.48, 0.32][index];
    const wind = Math.sin(performance.now() * 0.0016 + index * 1.8) * 2.2;
    const offset = -canvas.clientHeight * heightFactor * sway;
    link.style.transform = `translateX(${offset}px) rotate(${sway * 46 + wind}deg)`;
  });

  requestAnimationFrame(animate);
}

function triggerTree() {
  if (poemIndex >= poem.length && particles.length === 0) {
    poemIndex = 0;
  }
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
