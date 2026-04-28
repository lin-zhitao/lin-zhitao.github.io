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

const memoryLinks = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
  [6, 7], [7, 8], [8, 9], [6, 10], [10, 11], [11, 12], [12, 13],
  [14, 15], [15, 16], [16, 17], [14, 18], [18, 19], [19, 20], [20, 21],
  [4, 10], [10, 14], [3, 22], [22, 23], [23, 24],
  [7, 15], [11, 19], [12, 20], [2, 6], [5, 13]
];

const neurons = [
  { x: 342, y: 612, r: 18, hot: true, arms: [[330, 680, 320, 760], [300, 600, 215, 560], [382, 594, 500, 560], [350, 560, 385, 440], [320, 630, 250, 700], [370, 640, 470, 720]] },
  { x: 290, y: 455, r: 11, hot: false, arms: [[245, 430, 138, 310], [315, 420, 395, 255], [300, 500, 250, 560], [332, 446, 450, 375]] },
  { x: 475, y: 570, r: 10, hot: false, arms: [[405, 610, 338, 650], [520, 585, 640, 558], [488, 530, 570, 430], [455, 540, 380, 455]] },
  { x: 195, y: 365, r: 8, hot: false, arms: [[150, 340, 78, 274], [205, 400, 118, 480], [230, 350, 305, 525], [182, 320, 160, 220]] },
  { x: 520, y: 295, r: 8, hot: false, arms: [[570, 260, 632, 205], [485, 308, 450, 375], [540, 310, 688, 505], [505, 260, 532, 96]] }
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

function drawNeuronTendril(startX, startY, c1x, c1y, endX, endY, alpha, width, phase) {
  const t = performance.now() * 0.001;
  const wobble = Math.sin(t * 1.2 + phase) * Math.min(1, hoverFrames / 140) * 7;
  ctx.strokeStyle = `rgba(86, 91, 94, ${alpha})`;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(sx(startX), sy(startY));
  ctx.bezierCurveTo(
    sx(c1x + wobble),
    sy(c1y - wobble * 0.4),
    sx((c1x + endX) / 2 - wobble * 0.5),
    sy((c1y + endY) / 2 + wobble),
    sx(endX),
    sy(endY)
  );
  ctx.stroke();

  ctx.strokeStyle = `rgba(184, 78, 63, ${alpha * 0.18})`;
  ctx.lineWidth = Math.max(0.45, width * 0.35);
  ctx.stroke();
}

function drawTree() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const t = performance.now() * 0.001;
  const excitation = Math.min(1, hoverFrames / 140);
  ctx.save();
  ctx.clearRect(0, 0, w, h);
  ctx.translate(w / 2, h);
  ctx.transform(1, 0, sway, 1, 0, 0);
  ctx.translate(-w / 2, -h);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.strokeStyle = "rgba(74, 73, 68, 0.32)";
  drawBranch([[346, 835], [334, 710], [330, 612], [310, 505], [292, 420], [318, 312], [358, 130]], 4.8);
  ctx.strokeStyle = "rgba(184, 78, 63, 0.08)";
  drawBranch([[346, 835], [334, 710], [330, 612], [310, 505], [292, 420], [318, 312], [358, 130]], 7.2);

  ctx.strokeStyle = "rgba(74, 73, 68, 0.24)";
  drawBranch([[330, 612], [282, 565], [220, 510], [160, 458], [92, 405]], 2.8);
  drawBranch([[310, 505], [380, 465], [462, 410], [545, 350], [626, 290]], 2.8);
  drawBranch([[292, 420], [252, 360], [205, 300], [145, 245], [86, 202]], 2.2);

  for (let i = 0; i < 22; i++) {
    const base = branchSeeds[i % branchSeeds.length];
    const target = branchSeeds[(i * 7 + 5) % branchSeeds.length];
    ctx.strokeStyle = "rgba(86, 91, 94, 0.055)";
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(sx(base[0]), sy(base[1]));
    ctx.bezierCurveTo(
      sx((base[0] + target[0]) / 2 + Math.sin(i) * 70),
      sy((base[1] + target[1]) / 2 + Math.cos(i) * 44),
      sx((base[0] + target[0]) / 2 - Math.cos(i) * 40),
      sy((base[1] + target[1]) / 2 + Math.sin(i) * 38),
      sx(target[0]),
      sy(target[1])
    );
    ctx.stroke();
  }

  for (let n = 0; n < neurons.length; n++) {
    const neuron = neurons[n];
    for (let i = 0; i < neuron.arms.length; i++) {
      const [c1x, c1y, endX, endY] = neuron.arms[i];
      drawNeuronTendril(neuron.x, neuron.y, c1x, c1y, endX, endY, neuron.hot ? 0.23 : 0.17, neuron.hot ? 1.45 : 1.05, n * 2 + i);
    }
  }

  for (const [a, b] of memoryLinks.slice(0, 18)) {
    const from = branchSeeds[a];
    const to = branchSeeds[b];
    const pulse = Math.sin(t * 1.7 + a * 0.41 + b * 0.23) * excitation;
    ctx.strokeStyle = `rgba(74, 73, 68, ${0.045 + Math.max(0, pulse) * 0.07})`;
    ctx.lineWidth = 0.5 + Math.max(0, pulse) * 0.35;
    ctx.beginPath();
    ctx.moveTo(sx(from[0]), sy(from[1]));
    ctx.quadraticCurveTo(
      sx((from[0] + to[0]) / 2 + Math.sin(a + b) * 10),
      sy((from[1] + to[1]) / 2 + Math.cos(a - b) * 8),
      sx(to[0]),
      sy(to[1])
    );
    ctx.stroke();
  }

  for (let i = 0; i < neurons.length; i++) {
    const neuron = neurons[i];
    const breathe = Math.sin(t * 1.6 + i) * (0.8 + excitation * 1.4);
    const glow = ctx.createRadialGradient(sx(neuron.x), sy(neuron.y), 0, sx(neuron.x), sy(neuron.y), sx(neuron.r * 2.5));
    glow.addColorStop(0, neuron.hot ? "rgba(184, 78, 63, 0.42)" : "rgba(184, 78, 63, 0.2)");
    glow.addColorStop(0.36, "rgba(184, 78, 63, 0.12)");
    glow.addColorStop(1, "rgba(184, 78, 63, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(sx(neuron.x), sy(neuron.y), sx(neuron.r * 2.3 + excitation * 5), 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = neuron.hot ? "rgba(184, 78, 63, 0.72)" : "rgba(184, 78, 63, 0.38)";
    ctx.strokeStyle = "rgba(255, 238, 215, 0.16)";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(sx(neuron.x), sy(neuron.y), sx(neuron.r + breathe), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  for (let i = 0; i < branchSeeds.length; i++) {
    const p = branchSeeds[i];
    const breathe = Math.sin(t * 1.4 + i * 0.72) * (0.35 + excitation * 0.65);
    ctx.fillStyle = "rgba(48, 48, 45, 0.42)";
    ctx.beginPath();
    ctx.arc(sx(p[0]), sy(p[1] + Math.sin(t + i) * excitation * 2), sx(1.5 + breathe), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(116, 124, 134, 0.32)";
  ctx.font = `${Math.max(9, w * 0.02)}px Georgia, serif`;
  ctx.textAlign = "center";
  const labels = [
    ["memory", 195, 388],
    ["trace", 450, 352],
    ["聲", 335, 618],
    ["gesture", 520, 520]
  ];
  for (const [text, x, y] of labels) {
    ctx.fillText(text, sx(x), sy(y + Math.sin(t + x) * 2));
  }

  ctx.restore();
}

function drawWater() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const surface = waterY;

  ctx.save();
  ctx.strokeStyle = "rgba(91, 110, 116, 0.18)";
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
