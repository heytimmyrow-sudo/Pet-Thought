const canvas = document.querySelector("#petCanvas");
const ctx = canvas.getContext("2d");
const app = document.querySelector(".app");
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
const petNameInput = document.querySelector("#petNameInput");
const styleSelect = document.querySelector("#styleSelect");
const moodSelect = document.querySelector("#moodSelect");
const sizeRange = document.querySelector("#sizeRange");
const textRange = document.querySelector("#textRange");
const downloadBtn = document.querySelector("#downloadBtn");
const clearBtn = document.querySelector("#clearBtn");
const beforeAfterBtn = document.querySelector("#beforeAfterBtn");
const copyLinkBtn = document.querySelector("#copyLinkBtn");
const qrBtn = document.querySelector("#qrBtn");
const sharePhotoBtn = document.querySelector("#sharePhotoBtn");
const shareAppBtn = document.querySelector("#shareAppBtn");
const gallery = document.querySelector("#gallery");
const galleryStrip = document.querySelector("#galleryStrip");
const clearGalleryBtn = document.querySelector("#clearGalleryBtn");
const qrModal = document.querySelector("#qrModal");
const qrCloseBtn = document.querySelector("#qrCloseBtn");
const qrCodeBox = document.querySelector("#qrCodeBox");
const qrUrlText = document.querySelector("#qrUrlText");
const copyQrLinkBtn = document.querySelector("#copyQrLinkBtn");
const downloadQrBtn = document.querySelector("#downloadQrBtn");
const inlineQrBox = document.querySelector("#inlineQrBox");
const inlineQrUrlText = document.querySelector("#inlineQrUrlText");
const copyInlineQrLinkBtn = document.querySelector("#copyInlineQrLinkBtn");
const downloadInlineQrBtn = document.querySelector("#downloadInlineQrBtn");
const phraseChoices = document.querySelector("#phraseChoices");
const doodleBtn = document.querySelector("#doodleBtn");
const doodleColor = document.querySelector("#doodleColor");
const doodleSize = document.querySelector("#doodleSize");
const undoDoodleBtn = document.querySelector("#undoDoodleBtn");
const clearDoodleBtn = document.querySelector("#clearDoodleBtn");

const state = {
  image: null,
  pet: "cat",
  bubble: "thought",
  style: "classic",
  position: "auto",
  mood: "random",
  phrase: "",
  size: 1,
  textScale: 1,
  detection: null,
  imageFit: null,
  warning: "",
  manual: null,
  lastBubble: null,
  sceneTags: [],
  petName: "",
  phraseOptions: [],
  stickers: [],
  strokes: [],
  viewOriginal: false,
  doodleMode: false
};

let detectorPromise = null;
let dragMode = null;
let activeStroke = null;
const galleryKey = "petThoughtGallery";
const publicAppUrl = "https://new-games-jcrow.timmyrow.chatgpt.site";

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

const sharedPacks = {
  birthday: [
    "I wore my birthday fluff.",
    "All treats are birthday treats.",
    "Please admire my party face.",
    "I am the tiny guest of honor.",
    "Cake is just snack architecture.",
    "My wish is more snacks.",
    "This hat is legally suspicious.",
    "Another year, same excellent paws."
  ],
  morning: [
    "Good morning. I require ceremony.",
    "The sun is up. So are my needs.",
    "Breakfast should be immediate.",
    "I woke up adorable again.",
    "Morning meeting: me, you, snacks.",
    "Please start the day with admiration.",
    "I have fresh thoughts and one yawn.",
    "The blanket has accepted my resignation."
  ],
  apology: [
    "Sorry about the mysterious crash.",
    "I regret nothing, but I look sorry.",
    "The evidence is mostly chewed.",
    "Please accept this innocent face.",
    "The mess happened near me.",
    "I was framed by gravity.",
    "My apology includes tiny eyes.",
    "I will be good for several minutes."
  ],
  holiday: [
    "Festive fluff has entered the room.",
    "I am the decoration now.",
    "Please wrap snacks only.",
    "This sparkle belongs to me.",
    "Joy has paws today.",
    "I inspected the holiday paper.",
    "Seasonal coziness: approved.",
    "My gift is being this cute."
  ],
  hungry: [
    "Snack thoughts have taken over.",
    "My tummy has submitted a request.",
    "The food committee is me.",
    "I am accepting treat donations.",
    "A bite would improve morale.",
    "I have located the snack concept.",
    "Hunger is my current personality.",
    "Please respect my tiny appetite."
  ],
  sleepy: [
    "My eyelids are doing paperwork.",
    "I am entering cozy power-save mode.",
    "This nap has excellent leadership.",
    "Please whisper near the fluff.",
    "Dream snacks are loading.",
    "I have scheduled a tiny snooze.",
    "The soft place has chosen me.",
    "I am mostly blanket now."
  ],
  guilty: [
    "This face denies everything.",
    "The evidence is surprisingly nearby.",
    "I was helping in a crunchy way.",
    "Please note my innocent posture.",
    "The mess and I are acquaintances.",
    "I regret the part you noticed.",
    "My defense is being adorable.",
    "Nothing happened. Probably."
  ],
  excited: [
    "My feelings are doing zooms.",
    "This is the best moment so far.",
    "Joy has activated all paws.",
    "I brought enthusiasm for everyone.",
    "My sparkle level is critical.",
    "Something wonderful is happening.",
    "I am made of tiny celebration.",
    "Please observe my happy energy."
  ],
  fancy: [
    "I arrived dressed as importance.",
    "Elegance is my natural setting.",
    "Please admire the formal fluff.",
    "I am attending the gala of me.",
    "This pose is very exclusive.",
    "Luxury has a tiny face today.",
    "My outfit is mostly confidence.",
    "I am premium household decor."
  ],
  confused: [
    "I have several questions.",
    "This situation has unusual vibes.",
    "Why is the thing doing that?",
    "I am processing the mystery.",
    "The facts are not sitting nicely.",
    "Something here requires a sniff.",
    "I understand nothing with confidence.",
    "Please explain using snacks."
  ],
  boss: [
    "I am the manager of this photo.",
    "All decisions go through my paws.",
    "This household needs my leadership.",
    "Please submit the snack report.",
    "I run a very soft operation.",
    "The agenda is mostly me.",
    "Tiny boss has entered the frame.",
    "Meeting adjourned. Bring treats."
  ]
};

const scenePhrasePacks = {
  food: {
    cat: [
      "I am supervising this snack very closely.",
      "That food is within my emotional range.",
      "I was invited by the smell.",
      "The plate and I have unfinished business."
    ],
    dog: [
      "I am standing by for dropped snacks.",
      "Food detected. Tail system online.",
      "I can help with that bite.",
      "This meal has excellent sharing potential."
    ],
    either: [
      "The snacks in this photo are important.",
      "I have noticed the edible situation.",
      "This scene requires treat analysis.",
      "A crumb would complete the composition."
    ]
  },
  couch: {
    cat: [
      "This couch is now my soft kingdom.",
      "I have claimed this cushion legally.",
      "The couch understands my greatness.",
      "I am improving the furniture."
    ],
    dog: [
      "This couch is better because I am on it.",
      "I brought cozy energy to this cushion.",
      "Please do not move. Couch meeting.",
      "This is my official relaxation station."
    ],
    either: [
      "Cozy furniture has been conquered.",
      "This soft spot passed inspection.",
      "I am exactly where comfort happens.",
      "The cushion situation is excellent."
    ]
  },
  bed: {
    cat: [
      "This bed is doing a fine job worshipping me.",
      "I am testing the blanket for softness.",
      "Wake me when admiration resumes.",
      "This pillow is under new management."
    ],
    dog: [
      "I saved you a very tiny edge of bed.",
      "The bed and I are best friends now.",
      "I am guarding the blankets from loneliness.",
      "This nap zone has my full approval."
    ],
    either: [
      "The blanket has accepted me.",
      "This bed is a certified cozy zone.",
      "I have melted into the softness.",
      "Current activity: professional resting."
    ]
  },
  person: {
    cat: [
      "My human assistant is nearby.",
      "I am allowing this person to admire me.",
      "This lap-adjacent situation has promise.",
      "The human seems trainable."
    ],
    dog: [
      "My favorite person is in the photo!",
      "I am close to my human on purpose.",
      "This person is part of my pack.",
      "I saved this happy face for them."
    ],
    either: [
      "My human is here, so everything is better.",
      "This photo includes my favorite staff member.",
      "I am posing near someone important.",
      "The human adds useful warmth."
    ]
  },
  computer: {
    cat: [
      "Your keyboard clearly needed my expertise.",
      "I am helping by blocking the screen.",
      "This work thing belongs to me now.",
      "I typed one mysterious email."
    ],
    dog: [
      "I am assisting with important computer work.",
      "Your meeting needed more tail energy.",
      "I can explain the spreadsheet with my face.",
      "This laptop smells like less walk."
    ],
    either: [
      "I am the productivity manager now.",
      "This screen has not petted me once.",
      "Work can wait. I am happening.",
      "I have reviewed the computer situation."
    ]
  },
  toy: {
    cat: [
      "This toy has been selected for judgment.",
      "I attacked it with quiet professionalism.",
      "The tiny object fears me.",
      "I am pretending not to love this toy."
    ],
    dog: [
      "That toy is my whole personality today.",
      "Please throw it again immediately.",
      "Toy secured. Joy increased.",
      "I brought this treasure for the team."
    ],
    either: [
      "This object is clearly important.",
      "Playtime has entered the evidence.",
      "I found a thing and made it special.",
      "The toy situation is developing."
    ]
  },
  outside: {
    cat: [
      "The outdoors is loud, but I am majestic.",
      "I am inspecting nature from a safe attitude.",
      "A leaf moved suspiciously.",
      "The garden has been notified."
    ],
    dog: [
      "Outside smells are doing amazing work.",
      "I found seventeen invisible stories.",
      "Adventure is happening right here.",
      "The yard and I are having a great day."
    ],
    either: [
      "Nature has many excellent smells.",
      "This outdoor scene needed more cuteness.",
      "Fresh air, fresh thoughts.",
      "I am conducting field research."
    ]
  },
  vehicle: {
    cat: [
      "The moving box is not my favorite.",
      "I have concerns about this travel plan.",
      "This vehicle should contain more blankets.",
      "I am bravely near transportation."
    ],
    dog: [
      "Car ride? I am emotionally prepared.",
      "Window smells are calling me.",
      "This vehicle may lead to adventure.",
      "I packed my face and enthusiasm."
    ],
    either: [
      "Travel has been detected.",
      "This ride needs one small captain.",
      "I am ready, suspicious, or both.",
      "The journey could use snacks."
    ]
  },
  plant: {
    cat: [
      "The plant and I have a complicated history.",
      "This leaf looked at me first.",
      "I am botanically curious.",
      "The greenery has been inspected."
    ],
    dog: [
      "This plant smells like outside practice.",
      "I found a leafy friend.",
      "The garden report is mostly sniffing.",
      "Nature is doing a good job."
    ],
    either: [
      "The plant is part of my investigation.",
      "Green things have been noticed.",
      "I am adding charm to the scenery.",
      "This leaf situation seems official."
    ]
  },
  bag: {
    cat: [
      "If I fits, this bag is mine.",
      "This container has excellent potential.",
      "I am luggage now.",
      "The bag invited me emotionally."
    ],
    dog: [
      "Is this bag packed for snacks?",
      "I can help carry enthusiasm.",
      "This bag smells like going somewhere.",
      "I am ready for the adventure supplies."
    ],
    either: [
      "This bag has been thoroughly considered.",
      "Travel supplies detected.",
      "I found a portable mystery.",
      "The bag situation requires supervision."
    ]
  },
  bathroom: {
    cat: [
      "This room contains suspicious water.",
      "I do not support bath-related decisions.",
      "The sink has my attention.",
      "I am monitoring the wet zone."
    ],
    dog: [
      "Bath rumors are making me nervous.",
      "I was brave in the splash room.",
      "This bathroom needs more treats.",
      "I am damp in my imagination."
    ],
    either: [
      "Water-related activities are under review.",
      "This room has suspicious plumbing.",
      "I am asking questions about the sink.",
      "The bath vibes have been detected."
    ]
  },
  closeup: {
    cat: [
      "My face is the whole announcement.",
      "Please admire this premium close-up.",
      "I brought my tiny nose to the foreground.",
      "This is my serious portrait face."
    ],
    dog: [
      "My face is very close because I love you.",
      "This nose has entered the chat.",
      "I am delivering maximum puppy energy.",
      "Please enjoy this important face."
    ],
    either: [
      "Extreme cuteness has filled the frame.",
      "This close-up is my official statement.",
      "I moved closer for emotional impact.",
      "The camera has been blessed by my face."
    ]
  }
};

function allMoodKeys() {
  return ["food", "royalty", "chaos", "nap", "dramatic", "compliment", "birthday", "morning", "apology", "holiday", "hungry", "sleepy", "guilty", "excited", "fancy", "confused", "boss"];
}

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function nextPhrase(short = false) {
  if (state.warning) {
    state.phrase = state.warning;
    phraseInput.value = state.phrase;
    renderPhraseChoices([]);
    draw();
    return;
  }
  if (short) {
    state.phrase = personalizePhrase(contextualPhrase(true) || pick(shortPhrases));
  } else {
    state.phraseOptions = buildPhraseOptions(3);
    state.phrase = state.phraseOptions[0] || fallbackPhrase();
    renderPhraseChoices(state.phraseOptions);
  }
  phraseInput.value = state.phrase;
  draw();
}

function getPhrasePool(pet, mood) {
  return phrases[pet]?.[mood] || sharedPacks[mood] || phrases.either.compliment;
}

function contextualPhrase(short = false) {
  return buildContextPhrase(selectedMood(), short);
}

function selectedMood() {
  return state.mood === "random" ? pick(allMoodKeys()) : state.mood;
}

function buildPhraseOptions(count) {
  const options = [];
  const mood = selectedMood();
  const attempts = count * 14;
  for (let index = 0; index < attempts && options.length < count; index++) {
    const phrase = personalizePhrase(buildContextPhrase(mood, false) || (!state.sceneTags.length ? pick(getPhrasePool(state.pet, mood)) : ""));
    if (!options.includes(phrase)) options.push(phrase);
  }
  while (options.length < count && state.sceneTags.length) {
    const tag = state.sceneTags[options.length % state.sceneTags.length];
    const phrase = personalizePhrase(sceneFallbackPhrase(tag));
    if (!options.includes(phrase)) options.push(phrase);
    else break;
  }
  return options;
}

function buildContextPhrase(mood, short = false) {
  if (!state.sceneTags.length) return "";
  const tag = pick(weightedSceneTags());
  const pack = scenePhrasePacks[tag];
  if (!pack) return "";
  const base = pick([...(pack[state.pet] || []), ...(pack.either || [])]);
  if (short) return shortenContextPhrase(tag, base);
  return adaptPhraseForMood(base, mood, tag);
}

function fallbackPhrase() {
  if (state.sceneTags.length) return personalizePhrase(sceneFallbackPhrase(state.sceneTags[0]));
  return personalizePhrase(pick(getPhrasePool(state.pet, selectedMood())));
}

function sceneFallbackPhrase(tag) {
  const labels = {
    food: "the snack situation",
    couch: "this cozy couch scene",
    bed: "this sleepy bed scene",
    person: "my human in this photo",
    computer: "this computer situation",
    toy: "this toy moment",
    outside: "this outdoor adventure",
    vehicle: "this travel moment",
    plant: "this leafy scene",
    bag: "this bag situation",
    bathroom: "this suspicious bathroom scene",
    closeup: "this close-up face moment"
  };
  const subject = labels[tag] || "this photo";
  return pick([
    `I have reviewed ${subject}.`,
    `${petLabel()} has important thoughts about ${subject}.`,
    `This picture is mostly about ${subject}.`
  ]);
}

function weightedSceneTags() {
  const tags = [...state.sceneTags];
  const mood = state.mood;
  if (["food", "hungry"].includes(mood) && tags.includes("food")) tags.push("food", "food");
  if (["nap", "sleepy"].includes(mood) && tags.some((tag) => ["bed", "couch"].includes(tag))) tags.push("bed", "couch");
  if (["chaos", "excited"].includes(mood) && tags.includes("toy")) tags.push("toy", "toy");
  if (["compliment", "boss"].includes(mood) && tags.includes("person")) tags.push("person");
  return tags;
}

function adaptPhraseForMood(base, mood, tag) {
  const pet = petLabel();
  const moodOpeners = {
    royalty: [`${pet} has claimed this scene: `, `${pet} officially rules here: `],
    dramatic: ["Emergency thought: ", "A tiny drama report: "],
    compliment: [`${pet} thinks this photo is excellent: `, "Sweet thought: "],
    birthday: ["Birthday report: ", "Party thought: "],
    morning: ["Morning thought: ", "Breakfast-adjacent thought: "],
    apology: ["Apology note: ", "Innocent-face update: "],
    holiday: ["Festive thought: ", "Holiday report: "],
    hungry: ["Snack thought: ", "Treat report: "],
    sleepy: ["Sleepy thought: ", "Cozy report: "],
    guilty: ["Innocent thought: ", "Definitely-not-guilty update: "],
    excited: ["Excited thought: ", "Happy report: "],
    fancy: ["Fancy thought: ", "Elegant update: "],
    confused: ["Confused thought: ", "Mystery report: "],
    boss: [`${pet} says: `, "Tiny boss memo: "]
  };
  if (mood === "food" && tag !== "food") return pick(["I am checking whether this scene contains snacks.", `${pet} sees this photo and still requests treats.`, `${base} Also, snacks?`]);
  if (mood === "hungry" && tag !== "food") return pick([`I searched this ${tag} scene for snacks.`, `${pet} found the ${tag}, but is still thinking about treats.`, `${base} Snacks can arrive after this.`]);
  if (mood === "nap" && !["bed", "couch", "closeup"].includes(tag)) return pick([`${base} Then I will nap about it.`, "This scene looks like it could use a nap supervisor.", `${pet} can nap after handling this situation.`]);
  if (mood === "chaos" && tag !== "toy") return pick([`${base} Now let's make it slightly weird.`, "I am helping this scene become more exciting.", `${pet} has chaotic notes about this photo.`]);
  const openers = moodOpeners[mood];
  if (!openers) return base;
  const phrase = `${pick(openers)}${base}`;
  return phrase.length <= 110 ? phrase : base;
}

function shortenContextPhrase(tag, base) {
  const shortByTag = {
    food: ["Snack scene.", "Treat alert.", "Food thoughts."],
    couch: ["Couch claimed.", "Cozy boss.", "Soft spot."],
    bed: ["Nap zone.", "Blanket mode.", "Sleepy boss."],
    person: ["My human.", "Best human.", "Pack time."],
    computer: ["Work helper.", "Screen boss.", "Laptop thoughts."],
    toy: ["Throw it.", "Toy joy.", "Play now."],
    outside: ["Sniff report.", "Fresh air.", "Adventure."],
    vehicle: ["Ride time.", "Travel snack?", "Tiny trip."],
    plant: ["Leaf report.", "Plant watch.", "Garden thoughts."],
    bag: ["Bag mystery.", "Trip supplies.", "Packed fluff."],
    bathroom: ["Bath concern.", "Wet room.", "Sink thoughts."],
    closeup: ["My face.", "Boop view.", "Important nose."]
  };
  return pick(shortByTag[tag] || [base]);
}

function personalizePhrase(phrase) {
  const name = state.petName.trim();
  if (!name || phrase.includes(name)) return phrase;
  if (/^(I|My|Please|This|That|The|A|An|Food|Snack|Treat|Tiny|Cozy|Happy|Sweet|Morning|Holiday|Birthday|Party|Elegant|Fancy|Mystery|Innocent|Excited|Sleepy|Travel|Work|Water)/.test(phrase)) {
    const option = pick([`${name}: ${phrase}`, `${name} thinks: ${phrase}`]);
    return option.length <= 110 ? option : phrase;
  }
  return phrase;
}

function petLabel() {
  return state.petName.trim() || (state.pet === "either" ? "This pet" : `This ${state.pet}`);
}

function renderPhraseChoices(options) {
  phraseChoices.innerHTML = "";
  options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "phrase-choice";
    button.type = "button";
    button.textContent = option;
    button.classList.toggle("active", option === state.phrase);
    button.addEventListener("click", () => {
      state.phrase = option;
      phraseInput.value = option;
      renderPhraseChoices(options);
      draw();
    });
    phraseChoices.append(button);
  });
}

function draw() {
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  if (state.image) {
    drawCoverImage(state.image, width, height);
    if (!state.viewOriginal) {
      drawStickers();
      drawDoodles();
      drawBubble(width, height);
    } else {
      state.lastBubble = null;
    }
  } else {
    drawPlaceholder(width, height);
  }
}

function setPhotoVisible(hasPhoto) {
  app.classList.toggle("has-photo", hasPhoto);
  if (hasPhoto) renderQrCode(inlineQrBox, inlineQrUrlText, 3);
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
  const style = state.style;
  const widthMultiplier = style === "announcement" || style === "news" ? 1.18 : style === "whisper" ? .78 : 1;
  const bubbleWidth = Math.min(width - margin * 2, 470 * scale * widthMultiplier);
  const baseFont = Math.round((style === "whisper" ? 29 : style === "announcement" ? 44 : 38) * state.textScale);
  const lines = wrapText(phrase, bubbleWidth - 76, baseFont);
  const bubbleHeight = Math.max((style === "sticker" ? 130 : 160) * scale, lines.length * baseFont * 1.18 + 74);
  const pos = bubblePosition(width, height, bubbleWidth, bubbleHeight, margin);
  state.lastBubble = pos;

  ctx.save();
  ctx.shadowColor = style === "whisper" ? "rgba(36, 31, 33, .16)" : "rgba(36, 31, 33, .28)";
  ctx.shadowBlur = style === "sticker" ? 12 : 24;
  ctx.shadowOffsetY = style === "sticker" ? 5 : 10;
  ctx.fillStyle = style === "news" ? "#fff3c4" : style === "comic" ? "#fffdf2" : "#ffffff";
  ctx.strokeStyle = style === "news" ? "#191617" : "#2d2728";
  ctx.lineWidth = style === "whisper" ? 4 : style === "comic" ? 10 : 7;

  if (state.bubble === "speech") {
    speechTail(pos);
  } else {
    thoughtDots(pos);
  }

  if (style === "cloud") {
    cloudBubble(pos.x, pos.y, bubbleWidth, bubbleHeight);
  } else if (style === "comic") {
    burstBubble(pos.x, pos.y, bubbleWidth, bubbleHeight);
  } else if (style === "sticker") {
    roundedRect(pos.x, pos.y, bubbleWidth, bubbleHeight, 22);
  } else if (style === "news") {
    roundedRect(pos.x, pos.y, bubbleWidth, bubbleHeight, 18);
  } else {
    roundedRect(pos.x, pos.y, bubbleWidth, bubbleHeight, style === "whisper" ? 26 : 42);
  }
  ctx.fill();
  ctx.stroke();
  if (style === "news") {
    ctx.fillStyle = "#2d2728";
    ctx.fillRect(pos.x + 22, pos.y + 20, bubbleWidth - 44, 7);
    ctx.fillRect(pos.x + 22, pos.y + bubbleHeight - 27, bubbleWidth - 44, 7);
  }
  ctx.restore();

  ctx.fillStyle = "#211d1e";
  ctx.font = `${style === "whisper" ? 800 : 900} ${baseFont}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const lineHeight = baseFont * 1.18;
  const firstY = pos.y + bubbleHeight / 2 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, index) => {
    ctx.fillText(line, pos.x + bubbleWidth / 2, firstY + index * lineHeight);
  });
}

function drawStickers() {
  state.stickers.forEach((sticker) => {
    ctx.save();
    ctx.translate(sticker.x, sticker.y);
    ctx.rotate(sticker.rotation);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `900 ${sticker.size}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Arial`;
    ctx.lineWidth = Math.max(4, sticker.size * .11);
    ctx.strokeStyle = "rgba(45, 39, 40, .72)";
    ctx.fillStyle = sticker.color;
    ctx.strokeText(sticker.symbol, 0, 0);
    ctx.fillText(sticker.symbol, 0, 0);
    ctx.restore();
  });
}

function drawDoodles() {
  state.strokes.forEach(drawStroke);
  if (activeStroke) drawStroke(activeStroke);
}

function drawStroke(stroke) {
  if (stroke.points.length < 2) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.size;
  ctx.shadowColor = "rgba(36, 31, 33, .18)";
  ctx.shadowBlur = stroke.size * .45;
  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
  stroke.points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
  ctx.stroke();
  ctx.restore();
}

function cloudBubble(x, y, width, height) {
  const bumps = 12;
  ctx.beginPath();
  for (let index = 0; index < bumps; index++) {
    const angle = (index / bumps) * Math.PI * 2;
    const px = x + width / 2 + Math.cos(angle) * width * .48;
    const py = y + height / 2 + Math.sin(angle) * height * .44;
    const radius = index % 2 ? height * .22 : height * .27;
    if (index === 0) ctx.moveTo(px + radius, py);
    ctx.arc(px, py, radius, 0, Math.PI * 2);
  }
  roundedRect(x + width * .08, y + height * .12, width * .84, height * .76, 50);
}

function burstBubble(x, y, width, height) {
  const spikes = 18;
  ctx.beginPath();
  for (let index = 0; index < spikes; index++) {
    const angle = (index / spikes) * Math.PI * 2;
    const radiusX = width * (index % 2 ? .49 : .43);
    const radiusY = height * (index % 2 ? .49 : .42);
    const px = x + width / 2 + Math.cos(angle) * radiusX;
    const py = y + height / 2 + Math.sin(angle) * radiusY;
    if (index === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function bubblePosition(width, height, bubbleWidth, bubbleHeight, margin) {
  const target = bubbleTarget();
  if (state.position === "manual" && state.manual) {
    const x = clamp(state.manual.x, margin, width - bubbleWidth - margin);
    const y = clamp(state.manual.y, margin, height - bubbleHeight - margin);
    return {
      x,
      y,
      width: bubbleWidth,
      height: bubbleHeight,
      anchorX: clamp(state.manual.targetX, x + 48, x + bubbleWidth - 48),
      anchorY: y + bubbleHeight / 2,
      targetX: state.manual.targetX,
      targetY: state.manual.targetY
    };
  }

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
  const pos = positions[state.position] || positions["top-right"];
  if (target) {
    pos.targetX = target.x;
    pos.targetY = target.y;
    pos.anchorX = clamp(target.x, pos.x + 48, pos.x + pos.width - 48);
    pos.anchorY = clamp(target.y, pos.y + 36, pos.y + pos.height - 36);
  }
  return pos;
}

function bubbleTarget() {
  if (state.position === "manual" && state.manual) return { x: state.manual.targetX, y: state.manual.targetY };
  if (state.detection && state.imageFit) return headTarget();
  return null;
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
  const petHeadY = state.bubble === "speech" ? (state.pet === "dog" ? .43 : .38) : (state.pet === "dog" ? .29 : .25);
  const petHeadX = state.pet === "dog" ? .52 : .5;
  return {
    x: clamp(box.x + box.w * petHeadX, 28, canvas.width - 28),
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
    const edge = tailBaseTowardTarget(pos);
    const horizontal = edge.side === "top" || edge.side === "bottom";
    const halfBase = 42;
    if (horizontal) {
      ctx.moveTo(edge.x - halfBase, edge.y);
      ctx.lineTo(edge.x + halfBase, edge.y);
    } else {
      ctx.moveTo(edge.x, edge.y - halfBase);
      ctx.lineTo(edge.x, edge.y + halfBase);
    }
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

function tailBaseTowardTarget(pos) {
  const targetX = pos.targetX;
  const targetY = pos.targetY;
  const distances = [
    { side: "top", value: Math.abs(targetY - pos.y), x: clamp(targetX, pos.x + 70, pos.x + pos.width - 70), y: pos.y + 8 },
    { side: "bottom", value: Math.abs(targetY - (pos.y + pos.height)), x: clamp(targetX, pos.x + 70, pos.x + pos.width - 70), y: pos.y + pos.height - 8 },
    { side: "left", value: Math.abs(targetX - pos.x), x: pos.x + 8, y: clamp(targetY, pos.y + 58, pos.y + pos.height - 58) },
    { side: "right", value: Math.abs(targetX - (pos.x + pos.width)), x: pos.x + pos.width - 8, y: clamp(targetY, pos.y + 58, pos.y + pos.height - 58) }
  ];
  return distances.sort((a, b) => a.value - b.value)[0];
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

function addSticker(type) {
  const stickerMap = {
    heart: { symbol: "♥", color: "#f37b62" },
    star: { symbol: "★", color: "#f8c84e" },
    paw: { symbol: "●", color: "#2f9f95" },
    crown: { symbol: "♛", color: "#f8c84e" },
    party: { symbol: "▲", color: "#4f8fcf" },
    sparkle: { symbol: "✦", color: "#f37b62" }
  };
  const item = stickerMap[type] || stickerMap.heart;
  const index = state.stickers.length;
  state.stickers.push({
    ...item,
    x: canvas.width * (.18 + (index % 4) * .2),
    y: canvas.height * (.18 + (Math.floor(index / 4) % 3) * .22),
    size: type === "paw" ? 54 : 70,
    rotation: (index % 2 ? 1 : -1) * .14
  });
  draw();
}

async function copyAppLink() {
  try {
    await navigator.clipboard?.writeText(publicAppUrl);
    setDetectorStatus("App link copied.", "success");
  } catch (error) {
    setDetectorStatus("Share this link: " + publicAppUrl, "success");
  }
}

function showQrCode() {
  renderQrCode(qrCodeBox, qrUrlText, 7);
  qrModal.classList.remove("hidden");
  qrCloseBtn.focus();
}

function hideQrCode() {
  qrModal.classList.add("hidden");
  qrBtn.focus();
}

function renderQrCode(targetBox = qrCodeBox, targetText = qrUrlText, cellSize = 7) {
  targetText.textContent = publicAppUrl;
  targetBox.innerHTML = "";
  if (typeof qrcode !== "function") {
    targetBox.textContent = "QR code is loading.";
    return;
  }
  const qr = qrcode(0, "M");
  qr.addData(publicAppUrl);
  qr.make();
  targetBox.innerHTML = qr.createSvgTag(cellSize, 3);
}

function downloadQrCode() {
  renderQrCode(qrCodeBox, qrUrlText, 7);
  const svg = qrCodeBox.querySelector("svg");
  if (!svg) return;
  const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
  const link = document.createElement("a");
  link.download = "pet-thought-bubbler-qr.svg";
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}

function downloadInlineQrCode() {
  renderQrCode(inlineQrBox, inlineQrUrlText, 3);
  const svg = inlineQrBox.querySelector("svg");
  if (!svg) return;
  const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
  const link = document.createElement("a");
  link.download = "pet-thought-bubbler-qr.svg";
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) / rect.width * canvas.width,
    y: (event.clientY - rect.top) / rect.height * canvas.height
  };
}

function activateManualPlacement(point) {
  if (!state.lastBubble) return;
  const target = state.lastBubble.targetX === undefined ? headTargetFallback() : { x: state.lastBubble.targetX, y: state.lastBubble.targetY };
  state.position = "manual";
  state.manual = {
    x: state.lastBubble.x,
    y: state.lastBubble.y,
    targetX: target.x,
    targetY: target.y
  };
  document.querySelectorAll("[data-position]").forEach((item) => item.classList.toggle("active", item.dataset.position === "manual"));
}

function headTargetFallback() {
  return {
    x: canvas.width / 2,
    y: canvas.height * .38
  };
}

function hitBubble(point) {
  const b = state.lastBubble;
  return b && point.x >= b.x && point.x <= b.x + b.width && point.y >= b.y && point.y <= b.y + b.height;
}

function hitTarget(point) {
  const b = state.lastBubble;
  if (!b || b.targetX === undefined) return false;
  return Math.hypot(point.x - b.targetX, point.y - b.targetY) < 70;
}

canvas.addEventListener("pointerdown", (event) => {
  if (!state.image) return;
  const point = canvasPoint(event);
  event.preventDefault();
  if (state.doodleMode && !state.viewOriginal) {
    activeStroke = {
      color: doodleColor.value,
      size: Number(doodleSize.value),
      points: [point]
    };
    canvas.setPointerCapture(event.pointerId);
    return;
  }
  if (!state.lastBubble) return;
  activateManualPlacement(point);
  if (hitTarget(point)) {
    dragMode = { type: "target" };
  } else if (hitBubble(point)) {
    dragMode = { type: "bubble", offsetX: point.x - state.manual.x, offsetY: point.y - state.manual.y };
  } else {
    state.manual.targetX = clamp(point.x, 12, canvas.width - 12);
    state.manual.targetY = clamp(point.y, 12, canvas.height - 12);
    dragMode = { type: "target" };
    draw();
  }
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", (event) => {
  if (activeStroke) {
    activeStroke.points.push(canvasPoint(event));
    draw();
    return;
  }
  if (!dragMode || !state.manual) return;
  const point = canvasPoint(event);
  if (dragMode.type === "target") {
    state.manual.targetX = clamp(point.x, 12, canvas.width - 12);
    state.manual.targetY = clamp(point.y, 12, canvas.height - 12);
  } else {
    state.manual.x = point.x - dragMode.offsetX;
    state.manual.y = point.y - dragMode.offsetY;
  }
  draw();
});

canvas.addEventListener("pointerup", (event) => {
  if (activeStroke) {
    activeStroke.points.push(canvasPoint(event));
    if (activeStroke.points.length > 1) state.strokes.push(activeStroke);
    activeStroke = null;
    draw();
    canvas.releasePointerCapture(event.pointerId);
    return;
  }
  if (!dragMode) return;
  dragMode = null;
  canvas.releasePointerCapture(event.pointerId);
});

canvas.addEventListener("pointercancel", () => {
  dragMode = null;
  activeStroke = null;
});

function loadFile(file) {
  if (!file || !file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const image = new Image();
    image.addEventListener("load", () => {
      state.image = image;
      state.detection = null;
      state.warning = "";
      state.sceneTags = [];
      state.stickers = [];
      state.strokes = [];
      state.viewOriginal = false;
      state.doodleMode = false;
      state.manual = null;
      beforeAfterBtn.textContent = "Original";
      doodleBtn.classList.remove("active");
      setPhotoVisible(true);
      emptyState.classList.add("hidden");
      nextPhrase();
      identifyPet(image);
    });
    image.src = reader.result;
  });
  reader.readAsDataURL(file);
}

photoInput.addEventListener("change", (event) => loadFile(event.target.files[0]));
cameraInput.addEventListener("change", (event) => loadFile(event.target.files[0]));
cameraBtn.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    cameraInput.click();
  }
});

petNameInput.addEventListener("input", () => {
  state.petName = petNameInput.value.trim();
  if (state.image && !state.warning) nextPhrase();
});

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

styleSelect.addEventListener("change", () => {
  state.style = styleSelect.value;
  draw();
});

document.querySelectorAll("[data-position]").forEach((button) => {
  button.addEventListener("click", () => {
    state.position = button.dataset.position;
    if (state.position !== "manual") state.manual = null;
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
document.querySelectorAll("[data-sticker]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!state.image) return;
    state.viewOriginal = false;
    beforeAfterBtn.textContent = "Original";
    addSticker(button.dataset.sticker);
  });
});

doodleBtn.addEventListener("click", () => {
  if (!state.image) return;
  state.viewOriginal = false;
  state.doodleMode = !state.doodleMode;
  beforeAfterBtn.textContent = "Original";
  doodleBtn.classList.toggle("active", state.doodleMode);
  draw();
});

undoDoodleBtn.addEventListener("click", () => {
  state.strokes.pop();
  draw();
});

clearDoodleBtn.addEventListener("click", () => {
  state.strokes = [];
  draw();
});

beforeAfterBtn.addEventListener("click", () => {
  if (!state.image) return;
  state.viewOriginal = !state.viewOriginal;
  beforeAfterBtn.textContent = state.viewOriginal ? "Bubble" : "Original";
  draw();
});

copyLinkBtn.addEventListener("click", async () => {
  await copyAppLink();
});

qrBtn.addEventListener("click", () => {
  showQrCode();
});

qrCloseBtn.addEventListener("click", () => {
  hideQrCode();
});

qrModal.addEventListener("click", (event) => {
  if (event.target === qrModal) hideQrCode();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !qrModal.classList.contains("hidden")) hideQrCode();
});

copyQrLinkBtn.addEventListener("click", async () => {
  await copyAppLink();
});

downloadQrBtn.addEventListener("click", () => {
  downloadQrCode();
});

copyInlineQrLinkBtn.addEventListener("click", async () => {
  await copyAppLink();
});

downloadInlineQrBtn.addEventListener("click", () => {
  downloadInlineQrCode();
});

shuffleAllBtn.addEventListener("click", () => {
  state.pet = pick(["cat", "dog", "either"]);
  state.bubble = pick(["thought", "speech"]);
  state.style = pick(["classic", "comic", "cloud", "sticker", "whisper", "announcement", "news"]);
  state.position = state.detection ? "auto" : pick(["auto", "top-left", "top-right", "bottom-left", "bottom-right"]);
  state.mood = "random";
  state.manual = null;
  state.viewOriginal = false;
  moodSelect.value = "random";
  styleSelect.value = state.style;
  beforeAfterBtn.textContent = "Original";
  document.querySelectorAll("[data-pet]").forEach((item) => item.classList.toggle("active", item.dataset.pet === state.pet));
  document.querySelectorAll("[data-bubble]").forEach((item) => item.classList.toggle("active", item.dataset.bubble === state.bubble));
  document.querySelectorAll("[data-position]").forEach((item) => item.classList.toggle("active", item.dataset.position === state.position));
  nextPhrase();
});

downloadBtn.addEventListener("click", () => {
  downloadImage();
});

sharePhotoBtn.addEventListener("click", async () => {
  if (!state.image) return;
  const blob = await canvasBlob();
  const file = new File([blob], "pet-thought-bubble.png", { type: "image/png" });

  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "Pet Thought Bubbler",
        text: `Look what my pet is thinking. Make one here: ${publicAppUrl}`,
        url: publicAppUrl
      });
      saveToGallery(currentImageDataUrl());
      return;
    }
  } catch (error) {
    if (error.name === "AbortError") return;
  }

  downloadImage();
  setDetectorStatus("Sharing photos is not available here, so I downloaded it instead.", "warning");
});

shareAppBtn.addEventListener("click", async () => {
  const shareData = {
    title: "Pet Thought Bubbler",
    text: "Add silly thought bubbles to cat and dog photos.",
    url: publicAppUrl
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
  } catch (error) {
    if (error.name === "AbortError") return;
  }

  await copyAppLink();
});

clearBtn.addEventListener("click", () => {
  state.image = null;
  state.detection = null;
  state.warning = "";
  state.phrase = "";
  state.sceneTags = [];
  state.manual = null;
  state.phraseOptions = [];
  state.stickers = [];
  state.strokes = [];
  state.viewOriginal = false;
  state.doodleMode = false;
  activeStroke = null;
  phraseInput.value = "";
  renderPhraseChoices([]);
  photoInput.value = "";
  cameraInput.value = "";
  beforeAfterBtn.textContent = "Original";
  doodleBtn.classList.remove("active");
  setPhotoVisible(false);
  setDetectorStatus("Ready to spot cats and dogs.");
  emptyState.classList.remove("hidden");
  draw();
});

draw();
renderGallery();

function downloadImage() {
  const link = document.createElement("a");
  link.download = "pet-thought-bubble.png";
  link.href = currentImageDataUrl();
  link.click();
  saveToGallery(link.href);
}

function canvasBlob() {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

function currentImageDataUrl() {
  return canvas.toDataURL("image/png");
}

function loadGallery() {
  try {
    return JSON.parse(localStorage.getItem(galleryKey) || "[]");
  } catch (error) {
    return [];
  }
}

function saveToGallery(dataUrl) {
  const items = loadGallery();
  items.unshift(dataUrl);
  for (let count = 6; count >= 1; count--) {
    try {
      localStorage.setItem(galleryKey, JSON.stringify(items.slice(0, count)));
      break;
    } catch (error) {
      if (count === 1) localStorage.removeItem(galleryKey);
    }
  }
  renderGallery();
}

function renderGallery() {
  const items = loadGallery();
  gallery.classList.toggle("hidden", !items.length);
  galleryStrip.innerHTML = "";
  items.forEach((item, index) => {
    const button = document.createElement("button");
    button.className = "gallery-item";
    button.type = "button";
    button.setAttribute("aria-label", `Open recent creation ${index + 1}`);
    const img = document.createElement("img");
    img.src = item;
    img.alt = "";
    button.append(img);
    button.addEventListener("click", () => loadGalleryImage(item));
    galleryStrip.append(button);
  });
}

function loadGalleryImage(dataUrl) {
  const image = new Image();
  image.addEventListener("load", () => {
    state.image = image;
    state.detection = null;
    state.warning = "";
    state.sceneTags = [];
    state.manual = null;
    state.stickers = [];
    state.strokes = [];
    state.viewOriginal = false;
    state.doodleMode = false;
    beforeAfterBtn.textContent = "Original";
    doodleBtn.classList.remove("active");
    setPhotoVisible(true);
    emptyState.classList.add("hidden");
    nextPhrase();
    setDetectorStatus("Recent creation loaded.", "success");
  });
  image.src = dataUrl;
}

clearGalleryBtn.addEventListener("click", () => {
  localStorage.removeItem(galleryKey);
  renderGallery();
});

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
      state.sceneTags = sceneTagsFromPredictions(predictions, pet);
      state.warning = "";
      setActivePet(pet.class);
      const sceneNote = state.sceneTags.length ? ` Scene clues: ${state.sceneTags.slice(0, 3).join(", ")}.` : "";
      setDetectorStatus(`Looks like a ${pet.class}. Bubble aligned near the head.${sceneNote}`, "success");
      nextPhrase();
      return;
    }

    if (people.length) {
      state.pet = "either";
      state.detection = null;
      state.sceneTags = [];
      state.warning = "That's not a pet. Try a cat or dog photo.";
      setActivePet("either");
      setDetectorStatus("That's not a pet. Try a cat or dog photo.", "warning");
      nextPhrase();
      return;
    }

    state.detection = null;
    state.sceneTags = [];
    state.warning = "I can't find a cat or dog yet. Try a clearer pet photo.";
    setDetectorStatus("I can't find a cat or dog yet. Try a clearer pet photo.", "warning");
    nextPhrase();
  } catch (error) {
    state.detection = null;
    state.sceneTags = [];
    setDetectorStatus("Pet spotting is unavailable right now, but you can still make bubbles manually.", "warning");
    draw();
  }
}

function sceneTagsFromPredictions(predictions, pet) {
  const tagSet = new Set();
  const strongObjects = predictions.filter((item) => item.score >= .38 && item !== pet);
  const classNames = strongObjects.map((item) => item.class);

  addTagForAny(tagSet, classNames, "food", ["banana", "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "bowl", "cup", "wine glass", "fork", "knife", "spoon", "dining table"]);
  addTagForAny(tagSet, classNames, "couch", ["couch", "chair"]);
  addTagForAny(tagSet, classNames, "bed", ["bed"]);
  addTagForAny(tagSet, classNames, "person", ["person"]);
  addTagForAny(tagSet, classNames, "computer", ["laptop", "keyboard", "mouse", "cell phone", "tv", "remote"]);
  addTagForAny(tagSet, classNames, "toy", ["sports ball", "frisbee", "teddy bear", "baseball bat", "baseball glove", "skateboard"]);
  addTagForAny(tagSet, classNames, "outside", ["bird", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "bench", "umbrella", "skis", "snowboard", "kite", "surfboard", "tennis racket"]);
  addTagForAny(tagSet, classNames, "vehicle", ["bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat"]);
  addTagForAny(tagSet, classNames, "plant", ["potted plant"]);
  addTagForAny(tagSet, classNames, "bag", ["backpack", "handbag", "suitcase"]);
  addTagForAny(tagSet, classNames, "bathroom", ["toilet", "sink", "toothbrush", "hair drier"]);

  if (pet?.bbox && state.image) {
    const petArea = pet.bbox[2] * pet.bbox[3];
    const imageArea = state.image.naturalWidth * state.image.naturalHeight;
    if (petArea / imageArea > .42) tagSet.add("closeup");
  }

  return [...tagSet];
}

function addTagForAny(tagSet, classNames, tag, matches) {
  if (matches.some((item) => classNames.includes(item))) tagSet.add(tag);
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
