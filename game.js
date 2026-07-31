import { expansionRegistry } from "./expansions/expansion-registry.js";
import { exportSave, importSaveFile, loadSave, recordLevelResult, resetSave, saveProgress } from "./save-system.js";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const canvas = $("#gameCanvas");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;
const G = 1850;
const keys = new Set();
const heldTouch = new Set();
const effects = [];
let save = loadSave();
let game = null;
let lastFrame = 0;
let audioCtx = null;
let musicTimer = null;

const screens = ["titleScreen", "menuScreen", "packsScreen", "gameScreen"];
const colors = {
  steel: "#5c6b7e",
  dark: "#172033",
  red: "#ff566d",
  blue: "#4db7ff",
  yellow: "#ffd257",
  green: "#5ee098",
  lava: "#ff8c48"
};

function makeGame(expansionId = "base_game", levelIndex = 0) {
  const expansion = expansionRegistry.find((pack) => pack.id === expansionId) || expansionRegistry[0];
  const level = expansion.levels[levelIndex] || expansion.levels[0];
  const packageBody = body(level.package.x, level.package.y, 34, 34, true);
  return {
    expansion,
    level,
    levelIndex,
    mode: "playing",
    startedAt: performance.now(),
    elapsed: 0,
    polarity: 1,
    shake: 0,
    flipFlash: 0,
    completionTimer: 0,
    player: { ...body(level.spawn.x, level.spawn.y, 32, 42, false), speed: 0, grounded: false, coyote: 0, jumpBuffer: 0, facing: 1, carry: false, squash: 0 },
    package: { ...packageBody, health: 3, carried: false, hitCooldown: 0, wobble: 0 },
    platforms: (level.platforms || []).map((p) => ({ ...p, baseX: p.x, baseY: p.y, targetX: p.x, targetY: p.y })),
    doors: (level.doors || []).map((d) => ({ ...d, open: false })),
    boxes: (level.boxes || []).map((b) => body(b.x, b.y, b.w, b.h, true)),
    hazards: [...(level.hazards || []), ...(level.movingHazards || [])].map((h) => ({ ...h, baseX: h.x, baseY: h.y, t: Math.random() * 3 })),
    plates: (level.plates || []).map((p) => ({ ...p, pressed: false })),
    message: levelIndex === 0 ? "A/D move, jump, E carries the package, F flips polarity." : ""
  };
}

function body(x, y, w, h, magnetic) {
  return { x, y, w, h, vx: 0, vy: 0, magnetic };
}

function showScreen(id) {
  screens.forEach((screen) => $(`#${screen}`).classList.toggle("hidden", screen !== id));
  $("#overlay").classList.add("hidden");
  $("#settingsPanel").classList.add("hidden");
  if (id !== "gameScreen") game = null;
  renderMenus();
}

function startLevel(expansionId, index) {
  game = makeGame(expansionId, index);
  showScreen("gameScreen");
  updateHud();
  ping(220, .04, "square");
  requestAnimationFrame(loop);
}

function loop(now) {
  if (!game) return;
  const dt = Math.min(.033, (now - (lastFrame || now)) / 1000);
  lastFrame = now;
  if (game.mode === "playing") update(dt);
  draw();
  requestAnimationFrame(loop);
}

function update(dt) {
  game.elapsed = (performance.now() - game.startedAt) / 1000;
  game.flipFlash = Math.max(0, game.flipFlash - dt * 2.6);
  game.shake = Math.max(0, game.shake - dt * 14);
  game.package.hitCooldown = Math.max(0, game.package.hitCooldown - dt);
  updatePlates();
  updateDoorsAndPlatforms(dt);
  updateHazards(dt);
  updatePlayer(dt);
  updatePackage(dt);
  game.boxes.forEach((box) => {
    applyMagnetism(box, dt, .8);
    moveBody(box, dt, solids());
    box.vx *= .985;
  });
  checkHazards();
  checkDelivery(dt);
  updateHud();
  for (let i = effects.length - 1; i >= 0; i--) {
    effects[i].life -= dt;
    if (effects[i].life <= 0) effects.splice(i, 1);
  }
}

function updatePlayer(dt) {
  const p = game.player;
  const left = keys.has("arrowleft") || keys.has("a") || heldTouch.has("left");
  const right = keys.has("arrowright") || keys.has("d") || heldTouch.has("right");
  const dir = (right ? 1 : 0) - (left ? 1 : 0);
  if (dir) p.facing = dir;
  const target = dir * 285;
  p.vx += (target - p.vx) * Math.min(1, dt * (dir ? 16 : 10));
  p.vy += G * dt;
  p.coyote = p.grounded ? .1 : Math.max(0, p.coyote - dt);
  p.jumpBuffer = Math.max(0, p.jumpBuffer - dt);
  if (p.jumpBuffer && p.coyote) {
    p.vy = -650;
    p.grounded = false;
    p.coyote = 0;
    p.jumpBuffer = 0;
    p.squash = .18;
    burst(p.x + p.w / 2, p.y + p.h, "#d8e8ff", 8);
    ping(420, .035, "triangle");
  }
  p.squash = Math.max(0, p.squash - dt);
  moveBody(p, dt, solids());
  if (p.carry) {
    const pack = game.package;
    pack.carried = true;
    pack.x += ((p.x + p.w / 2 + p.facing * 24) - (pack.x + pack.w / 2)) * .45;
    pack.y += ((p.y + 10) - pack.y) * .45;
    pack.vx = p.vx + p.facing * 38;
    pack.vy = p.vy * .35;
    pack.wobble += dt * 12;
  }
}

function updatePackage(dt) {
  const pack = game.package;
  if (pack.carried) return;
  applyMagnetism(pack, dt, 1);
  pack.vy += G * dt;
  const fallSpeed = pack.vy;
  moveBody(pack, dt, solids().concat(game.boxes));
  if (pack.grounded) pack.vx *= .94;
  else pack.vx *= .995;
  if (fallSpeed > 920 && pack.grounded) damagePackage("hard impact");
  pack.wobble += Math.abs(pack.vx) * dt * .03;
}

function moveBody(entity, dt, solidList) {
  const wasGrounded = entity.grounded;
  const enteringVy = entity.vy;
  entity.grounded = false;
  entity.x += entity.vx * dt;
  for (const s of solidList) {
    if (!s || s.open || !rects(entity, s)) continue;
    if (entity.vx > 0) entity.x = s.x - entity.w;
    if (entity.vx < 0) entity.x = s.x + s.w;
    entity.vx = 0;
  }
  entity.y += entity.vy * dt;
  for (const s of solidList) {
    if (!s || s.open || !rects(entity, s)) continue;
    if (entity.vy > 0) {
      entity.y = s.y - entity.h;
      entity.grounded = true;
      if (entity === game.player) {
        entity.coyote = .1;
        if (!wasGrounded && enteringVy > 80) burst(entity.x + entity.w / 2, entity.y + entity.h, "#b9c7d8", 7);
      }
    }
    if (entity.vy < 0) entity.y = s.y + s.h;
    entity.vy = 0;
  }
  entity.x = clamp(entity.x, 20, W - entity.w - 20);
  if (entity.y > H + 80) failLevel("The package line ate the delivery.");
}

function solids() {
  return [...(game.level.walls || []), ...game.platforms, ...game.doors.filter((d) => !d.open)];
}

function updateDoorsAndPlatforms(dt) {
  game.doors.forEach((door) => {
    if (typeof door.openPolarity === "string") door.open = game.plates.some((p) => p.id === door.openPolarity && p.pressed);
    else door.open = game.polarity === door.openPolarity;
  });
  game.platforms.forEach((p) => {
    const active = game.polarity === p.polarity ? 1 : 0;
    p.targetX = p.baseX + p.dx * active;
    p.targetY = p.baseY + p.dy * active;
    p.x += (p.targetX - p.x) * Math.min(1, dt * 4.5);
    p.y += (p.targetY - p.y) * Math.min(1, dt * 4.5);
  });
}

function updatePlates() {
  game.plates.forEach((plate) => {
    plate.pressed = [game.player, game.package, ...game.boxes].some((b) => rects(b, { ...plate, y: plate.y - 8, h: 20 }));
  });
}

function updateHazards(dt) {
  game.hazards.forEach((h) => {
    h.t += dt * (h.speed || 1);
    if (h.type === "crusher") {
      const offset = Math.sin(h.t * Math.PI) * h.distance;
      h.x = h.baseX + (h.axis === "x" ? offset : 0);
      h.y = h.baseY + (h.axis === "y" ? offset : 0);
    }
  });
}

function applyMagnetism(entity, dt, weight) {
  if (!entity.magnetic) return;
  for (const m of game.level.magnets || []) {
    const ex = entity.x + entity.w / 2;
    const ey = entity.y + entity.h / 2;
    const dx = m.x - ex;
    const dy = m.y - ey;
    const dist = Math.max(32, Math.hypot(dx, dy));
    if (dist > m.r) continue;
    const same = game.polarity === m.polarity;
    const force = (same ? -1 : 1) * (m.strength / dist) * (1 - dist / m.r) * 85 * weight;
    entity.vx += (dx / dist) * force * dt;
    entity.vy += (dy / dist) * force * dt;
    if (Math.random() < .2) effects.push({ x: ex, y: ey, vx: (Math.random() - .5) * 80, vy: -40, color: same ? colors.red : colors.blue, life: .35, r: 2 });
  }
}

function checkHazards() {
  for (const h of game.hazards) {
    const active = h.activePolarity == null || h.activePolarity === game.polarity;
    if (!active) continue;
    if (h.type === "spikes" || h.type === "electric" || h.type === "crusher") {
      if (rects(game.player, h)) failLevel("The robot got scrambled.");
      if (rects(game.package, h)) damagePackage(h.type);
      game.boxes.forEach((box) => { if (rects(box, h) && h.type !== "electric") box.vx *= -1; });
    }
  }
}

function checkDelivery(dt) {
  const zone = game.level.delivery;
  const ok = rects(game.player, zone) && rects(game.package, zone);
  game.completionTimer = ok ? game.completionTimer + dt : 0;
  if (game.completionTimer > .35) completeLevel();
}

function completeLevel() {
  if (game.mode !== "playing") return;
  game.mode = "complete";
  const earned = recordLevelResult(save, game.expansion.id, game.level.id, game.elapsed, game.package.health, game.level.targetTime);
  burst(game.level.delivery.x + game.level.delivery.w / 2, game.level.delivery.y, colors.yellow, 30);
  ping(660, .08, "sine");
  showOverlay("Delivery Complete", `Best stamp count for this route: ${earned}/3. Time ${game.elapsed.toFixed(1)}s. Target ${game.level.targetTime}s.`, "★".repeat(earned), [
    ["Next", () => startLevel(game.expansion.id, Math.min(game.levelIndex + 1, game.expansion.levels.length - 1)), "primary"],
    ["Levels", () => showScreen("menuScreen")],
    ["Restart", () => startLevel(game.expansion.id, game.levelIndex)]
  ]);
  if (game.levelIndex === game.expansion.levels.length - 1) {
    showOverlay("Factory Cleared", "Every base-game delivery is complete. Future expansion slots are already wired in.", "★★★", [
      ["Expansion Packs", () => showScreen("packsScreen"), "primary"],
      ["Title", () => showScreen("titleScreen")]
    ]);
  }
}

function failLevel(reason) {
  if (!game || game.mode !== "playing") return;
  game.mode = "failed";
  game.shake = 10;
  ping(95, .08, "sawtooth");
  window.setTimeout(() => game && startLevel(game.expansion.id, game.levelIndex), 550);
  game.message = reason;
}

function damagePackage(reason) {
  const pack = game.package;
  if (pack.hitCooldown > 0) return;
  pack.health -= 1;
  pack.hitCooldown = .8;
  pack.vx *= -.45;
  pack.vy = Math.min(pack.vy, -260);
  game.shake = 6;
  burst(pack.x + pack.w / 2, pack.y + pack.h / 2, colors.red, 14);
  ping(140, .05, "square");
  if (pack.health <= 0) failLevel(`Package destroyed by ${reason}.`);
}

function draw() {
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  const sx = save.settings.shake ? (Math.random() - .5) * game.shake : 0;
  const sy = save.settings.shake ? (Math.random() - .5) * game.shake : 0;
  ctx.translate(sx, sy);
  drawBackground();
  drawMagnets();
  drawRects(game.level.walls || [], colors.floor, "#344154");
  game.platforms.forEach((p) => drawRect(p, "#738091", "#3d4a5f"));
  game.doors.forEach((d) => { if (!d.open) drawDoor(d); });
  game.plates.forEach(drawPlate);
  game.boxes.forEach(drawBox);
  drawHazards();
  drawDelivery();
  drawPackage();
  drawPlayer();
  drawEffects();
  drawMessage();
  if (game.flipFlash > 0) {
    ctx.globalAlpha = game.flipFlash * .3;
    ctx.fillStyle = game.polarity === 1 ? colors.red : colors.blue;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#132033");
  grad.addColorStop(1, "#0d1420");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(255,255,255,.05)";
  ctx.lineWidth = 2;
  for (let x = 40; x < W; x += 80) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 70; y < H; y += 70) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.fillStyle = "rgba(255,210,87,.7)";
  for (let x = 60; x < W; x += 180) ctx.fillRect(x, 32, 18, 8);
}

function drawMagnets() {
  for (const m of game.level.magnets || []) {
    const activePull = game.polarity !== m.polarity;
    ctx.save();
    ctx.globalAlpha = .12;
    ctx.strokeStyle = activePull ? colors.blue : colors.red;
    for (let r = 36; r <= m.r; r += 28) {
      ctx.beginPath(); ctx.arc(m.x, m.y, r, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = m.polarity === 1 ? colors.red : colors.blue;
    roundRect(m.x - 26, m.y - 26, 52, 52, 10, true);
    ctx.fillStyle = "#101825";
    ctx.font = "900 20px Nunito";
    ctx.textAlign = "center";
    ctx.fillText(m.polarity === 1 ? "N" : "S", m.x, m.y + 7);
    ctx.restore();
  }
}

function drawHazards() {
  for (const h of game.hazards) {
    const active = h.activePolarity == null || h.activePolarity === game.polarity;
    ctx.globalAlpha = active ? 1 : .28;
    if (h.type === "spikes") {
      ctx.fillStyle = colors.lava;
      for (let x = h.x; x < h.x + h.w; x += 18) {
        ctx.beginPath(); ctx.moveTo(x, h.y + h.h); ctx.lineTo(x + 9, h.y); ctx.lineTo(x + 18, h.y + h.h); ctx.fill();
      }
    } else if (h.type === "electric") {
      ctx.fillStyle = "#1e2d43"; ctx.fillRect(h.x, h.y, h.w, h.h);
      ctx.strokeStyle = active ? colors.yellow : "#536272"; ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(h.x + h.w / 2, h.y + 4);
      for (let y = h.y + 12; y < h.y + h.h; y += 14) ctx.lineTo(h.x + (Math.random() > .5 ? 4 : h.w - 4), y);
      ctx.stroke();
    } else if (h.type === "crusher") {
      drawRect(h, "#a74657", "#642532");
      ctx.fillStyle = "#ffc4ce"; ctx.fillRect(h.x + 8, h.y + h.h - 8, h.w - 16, 5);
    }
    ctx.globalAlpha = 1;
  }
}

function drawDelivery() {
  const d = game.level.delivery;
  ctx.fillStyle = "#263851";
  roundRect(d.x, d.y, d.w, d.h, 8, true);
  ctx.fillStyle = colors.green;
  ctx.fillRect(d.x + 10, d.y + 10, d.w - 20, 10);
  ctx.fillStyle = "#bfffd8";
  ctx.font = "900 16px Nunito";
  ctx.textAlign = "center";
  ctx.fillText("SHIP", d.x + d.w / 2, d.y + d.h / 2 + 12);
}

function drawPlayer() {
  const p = game.player;
  const squish = p.squash ? 1 + p.squash : 1;
  ctx.save();
  ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
  ctx.scale(1 / squish, squish);
  ctx.fillStyle = "#dce9f7";
  roundRect(-p.w / 2, -p.h / 2, p.w, p.h, 9, true);
  ctx.fillStyle = "#223148";
  ctx.fillRect(-9, -5, 6, 6);
  ctx.fillRect(5, -5, 6, 6);
  ctx.fillStyle = game.polarity === 1 ? colors.red : colors.blue;
  ctx.fillRect(-12, 12, 24, 5);
  ctx.restore();
}

function drawPackage() {
  const p = game.package;
  ctx.save();
  ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
  ctx.rotate(Math.sin(p.wobble) * .08);
  ctx.fillStyle = p.health === 3 ? colors.yellow : p.health === 2 ? "#ffad57" : "#ff6b60";
  roundRect(-p.w / 2, -p.h / 2, p.w, p.h, 6, true);
  ctx.fillStyle = "rgba(37,36,25,.3)";
  ctx.fillRect(-p.w / 2 + 5, -3, p.w - 10, 6);
  if (p.health < 3) {
    ctx.strokeStyle = "#4a2b28"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-8, -11); ctx.lineTo(0, -2); ctx.lineTo(-4, 9); ctx.stroke();
  }
  if (p.health < 2) {
    ctx.beginPath(); ctx.moveTo(8, -12); ctx.lineTo(3, 1); ctx.lineTo(11, 12); ctx.stroke();
  }
  ctx.restore();
}

function drawBox(b) {
  drawRect(b, "#8795a6", "#4a586b");
  ctx.fillStyle = "#cdd8e5"; ctx.fillRect(b.x + 8, b.y + 8, b.w - 16, 6);
}

function drawDoor(d) {
  drawRect(d, game.polarity === 1 ? "#9e3549" : "#2d78ad", "#172033");
  ctx.fillStyle = "#f2f6fb";
  ctx.fillRect(d.x + 8, d.y + 10, d.w - 16, d.h - 20);
}

function drawPlate(p) {
  ctx.fillStyle = p.pressed ? colors.green : "#506075";
  roundRect(p.x, p.y, p.w, p.h, 5, true);
}

function drawEffects() {
  effects.forEach((e) => {
    e.x += e.vx / 60;
    e.y += e.vy / 60;
    ctx.globalAlpha = Math.max(0, e.life * 3);
    ctx.fillStyle = e.color;
    ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  });
}

function drawMessage() {
  if (!game.message) return;
  ctx.fillStyle = "rgba(10,16,25,.72)";
  roundRect(220, 20, 520, 44, 8, true);
  ctx.fillStyle = "#f4f7fb";
  ctx.font = "900 17px Nunito";
  ctx.textAlign = "center";
  ctx.fillText(game.message, W / 2, 49);
}

function drawRects(list, fill, stroke) {
  list.forEach((r) => drawRect(r, fill, stroke));
}

function drawRect(r, fill, stroke) {
  ctx.fillStyle = fill;
  roundRect(r.x, r.y, r.w, r.h, 5, true);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 3;
  roundRect(r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3, 5, false);
}

function roundRect(x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  fill ? ctx.fill() : ctx.stroke();
}

function renderMenus() {
  const base = expansionRegistry[0];
  $("#levelGrid").innerHTML = base.levels.map((level, index) => {
    const key = `${base.id}:${level.id}`;
    const stamps = Number(save.stamps[key]) || 0;
    const best = save.bestTimes[key] ? `${Number(save.bestTimes[key]).toFixed(1)}s` : "No time yet";
    return `<button class="level-card" data-level="${index}" type="button">
      <b>${index + 1}. ${level.name}</b>
      <small>Target ${level.targetTime}s · ${best}</small>
      <div class="stamps">${"★".repeat(stamps)}${"☆".repeat(3 - stamps)}</div>
    </button>`;
  }).join("");
  $("#packGrid").innerHTML = expansionRegistry.map((pack) => {
    const possible = pack.levels.length * 3;
    const earned = pack.levels.reduce((sum, level) => sum + (Number(save.stamps[`${pack.id}:${level.id}`]) || 0), 0);
    const pct = possible ? Math.round((earned / possible) * 100) : 0;
    const status = pack.availability === "installed" ? "Play" : pack.availability === "locked" ? "Locked" : "Coming soon";
    return `<button class="pack-card ${pack.availability !== "installed" ? "locked" : ""}" data-pack="${pack.id}" type="button">
      <span class="pack-icon">${pack.cover}</span>
      <b>${pack.name}</b>
      <small>${pack.description}</small>
      <small>${pack.levels.length} levels · ${pct}% · ${earned}/${possible || 0} stamps</small>
      <div class="stamps">${status}</div>
    </button>`;
  }).join("");
}

function updateHud() {
  $("#hudLevel").textContent = `Level ${game.levelIndex + 1}: ${game.level.name}`;
  $("#hudPack").textContent = game.expansion.name;
  $("#timer").textContent = game.elapsed.toFixed(1);
  $$(".durability i").forEach((heart, i) => heart.classList.toggle("broken", i >= game.package.health));
  $("#polarityBadge").textContent = game.polarity === 1 ? "NORTH" : "SOUTH";
  $("#polarityBadge").className = `polarity ${game.polarity === 1 ? "north" : "south"}`;
}

function showOverlay(title, text, stamps, actions) {
  $("#overlayTitle").textContent = title;
  $("#overlayText").textContent = text;
  $("#stampResult").textContent = stamps || "";
  $("#overlayActions").innerHTML = "";
  actions.forEach(([label, fn, klass]) => {
    const button = document.createElement("button");
    button.className = `btn ${klass || ""}`;
    button.textContent = label;
    button.addEventListener("click", fn);
    $("#overlayActions").append(button);
  });
  $("#overlay").classList.remove("hidden");
}

function pauseGame() {
  if (!game || game.mode !== "playing") return;
  game.mode = "paused";
  showOverlay("Paused", "Factory time is stopped. Your package is exactly as anxious as you left it.", "", [
    ["Resume", () => { $("#overlay").classList.add("hidden"); game.mode = "playing"; game.startedAt = performance.now() - game.elapsed * 1000; }, "primary"],
    ["Restart", () => startLevel(game.expansion.id, game.levelIndex)],
    ["Levels", () => showScreen("menuScreen")]
  ]);
}

function flipPolarity() {
  if (!game || game.mode !== "playing") return;
  game.polarity *= -1;
  game.flipFlash = 1;
  game.shake = 5;
  burst(W / 2, H / 2, game.polarity === 1 ? colors.red : colors.blue, 36);
  ping(game.polarity === 1 ? 260 : 180, .055, "sawtooth");
}

function pickupDrop() {
  if (!game || game.mode !== "playing") return;
  const p = game.player;
  const pack = game.package;
  if (p.carry) {
    p.carry = false;
    pack.carried = false;
    pack.vx = p.vx + p.facing * 260;
    pack.vy = Math.min(pack.vy, -150);
    ping(300, .03, "triangle");
    return;
  }
  const close = Math.hypot((p.x + p.w / 2) - (pack.x + pack.w / 2), (p.y + p.h / 2) - (pack.y + pack.h / 2)) < 72;
  if (close) {
    p.carry = true;
    pack.carried = true;
    ping(520, .03, "sine");
  }
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i++) effects.push({
    x, y,
    vx: (Math.random() - .5) * 240,
    vy: (Math.random() - .65) * 220,
    color,
    life: .25 + Math.random() * .5,
    r: 2 + Math.random() * 3
  });
}

function ping(freq, duration, type = "sine") {
  if (!save.settings.sound) return;
  audioCtx ||= new AudioContext();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = .045;
  gain.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + duration);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function startMusic() {
  stopMusic();
  if (!save.settings.music) return;
  let step = 0;
  musicTimer = window.setInterval(() => {
    if (!game || game.mode !== "playing") return;
    const notes = [110, 146.8, 164.8, 220];
    ping(notes[step++ % notes.length], .035, "sine");
  }, 640);
}

function stopMusic() {
  if (musicTimer) window.clearInterval(musicTimer);
  musicTimer = null;
}

function rects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function handleAction(action) {
  if (action === "jump" && game) game.player.jumpBuffer = .12;
  if (action === "pickup") pickupDrop();
  if (action === "flip") flipPolarity();
  if (action === "restart" && game) startLevel(game.expansion.id, game.levelIndex);
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowleft", "arrowright", "arrowup", " ", "a", "d", "w", "e", "f", "shift", "r", "escape"].includes(key)) event.preventDefault();
  keys.add(key);
  if (key === "w" || key === "arrowup" || key === " ") handleAction("jump");
  if (key === "e") handleAction("pickup");
  if (key === "f" || key === "shift") handleAction("flip");
  if (key === "r" && game) startLevel(game.expansion.id, game.levelIndex);
  if (key === "escape") pauseGame();
}, { passive: false });
document.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
document.addEventListener("touchmove", (event) => event.preventDefault(), { passive: false });
window.addEventListener("blur", pauseGame);

$("#playBtn").addEventListener("click", () => {
  const firstOpen = expansionRegistry[0].levels.findIndex((level, i) => i === 0 || save.completedLevels[`base_game:${expansionRegistry[0].levels[i - 1].id}`]);
  startLevel("base_game", Math.max(0, firstOpen));
  startMusic();
});
$("#levelSelectBtn").addEventListener("click", () => showScreen("menuScreen"));
$("#packsBtn").addEventListener("click", () => showScreen("packsScreen"));
$("#restartBtn").addEventListener("click", () => game && startLevel(game.expansion.id, game.levelIndex));
$("#pauseBtn").addEventListener("click", pauseGame);
$("#settingsOpenBtn").addEventListener("click", () => {
  $("#soundToggle").checked = save.settings.sound;
  $("#musicToggle").checked = save.settings.music;
  $("#shakeToggle").checked = save.settings.shake;
  $("#settingsPanel").classList.remove("hidden");
});
$("#settingsSaveBtn").addEventListener("click", () => {
  save.settings.sound = $("#soundToggle").checked;
  save.settings.music = $("#musicToggle").checked;
  save.settings.shake = $("#shakeToggle").checked;
  saveProgress(save);
  startMusic();
  $("#settingsPanel").classList.add("hidden");
});
$("#resetBtn").addEventListener("click", () => {
  if (confirm("Reset all Magnet Mayhem Delivery progress on this browser? A backup will be kept before deleting.")) {
    save = resetSave();
    renderMenus();
    $("#settingsPanel").classList.add("hidden");
  }
});
$("#exportBtn").addEventListener("click", () => exportSave(save));
$("#importInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    save = await importSaveFile(file);
    renderMenus();
    alert("Save imported.");
  } catch {
    alert("That save file was not valid JSON progress.");
  }
  event.target.value = "";
});
$("#fullscreenBtn").addEventListener("click", () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.();
});
$$("[data-screen]").forEach((button) => button.addEventListener("click", () => showScreen(button.dataset.screen)));
$("#levelGrid").addEventListener("click", (event) => {
  const button = event.target.closest("[data-level]");
  if (button) {
    startLevel("base_game", Number(button.dataset.level));
    startMusic();
  }
});
$("#packGrid").addEventListener("click", (event) => {
  const button = event.target.closest("[data-pack]");
  if (!button) return;
  const pack = expansionRegistry.find((item) => item.id === button.dataset.pack);
  if (pack?.availability === "installed" && pack.levels.length) {
    startLevel(pack.id, 0);
    startMusic();
  }
});
$$("[data-touch]").forEach((button) => {
  const name = button.dataset.touch;
  const down = (event) => {
    event.preventDefault();
    heldTouch.add(name);
    handleAction(name);
  };
  const up = (event) => {
    event.preventDefault();
    heldTouch.delete(name);
  };
  button.addEventListener("pointerdown", down);
  button.addEventListener("pointerup", up);
  button.addEventListener("pointercancel", up);
  button.addEventListener("pointerleave", up);
});

renderMenus();
showScreen("titleScreen");
