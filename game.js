/* Tiny Factory Drop - standalone browser factory merge game. */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const SAVE_KEY = "tinyFactoryDrop_v2";
const PRODUCT_VALUES = [0, 1, 4, 12, 35, 100];
const PRODUCT_NAMES = ["", "Scrap", "Parts", "Gadget", "Robot", "Super Machine"];
const PRODUCT_MARKS = [
  null,
  ["S", "P", "G", "R", "M"],
  ["C", "T", "L", "B", "K"],
  ["N", "B", "D", "A", "X"],
  ["H", "V", "F", "O", "E"],
  ["M", "S", "P", "Z", "Q"]
];

const FACTORIES = [
  { name: "Toy Factory", short: "TOY", theme: "toy", goal: 90, bonus: 1, mechanic: "Combo order progress grows faster after quick merges." },
  { name: "Candy Factory", short: "CANDY", theme: "candy", goal: 210, bonus: 1.35, mechanic: "Occasional bonus Scrap drops with each tap." },
  { name: "Robot Factory", short: "BOT", theme: "robot", goal: 470, bonus: 1.8, mechanic: "Robots trigger a short scanner speed boost." },
  { name: "Potion Factory", short: "POTION", theme: "potion", goal: 950, bonus: 2.45, mechanic: "Painted products can gain a bubbling value bonus." },
  { name: "Space Factory", short: "SPACE", theme: "space", goal: 1800, bonus: 3.35, mechanic: "Super Machines can launch a small token spark." }
];

const UPGRADES = {
  drop: { name: "Drop Speed", desc: "Shorter button cooldown", base: 10, max: 10 },
  speed: { name: "Belt Motor", desc: "Faster conveyor movement", base: 16, max: 10 },
  value: { name: "Sale Value", desc: "More coins from shipping", base: 22, max: 10 },
  quality: { name: "Better Materials", desc: "Chance to drop Parts", base: 34, max: 7 },
  auto: { name: "Auto Dropper", desc: "Drops while space is open", base: 70, max: 5 },
  machineChance: { name: "Machine Chance", desc: "More machine activations", base: 85, max: 8 },
  machinePower: { name: "Machine Power", desc: "Stronger machine results", base: 95, max: 8 },
  capacity: { name: "Belt Space", desc: "More products can fit", base: 45, max: 7 },
  order: { name: "Order Rewards", desc: "Bigger order payouts", base: 55, max: 8 }
};

const MACHINES = {
  paint: { name: "Paint Machine", icon: "PNT", desc: "Raises sale value", base: 58, max: 5 },
  upgrade: { name: "Upgrade Machine", icon: "UP", desc: "May raise product level", base: 96, max: 5 },
  duplicate: { name: "Duplicator", icon: "DUP", desc: "May copy a product", base: 140, max: 5 },
  scanner: { name: "Speed Scanner", icon: "SPD", desc: "High levels boost belt speed", base: 185, max: 5 }
};

const TOKEN_UPGRADES = {
  earn: { name: "Coin Earnings", desc: "+5% coins per level" },
  merge: { name: "Merge Value", desc: "Merged items ship for more" },
  drop: { name: "Drop Speed", desc: "-3% cooldown per level" },
  rare: { name: "Rare Products", desc: "+1.5% Parts chance per level" },
  order: { name: "Order Rewards", desc: "+8% order rewards per level" }
};

let state;
let items = [];
let nextId = 0;
let dragging = null;
let lastFrame = 0;
let cooldownUntil = 0;
let paused = false;
let started = false;
let audioCtx = null;
let musicTimer = null;
let saveTimer = null;
let autoTimer = null;
let speedBoostUntil = 0;
let lastMergeAt = 0;

function freshState() {
  return {
    coins: 14,
    tokens: 0,
    factory: 0,
    progress: 0,
    upgrades: Object.fromEntries(Object.keys(UPGRADES).map((key) => [key, 0])),
    machines: Object.fromEntries(Object.keys(MACHINES).map((key) => [key, 0])),
    order: makeOrder(0),
    lifetimeEarned: 14,
    sound: true,
    music: true,
    tutorial: 0,
    tutorialDone: false,
    prestige: Object.fromEntries(Object.keys(TOKEN_UPGRADES).map((key) => [key, 0]))
  };
}

function load() {
  const base = freshState();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    state = raw ? { ...base, ...JSON.parse(raw) } : base;
  } catch (error) {
    console.warn("Tiny Factory Drop save could not be loaded; starting fresh.", error);
    state = base;
  }
  state.upgrades = { ...base.upgrades, ...state.upgrades };
  state.machines = { ...base.machines, ...state.machines };
  state.prestige = { ...base.prestige, ...state.prestige };
  state.order = { ...base.order, ...state.order };
  state.factory = clamp(Number(state.factory) || 0, 0, FACTORIES.length - 1);
  state.coins = Math.max(0, Number(state.coins) || 0);
  state.tokens = Math.max(0, Number(state.tokens) || 0);
  state.progress = Math.max(0, Number(state.progress) || 0);
}

function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    $("#saveStatus").textContent = "Saved";
    window.clearTimeout(save.statusTimer);
    save.statusTimer = window.setTimeout(() => $("#saveStatus").textContent = "Autosaving", 1400);
  } catch (error) {
    console.warn("Tiny Factory Drop save failed.", error);
    $("#saveStatus").textContent = "Save failed";
  }
}

function startGame() {
  if (started) return;
  started = true;
  load();
  $("#startScreen").classList.add("hidden");
  $("#gameScreen").classList.remove("hidden");
  renderAll();
  if (!state.tutorialDone) showTutorial();
  startMusic();
  saveTimer = window.setInterval(save, 8000);
  autoTimer = window.setInterval(autoDropTick, 350);
  requestAnimationFrame(loop);
}

function renderAll() {
  const factory = FACTORIES[state.factory];
  const app = $("#app");
  app.className = `theme-${factory.theme}`;
  $("#factoryName").textContent = factory.name;
  $("#buildingLabel").innerHTML = `${factory.short}<br>WORKS`;
  $("#coinCount").textContent = formatNumber(state.coins);
  $("#tokenCount").textContent = formatNumber(state.tokens);
  $("#factoryMechanicText").textContent = `${factory.name}: ${factory.mechanic}`;
  $("#factoryFill").style.width = `${Math.min(100, (state.progress / factory.goal) * 100)}%`;
  $("#factoryProgressText").textContent = `${Math.floor(state.progress)} / ${factory.goal} shipments`;
  $("#factoryList").innerHTML = FACTORIES.map((item, index) => {
    const className = index === state.factory ? "current" : index < state.factory ? "unlocked" : "";
    return `<span class="factory-dot ${className}" title="${item.name}">${index + 1}</span>`;
  }).join("");
  renderOrder();
  renderUpgrades();
  renderMachines();
  renderAudioButtons();
}

function renderOrder() {
  const order = state.order;
  $("#orderTitle").textContent = order.done ? "Order ready to claim" : orderText(order);
  $("#orderProgress").textContent = `${Math.floor(order.progress)} / ${order.target} - reward ${formatNumber(order.reward)} coins + ${order.points} token`;
  $("#orderFill").style.width = `${Math.min(100, (order.progress / order.target) * 100)}%`;
  $("#claimOrderBtn").classList.toggle("hidden", !order.done);
}

function renderUpgrades() {
  $("#upgradeList").innerHTML = Object.entries(UPGRADES).map(([key, upgrade]) => {
    const level = state.upgrades[key];
    const maxed = level >= upgrade.max;
    const price = cost(upgrade.base, level);
    const disabled = maxed || state.coins < price ? "disabled" : "";
    const label = maxed ? "Maxed" : `Buy ${formatNumber(price)}`;
    return `
      <div class="upgrade-row">
        <b>${upgrade.name} Lv.${level}</b>
        <small>${upgrade.desc} - ${maxed ? "maximum reached" : nextBenefit(key, level + 1)}</small>
        <button class="buy-btn" data-buy-upgrade="${key}" ${disabled} type="button">${label}</button>
      </div>`;
  }).join("");
}

function renderMachines() {
  $("#machineList").innerHTML = Object.entries(MACHINES).map(([key, machine]) => {
    const level = state.machines[key];
    const maxed = level >= machine.max;
    const price = cost(machine.base, level);
    const disabled = maxed || state.coins < price ? "disabled" : "";
    return `
      <div class="machine-row">
        <span class="machine-icon">${machine.icon}</span>
        <div><b>${machine.name} Lv.${level}</b><small>${machine.desc}</small></div>
        <button class="buy-btn" data-buy-machine="${key}" ${disabled} type="button">${maxed ? "Maxed" : `Buy ${formatNumber(price)}`}</button>
      </div>`;
  }).join("");
  $("#paintLabel").textContent = state.machines.paint ? `x${paintMultiplier().toFixed(2)}` : "Locked";
  $("#upgradeLabel").textContent = state.machines.upgrade ? `${Math.round(upgradeChance() * 100)}%` : "Locked";
  $("#duplicateLabel").textContent = state.machines.duplicate ? `${Math.round(duplicateChance() * 100)}%` : "Locked";
  $("#scannerLabel").textContent = state.machines.scanner ? `${scannerSeconds().toFixed(1)}s` : "Locked";
  Object.keys(MACHINES).forEach((key) => {
    $(`.machine[data-machine="${key}"]`).classList.toggle("locked", !state.machines[key]);
  });
}

function renderAudioButtons() {
  $("#soundBtn").textContent = state.sound ? "SFX" : "OFF";
  $("#musicBtn").textContent = state.music ? "MUS" : "OFF";
}

function nextBenefit(key, level) {
  const benefits = {
    drop: `${dropCooldown(level).toFixed(2)}s cooldown`,
    speed: `+${level * 12}% belt speed`,
    value: `+${level * 10}% sale coins`,
    quality: `${level * 8}% Parts chance`,
    auto: `auto every ${autoInterval(level).toFixed(1)}s`,
    machineChance: `+${level * 10}% machine odds`,
    machinePower: `+${level * 9}% machine strength`,
    capacity: `${capacity(level)} product spaces`,
    order: `+${level * 12}% order coins`
  };
  return benefits[key];
}

function cost(base, level) {
  return Math.floor(base * Math.pow(1.58, level));
}

function dropCooldown(level = state.upgrades.drop) {
  const prestige = 1 - state.prestige.drop * 0.03;
  return Math.max(0.34, (1.08 - level * 0.075) * Math.max(0.65, prestige));
}

function autoInterval(level = state.upgrades.auto) {
  return Math.max(1.15, 4.2 - level * 0.45);
}

function capacity(level = state.upgrades.capacity) {
  return 8 + level;
}

function dropItem(force = false) {
  const now = performance.now();
  const cooldownMs = dropCooldown() * 1000;
  if (!force && now < cooldownUntil) return false;
  if (items.length >= capacity()) {
    setBlocked(true);
    return false;
  }

  if (!force) cooldownUntil = now + cooldownMs;
  const rareChance = state.upgrades.quality * 0.08 + state.prestige.rare * 0.015;
  const level = Math.random() < rareChance ? 2 : 1;
  spawnProduct(level, 15 + Math.random() * 9, 54 + Math.random() * 72, { fromMerge: false });

  if (state.factory >= 1 && Math.random() < 0.09 && items.length < capacity()) {
    spawnProduct(1, 12, 112, { fromMerge: false });
    floatText("Candy bonus", null, 62, 122);
  }

  beep(280, 0.08);
  tutorialEvent("drop");
  renderAll();
  return true;
}

function spawnProduct(level, x, y, options = {}) {
  if (items.length >= capacity()) return null;
  const product = {
    id: ++nextId,
    level,
    x,
    y,
    valueBonus: options.valueBonus || 1,
    processed: {},
    born: performance.now()
  };
  const el = document.createElement("div");
  el.className = `product lvl${level}`;
  el.dataset.id = String(product.id);
  product.el = el;
  updateProductElement(product);
  el.style.left = `${product.x}px`;
  el.style.top = `${product.y}px`;
  el.addEventListener("pointerdown", beginDrag);
  $("#products").appendChild(el);
  items.push(product);
  if (options.fromMerge) el.classList.add("pop");
  return product;
}

function updateProductElement(product) {
  product.el.className = `product lvl${product.level}${product.el.classList.contains("dragging") ? " dragging" : ""}`;
  product.el.dataset.level = String(product.level);
  const marks = PRODUCT_MARKS[state.factory] || PRODUCT_MARKS[0];
  product.el.dataset.mark = marks[product.level - 1] || PRODUCT_NAMES[product.level][0] || "?";
  product.el.setAttribute("aria-label", PRODUCT_NAMES[product.level]);
}

function beginDrag(event) {
  if (paused) return;
  const product = items.find((item) => item.id === Number(event.currentTarget.dataset.id));
  if (!product) return;
  const rect = product.el.getBoundingClientRect();
  dragging = {
    product,
    pointerId: event.pointerId,
    dx: event.clientX - rect.left,
    dy: event.clientY - rect.top
  };
  product.el.setPointerCapture?.(event.pointerId);
  product.el.classList.add("dragging");
  event.preventDefault();
}

window.addEventListener("pointermove", (event) => {
  if (!dragging) return;
  const area = $("#products").getBoundingClientRect();
  const size = productSize();
  const product = dragging.product;
  product.x = clamp(event.clientX - area.left - dragging.dx, 0, area.width - size);
  product.y = clamp(event.clientY - area.top - dragging.dy, 0, area.height - size);
  placeProduct(product);
  event.preventDefault();
}, { passive: false });

window.addEventListener("pointerup", () => {
  if (!dragging) return;
  const product = dragging.product;
  product.el.classList.remove("dragging");
  dragging = null;
  const match = items.find((item) => item !== product && item.level === product.level && distance(item, product) < productSize() * 0.86);
  if (match) mergeProducts(product, match);
  tutorialEvent("drag");
});

function mergeProducts(a, b) {
  if (!items.includes(a) || !items.includes(b) || a.level !== b.level) return;
  if (a.level >= 5) {
    floatText("Max level", null, a.x, a.y);
    return;
  }
  const level = a.level + 1;
  const x = (a.x + b.x) / 2;
  const y = (a.y + b.y) / 2;
  const quick = performance.now() - lastMergeAt < 2200;
  lastMergeAt = performance.now();
  removeProduct(a);
  removeProduct(b);
  const merged = spawnProduct(level, x, y, { fromMerge: true, valueBonus: 1 + state.prestige.merge * 0.04 });
  burst(x + 24, y + 24, "#ffd66a");
  floatText(PRODUCT_NAMES[level], null, x + 20, y);
  beep(450 + level * 100, 0.1);
  tally("merge", state.factory === 0 && quick ? 2 : 1);
  tally(`create${level}`, 1);
  tutorialEvent("merge");
  if (state.factory >= 2 && level >= 4) triggerScanner();
  if (merged) processMachines(merged);
  save();
}

function removeProduct(product) {
  product.el?.remove();
  items = items.filter((item) => item !== product);
}

function placeProduct(product) {
  product.el.style.left = `${product.x}px`;
  product.el.style.top = `${product.y}px`;
}

function loop(time) {
  const dt = Math.min(50, time - lastFrame || 16);
  lastFrame = time;
  if (!paused) {
    moveProducts(dt);
    updateCooldown();
  }
  requestAnimationFrame(loop);
}

function moveProducts(dt) {
  const belt = $("#belt");
  const beltWidth = $("#products").clientWidth;
  const boost = performance.now() < speedBoostUntil ? 1.75 : 1;
  const speed = (0.032 + state.upgrades.speed * 0.0042) * (1 + state.factory * 0.045) * boost;
  for (const product of [...items]) {
    if (dragging?.product !== product) {
      product.x += speed * dt;
      avoidPermanentOverlap(product);
      placeProduct(product);
    }
    processMachines(product);
    if (product.x > beltWidth - productSize() * 0.64) sellProduct(product);
  }
  const full = items.length >= capacity();
  setBlocked(full);
  belt.classList.toggle("slow", full && performance.now() >= speedBoostUntil);
}

function avoidPermanentOverlap(product) {
  for (const other of items) {
    if (other === product || dragging?.product === other || product.level === other.level) continue;
    if (distance(product, other) < productSize() * 0.72) {
      product.y += product.y < other.y ? -0.28 : 0.28;
      product.y = clamp(product.y, 0, $("#products").clientHeight - productSize());
    }
  }
}

function processMachines(product) {
  const width = $("#products").clientWidth || 1;
  const pos = product.x / width;
  const stops = { paint: 0.2, upgrade: 0.42, duplicate: 0.63, scanner: 0.84 };
  for (const [key, at] of Object.entries(stops)) {
    if (pos > at && !product.processed[key] && state.machines[key]) {
      product.processed[key] = true;
      activateMachine(key);
      if (key === "paint") applyPaint(product);
      if (key === "upgrade") applyUpgradeMachine(product);
      if (key === "duplicate") applyDuplicator(product);
      if (key === "scanner" && product.level >= 4) triggerScanner();
    }
  }
}

function applyPaint(product) {
  product.valueBonus *= paintMultiplier();
  if (state.factory >= 3 && Math.random() < 0.16) {
    product.valueBonus *= 1.35;
    floatText("Bubble bonus", null, product.x, product.y);
  }
}

function applyUpgradeMachine(product) {
  if (product.level >= 5) return;
  if (Math.random() < upgradeChance()) {
    product.level += 1;
    updateProductElement(product);
    product.el.classList.add("pop");
    burst(product.x + 25, product.y + 25, "#bca1ff");
    floatText("Upgraded", null, product.x, product.y);
    tally(`create${product.level}`, 1);
  }
}

function applyDuplicator(product) {
  if (items.length >= capacity()) return;
  if (Math.random() < duplicateChance()) {
    spawnProduct(product.level, Math.max(0, product.x - 48), clamp(product.y + 12, 0, $("#products").clientHeight - productSize()), { valueBonus: product.valueBonus });
    floatText("Copy", null, product.x, product.y);
  }
}

function activateMachine(key) {
  const el = $(`.machine[data-machine="${key}"]`);
  el.classList.remove("active");
  void el.offsetWidth;
  el.classList.add("active");
  beep(key === "paint" ? 390 : key === "upgrade" ? 640 : key === "duplicate" ? 530 : 760, 0.07);
}

function paintMultiplier() {
  return 1.08 + state.machines.paint * 0.1 + state.upgrades.machinePower * 0.012;
}

function upgradeChance() {
  return Math.min(0.55, 0.045 + state.machines.upgrade * 0.035 + state.upgrades.machineChance * 0.01);
}

function duplicateChance() {
  return Math.min(0.42, 0.03 + state.machines.duplicate * 0.028 + state.upgrades.machineChance * 0.008);
}

function scannerSeconds() {
  return 1.8 + state.machines.scanner * 0.35 + state.upgrades.machinePower * 0.08;
}

function triggerScanner() {
  if (!state.machines.scanner && state.factory < 2) return;
  speedBoostUntil = Math.max(speedBoostUntil, performance.now() + scannerSeconds() * 1000);
  activateMachine("scanner");
  floatText("Speed boost", null, $("#products").clientWidth * 0.75, 22);
}

function sellProduct(product) {
  if (!items.includes(product)) return;
  let gain = PRODUCT_VALUES[product.level];
  gain *= FACTORIES[state.factory].bonus;
  gain *= 1 + state.upgrades.value * 0.1;
  gain *= 1 + state.prestige.earn * 0.05;
  gain *= product.valueBonus || 1;
  gain = Math.max(1, Math.ceil(gain));
  state.coins += gain;
  state.lifetimeEarned += gain;
  state.progress += product.level >= 4 ? 2 : 1;
  if (state.factory >= 4 && product.level === 5 && Math.random() < 0.05) {
    state.tokens += 1;
    floatText("+1 token spark", "coin", product.x, product.y - 18);
  }
  removeProduct(product);
  floatText(`+${gain}`, "coin", $("#products").clientWidth - 68, product.y + 12);
  burst($("#products").clientWidth - 32, product.y + 24, "#ffda63");
  beep(800, 0.08);
  tally("earn", gain);
  tally(`sell${product.level}`, 1);
  tutorialEvent("sell");
  checkFactoryUnlock();
  renderAll();
}

function checkFactoryUnlock() {
  const factory = FACTORIES[state.factory];
  if (state.progress >= factory.goal && state.factory < FACTORIES.length - 1) {
    state.factory += 1;
    state.progress = 0;
    speedBoostUntil = performance.now() + 1800;
    floatText(`${FACTORIES[state.factory].name} unlocked`, "coin", 260, 40);
    burst(310, 80, "#ffd66a");
    shake();
    beep(980, 0.22);
  }
}

function makeOrder(factoryIndex) {
  const n = Math.min(factoryIndex, 4);
  const orders = [
    { type: "merge", target: 5 + n * 2, reward: 28 + n * 36, points: 1 },
    { type: "sell2", target: 4 + n * 2, reward: 34 + n * 40, points: 1 },
    { type: "create3", target: 2 + n, reward: 44 + n * 48, points: 1 },
    { type: "sell4", target: 1 + Math.floor(n / 2), reward: 70 + n * 70, points: 1 + Math.floor(n / 2) },
    { type: "earn", target: 55 + n * 80, reward: 42 + n * 55, points: 1 }
  ];
  const picked = orders[Math.floor(Math.random() * orders.length)];
  return { ...picked, progress: 0, done: false };
}

function orderText(order) {
  const text = {
    merge: "Perform product merges",
    sell2: "Sell Parts",
    create3: "Create Gadgets",
    sell4: "Sell Robots",
    earn: "Earn coins"
  };
  return text[order.type] || "Customer order";
}

function tally(kind, amount = 1) {
  const order = state.order;
  if (order.done) return;
  if (order.type !== kind) return;
  order.progress = Math.min(order.target, order.progress + amount);
  if (order.progress >= order.target) {
    order.done = true;
    floatText("Order complete", "coin", 62, 72);
    beep(900, 0.16);
  }
  renderOrder();
}

function claimOrder() {
  const order = state.order;
  if (!order.done) return;
  const reward = Math.ceil(order.reward * (1 + state.upgrades.order * 0.12) * (1 + state.prestige.order * 0.08));
  state.coins += reward;
  state.lifetimeEarned += reward;
  state.tokens += order.points;
  state.progress += 8 + state.upgrades.order;
  floatText(`+${reward} coins`, "coin", 68, 64);
  floatText(`+${order.points} token`, "coin", 78, 92);
  state.order = makeOrder(state.factory);
  beep(920, 0.18);
  checkFactoryUnlock();
  renderAll();
  save();
}

function buyUpgrade(key) {
  const upgrade = UPGRADES[key];
  const level = state.upgrades[key];
  const price = cost(upgrade.base, level);
  if (!upgrade || level >= upgrade.max || state.coins < price) return;
  state.coins = Math.max(0, state.coins - price);
  state.upgrades[key] += 1;
  floatText(`${upgrade.name} up`, null, 210, 52);
  beep(610, 0.1);
  if (key === "capacity" || key === "speed") shake();
  renderAll();
  save();
}

function buyMachine(key) {
  const machine = MACHINES[key];
  const level = state.machines[key];
  const price = cost(machine.base, level);
  if (!machine || level >= machine.max || state.coins < price) return;
  state.coins = Math.max(0, state.coins - price);
  state.machines[key] += 1;
  floatText(`${machine.name} ready`, null, 260, 35);
  beep(700, 0.12);
  shake();
  renderAll();
  save();
}

function autoDropTick() {
  if (!started || paused || !state.upgrades.auto) return;
  const now = performance.now();
  if (!autoDropTick.next) autoDropTick.next = now + autoInterval() * 1000;
  if (now >= autoDropTick.next) {
    dropItem(true);
    autoDropTick.next = now + autoInterval() * 1000;
  }
}

function updateCooldown() {
  const remaining = Math.max(0, cooldownUntil - performance.now());
  const cooldown = dropCooldown() * 1000;
  $("#cooldownFill").style.width = `${(remaining / cooldown) * 100}%`;
  $("#dropBtn").disabled = paused || remaining > 0 || items.length >= capacity();
}

function setBlocked(value) {
  $("#blocked").classList.toggle("hidden", !value);
}

function showTutorial() {
  if (state.tutorialDone) return;
  const steps = [
    ["Drop an item", "Tap Drop Item to place Scrap on the conveyor."],
    ["Drag products", "Drag with a mouse or finger. The page will stay still while you drag."],
    ["Merge matches", "Touch two matching products together to make the next product."],
    ["Ship products", "Items sell automatically when they reach the SHIP gate."],
    ["Buy upgrades", "Spend coins on Drop Speed or Belt Motor to grow faster."]
  ];
  if (state.tutorial >= steps.length) {
    state.tutorialDone = true;
    $("#tutorial").classList.add("hidden");
    save();
    return;
  }
  $("#tutorial").classList.remove("hidden");
  $("#tutorialTitle").textContent = steps[state.tutorial][0];
  $("#tutorialText").textContent = steps[state.tutorial][1];
  $("#tutorialNextBtn").textContent = state.tutorial === steps.length - 1 ? "Finish" : "Next";
}

function tutorialEvent(kind) {
  if (state.tutorialDone) return;
  const expected = ["drop", "drag", "merge", "sell"];
  if (expected[state.tutorial] === kind) {
    state.tutorial += 1;
    showTutorial();
  }
}

function openHelp() {
  showModal(`
    <h2 id="modalTitle">How to play</h2>
    <p>Drop Scrap onto the conveyor. Drag equal products together to merge them into better products. The shipping gate sells anything that reaches the end.</p>
    <p>When the belt is full, dropping pauses until you merge or ship products. Orders, upgrades, machines, factory unlocks, and prestige all build from that loop.</p>
    <button class="btn btn-primary" type="button" data-close-modal>Back to work</button>
  `);
}

function openSettings() {
  showModal(`
    <h2 id="modalTitle">Settings</h2>
    <p>Progress autosaves on this browser. Audio is generated in the game, so it still runs if external audio is unavailable.</p>
    <button id="resetSaveBtn" class="btn danger-btn" type="button">Reset saved progress</button>
  `);
  $("#resetSaveBtn").addEventListener("click", () => {
    if (window.confirm("Reset all Tiny Factory Drop progress? This cannot be undone.")) {
      localStorage.removeItem(SAVE_KEY);
      location.reload();
    }
  });
}

function openPrestige() {
  if (state.coins < 2500) {
    showModal(`
      <h2 id="modalTitle">Factory Reset</h2>
      <p>Prestige unlocks at 2,500 coins. You currently have ${formatNumber(state.coins)} coins.</p>
      <p>When available, it resets coins, factory progress, upgrades, machines, orders, and loose products for permanent Factory Tokens.</p>
      <button class="btn btn-primary" type="button" data-close-modal>Keep building</button>
    `);
    return;
  }
  const earned = Math.max(1, Math.floor(state.coins / 2500));
  showModal(`
    <h2 id="modalTitle">Factory Reset</h2>
    <p>Reset coins, upgrades, machines, current factory, orders, and conveyor products for ${earned} permanent Factory Tokens.</p>
    <p>Your existing tokens and token upgrades stay forever.</p>
    <button id="confirmPrestigeBtn" class="btn btn-primary" type="button">Reset for ${earned} tokens</button>
  `);
  $("#confirmPrestigeBtn").addEventListener("click", () => {
    const permanent = { tokens: state.tokens + earned, prestige: { ...state.prestige }, sound: state.sound, music: state.music, tutorialDone: true };
    items.forEach((item) => item.el.remove());
    items = [];
    state = freshState();
    state.tokens = permanent.tokens;
    state.prestige = permanent.prestige;
    state.sound = permanent.sound;
    state.music = permanent.music;
    state.tutorialDone = permanent.tutorialDone;
    closeModal();
    floatText(`+${earned} Factory Tokens`, "coin", 220, 70);
    burst(250, 95, "#ffd66a");
    shake();
    beep(1020, 0.24);
    renderAll();
    save();
  });
}

function openTokenShop() {
  const rows = Object.entries(TOKEN_UPGRADES).map(([key, upgrade]) => `
    <div class="token-row">
      <b>${upgrade.name} Lv.${state.prestige[key]}</b>
      <small>${upgrade.desc}</small>
      <button class="buy-btn" data-buy-token="${key}" ${state.tokens < 1 ? "disabled" : ""} type="button">Spend 1 Token</button>
    </div>
  `).join("");
  showModal(`
    <h2 id="modalTitle">Factory Tokens: ${formatNumber(state.tokens)}</h2>
    <p>Tokens are permanent and survive Factory Reset.</p>
    ${rows}
  `);
}

function buyTokenUpgrade(key) {
  if (!TOKEN_UPGRADES[key] || state.tokens < 1) return;
  state.tokens -= 1;
  state.prestige[key] += 1;
  beep(760, 0.1);
  renderAll();
  save();
  openTokenShop();
}

function showModal(html) {
  paused = true;
  $("#modalContent").innerHTML = html;
  $("#modal").classList.remove("hidden");
}

function closeModal() {
  $("#modal").classList.add("hidden");
  paused = false;
}

function togglePause() {
  if (paused && !$("#modal").classList.contains("hidden")) return;
  paused = true;
  showModal(`
    <h2 id="modalTitle">Production Paused</h2>
    <p>The conveyor is stopped safely.</p>
    <button class="btn btn-primary" type="button" data-close-modal>Resume</button>
  `);
}

function floatText(text, kind, x, y) {
  const el = document.createElement("span");
  el.className = `float ${kind || ""}`;
  el.textContent = text;
  el.style.left = `${x ?? 220}px`;
  el.style.top = `${y ?? 120}px`;
  $("#floatLayer").appendChild(el);
  window.setTimeout(() => el.remove(), 1000);
}

function burst(x, y, color) {
  for (let i = 0; i < 10; i += 1) {
    const particle = document.createElement("i");
    particle.className = "particle";
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.background = color;
    particle.style.setProperty("--x", `${Math.random() * 88 - 44}px`);
    particle.style.setProperty("--y", `${Math.random() * -86 - 8}px`);
    $("#particleLayer").appendChild(particle);
    window.setTimeout(() => particle.remove(), 620);
  }
}

function shake() {
  $(".play-column").animate([
    { transform: "translateX(-4px)" },
    { transform: "translateX(4px)" },
    { transform: "translateX(0)" }
  ], { duration: 240 });
}

function tone(freq, duration = 0.1, volume = 0.045) {
  if (!state.sound && volume > 0.02) return;
  try {
    audioCtx = audioCtx || new AudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (error) {
    console.warn("Tiny Factory Drop audio is unavailable.", error);
  }
}

function beep(freq, duration) {
  if (state?.sound) tone(freq, duration);
}

function startMusic() {
  window.clearInterval(musicTimer);
  if (!state.music) return;
  const notes = [262, 330, 392, 330, 294, 349, 440, 349];
  let index = 0;
  musicTimer = window.setInterval(() => {
    if (state.music && !paused) tone(notes[index++ % notes.length], 0.18, 0.012);
  }, 380);
}

function productSize() {
  return $("#products").clientWidth < 520 ? 51 : 58;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatNumber(value) {
  return Math.floor(value).toLocaleString("en-US");
}

$("#playBtn").addEventListener("click", startGame);
$("#continueBtn").addEventListener("click", startGame);
$("#dropBtn").addEventListener("click", () => dropItem(false));
$("#claimOrderBtn").addEventListener("click", claimOrder);
$("#upgradeList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-buy-upgrade]");
  if (button) buyUpgrade(button.dataset.buyUpgrade);
});
$("#machineList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-buy-machine]");
  if (button) buyMachine(button.dataset.buyMachine);
});
$("#modalContent").addEventListener("click", (event) => {
  const tokenButton = event.target.closest("[data-buy-token]");
  if (tokenButton) buyTokenUpgrade(tokenButton.dataset.buyToken);
  if (event.target.closest("[data-close-modal]")) closeModal();
});
$("#helpBtn").addEventListener("click", openHelp);
$("#orderInfoBtn").addEventListener("click", openHelp);
$("#upgradeInfoBtn").addEventListener("click", openHelp);
$("#settingsBtn").addEventListener("click", openSettings);
$("#modalCloseBtn").addEventListener("click", closeModal);
$("#prestigeBtn").addEventListener("click", openPrestige);
$("#tokenShopBtn").addEventListener("click", openTokenShop);
$("#pauseBtn").addEventListener("click", togglePause);
$("#soundBtn").addEventListener("click", () => {
  state.sound = !state.sound;
  renderAudioButtons();
  save();
});
$("#musicBtn").addEventListener("click", () => {
  state.music = !state.music;
  startMusic();
  renderAudioButtons();
  save();
});
$("#tutorialNextBtn").addEventListener("click", () => {
  state.tutorial += 1;
  showTutorial();
});
$("#tutorialSkipBtn").addEventListener("click", () => {
  state.tutorialDone = true;
  $("#tutorial").classList.add("hidden");
  save();
});

window.addEventListener("beforeunload", () => {
  if (started) save();
  window.clearInterval(saveTimer);
  window.clearInterval(autoTimer);
  window.clearInterval(musicTimer);
});

if (localStorage.getItem(SAVE_KEY)) {
  $("#continueBtn").classList.remove("hidden");
}

window.tinyFactoryDebug = {
  countProducts: () => items.length,
  testDrop: () => dropItem(true)
};
