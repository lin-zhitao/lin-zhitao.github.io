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
  [130, 310], [190, 285], [252, 326], [310, 278], [365, 348], [430, 304],
  [500, 282], [570, 330], [610, 265], [148, 430], [220, 410], [295, 452],
  [355, 405], [424, 462], [500, 420], [575, 448], [170, 565], [245, 535],
  [320, 588], [410, 542], [488, 590], [558, 548], [260, 220], [455, 208]
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

function drawInkTrace(points, width, alpha) {
  ctx.strokeStyle = `rgba(74, 73, 68, ${alpha})`;
  drawBranch(points, width);
  ctx.strokeStyle = `rgba(74, 73, 68, ${alpha * 0.2})`;
  drawBranch(points.map(([x, y], i) => [x + Math.sin(i * 1.7) * 12, y + Math.cos(i) * 8]), width + 7);
}

function drawScoreSystem() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.save();
  ctx.clearRect(0, 0, w, h);
  ctx.translate(w / 2, h);
  ctx.transform(1, 0, sway, 1, 0, 0);
  ctx.translate(-w / 2, -h);
  const t = performance.now() * 0.001;

  ctx.strokeStyle = "rgba(74, 73, 68, 0.12)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 7; i++) {
    const y = 230 + i * 58;
    ctx.beginPath();
    for (let x = 95; x <= 630; x += 18) {
      const wave = Math.sin(x * 0.02 + t + i * 0.7) * (2 + i * 0.18);
      if (x === 95) ctx.moveTo(sx(x), sy(y + wave));
      else ctx.lineTo(sx(x), sy(y + wave));
    }
    ctx.stroke();
  }

  drawInkTrace([[105, 340], [190, 260], [280, 330], [360, 258], [458, 340], [610, 266]], 2.2, 0.62);
  drawInkTrace([[132, 498], [250, 410], [350, 468], [450, 402], [596, 462]], 2.8, 0.58);
  drawInkTrace([[160, 610], [260, 548], [340, 600], [438, 530], [570, 578]], 2.1, 0.46);

  ctx.strokeStyle = "rgba(74, 73, 68, 0.2)";
  ctx.lineWidth = 1;
  const graph = [[190, 285], [252, 326], [365, 348], [430, 304], [500, 282], [575, 448], [488, 590], [320, 588], [220, 410], [190, 285]];
  ctx.beginPath();
  graph.forEach(([x, y], i) => {
    if (i === 0) ctx.moveTo(sx(x), sy(y));
    else ctx.lineTo(sx(x), sy(y));
  });
  ctx.stroke();

  for (let i = 0; i < branchSeeds.length; i++) {
    const p = branchSeeds[i];
    const pulse = Math.sin(t * 1.5 + i * 0.9) * 0.8;
    ctx.fillStyle = i === 12 || i === 18 ? "rgba(184, 78, 63, 0.78)" : "rgba(22, 22, 21, 0.86)";
    ctx.beginPath();
    ctx.arc(sx(p[0]), sy(p[1]), sx(3.2 + pulse), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(116, 124, 134, 0.72)";
  ctx.font = `${Math.max(10, w * 0.025)}px Georgia, serif`;
  ctx.textAlign = "center";
  ctx.fillText("sound", sx(365), sy(382));
  ctx.fillText("memory", sx(190), sy(260));
  ctx.fillText("gesture", sx(500), sy(255));
  ctx.fillText("trace", sx(320), sy(628));

  ctx.save();
  ctx.translate(sx(86), sy(445));
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "rgba(138, 151, 167, 0.68)";
  ctx.font = `${Math.max(9, w * 0.021)}px Courier New, monospace`;
  ctx.letterSpacing = "4px";
  ctx.fillText("LIVING SCORE", 0, 0);
  ctx.restore();

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

  drawScoreSystem();
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
