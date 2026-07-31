const canvas = document.querySelector("#petCanvas");
const ctx = canvas.getContext("2d");
const photoInput = document.querySelector("#photoInput");
const cameraInput = document.querySelector("#cameraInput");
const cameraBtn = document.querySelector("#cameraBtn");
const dropZone = document.querySelector("#dropZone");
const emptyState = document.querySelector("#emptyState");
const detectorStatus = document.querySelector("#detectorStatus");
const phraseInput = document.querySelector("#phraseInput");
const phraseBtn = document.querySelector("#phraseBtn");
const shortBtn = document.querySelector("#shortBtn");
const shuffleAllBtn = document.querySelector("#shuffleAllBtn");
const moodSelect = document.querySelector("#moodSelect");
const sizeRange = document.querySelector("#sizeRange");
const textRange = document.querySelector("#textRange");
const downloadBtn = document.querySelector("#downloadBtn");
const clearBtn = document.querySelector("#clearBtn");

const state = {
  image: null,
  pet: "cat",
  bubble: "thought",
  position: "auto",
  mood: "random",
  phrase: "",
  size: 1,
  textScale: 1,
  detection: null,
  imageFit: null,
  warning: ""
};

let detectorPromise = null;

const phrases = {
  cat: {
    food: [
      "I require snack tribute at once.",
      "This bowl is tragically half-visible.",
      "The cheese has been detected.",
      "I licked it, so now it is mine.",
      "A tiny salmon would fix everything.",
      "Why is dinner late by seven seconds?",
      "I am but a loaf seeking gravy.",
      "Crumbs are just floor sprinkles."
    ],
    royalty: [
      "My kingdom has excellent sunbeams.",
      "Carry me, furniture person.",
      "I have pardoned the couch.",
      "This carpet is my summer palace.",
      "Bow gently. I am digesting.",
      "The crown is invisible but heavy.",
      "I approve this lap.",
      "All shelves are legally mine."
    ],
    chaos: [
      "What if gravity needs testing?",
      "The plant looked at me first.",
      "Zoom meeting? I heard zoom.",
      "I have hidden one sock emotionally.",
      "This curtain knows too much.",
      "At 3 a.m., we gallop.",
      "I can fit. I have decided.",
      "The tiny cup must fall."
    ],
    nap: [
      "I am charging my purr battery.",
      "Five more hours, then breakfast.",
      "This nap has a nap inside it.",
      "Do not disturb the soft engine.",
      "I found a sun puddle.",
      "My bones are now soup.",
      "Wake me when snacks become law.",
      "Dreaming of forbidden counters."
    ],
    dramatic: [
      "No one has ever suffered like me.",
      "The closed door has betrayed us.",
      "I was petted only nine times.",
      "The vacuum remains my oldest enemy.",
      "I sing because the hallway echoes.",
      "My bowl: empty in spirit.",
      "A tragedy in one meow.",
      "I saw the bottom of the bowl."
    ],
    compliment: [
      "Your lap is premium real estate.",
      "You are warm and acceptable.",
      "I saved my softest blink for you.",
      "Your keyboard needed my help.",
      "I chose you, snack wizard.",
      "Today you may pet the velvet.",
      "Your hoodie is now our hoodie.",
      "You smell like home and toast."
    ]
  },
  dog: {
    food: [
      "Is that for us or just you?",
      "I heard cheese from three rooms away.",
      "My tummy has breaking news.",
      "If it drops, I am ready.",
      "Please admire my snack face.",
      "This kibble has notes of crunch.",
      "The fridge and I are close friends.",
      "I pre-washed your plate with love."
    ],
    royalty: [
      "I am mayor of this blanket.",
      "All visitors must meet my tail.",
      "This yard is under my protection.",
      "I hereby knight this squeaky toy.",
      "My throne has suspicious crumbs.",
      "I rule with kindness and drool.",
      "Behold my formal sitting pose.",
      "The mail has been warned."
    ],
    chaos: [
      "I brought you a mystery leaf.",
      "My tail started it.",
      "The ball is gone. Again please.",
      "I found a smell from history.",
      "Emergency! A squirrel-shaped rumor.",
      "I will help by standing exactly here.",
      "The puddle called my name.",
      "This shoe wanted adventure."
    ],
    nap: [
      "I am dreaming in tennis balls.",
      "Wake me for snacks or applause.",
      "The floor is surprisingly luxurious.",
      "My snores are tiny engines.",
      "I worked very hard being near you.",
      "This nap needs supervision.",
      "I am storing sunshine for later.",
      "Do not move. We are cozy."
    ],
    dramatic: [
      "You left for four whole minutes.",
      "The bath has changed me forever.",
      "I was brave near the broom.",
      "My toy is under the couch forever.",
      "A doorbell happened. I survived.",
      "The leash is late and I noticed.",
      "My ears heard betrayal: no walk yet.",
      "I gave you my paw. Pay attention."
    ],
    compliment: [
      "You are my favorite human today.",
      "Your socks smell like adventure.",
      "I saved this wiggle for you.",
      "Excellent job existing near me.",
      "Your face is great for kisses.",
      "We are best friends officially.",
      "I would share my stick with you.",
      "You make the couch better."
    ]
  },
  either: {
    food: [
      "Tiny treat? Big emotional recovery.",
      "I believe snacks are a love language.",
      "The kitchen has possibilities.",
      "I can hear a wrapper thinking.",
      "Please submit one crumb for testing.",
      "A small bite would improve science.",
      "My bowl and I are in talks.",
      "I have never eaten, probably."
    ],
    royalty: [
      "I own this sunbeam now.",
      "This blanket is my tiny estate.",
      "The household is running smoothly.",
      "My staff is cute but slow.",
      "Please schedule my admiration.",
      "I am dressed in natural elegance.",
      "This spot has been claimed.",
      "A noble fluff surveys the realm."
    ],
    chaos: [
      "What if we made this weird?",
      "I found a noise and chased it.",
      "This object could be elsewhere.",
      "I am helping in a confusing way.",
      "Adventure smells slightly dusty.",
      "No plan, only sparkle.",
      "The floor knows what happened.",
      "I regret nothing except bath time."
    ],
    nap: [
      "I am busy being a warm potato.",
      "This blink became a meeting.",
      "Saving energy for more cuteness.",
      "Nap level: expert deluxe.",
      "I have melted into this spot.",
      "My dream has snacks in it.",
      "Cozy mode cannot be canceled.",
      "This is professional resting."
    ],
    dramatic: [
      "I was ignored for almost moments.",
      "History will remember this empty bowl.",
      "The door is closed. Society has failed.",
      "I am small, but my feelings are huge.",
      "A betrayal, possibly involving shampoo.",
      "The blanket moved without permission.",
      "I have concerns and one whisker.",
      "My patience is ornamental."
    ],
    compliment: [
      "You are my favorite furniture.",
      "Your voice is my cozy sound.",
      "Good human. Very good human.",
      "I made this face just for you.",
      "You are part of my collection.",
      "Thanks for being my warm thing.",
      "I trust you with my weirdness.",
      "We are a very cute team."
    ]
  }
};

const shortPhrases = [
  "Snack?",
  "Boop me.",
  "I am baby.",
  "More cozy.",
  "Tiny chaos.",
  "Best day.",
  "I helped.",
  "Treat tax.",
  "Nap boss.",
  "Very wow.",
  "Me? Never.",
  "Soft plans."
];

function allMoodKeys() {
  return ["food", "royalty", "chaos", "nap", "dramatic", "compliment"];
}

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function nextPhrase(short = false) {
  if (state.warning) {
    state.phrase = state.warning;
    phraseInput.value = state.phrase;
    draw();
    return;
  }
  if (short) {
    state.phrase = pick(shortPhrases);
  } else {
    const pet = state.pet;
    const mood = state.mood === "random" ? pick(allMoodKeys()) : state.mood;
    state.phrase = pick(phrases[pet][mood]);
  }
  phraseInput.value = state.phrase;
  draw();
}

function draw() {
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  if (state.image) {
    drawCoverImage(state.image, width, height);
    drawBubble(width, height);
  } else {
    drawPlaceholder(width, height);
  }
}

function drawCoverImage(image, width, height) {
  const canvasRatio = width / height;
  const imageRatio = image.naturalWidth / image.naturalHeight;
  let sourceWidth = image.naturalWidth;
  let sourceHeight = image.naturalHeight;
  let sourceX = 0;
  let sourceY = 0;

  if (imageRatio > canvasRatio) {
    sourceWidth = image.naturalHeight * canvasRatio;
    sourceX = (image.naturalWidth - sourceWidth) / 2;
  } else {
    sourceHeight = image.naturalWidth / canvasRatio;
    sourceY = (image.naturalHeight - sourceHeight) / 2;
  }

  state.imageFit = { sourceX, sourceY, sourceWidth, sourceHeight, width, height };
  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
}

function drawPlaceholder(width, height) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#fff5d8");
  gradient.addColorStop(.58, "#f2ebe1");
  gradient.addColorStop(1, "#dff3ef");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(45, 39, 40, .08)";
  for (let y = 0; y < height; y += 96) {
    for (let x = 0; x < width; x += 96) {
      ctx.beginPath();
      ctx.arc(x + 38, y + 34, 12, 0, Math.PI * 2);
      ctx.arc(x + 68, y + 34, 12, 0, Math.PI * 2);
      ctx.arc(x + 52, y + 58, 18, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawBubble(width, height) {
  const phrase = (state.phrase || "I am thinking extremely important fluff thoughts.").trim();
  const scale = state.size;
  const margin = 54;
  const bubbleWidth = Math.min(width - margin * 2, 470 * scale);
  const baseFont = Math.round(38 * state.textScale);
  const lines = wrapText(phrase, bubbleWidth - 76, baseFont);
  const bubbleHeight = Math.max(160 * scale, lines.length * baseFont * 1.18 + 74);
  const pos = bubblePosition(width, height, bubbleWidth, bubbleHeight, margin);

  ctx.save();
  ctx.shadowColor = "rgba(36, 31, 33, .28)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#2d2728";
  ctx.lineWidth = 7;

  if (state.bubble === "speech") {
    speechTail(pos);
  } else {
    thoughtDots(pos);
  }

  roundedRect(pos.x, pos.y, bubbleWidth, bubbleHeight, 42);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#211d1e";
  ctx.font = `900 ${baseFont}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const lineHeight = baseFont * 1.18;
  const firstY = pos.y + bubbleHeight / 2 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, index) => {
    ctx.fillText(line, pos.x + bubbleWidth / 2, firstY + index * lineHeight);
  });
}

function bubblePosition(width, height, bubbleWidth, bubbleHeight, margin) {
  if (state.position === "auto" && state.detection && state.imageFit) {
    return autoBubblePosition(width, height, bubbleWidth, bubbleHeight, margin);
  }

  const xRight = width - bubbleWidth - margin;
  const yBottom = height - bubbleHeight - margin;
  const positions = {
    "top-left": { x: margin, y: margin, width: bubbleWidth, height: bubbleHeight, anchorX: margin + bubbleWidth * .24, anchorY: margin + bubbleHeight },
    "top-right": { x: xRight, y: margin, width: bubbleWidth, height: bubbleHeight, anchorX: xRight + bubbleWidth * .76, anchorY: margin + bubbleHeight },
    "bottom-left": { x: margin, y: yBottom, width: bubbleWidth, height: bubbleHeight, anchorX: margin + bubbleWidth * .24, anchorY: yBottom },
    "bottom-right": { x: xRight, y: yBottom, width: bubbleWidth, height: bubbleHeight, anchorX: xRight + bubbleWidth * .76, anchorY: yBottom }
  };
  return positions[state.position] || positions["top-right"];
}

function autoBubblePosition(width, height, bubbleWidth, bubbleHeight, margin) {
  const target = headTarget();
  const leftSpace = target.x;
  const rightSpace = width - target.x;
  const topSpace = target.y;
  const bottomSpace = height - target.y;
  const preferTop = topSpace > bubbleHeight + 95 || topSpace >= bottomSpace;
  const preferLeft = leftSpace > rightSpace;
  const x = clamp(preferLeft ? target.x - bubbleWidth - 70 : target.x + 70, margin, width - bubbleWidth - margin);
  const y = clamp(preferTop ? target.y - bubbleHeight - 70 : target.y + 70, margin, height - bubbleHeight - margin);

  return {
    x,
    y,
    width: bubbleWidth,
    height: bubbleHeight,
    anchorX: clamp(target.x, x + 48, x + bubbleWidth - 48),
    anchorY: y + bubbleHeight / 2,
    targetX: target.x,
    targetY: target.y
  };
}

function headTarget() {
  const box = detectionToCanvasBox(state.detection);
  const petHeadY = state.pet === "dog" ? .31 : .27;
  return {
    x: clamp(box.x + box.w * .5, 28, canvas.width - 28),
    y: clamp(box.y + box.h * petHeadY, 28, canvas.height - 28)
  };
}

function detectionToCanvasBox(detection) {
  const fit = state.imageFit;
  const [x, y, w, h] = detection.bbox;
  const left = (x - fit.sourceX) / fit.sourceWidth * fit.width;
  const top = (y - fit.sourceY) / fit.sourceHeight * fit.height;
  const width = w / fit.sourceWidth * fit.width;
  const height = h / fit.sourceHeight * fit.height;
  return {
    x: clamp(left, 0, fit.width),
    y: clamp(top, 0, fit.height),
    w: clamp(width, 0, fit.width),
    h: clamp(height, 0, fit.height)
  };
}

function speechTail(pos) {
  if (pos.targetX !== undefined) {
    ctx.beginPath();
    const baseX = clamp(pos.targetX, pos.x + 62, pos.x + pos.width - 62);
    const baseY = clamp(pos.targetY < pos.y ? pos.y + 14 : pos.y + pos.height - 14, pos.y + 14, pos.y + pos.height - 14);
    ctx.moveTo(baseX - 52, baseY);
    ctx.lineTo(baseX + 52, baseY);
    ctx.lineTo(pos.targetX, pos.targetY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    return;
  }

  const down = pos.y < canvas.height / 2;
  const tipY = down ? pos.y + 172 : pos.y - 92;
  const baseY = down ? pos.y + 120 : pos.y + 18;
  ctx.beginPath();
  ctx.moveTo(pos.anchorX - 38, baseY);
  ctx.lineTo(pos.anchorX + 86, baseY + (down ? 8 : -8));
  ctx.lineTo(pos.anchorX + 12, tipY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function thoughtDots(pos) {
  if (pos.targetX !== undefined) {
    const dx = (pos.targetX - pos.anchorX) / 4;
    const dy = (pos.targetY - pos.anchorY) / 4;
    [
      { r: 16, step: 3.1 },
      { r: 25, step: 2.05 },
      { r: 36, step: 1.05 }
    ].forEach((dot) => {
      ctx.beginPath();
      ctx.arc(pos.anchorX + dx * dot.step, pos.anchorY + dy * dot.step, dot.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
    return;
  }

  const down = pos.y < canvas.height / 2;
  const dots = [
    { r: 18, dx: 14, dy: down ? 36 : -36 },
    { r: 28, dx: 54, dy: down ? 78 : -78 },
    { r: 40, dx: 102, dy: down ? 126 : -126 }
  ];
  dots.forEach((dot) => {
    ctx.beginPath();
    ctx.arc(pos.anchorX + dot.dx, pos.anchorY + dot.dy, dot.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
}

function roundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function wrapText(text, maxWidth, fontSize) {
  ctx.font = `900 ${fontSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Arial`;
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth || !line) {
      line = test;
    } else {
      lines.push(line);
      line = word;
    }
  });
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function loadFile(file) {
  if (!file || !file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const image = new Image();
    image.addEventListener("load", () => {
      state.image = image;
      state.detection = null;
      state.warning = "";
      emptyState.classList.add("hidden");
      draw();
      identifyPet(image);
    });
    image.src = reader.result;
  });
  reader.readAsDataURL(file);
}

photoInput.addEventListener("change", (event) => loadFile(event.target.files[0]));
cameraInput.addEventListener("change", (event) => loadFile(event.target.files[0]));
cameraBtn.addEventListener("click", () => cameraInput.click());

["dragenter", "dragover"].forEach((type) => {
  dropZone.addEventListener(type, (event) => {
    event.preventDefault();
    dropZone.classList.add("dragover");
  });
});
["dragleave", "drop"].forEach((type) => {
  dropZone.addEventListener(type, (event) => {
    event.preventDefault();
    dropZone.classList.remove("dragover");
  });
});
dropZone.addEventListener("drop", (event) => loadFile(event.dataTransfer.files[0]));

document.querySelectorAll("[data-pet]").forEach((button) => {
  button.addEventListener("click", () => {
    state.pet = button.dataset.pet;
    state.warning = "";
    document.querySelectorAll("[data-pet]").forEach((item) => item.classList.toggle("active", item === button));
    nextPhrase();
  });
});

document.querySelectorAll("[data-bubble]").forEach((button) => {
  button.addEventListener("click", () => {
    state.bubble = button.dataset.bubble;
    document.querySelectorAll("[data-bubble]").forEach((item) => item.classList.toggle("active", item === button));
    draw();
  });
});

document.querySelectorAll("[data-position]").forEach((button) => {
  button.addEventListener("click", () => {
    state.position = button.dataset.position;
    document.querySelectorAll("[data-position]").forEach((item) => item.classList.toggle("active", item === button));
    draw();
  });
});

moodSelect.addEventListener("change", () => {
  state.mood = moodSelect.value;
  nextPhrase();
});
phraseInput.addEventListener("input", () => {
  state.phrase = phraseInput.value;
  draw();
});
sizeRange.addEventListener("input", () => {
  state.size = Number(sizeRange.value) / 100;
  draw();
});
textRange.addEventListener("input", () => {
  state.textScale = Number(textRange.value) / 100;
  draw();
});
phraseBtn.addEventListener("click", () => nextPhrase());
shortBtn.addEventListener("click", () => nextPhrase(true));
shuffleAllBtn.addEventListener("click", () => {
  state.pet = pick(["cat", "dog", "either"]);
  state.bubble = pick(["thought", "speech"]);
  state.position = state.detection ? "auto" : pick(["auto", "top-left", "top-right", "bottom-left", "bottom-right"]);
  state.mood = "random";
  moodSelect.value = "random";
  document.querySelectorAll("[data-pet]").forEach((item) => item.classList.toggle("active", item.dataset.pet === state.pet));
  document.querySelectorAll("[data-bubble]").forEach((item) => item.classList.toggle("active", item.dataset.bubble === state.bubble));
  document.querySelectorAll("[data-position]").forEach((item) => item.classList.toggle("active", item.dataset.position === state.position));
  nextPhrase();
});

downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "pet-thought-bubble.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

clearBtn.addEventListener("click", () => {
  state.image = null;
  state.detection = null;
  state.warning = "";
  photoInput.value = "";
  cameraInput.value = "";
  setDetectorStatus("Ready to spot cats and dogs.");
  emptyState.classList.remove("hidden");
  draw();
});

nextPhrase();

async function identifyPet(image) {
  setDetectorStatus("Looking for a cat or dog...");
  try {
    const detector = await loadDetector();
    const predictions = await detector.detect(image);
    const pets = predictions.filter((item) => ["cat", "dog"].includes(item.class) && item.score >= .45);
    const people = predictions.filter((item) => item.class === "person" && item.score >= .5);

    if (pets.length) {
      const pet = pets.sort((a, b) => scoreDetection(b) - scoreDetection(a))[0];
      state.pet = pet.class;
      state.detection = pet;
      state.warning = "";
      setActivePet(pet.class);
      setDetectorStatus(`Looks like a ${pet.class}. Bubble aligned near the head.`, "success");
      nextPhrase();
      return;
    }

    if (people.length) {
      state.pet = "either";
      state.detection = null;
      state.warning = "That's not a pet. Try a cat or dog photo.";
      setActivePet("either");
      setDetectorStatus("That's not a pet. Try a cat or dog photo.", "warning");
      nextPhrase();
      return;
    }

    state.detection = null;
    state.warning = "I can't find a cat or dog yet. Try a clearer pet photo.";
    setDetectorStatus("I can't find a cat or dog yet. Try a clearer pet photo.", "warning");
    nextPhrase();
  } catch (error) {
    state.detection = null;
    setDetectorStatus("Pet spotting is unavailable right now, but you can still make bubbles manually.", "warning");
    draw();
  }
}

function loadDetector() {
  if (!detectorPromise) {
    detectorPromise = new Promise((resolve, reject) => {
      const startedAt = Date.now();
      const waitForModel = () => {
        if (window.cocoSsd) {
          window.cocoSsd.load().then(resolve, reject);
        } else if (Date.now() - startedAt > 10000) {
          reject(new Error("Detector did not load"));
        } else {
          window.setTimeout(waitForModel, 120);
        }
      };
      waitForModel();
    });
  }
  return detectorPromise;
}

function scoreDetection(item) {
  return item.score * item.bbox[2] * item.bbox[3];
}

function setActivePet(pet) {
  document.querySelectorAll("[data-pet]").forEach((item) => item.classList.toggle("active", item.dataset.pet === pet));
}

function setDetectorStatus(message, tone = "") {
  detectorStatus.textContent = message;
  detectorStatus.classList.toggle("success", tone === "success");
  detectorStatus.classList.toggle("warning", tone === "warning");
}
