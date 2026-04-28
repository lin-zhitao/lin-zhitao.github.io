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
let treeLeft = 0;
let treeWidth = 0;
let photoTouchY = null;

const branchSeeds = [
  [524, 760], [520, 676], [500, 590], [462, 512], [410, 458], [348, 420],
  [430, 450], [355, 392], [265, 345], [168, 306], [92, 286],
  [400, 445], [315, 455], [225, 475], [142, 520],
  [452, 500], [510, 465], [570, 405], [628, 340],
  [462, 512], [470, 392], [495, 290], [520, 205],
  [380, 430], [340, 315], [305, 225]
];

const mapleLeaves = [
  [148, 300, 6, -0.8], [178, 284, 7, 0.2], [215, 308, 6, 1.1], [250, 330, 7, -0.2],
  [288, 354, 6, 0.6], [318, 380, 7, -0.7], [354, 396, 6, 0.1], [390, 420, 7, 0.9],
  [468, 408, 7, -0.4], [505, 378, 6, 0.6], [548, 344, 7, 0.2], [590, 320, 6, -0.8],
  [308, 236, 5, 0.5], [342, 300, 6, -0.3], [500, 288, 5, 0.9],
  [245, 515, 5, -0.6], [380, 560, 4, 0.4], [535, 650, 6, -0.3], [238, 775, 5, 0.8]
].map(([x, y, size, angle], index) => ({
  x,
  y,
  size,
  angle,
  opacity: 1,
  baseAlpha: index > 15 ? 0.62 : 0.82
}));

const memoryLines = [
  [22, 205, 520, 760], [70, 260, 628, 340], [115, 524, 520, 205],
  [220, 160, 570, 405], [305, 225, 628, 340], [168, 306, 495, 290],
  [142, 520, 520, 676], [265, 345, 570, 405], [430, 450, 628, 340]
];

const treeLabels = [
  { text: "body", x: 238, y: 474, opacity: 1 },
  { text: "desire", x: 505, y: 398, opacity: 1 },
  { text: "error", x: 390, y: 548, opacity: 1 },
  { text: "形", x: 520, y: 560, opacity: 1 },
  { text: "聲", x: 600, y: 474, opacity: 1 },
  { text: "system", x: 300, y: 294, opacity: 1 }
];

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const parentRect = canvas.parentElement.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  treeLeft = parentRect.left - rect.left;
  treeWidth = parentRect.width;
  waterY = rect.height * 0.88;
}

function sx(x) {
  return treeLeft + x * treeWidth / 720;
}

function sy(y) {
  return y * canvas.clientHeight / 900;
}

function dx(x) {
  return x * treeWidth / 720;
}

function vx(x) {
  return (x - treeLeft) / treeWidth * 720;
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

function drawMapleLeaf(x, y, size, angle, alpha = 1) {
  ctx.save();
  ctx.translate(sx(x), sy(y));
  ctx.rotate(angle);
  ctx.scale(dx(size) / size, sy(size) / size);
  ctx.fillStyle = `rgba(173, 82, 70, ${alpha})`;
  ctx.strokeStyle = `rgba(129, 65, 58, ${alpha * 0.35})`;
  ctx.lineWidth = 0.45;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const r = i % 2 === 0 ? size : size * 0.42;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, size * 1.15);
  ctx.stroke();
  ctx.restore();
}

function drawSleepingCat(t, excitation) {
  const tail = Math.sin(t * 4.4) * 0.18 * excitation;
  ctx.save();
  ctx.translate(sx(660), sy(748));
  ctx.fillStyle = "rgba(30, 30, 28, 0.9)";
  ctx.strokeStyle = "rgba(30, 30, 28, 0.84)";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.ellipse(0, 0, dx(43), sy(19), -0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(dx(37), sy(-6), dx(14), sy(12), 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(dx(29), sy(-16));
  ctx.lineTo(dx(34), sy(-30));
  ctx.lineTo(dx(40), sy(-15));
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(dx(42), sy(-16));
  ctx.lineTo(dx(50), sy(-28));
  ctx.lineTo(dx(50), sy(-11));
  ctx.closePath();
  ctx.fill();

  ctx.lineWidth = dx(5);
  ctx.beginPath();
  ctx.moveTo(dx(-32), sy(0));
  ctx.bezierCurveTo(dx(-52), sy(12), dx(-58), sy(-13 + tail * 18), dx(-30), sy(-16 + tail * 10));
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
  ctx.beginPath();
  ctx.arc(dx(44), sy(-8), dx(1.2), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
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
  const treeCenter = treeLeft + treeWidth / 2;
  ctx.save();
  ctx.clearRect(0, 0, w, h);
  ctx.translate(treeCenter, h);
  ctx.transform(1, 0, sway, 1, 0, 0);
  ctx.translate(-treeCenter, -h);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.strokeStyle = "rgba(74, 73, 68, 0.18)";
  ctx.lineWidth = 0.55;
  for (const [x1, y1, x2, y2] of memoryLines) {
    const pulse = Math.max(0, Math.sin(t * 1.2 + x1 * 0.03)) * excitation;
    ctx.strokeStyle = `rgba(74, 73, 68, ${0.045 + pulse * 0.06})`;
    ctx.beginPath();
    ctx.moveTo(sx(x1), sy(y1));
    ctx.lineTo(sx(x2), sy(y2));
    ctx.stroke();
    ctx.fillStyle = `rgba(74, 73, 68, ${0.18 + pulse * 0.18})`;
    ctx.beginPath();
    ctx.arc(sx(x2), sy(y2), dx(1.3 + pulse), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(68, 68, 63, 0.34)";
  drawBranch([[545, 800], [545, 705], [522, 625], [488, 548], [430, 465], [352, 410], [258, 360], [128, 312]], 2.8);
  ctx.strokeStyle = "rgba(184, 78, 63, 0.06)";
  drawBranch([[545, 800], [545, 705], [522, 625], [488, 548], [430, 465], [352, 410], [258, 360], [128, 312]], 5.2);

  ctx.strokeStyle = "rgba(68, 68, 63, 0.26)";
  drawBranch([[520, 672], [500, 612], [462, 512], [452, 420], [494, 290], [520, 205]], 2);
  drawBranch([[488, 548], [420, 500], [322, 462], [205, 475], [108, 528]], 1.7);
  drawBranch([[430, 465], [378, 390], [338, 300], [305, 225]], 1.5);
  drawBranch([[352, 410], [285, 336], [218, 286], [152, 270], [78, 256]], 1.3);
  drawBranch([[462, 512], [520, 466], [574, 405], [628, 340]], 1.25);

  ctx.strokeStyle = "rgba(68, 68, 63, 0.16)";
  drawBranch([[258, 360], [210, 340], [172, 310], [120, 250]], 0.7);
  drawBranch([[322, 462], [275, 455], [238, 430], [196, 390]], 0.65);
  drawBranch([[452, 420], [420, 370], [390, 330], [350, 300]], 0.65);
  drawBranch([[574, 405], [608, 376], [662, 330], [704, 292]], 0.65);

  for (let i = 0; i < mapleLeaves.length; i++) {
    const leaf = mapleLeaves[i];
    const { x, y, size, angle } = leaf;
    if (leaf.opacity <= 0.01) continue;
    const drift = Math.sin(t * 1.1 + i * 0.9) * (1.4 + excitation * 1.8);
    drawMapleLeaf(
      x + drift,
      y + Math.cos(t + i) * excitation * 2,
      size,
      angle + drift * 0.025,
      leaf.baseAlpha * leaf.opacity
    );
  }

  for (let i = 0; i < branchSeeds.length; i++) {
    const p = branchSeeds[i];
    const breathe = Math.sin(t * 1.4 + i * 0.72) * (0.35 + excitation * 0.65);
    ctx.fillStyle = "rgba(48, 48, 45, 0.26)";
    ctx.beginPath();
    ctx.arc(sx(p[0]), sy(p[1] + Math.sin(t + i) * excitation * 1.4), dx(1.05 + breathe * 0.6), 0, Math.PI * 2);
    ctx.fill();
  }

  drawSleepingCat(t, excitation);

  ctx.font = `${Math.max(9, treeWidth * 0.02)}px Georgia, serif`;
  ctx.textAlign = "center";
  for (const label of treeLabels) {
    if (label.opacity <= 0.01) continue;
    ctx.fillStyle = `rgba(184, 78, 63, ${0.32 * label.opacity})`;
    ctx.fillText(label.text, sx(label.x), sy(label.y + Math.sin(t + label.x) * 2));
  }

  ctx.restore();
}

function drawWater() {
  const w = canvas.clientWidth;
  const surface = waterY;
  const waterStroke = (alpha, red = false) => {
    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    const color = red ? "150, 91, 80" : "91, 110, 116";
    gradient.addColorStop(0, `rgba(${color}, 0)`);
    gradient.addColorStop(0.16, `rgba(${color}, ${alpha * 0.32})`);
    gradient.addColorStop(0.5, `rgba(${color}, ${alpha})`);
    gradient.addColorStop(0.84, `rgba(${color}, ${alpha * 0.32})`);
    gradient.addColorStop(1, `rgba(${color}, 0)`);
    return gradient;
  };

  ctx.save();
  ctx.strokeStyle = waterStroke(0.11);
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(0, surface);
  ctx.lineTo(w, surface);
  ctx.stroke();

  ctx.strokeStyle = waterStroke(0.09);
  ctx.beginPath();
  ctx.moveTo(w * 0.70, surface - 6);
  ctx.bezierCurveTo(w * 0.72, surface + 16, w * 0.72, surface + 42, w * 0.74, surface + 68);
  ctx.stroke();

  if (ripples.length) {
    ctx.strokeStyle = waterStroke(0.18);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 8) {
      let y = surface;
      for (const ripple of ripples) {
        const dx = Math.abs(x - ripple.x);
        const ring = Math.abs(dx - ripple.radius);
        const influence = Math.max(0, 1 - ring / 38) * ripple.alpha;
        y += Math.sin(dx * 0.055 - ripple.radius * 0.08) * influence * 7;
      }
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  for (const ripple of ripples) {
    ctx.strokeStyle = waterStroke(ripple.alpha * 0.32);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(ripple.x, surface + ripple.depth, ripple.radius, ripple.radius * 0.18, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = waterStroke(ripple.alpha * 0.11, true);
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
    ctx.font = `${Math.max(11, treeWidth * 0.024)}px Georgia, serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.char, 0, 0);
    ctx.restore();
  }
}

class LabelParticle {
  constructor(sourceLabel) {
    this.sourceLabel = sourceLabel;
    this.sourceLabel.opacity = 0;
    this.x = sx(sourceLabel.x);
    this.y = sy(sourceLabel.y);
    this.text = sourceLabel.text;
    this.vx = (Math.random() - 0.5) * 0.45;
    this.vy = 0.18 + Math.random() * 0.36;
    this.angle = (Math.random() - 0.5) * 0.35;
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
      this.x += this.vx * 0.05;
      this.y += Math.sin(performance.now() * 0.0015 + this.floatOffset) * 0.028;
      this.angle += Math.sin(performance.now() * 0.001 + this.floatOffset) * 0.0016;
      if (elapsed > 8000) {
        this.fade = Math.max(0, 1 - ((elapsed - 8000) / 2000));
        this.sourceLabel.opacity = Math.min(1, 1 - this.fade);
      }
      if (elapsed > 10000) {
        this.sourceLabel.opacity = 1;
        this.dead = true;
      }
      return;
    }

    this.vx += Math.sin(performance.now() * 0.001 + this.y * 0.02) * 0.01;
    this.vy = Math.min(this.vy + 0.026, 1.25);
    this.x += this.vx;
    this.y += this.vy;
    this.angle += 0.006;

    if (this.y >= waterY) {
      this.y = waterY + Math.random() * 6;
      this.vx *= 0.22;
      this.vy = 0;
      this.inWater = true;
      this.waterTime = performance.now();
      if (!this.rippled) {
        ripples.push({ x: this.x, radius: 4, alpha: 0.82, depth: Math.random() * 8 });
        this.rippled = true;
      }
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.inWater ? Math.sin(this.x) * 0.12 : this.angle);
    ctx.fillStyle = `rgba(184, 78, 63, ${0.36 * this.fade})`;
    ctx.font = `${Math.max(8, treeWidth * 0.016)}px Georgia, serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.text, 0, 0);
    ctx.restore();
  }
}

class MapleLeafParticle {
  constructor(sourceLeaf) {
    this.sourceLeaf = sourceLeaf;
    this.sourceLeaf.opacity = 0;
    this.x = sx(sourceLeaf.x);
    this.y = sy(sourceLeaf.y);
    this.size = sourceLeaf.size;
    this.vx = -0.25 + Math.random() * 0.55;
    this.vy = 0.18 + Math.random() * 0.42;
    this.angle = sourceLeaf.angle + (Math.random() - 0.5) * 0.5;
    this.spin = (Math.random() - 0.5) * 0.035;
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
      this.x += this.vx * 0.06;
      this.y += Math.sin(performance.now() * 0.0014 + this.floatOffset) * 0.03;
      this.angle += this.spin * 0.08;
      if (elapsed > 8000) {
        this.fade = Math.max(0, 1 - ((elapsed - 8000) / 2000));
        this.sourceLeaf.opacity = Math.min(1, 1 - this.fade);
      }
      if (elapsed > 10000) {
        this.sourceLeaf.opacity = 1;
        this.dead = true;
      }
      return;
    }

    this.vx += Math.sin(performance.now() * 0.0012 + this.y * 0.02) * 0.018;
    this.vy = Math.min(this.vy + 0.018, 1.05);
    this.x += this.vx;
    this.y += this.vy;
    this.angle += this.spin;

    if (this.y >= waterY) {
      this.y = waterY + Math.random() * 5;
      this.vx *= 0.24;
      this.vy = 0;
      this.inWater = true;
      this.waterTime = performance.now();
      if (!this.rippled) {
        ripples.push({ x: this.x, radius: 5, alpha: 0.78, depth: Math.random() * 8 });
        this.rippled = true;
      }
    }
  }

  draw() {
    drawMapleLeaf(
      vx(this.x),
      this.y / canvas.clientHeight * 900,
      this.size,
      this.angle,
      0.58 * this.fade
    );
  }
}

function spawnLetters() {
  for (let i = 0; i < 7; i++) {
    if (poemIndex >= poem.length) return;
    const char = poem[poemIndex++];
    if (char !== " ") {
      const seed = branchSeeds[Math.floor(Math.random() * branchSeeds.length)];
      particles.push(new Letter(sx(seed[0]), sy(seed[1]), char));
      if (Math.random() < 0.18) {
        const availableLeaves = mapleLeaves.filter((leaf) => leaf.opacity > 0.98);
        if (availableLeaves.length) {
          const leaf = availableLeaves[Math.floor(Math.random() * availableLeaves.length)];
          particles.push(new MapleLeafParticle(leaf));
        }
      }
      if (Math.random() < 0.06) {
        const availableLabels = treeLabels.filter((label) => label.opacity > 0.98);
        if (availableLabels.length) {
          const label = availableLabels[Math.floor(Math.random() * availableLabels.length)];
          particles.push(new LabelParticle(label));
        }
      }
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
    const heightFactor = [0.7, 0.5, 0.34, 0.22][index] || 0.4;
    const wind = Math.sin(performance.now() * 0.0016 + index * 1.8) * 2.2;
    const offset = -canvas.clientHeight * heightFactor * sway;
    link.style.transform = `translateX(${offset}px) rotate(${sway * 46 + wind}deg)`;
  });

  requestAnimationFrame(animate);
}

function triggerTree() {
  if (document.body.classList.contains("photo-mode")) return;
  if (poemIndex >= poem.length && particles.length === 0) {
    poemIndex = 0;
  }
  hoverFrames = 180;
}

function isCatHit(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const catX = sx(660);
  const catY = sy(748);
  const radiusX = dx(92);
  const radiusY = sy(58);
  return ((x - catX) ** 2) / (radiusX ** 2) + ((y - catY) ** 2) / (radiusY ** 2) <= 1;
}

function enterPhotoMode() {
  hoverFrames = 0;
  particles.length = 0;
  ripples.length = 0;
  document.querySelectorAll(".memory-response .char").forEach((span, index) => {
    const delay = 2 + Math.random() * 0.16 + index * 0.01;
    span.style.animation = "";
    span.getBoundingClientRect();
    span.style.animationDelay = `${delay}s, ${delay + 5}s`;
  });
  document.body.classList.add("photo-mode");
}

function handleCanvasPointerDown(event) {
  if (isCatHit(event)) {
    enterPhotoMode();
    return;
  }
  triggerTree();
}

function handlePhotoModeWheel(event) {
  if (!document.body.classList.contains("photo-mode")) return;
  const scroller = document.querySelector(".memory-photo-scroll");
  if (!scroller) return;
  event.preventDefault();
  scroller.scrollTop += event.deltaY;
}

function handlePhotoTouchStart(event) {
  if (!document.body.classList.contains("photo-mode")) return;
  photoTouchY = event.touches[0]?.clientY ?? null;
}

function handlePhotoTouchMove(event) {
  if (!document.body.classList.contains("photo-mode") || photoTouchY === null) return;
  const scroller = document.querySelector(".memory-photo-scroll");
  if (!scroller) return;
  const nextY = event.touches[0]?.clientY ?? photoTouchY;
  event.preventDefault();
  scroller.scrollTop += photoTouchY - nextY;
  photoTouchY = nextY;
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
      } else if (el.classList.contains("memory-response")) {
        span.style.animationDelay = "0s, 0s";
      }
      el.append(span);
    }
  });
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("wheel", handlePhotoModeWheel, { passive: false });
window.addEventListener("touchstart", handlePhotoTouchStart, { passive: true });
window.addEventListener("touchmove", handlePhotoTouchMove, { passive: false });
canvas.addEventListener("pointerenter", triggerTree);
canvas.addEventListener("pointermove", triggerTree);
canvas.addEventListener("pointerdown", handleCanvasPointerDown);

splitFloatingText();
resizeCanvas();
animate();
