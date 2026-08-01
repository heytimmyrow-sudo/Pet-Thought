const canvas = document.querySelector("#petCanvas");
const ctx = canvas.getContext("2d");
const app = document.querySelector(".app");
const photoInput = document.querySelector("#photoInput");
const cameraInput = document.querySelector("#cameraInput");
const choosePhotoBtn = document.querySelector("#choosePhotoBtn");
const cameraBtn = document.querySelector("#cameraBtn");
const dropZone = document.querySelector("#dropZone");
const emptyState = document.querySelector("#emptyState");
const detectorStatus = document.querySelector("#detectorStatus");
const phraseInput = document.querySelector("#phraseInput");
const phraseBtn = document.querySelector("#phraseBtn");
const customPhraseBtn = document.querySelector("#customPhraseBtn");
const shortBtn = document.querySelector("#shortBtn");
const badPhraseBtn = document.querySelector("#badPhraseBtn");
const shuffleAllBtn = document.querySelector("#shuffleAllBtn");
const petNameInput = document.querySelector("#petNameInput");
const styleSelect = document.querySelector("#styleSelect");
const moodSelect = document.querySelector("#moodSelect");
const sizeRange = document.querySelector("#sizeRange");
const textRange = document.querySelector("#textRange");
const downloadBtn = document.querySelector("#downloadBtn");
const clearBtn = document.querySelector("#clearBtn");
const speakBtn = document.querySelector("#speakBtn");
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
const tailBtn = document.querySelector("#tailBtn");
const doodleBtn = document.querySelector("#doodleBtn");
const doodleColor = document.querySelector("#doodleColor");
const doodleSize = document.querySelector("#doodleSize");
const undoDoodleBtn = document.querySelector("#undoDoodleBtn");
const clearDoodleBtn = document.querySelector("#clearDoodleBtn");
const voiceButtons = document.querySelectorAll("[data-voice]");
const cameraModal = document.querySelector("#cameraModal");
const cameraPreview = document.querySelector("#cameraPreview");
const cameraCloseBtn = document.querySelector("#cameraCloseBtn");
const cameraCancelBtn = document.querySelector("#cameraCancelBtn");
const captureBtn = document.querySelector("#captureBtn");
const cameraHelp = document.querySelector("#cameraHelp");

const state = {
  image: null,
  pet: "cat",
  bubble: "thought",
  voiceStyle: "cute",
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
  sceneDetails: [],
  petName: "",
  phraseOptions: [],
  stickers: [],
  strokes: [],
  viewOriginal: false,
  doodleMode: false,
  tailMode: false,
  speaking: false,
  talkStartedAt: 0,
  suppressEditHandles: false,
  awaitingCaptionChoice: false
};

let detectorPromise = null;
let dragMode = null;
let activeStroke = null;
let cameraStream = null;
let talkAnimationFrame = null;
const galleryKey = "petThoughtGallery";
const reportedPhraseKey = "petThoughtReportedPhrases";
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
  on_table: {
    cat: [
      "I am on this table for very official cat reasons.",
      "This table has become my elevated cat headquarters.",
      "I climbed onto the table and found power.",
      "The table is mine because I am currently on it."
    ],
    dog: [
      "I am on the table and taking questions.",
      "This table I am on was clearly very important.",
      "I found my way onto the table like a professional.",
      "The table I am on is surprised, but I am committed."
    ],
    either: [
      "Being on this table has improved the whole photo.",
      "This table is now a tiny stage.",
      "I am using this table for important visibility.",
      "The surface beneath me has been promoted."
    ]
  },
  on_couch: {
    cat: [
      "I am on the couch because comfort needed leadership.",
      "This couch I am on has accepted my cat authority.",
      "I found the couch and became furniture royalty.",
      "The couch I am on is doing a fine job holding me."
    ],
    dog: [
      "I am on the couch and fully available for snuggles.",
      "This couch is better with dog installed on it.",
      "I have joined the couch for emotional support.",
      "The couch and I are having a cozy meeting."
    ],
    either: [
      "I am on this couch doing comfort research.",
      "This couch I am on has been officially softened.",
      "The cushion under me is performing beautifully.",
      "I found the couch, got on it, and improved it."
    ]
  },
  on_bed: {
    cat: [
      "I am on the bed conducting nap business.",
      "This bed I am on has been selected by cat management.",
      "I found the bed, got on it, and became unavailable.",
      "The bed I am on is mine until further notice."
    ],
    dog: [
      "I am on the bed saving a tiny corner for you.",
      "This bed and I are best nap partners.",
      "I brought dog warmth onto the bed meeting.",
      "The bed is currently under cuddle protection."
    ],
    either: [
      "I am on this bed for professional resting.",
      "The bed has accepted my softness.",
      "This bed scene is mostly about cozy excellence.",
      "I found the nap zone and made it official."
    ]
  },
  near_food: {
    cat: [
      "I am near the food for scientific reasons.",
      "This nearby food is close enough to become my business.",
      "I am monitoring nearby snacks with quiet intensity.",
      "The nearby food and I are having a meaningful moment."
    ],
    dog: [
      "I am near the food and ready to help.",
      "This snack is close enough to inspire hope.",
      "I have positioned myself near the food department.",
      "The food is nearby, so my focus is excellent."
    ],
    either: [
      "I am near the snacks and thinking important thoughts.",
      "The food nearby has my full attention.",
      "This nearby food situation requires supervision.",
      "I found the snack zone and reported for duty."
    ]
  },
  near_toy: {
    cat: [
      "I am near this toy so it remembers who is in charge.",
      "This nearby toy is close enough for dramatic judgment.",
      "I am pretending the nearby toy is not exciting.",
      "The toy near me has been carefully evaluated."
    ],
    dog: [
      "I am near the toy and prepared for launch.",
      "This nearby toy is close, which means joy is close.",
      "I found the nearby toy zone and brought enthusiasm.",
      "The toy near me is requesting another throw."
    ],
    either: [
      "I am near the toy and the plot is developing.",
      "This nearby toy has become very important.",
      "The nearby toy situation is close and serious.",
      "Playtime is within paw range."
    ]
  },
  near_computer: {
    cat: [
      "I am near the computer to improve productivity.",
      "This nearby computer is close enough for cat management.",
      "I am supervising the nearby screen with authority.",
      "The computer near me clearly needed fluff."
    ],
    dog: [
      "I am near the computer because work needs moral support.",
      "This laptop is close, but walks are still important.",
      "I brought my face to the nearby computer zone.",
      "The nearby screen has not thrown a ball once."
    ],
    either: [
      "I am near the computer and reviewing the situation.",
      "This work zone needed a tiny supervisor.",
      "The nearby screen is competing with my cuteness.",
      "Nearby computer time has been interrupted by excellence."
    ]
  },
  with_person: {
    cat: [
      "I am with my human assistant for scale.",
      "This person is close because I allowed it.",
      "My human is nearby and seems useful.",
      "I am sharing the frame with trained staff."
    ],
    dog: [
      "I am with my person and everything is better.",
      "My human is close, so this photo is perfect.",
      "I brought my favorite person into the moment.",
      "This person is near me because we are a team."
    ],
    either: [
      "I am with my human and feeling very official.",
      "This person nearby is part of my support crew.",
      "The human in this photo has been approved.",
      "I am close to someone important."
    ]
  },
  floor: {
    cat: [
      "This floor has been selected for cat business.",
      "I am on floor patrol with quiet authority.",
      "The floor is beneath me and therefore important.",
      "I have claimed this floor-level situation."
    ],
    dog: [
      "I am on the floor and ready for action.",
      "This floor has excellent flop potential.",
      "I brought dog energy to the floor zone.",
      "The floor is currently my command center."
    ],
    either: [
      "This floor scene has my full attention.",
      "I am making the floor look important.",
      "The floor situation has been approved.",
      "Ground-level cuteness has been detected."
    ]
  },
  window: {
    cat: [
      "This window is my tiny theater.",
      "I am monitoring the window for suspicious movement.",
      "The window has excellent bird television.",
      "I have important window-watching duties."
    ],
    dog: [
      "This window contains breaking neighborhood news.",
      "I am supervising the window with my nose.",
      "The window view needs more tail energy.",
      "I spotted window activity and became official."
    ],
    either: [
      "The window scene has my attention.",
      "I am reviewing the view through this window.",
      "This window has become an important lookout.",
      "Window watching is serious pet work."
    ]
  },
  crate: {
    cat: [
      "This crate has been inspected by cat management.",
      "I am judging this crate from a safe attitude.",
      "The crate situation requires whisker review.",
      "This crate is now part of my investigation."
    ],
    dog: [
      "This crate is my little den checkpoint.",
      "I am near the crate and doing brave thoughts.",
      "The crate has been reviewed by dog leadership.",
      "This crate scene could use a treat."
    ],
    either: [
      "This crate has been officially considered.",
      "I have important crate opinions.",
      "The crate situation is under pet review.",
      "This little den zone has been noticed."
    ]
  },
  leash: {
    cat: [
      "This leash raises several cat questions.",
      "I am near the leash and negotiating terms.",
      "The leash situation seems suspiciously outdoor.",
      "This leash has entered my formal complaint."
    ],
    dog: [
      "The leash is here, so walk hopes are rising.",
      "I am near the leash and emotionally prepared.",
      "This leash means adventure might be loading.",
      "The leash situation has activated my optimism."
    ],
    either: [
      "This leash has become the main topic.",
      "I have noticed the leash situation.",
      "The leash nearby suggests possible adventure.",
      "This leash requires immediate pet analysis."
    ]
  },
  bowl: {
    cat: [
      "This bowl is under strict cat inspection.",
      "I am evaluating the bowl with great seriousness.",
      "The bowl situation affects me personally.",
      "This bowl has my full snack attention."
    ],
    dog: [
      "This bowl and I have important business.",
      "I am monitoring the bowl for improvements.",
      "The bowl situation could use more snacks.",
      "This bowl has excellent refill potential."
    ],
    either: [
      "The bowl has been noticed immediately.",
      "This bowl scene requires snack analysis.",
      "I am thinking bowl-related thoughts.",
      "The bowl situation is highly relevant."
    ]
  },
  blanket: {
    cat: [
      "This blanket has accepted my cat shape.",
      "I am improving the blanket with my presence.",
      "The blanket is under soft cat management.",
      "This blanket situation is extremely approved."
    ],
    dog: [
      "This blanket is better because I am here.",
      "I brought warmth to the blanket zone.",
      "The blanket and I are having a cozy meeting.",
      "This blanket scene needs one more snuggle."
    ],
    either: [
      "This blanket has excellent cozy energy.",
      "I am supervising the blanket situation.",
      "The blanket has become very important.",
      "This soft blanket scene has been approved."
    ]
  },
  rug: {
    cat: [
      "This rug is my low-profile throne.",
      "I am decorating the rug with importance.",
      "The rug has been claimed by cat law.",
      "This rug scene needed more whiskers."
    ],
    dog: [
      "This rug is perfect for dramatic flopping.",
      "I am bringing dog charm to the rug.",
      "The rug has become my cozy checkpoint.",
      "This rug scene has excellent paw placement."
    ],
    either: [
      "This rug has been officially noticed.",
      "I am making the rug look more important.",
      "The rug situation is now pet-approved.",
      "This rug scene has strong cozy potential."
    ]
  },
  table: {
    cat: [
      "This table is my observation platform.",
      "I have claimed the table for important cat business.",
      "The table gives me excellent dramatic height.",
      "I am conducting serious table research."
    ],
    dog: [
      "This table situation needs my very close supervision.",
      "I found the table and brought my face.",
      "The table is high, but my curiosity is higher.",
      "I am politely monitoring this table scene."
    ],
    either: [
      "This table is now part of my official territory.",
      "I am near the table because important things happen here.",
      "The table has been inspected and approved.",
      "This surface clearly needed a tiny supervisor."
    ]
  },
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
      "This food scene requires treat analysis.",
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
      "Wake me when bed admiration resumes.",
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
      "This person-adjacent lap situation has promise.",
      "The human seems trainable."
    ],
    dog: [
      "My favorite person is in the photo!",
      "I am close to my human on purpose.",
      "This person is part of my pack.",
      "I saved this happy face for my person."
    ],
    either: [
      "My human is here, so everything is better.",
      "This photo includes my favorite staff member.",
      "I am posing near an important human.",
      "The human adds useful warmth."
    ]
  },
  computer: {
    cat: [
      "Your keyboard clearly needed my expertise.",
      "I am helping by blocking the screen.",
      "This work thing belongs to me now.",
      "I typed one mysterious computer email."
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
      "I found seventeen outdoor smell stories.",
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
      "I packed my face and enthusiasm for this ride."
    ],
    either: [
      "Travel has been detected.",
      "This ride needs one small captain.",
      "I am ready for this vehicle, suspicious, or both.",
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
      "This plant is doing a good nature job."
    ],
    either: [
      "The plant is part of my investigation.",
      "Green things have been noticed.",
      "I am adding charm to the plant scenery.",
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
      "I am damp in my bathroom imagination."
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

const sceneCaptionTemplates = {
  on_table: [
    "{pet} is on this table and has promoted it to lookout tower.",
    "I am on the table because supervision works better from up here.",
    "This table is my stage, and everyone may begin applauding."
  ],
  on_couch: [
    "{pet} is on the couch and has chosen maximum comfort.",
    "I am on this couch because it is my soft headquarters.",
    "I found the couch, so the meeting is officially cozy."
  ],
  on_bed: [
    "{pet} is on the bed and doing advanced nap research.",
    "I am on this bed for serious snoozing research.",
    "I am on the bed because softness requires leadership."
  ],
  near_food: [
    "{pet} is near the food and pretending to be casual.",
    "I am close to the snacks for important scientific reasons.",
    "I am near this food because it needs a brave taste inspector."
  ],
  near_toy: [
    "{pet} is near the toy and ready for dramatic playtime.",
    "I am near this toy because immediate silliness is required.",
    "I am near the toy so someone understands the assignment."
  ],
  near_computer: [
    "{pet} is near the computer and managing productivity.",
    "I am helping with computer work by being impossible to ignore.",
    "This screen needs more pet supervision."
  ],
  with_person: [
    "{pet} is with a human and clearly supervising them.",
    "I brought my human into the photo for emotional support.",
    "This person is doing well because I am nearby."
  ],
  floor: [
    "{pet} is on the floor and conducting ground-level business.",
    "I am on the floor because this is where the important smells live.",
    "This floor has been claimed for pet operations."
  ],
  window: [
    "{pet} is by the window and monitoring the view.",
    "I am watching the window like tiny neighborhood security.",
    "This window has excellent things to stare at."
  ],
  crate: [
    "{pet} is near the crate and reviewing den policy.",
    "This crate situation has been inspected by management.",
    "I am near the crate, but I would like to discuss benefits."
  ],
  leash: [
    "{pet} is near the leash and thinking about adventures.",
    "I saw the leash, so walk hopes are rising quickly.",
    "This leash has awakened my outdoor feelings."
  ],
  bowl: [
    "{pet} is near the bowl and expecting excellent service.",
    "I found the bowl and would like to file a refill request.",
    "This bowl is the emotional center of the photo."
  ],
  blanket: [
    "{pet} is on the blanket and accepting cozy compliments.",
    "This blanket has been claimed by the softness department.",
    "I am on the blanket because comfort needs a professional."
  ],
  rug: [
    "{pet} is on the rug and making it look important.",
    "This rug is my fancy floor island.",
    "I am on the rug because my paws chose luxury."
  ],
  table: [
    "{pet} spotted the table and is considering a promotion.",
    "This table is suspiciously useful for pet business.",
    "I have important table-related opinions."
  ],
  food: [
    "{pet} spotted food and is suddenly very focused.",
    "This snack situation has my full attention.",
    "I see food, so I am becoming extremely polite."
  ],
  couch: [
    "{pet} spotted the couch and is planning comfort.",
    "This couch looks like it needs a pet-shaped decoration.",
    "I have cozy plans for that couch."
  ],
  bed: [
    "{pet} spotted the bed and is thinking about naps.",
    "That bed appears ready for my official inspection.",
    "I see a bed, so my schedule is suddenly full."
  ],
  person: [
    "{pet} spotted a human and is managing them carefully.",
    "This human looks trainable and possibly snack-adjacent.",
    "I see my person, so this photo has emotional value."
  ],
  computer: [
    "{pet} spotted the computer and is ready to help badly.",
    "This computer clearly needs more pet opinions.",
    "I see a screen, so I will improve the meeting."
  ],
  toy: [
    "{pet} spotted a toy and has entered play mode.",
    "This toy is about to become the main character.",
    "I see the toy, and my tiny plan is working."
  ],
  outside: [
    "{pet} is outside and collecting fresh-air information.",
    "This outdoor scene has many smells to consider.",
    "I am outside, so adventure paperwork has begun."
  ],
  vehicle: [
    "{pet} spotted a vehicle and is thinking travel thoughts.",
    "This ride may require snacks and window access.",
    "I see transportation and have questions about destinations."
  ],
  plant: [
    "{pet} spotted a plant and is judging the leaves.",
    "This plant has entered my inspection zone.",
    "I am reviewing the leafy situation very seriously."
  ],
  bag: [
    "{pet} spotted a bag and is checking for trip supplies.",
    "This bag may contain snacks, secrets, or both.",
    "I see the bag, so I am preparing for portable mischief."
  ],
  bathroom: [
    "{pet} is in the bathroom and questioning the water choices.",
    "This bathroom has suspicious splash potential.",
    "I am reviewing the wet-room situation with concern."
  ],
  closeup: [
    "{pet} is very close to the camera with an important face.",
    "My face is filling the frame because the people deserve it.",
    "This close-up is my official tiny announcement."
  ]
};

function allMoodKeys() {
  return ["food", "royalty", "chaos", "nap", "dramatic", "compliment", "birthday", "morning", "apology", "holiday", "hungry", "sleepy", "guilty", "excited", "fancy", "confused", "boss"];
}

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function nextPhrase(short = false) {
  stopSpeaking();
  if (state.warning) {
    state.awaitingCaptionChoice = false;
    state.phrase = state.warning;
    phraseInput.value = state.phrase;
    renderPhraseChoices([]);
    draw();
    return;
  }
  if (short) {
    state.awaitingCaptionChoice = false;
    state.phrase = personalizePhrase(contextualPhrase(true) || pick(shortPhrases));
  } else {
    state.phraseOptions = buildPhraseOptions(3);
    state.phrase = state.awaitingCaptionChoice ? "" : state.phraseOptions[0] || fallbackPhrase();
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
  const precise = personalizePhrase(preciseScenePhrase());
  if (precise && !isReportedPhrase(precise)) options.push(precise);
  const mood = selectedMood();
  const attempts = count * 14;
  for (let index = 0; index < attempts && options.length < count; index++) {
    const phrase = personalizePhrase(buildContextPhrase(mood, false) || (!state.sceneTags.length ? pick(getPhrasePool(state.pet, mood)) : ""));
    if (phrase && !isReportedPhrase(phrase) && !options.includes(phrase)) options.push(phrase);
  }
  while (options.length < count && state.sceneTags.length) {
    const tag = state.sceneTags[options.length % state.sceneTags.length];
    const phrase = personalizePhrase(sceneFallbackPhrase(tag));
    if (!isReportedPhrase(phrase) && !options.includes(phrase)) options.push(phrase);
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

function preciseScenePhrase(short = false) {
  if (!state.sceneTags.length) return "";
  const detail = bestSceneDetail();
  if (!detail) return "";
  if (short) return shortenContextPhrase(detail.tag, "");
  const templates = sceneCaptionTemplates[detail.tag] || sceneCaptionTemplates[detail.baseTag];
  if (!templates?.length) return "";
  return fillSceneTemplate(pick(templates), detail);
}

function bestSceneDetail() {
  const priority = ["on_table", "on_couch", "on_bed", "near_food", "bowl", "near_toy", "near_computer", "with_person", "floor", "window", "crate", "leash", "blanket", "rug", "food", "toy", "computer", "person", "table", "couch", "bed", "outside", "vehicle", "plant", "bag", "bathroom", "closeup"];
  const details = state.sceneDetails.length ? state.sceneDetails : state.sceneTags.map((tag) => ({ tag, baseTag: tag, label: displaySceneTag(tag) }));
  return priority
    .map((tag) => details.find((detail) => detail.tag === tag))
    .find(Boolean) || details[0];
}

function fillSceneTemplate(template, detail) {
  const pet = petLabel();
  const object = detail?.label || displaySceneTag(detail?.tag || "");
  return template
    .replaceAll("{pet}", pet)
    .replaceAll("{object}", object)
    .replace(/\s+/g, " ")
    .trim();
}

function fallbackPhrase() {
  if (state.sceneTags.length) return personalizePhrase(sceneFallbackPhrase(state.sceneTags[0]));
  return personalizePhrase(pick(getPhrasePool(state.pet, selectedMood())));
}

function sceneFallbackPhrase(tag) {
  const labels = {
    on_table: "being on this table",
    on_couch: "being on this couch",
    on_bed: "being on this bed",
    near_food: "this nearby food",
    near_toy: "this nearby toy",
    near_computer: "this nearby computer",
    with_person: "being with my human",
    floor: "this floor scene",
    window: "this window scene",
    crate: "this crate scene",
    leash: "this leash situation",
    bowl: "this bowl scene",
    blanket: "this blanket scene",
    rug: "this rug scene",
    table: "this table scene",
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
  ["on_table", "on_couch", "on_bed", "near_food", "near_toy", "near_computer", "with_person"].forEach((tag) => {
    if (tags.includes(tag)) tags.push(tag, tag, tag, tag);
  });
  ["floor", "window", "crate", "leash", "blanket", "rug"].forEach((tag) => {
    if (tags.includes(tag)) tags.push(tag);
  });
  if (tags.includes("bowl")) tags.push("bowl", "bowl", "bowl", "bowl");
  if (tags.includes("table")) tags.push("table", "table", "table");
  if (tags.includes("computer")) tags.push("computer");
  if (tags.includes("toy")) tags.push("toy");
  if (["food", "hungry"].includes(mood) && tags.includes("food")) tags.push("food", "food");
  if (["nap", "sleepy"].includes(mood) && tags.some((tag) => ["bed", "couch"].includes(tag))) tags.push("bed", "couch");
  if (["chaos", "excited"].includes(mood) && tags.includes("toy")) tags.push("toy", "toy");
  if (["compliment", "boss"].includes(mood) && tags.includes("person")) tags.push("person");
  return tags;
}

function adaptPhraseForMood(base, mood, tag) {
  if (state.mood === "random") return base;
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
    on_table: ["On table.", "Table boss.", "High ground."],
    on_couch: ["On couch.", "Couch mode.", "Cushion boss."],
    on_bed: ["On bed.", "Nap zone.", "Bed boss."],
    near_food: ["Snack range.", "Food watch.", "Treat nearby."],
    near_toy: ["Toy nearby.", "Play range.", "Toy watch."],
    near_computer: ["Work watch.", "Screen zone.", "Computer boss."],
    with_person: ["With human.", "My person.", "Team photo."],
    floor: ["Floor patrol.", "Ground boss.", "Floor thoughts."],
    window: ["Window watch.", "View report.", "Lookout mode."],
    crate: ["Crate report.", "Den thoughts.", "Crate watch."],
    leash: ["Leash alert.", "Walk hopes.", "Adventure soon?"],
    bowl: ["Bowl watch.", "Snack bowl.", "Refill thoughts."],
    blanket: ["Blanket mode.", "Cozy blanket.", "Soft boss."],
    rug: ["Rug claimed.", "Floor cozy.", "Rug thoughts."],
    table: ["Table claimed.", "Surface boss.", "Table thoughts."],
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
      stopSpeaking();
      state.awaitingCaptionChoice = false;
      state.phrase = option;
      phraseInput.value = option;
      renderPhraseChoices(options);
      draw();
    });
    phraseChoices.append(button);
  });
}

function reportedPhrases() {
  try {
    return JSON.parse(localStorage.getItem(reportedPhraseKey) || "[]");
  } catch (error) {
    return [];
  }
}

function normalizePhraseForReport(phrase) {
  return phrase.trim().toLowerCase();
}

function isReportedPhrase(phrase) {
  const normalized = normalizePhraseForReport(phrase);
  return reportedPhrases().some((item) => item === normalized);
}

function reportCurrentPhrase() {
  const phrase = state.phrase.trim();
  if (!phrase || state.warning) {
    setDetectorStatus("Pick a phrase first, then report it if it feels wrong.", "warning");
    return;
  }
  const reports = reportedPhrases();
  const normalized = normalizePhraseForReport(phrase);
  if (!reports.includes(normalized)) {
    reports.unshift(normalized);
    localStorage.setItem(reportedPhraseKey, JSON.stringify(reports.slice(0, 80)));
  }
  state.phraseOptions = state.phraseOptions.filter((option) => normalizePhraseForReport(option) !== normalized);
  state.awaitingCaptionChoice = false;
  state.phraseOptions = state.phraseOptions.length >= 3 ? state.phraseOptions : buildPhraseOptions(3);
  state.phrase = state.phraseOptions[0] || fallbackPhrase();
  phraseInput.value = state.phrase;
  renderPhraseChoices(state.phraseOptions);
  setDetectorStatus("Got it. I swapped in a different phrase.", "success");
  draw();
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
      if (state.phrase.trim()) drawBubble(width, height);
      else state.lastBubble = null;
    } else {
      state.lastBubble = null;
    }
  } else {
    drawPlaceholder(width, height);
  }
}

function setPhotoVisible(hasPhoto) {
  app.classList.toggle("has-photo", hasPhoto);
  renderQrCode(inlineQrBox, inlineQrUrlText, 3);
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
  const talkPulse = state.speaking ? Math.sin((performance.now() - state.talkStartedAt) / 115) : 0;
  const talkScale = state.speaking ? 1 + talkPulse * .018 : 1;
  const drawX = pos.x + bubbleWidth * (1 - talkScale) / 2;
  const drawY = pos.y + bubbleHeight * (1 - talkScale) / 2;
  const drawWidth = bubbleWidth * talkScale;
  const drawHeight = bubbleHeight * talkScale;
  const drawPos = { ...pos, x: drawX, y: drawY, width: drawWidth, height: drawHeight };

  ctx.save();
  ctx.shadowColor = style === "whisper" ? "rgba(36, 31, 33, .16)" : "rgba(36, 31, 33, .28)";
  ctx.shadowBlur = style === "sticker" ? 12 : 24;
  ctx.shadowOffsetY = style === "sticker" ? 5 : 10;
  ctx.fillStyle = style === "news" ? "#fff3c4" : style === "comic" ? "#fffdf2" : "#ffffff";
  ctx.strokeStyle = style === "news" ? "#191617" : "#2d2728";
  ctx.lineWidth = style === "whisper" ? 4 : style === "comic" ? 10 : 7;

  if (state.bubble === "speech") {
    speechTail(drawPos);
  } else {
    thoughtDots(drawPos);
  }

  if (style === "cloud") {
    cloudBubble(drawX, drawY, drawWidth, drawHeight);
  } else if (style === "comic") {
    burstBubble(drawX, drawY, drawWidth, drawHeight);
  } else if (style === "sticker") {
    roundedRect(drawX, drawY, drawWidth, drawHeight, 22);
  } else if (style === "news") {
    roundedRect(drawX, drawY, drawWidth, drawHeight, 18);
  } else {
    roundedRect(drawX, drawY, drawWidth, drawHeight, style === "whisper" ? 26 : 42);
  }
  ctx.fill();
  ctx.stroke();
  if (style === "news") {
    ctx.fillStyle = "#2d2728";
    ctx.fillRect(drawX + 22, drawY + 20, drawWidth - 44, 7);
    ctx.fillRect(drawX + 22, drawY + drawHeight - 27, drawWidth - 44, 7);
  }
  ctx.restore();
  if (state.speaking) drawSoundMarks(drawPos, talkPulse);

  ctx.fillStyle = "#211d1e";
  ctx.font = `${style === "whisper" ? 800 : 900} ${baseFont}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const lineHeight = baseFont * 1.18;
  const firstY = drawY + drawHeight / 2 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, index) => {
    ctx.fillText(line, drawX + drawWidth / 2, firstY + index * lineHeight);
  });

  if (shouldDrawEditHandles()) drawEditHandles(pos);
}

function shouldDrawEditHandles() {
  return state.image && !state.viewOriginal && !state.suppressEditHandles && !state.doodleMode && (dragMode || state.tailMode || state.position === "manual");
}

function drawEditHandles(pos) {
  ctx.save();
  ctx.setLineDash([16, 12]);
  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(47, 159, 149, .92)";
  ctx.shadowColor = "rgba(255, 255, 255, .9)";
  ctx.shadowBlur = 8;
  roundedRect(pos.x - 10, pos.y - 10, pos.width + 20, pos.height + 20, 28);
  ctx.stroke();
  ctx.setLineDash([]);

  const corners = [
    { x: pos.x, y: pos.y },
    { x: pos.x + pos.width, y: pos.y },
    { x: pos.x, y: pos.y + pos.height },
    { x: pos.x + pos.width, y: pos.y + pos.height }
  ];
  corners.forEach((corner) => drawEditHandle(corner.x, corner.y, "#ffffff", "#2f9f95", 17));

  if (pos.targetX !== undefined) {
    ctx.beginPath();
    ctx.moveTo(pos.anchorX, pos.anchorY);
    ctx.lineTo(pos.targetX, pos.targetY);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(47, 159, 149, .62)";
    ctx.stroke();
    drawEditHandle(pos.targetX, pos.targetY, "#f8c84e", "#2d2728", 20);
  }
  ctx.restore();
}

function drawSoundMarks(pos, pulse) {
  const side = pos.x + pos.width / 2 < canvas.width / 2 ? 1 : -1;
  const originX = side === 1 ? pos.x + pos.width + 22 : pos.x - 22;
  const originY = pos.y + pos.height * .32;
  ctx.save();
  ctx.strokeStyle = "rgba(47, 159, 149, .86)";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.shadowColor = "rgba(255, 255, 255, .9)";
  ctx.shadowBlur = 7;
  for (let index = 0; index < 3; index++) {
    const radius = 18 + index * 15 + Math.max(0, pulse) * 5;
    const start = side === 1 ? -.62 : Math.PI + -.62;
    const end = side === 1 ? .62 : Math.PI + .62;
    ctx.beginPath();
    ctx.arc(originX, originY, radius, start, end, side === -1);
    ctx.stroke();
  }
  ctx.restore();
}

function drawEditHandle(x, y, fill, stroke, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 5;
  ctx.fill();
  ctx.stroke();
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
  const preferTop = topSpace > bubbleHeight + 62 || topSpace >= bottomSpace;
  const preferLeft = leftSpace > rightSpace;
  const offset = 46;
  const x = clamp(preferLeft ? target.x - bubbleWidth - offset : target.x + offset, margin, width - bubbleWidth - margin);
  const y = clamp(preferTop ? target.y - bubbleHeight - offset : target.y + offset, margin, height - bubbleHeight - margin);

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
  const petHeadY = state.bubble === "speech" ? (state.pet === "dog" ? .36 : .32) : (state.pet === "dog" ? .27 : .24);
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

function speakPetPhrase() {
  const text = state.phrase.trim();
  if (!text || state.warning) {
    setDetectorStatus("Add a pet phrase first, then the pet voice can read it.", "warning");
    return;
  }
  if (!("speechSynthesis" in window) || !window.SpeechSynthesisUtterance) {
    setDetectorStatus("This browser does not support pet voice playback.", "warning");
    return;
  }
  if (window.speechSynthesis.speaking) {
    stopSpeaking();
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  const style = voiceStyleSettings();
  utterance.rate = style.rate;
  utterance.pitch = style.pitch;
  utterance.volume = 1;
  const voice = choosePetVoice();
  if (voice) utterance.voice = voice;
  utterance.addEventListener("start", () => {
    speakBtn.textContent = "Stop Voice";
    state.speaking = true;
    state.talkStartedAt = performance.now();
    startTalkAnimation();
    setDetectorStatus(`${style.label} pet voice is reading the bubble.`, "success");
  });
  utterance.addEventListener("end", () => {
    stopTalkAnimation();
  });
  utterance.addEventListener("error", () => {
    stopTalkAnimation();
    setDetectorStatus("Pet voice could not play in this browser.", "warning");
  });
  window.speechSynthesis.speak(utterance);
}

function voiceStyleSettings() {
  const byStyle = {
    cute: { label: "Tiny", rate: state.pet === "dog" ? 1.06 : 1.0, pitch: state.pet === "cat" ? 1.45 : 1.24 },
    dramatic: { label: "Dramatic", rate: .88, pitch: state.pet === "cat" ? 1.14 : .98 },
    sleepy: { label: "Sleepy", rate: .72, pitch: state.pet === "cat" ? 1.05 : .92 },
    excited: { label: "Excited", rate: 1.24, pitch: state.pet === "cat" ? 1.55 : 1.32 }
  };
  return byStyle[state.voiceStyle] || byStyle.cute;
}

function choosePetVoice() {
  const voices = window.speechSynthesis.getVoices?.() || [];
  if (!voices.length) return null;
  const preferred = voices.find((voice) => /female|samantha|zira|google us english/i.test(voice.name));
  return preferred || voices.find((voice) => /^en[-_]/i.test(voice.lang)) || voices[0];
}

function stopSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  stopTalkAnimation();
}

function startTalkAnimation() {
  if (talkAnimationFrame) return;
  const tick = () => {
    if (!state.speaking) {
      talkAnimationFrame = null;
      return;
    }
    draw();
    talkAnimationFrame = requestAnimationFrame(tick);
  };
  talkAnimationFrame = requestAnimationFrame(tick);
}

function stopTalkAnimation() {
  state.speaking = false;
  if (talkAnimationFrame) {
    cancelAnimationFrame(talkAnimationFrame);
    talkAnimationFrame = null;
  }
  if (speakBtn) speakBtn.textContent = "Pet Voice";
  draw();
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

function setTailMode(active) {
  state.tailMode = active;
  tailBtn.classList.toggle("active", active);
  if (active) state.doodleMode = false;
  doodleBtn.classList.toggle("active", state.doodleMode);
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
  if (state.tailMode || hitTarget(point)) {
    state.manual.targetX = clamp(point.x, 12, canvas.width - 12);
    state.manual.targetY = clamp(point.y, 12, canvas.height - 12);
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
  reader.addEventListener("load", () => loadImageDataUrl(reader.result));
  reader.readAsDataURL(file);
}

function loadImageDataUrl(dataUrl) {
  const image = new Image();
  image.addEventListener("load", () => {
    state.image = image;
    state.detection = null;
    state.warning = "";
    state.sceneTags = [];
    state.sceneDetails = [];
    state.stickers = [];
    state.strokes = [];
    state.viewOriginal = false;
    state.doodleMode = false;
    state.manual = null;
    state.awaitingCaptionChoice = false;
    state.phrase = "";
    state.phraseOptions = [];
    setTailMode(false);
    stopSpeaking();
    phraseInput.value = "";
    renderPhraseChoices([]);
    beforeAfterBtn.textContent = "Original";
    doodleBtn.classList.remove("active");
    setPhotoVisible(true);
    emptyState.classList.add("hidden");
    draw();
    identifyPet(image);
  });
  image.src = dataUrl;
}

async function openCamera() {
  stopSpeaking();
  if (prefersDeviceCameraApp()) {
    cameraInput.click();
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    cameraInput.click();
    return;
  }
  try {
    cameraHelp.textContent = "Starting camera...";
    cameraModal.classList.remove("hidden");
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 960 }
      },
      audio: false
    });
    cameraPreview.srcObject = cameraStream;
    await cameraPreview.play();
    cameraHelp.textContent = "Point the camera at your pet, then capture.";
  } catch (error) {
    closeCamera();
    cameraInput.click();
    setDetectorStatus("Camera access was not available, so choose or take a picture from your device.", "warning");
  }
}

function prefersDeviceCameraApp() {
  return window.matchMedia?.("(pointer: coarse)")?.matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function closeCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }
  cameraPreview.srcObject = null;
  cameraModal.classList.add("hidden");
}

function captureCameraPhoto() {
  if (!cameraStream || !cameraPreview.videoWidth || !cameraPreview.videoHeight) {
    setDetectorStatus("Camera is still warming up. Try again in a second.", "warning");
    return;
  }
  const snapshot = document.createElement("canvas");
  snapshot.width = cameraPreview.videoWidth;
  snapshot.height = cameraPreview.videoHeight;
  const snapshotCtx = snapshot.getContext("2d");
  snapshotCtx.drawImage(cameraPreview, 0, 0, snapshot.width, snapshot.height);
  const dataUrl = snapshot.toDataURL("image/png");
  closeCamera();
  loadImageDataUrl(dataUrl);
}

photoInput.addEventListener("change", (event) => loadFile(event.target.files[0]));
cameraInput.addEventListener("change", (event) => loadFile(event.target.files[0]));
choosePhotoBtn.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    photoInput.click();
  }
});
cameraBtn.addEventListener("click", () => openCamera());

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
      if (state.image && !state.phrase.trim()) state.awaitingCaptionChoice = false;
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

voiceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    stopSpeaking();
    state.voiceStyle = button.dataset.voice;
    voiceButtons.forEach((item) => item.classList.toggle("active", item === button));
    setDetectorStatus(`${voiceStyleSettings().label} pet voice selected.`, "success");
  });
});

styleSelect.addEventListener("change", () => {
  state.style = styleSelect.value;
  draw();
});

document.querySelectorAll("[data-position]").forEach((button) => {
  button.addEventListener("click", () => {
    setTailMode(false);
    state.position = button.dataset.position;
    if (state.position !== "manual") state.manual = null;
    document.querySelectorAll("[data-position]").forEach((item) => item.classList.toggle("active", item === button));
    draw();
  });
});

tailBtn.addEventListener("click", () => {
  if (!state.image || !state.lastBubble) return;
  activateManualPlacement();
  setTailMode(!state.tailMode);
  draw();
});

moodSelect.addEventListener("change", () => {
  state.mood = moodSelect.value;
  if (state.image && !state.phrase.trim()) state.awaitingCaptionChoice = false;
  nextPhrase();
});
phraseInput.addEventListener("input", () => {
  stopSpeaking();
  state.awaitingCaptionChoice = false;
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
customPhraseBtn.addEventListener("click", () => {
  if (!state.image) return;
  state.awaitingCaptionChoice = false;
  phraseInput.focus();
  phraseInput.select();
  setDetectorStatus("Type your own phrase, and it will appear on the picture.", "success");
});
shortBtn.addEventListener("click", () => nextPhrase(true));
badPhraseBtn.addEventListener("click", () => reportCurrentPhrase());
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
  setTailMode(false);
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

speakBtn.addEventListener("click", () => {
  speakPetPhrase();
});

beforeAfterBtn.addEventListener("click", () => {
  if (!state.image) return;
  setTailMode(false);
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
  if (event.key === "Escape" && !cameraModal.classList.contains("hidden")) closeCamera();
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
  setTailMode(false);
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
      setDetectorStatus("Photo shared.", "success");
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
      setDetectorStatus("App shared.", "success");
      return;
    }
  } catch (error) {
    if (error.name === "AbortError") return;
  }

  await copyAppLink();
});

cameraCloseBtn.addEventListener("click", () => closeCamera());
cameraCancelBtn.addEventListener("click", () => closeCamera());
captureBtn.addEventListener("click", () => captureCameraPhoto());
cameraModal.addEventListener("click", (event) => {
  if (event.target === cameraModal) closeCamera();
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
  state.awaitingCaptionChoice = false;
  setTailMode(false);
  stopSpeaking();
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
renderQrCode(inlineQrBox, inlineQrUrlText, 3);
renderGallery();

function downloadImage() {
  const link = document.createElement("a");
  link.download = "pet-thought-bubble.png";
  link.href = currentImageDataUrl();
  link.click();
  saveToGallery(link.href);
}

function canvasBlob() {
  return withCleanCanvas(() => new Promise((resolve) => canvas.toBlob(resolve, "image/png")));
}

function currentImageDataUrl() {
  return withCleanCanvas(() => canvas.toDataURL("image/png"));
}

function withCleanCanvas(callback) {
  const wasSuppressed = state.suppressEditHandles;
  state.suppressEditHandles = true;
  draw();
  const result = callback();
  if (result?.then) {
    return result.finally(() => {
      state.suppressEditHandles = wasSuppressed;
      draw();
    });
  }
  state.suppressEditHandles = wasSuppressed;
  draw();
  return result;
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
    state.sceneDetails = [];
    state.manual = null;
    state.stickers = [];
    state.strokes = [];
    state.viewOriginal = false;
    state.doodleMode = false;
    state.awaitingCaptionChoice = false;
    state.phrase = "";
    state.phraseOptions = [];
    setTailMode(false);
    phraseInput.value = "";
    renderPhraseChoices([]);
    beforeAfterBtn.textContent = "Original";
    doodleBtn.classList.remove("active");
    setPhotoVisible(true);
    emptyState.classList.add("hidden");
    draw();
    setDetectorStatus("Recent creation loaded. Pick a phrase to add the bubble.", "success");
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
      state.sceneDetails = sceneDetailsFromPredictions(predictions, pet, state.sceneTags);
      state.warning = "";
      setActivePet(pet.class);
      const sceneNote = state.sceneTags.length ? ` Scene clues: ${state.sceneTags.slice(0, 3).map(displaySceneTag).join(", ")}.` : "";
      setDetectorStatus(`${petConfidenceText(pet)} I added a bubble. Change the phrase below whenever you want.${sceneNote}`, "success");
      nextPhrase();
      return;
    }

    if (people.length) {
      state.pet = "either";
      state.detection = null;
      state.sceneTags = [];
      state.sceneDetails = [];
      state.warning = "That's not a pet. Try a cat or dog photo.";
      setActivePet("either");
      setDetectorStatus("That's not a pet. Try a cat or dog photo.", "warning");
      nextPhrase();
      return;
    }

    state.detection = null;
    state.sceneTags = [];
    state.sceneDetails = [];
    state.warning = "I can't find a cat or dog yet. Try a clearer pet photo.";
    setDetectorStatus("I can't find a cat or dog yet. Try a clearer pet photo.", "warning");
    nextPhrase();
  } catch (error) {
    state.detection = null;
    state.sceneTags = [];
    state.sceneDetails = [];
    setDetectorStatus("Pet spotting is unavailable right now, but you can still make bubbles manually.", "warning");
    draw();
  }
}

function sceneTagsFromPredictions(predictions, pet) {
  const tagSet = new Set();
  const strongObjects = predictions.filter((item) => item.score >= .38 && item !== pet);
  const classNames = strongObjects.map((item) => item.class);
  const petBox = predictionBox(pet);

  addRelationshipTags(tagSet, strongObjects, petBox);
  addTagForAny(tagSet, classNames, "table", ["dining table"]);
  addTagForAny(tagSet, classNames, "bowl", ["bowl"]);
  addTagForAny(tagSet, classNames, "food", ["banana", "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "cup", "wine glass", "fork", "knife", "spoon"]);
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
  addTagForAny(tagSet, classNames, "window", ["window"]);
  addTagForAny(tagSet, classNames, "crate", ["crate", "cage", "kennel"]);
  addTagForAny(tagSet, classNames, "leash", ["leash", "dog leash"]);
  addTagForAny(tagSet, classNames, "blanket", ["blanket"]);
  addTagForAny(tagSet, classNames, "rug", ["rug", "carpet"]);

  if (pet?.bbox && state.image) {
    const petArea = pet.bbox[2] * pet.bbox[3];
    const imageArea = state.image.naturalWidth * state.image.naturalHeight;
    if (petArea / imageArea > .42) tagSet.add("closeup");
    if (!["on_table", "on_couch", "on_bed"].some((tag) => tagSet.has(tag)) && petBox.bottom > state.image.naturalHeight * .72) tagSet.add("floor");
  }

  return [...tagSet];
}

function sceneDetailsFromPredictions(predictions, pet, tags = sceneTagsFromPredictions(predictions, pet)) {
  const objects = predictions.filter((item) => item !== pet);
  return tags.map((tag) => ({
    tag,
    baseTag: baseTagForScene(tag),
    label: labelForSceneObject(tag, objects),
    confidence: sceneConfidence(tag, objects)
  })).sort((a, b) => scenePriority(a.tag) - scenePriority(b.tag) || b.confidence - a.confidence);
}

function baseTagForScene(tag) {
  const baseTags = {
    on_table: "table",
    on_couch: "couch",
    on_bed: "bed",
    near_food: "food",
    near_toy: "toy",
    near_computer: "computer",
    with_person: "person"
  };
  return baseTags[tag] || tag;
}

function labelForSceneObject(tag, objects) {
  const labels = {
    on_table: "table",
    on_couch: "couch",
    on_bed: "bed",
    near_food: strongestLabel(objects, ["bowl", "pizza", "cake", "donut", "sandwich", "hot dog", "apple", "banana", "orange", "carrot", "broccoli", "cup", "fork", "knife", "spoon"]) || "food",
    near_toy: strongestLabel(objects, ["sports ball", "frisbee", "teddy bear", "baseball bat", "baseball glove", "skateboard"]) || "toy",
    near_computer: strongestLabel(objects, ["laptop", "keyboard", "mouse", "cell phone", "tv", "remote"]) || "computer",
    with_person: "human",
    floor: "floor",
    window: "window",
    crate: "crate",
    leash: "leash",
    bowl: "bowl",
    blanket: "blanket",
    rug: "rug",
    table: "table",
    food: strongestLabel(objects, ["bowl", "pizza", "cake", "donut", "sandwich", "hot dog", "apple", "banana", "orange", "carrot", "broccoli", "cup", "fork", "knife", "spoon"]) || "food",
    couch: strongestLabel(objects, ["couch", "chair"]) || "couch",
    bed: "bed",
    person: "human",
    computer: strongestLabel(objects, ["laptop", "keyboard", "mouse", "cell phone", "tv", "remote"]) || "computer",
    toy: strongestLabel(objects, ["sports ball", "frisbee", "teddy bear", "baseball bat", "baseball glove", "skateboard"]) || "toy",
    outside: strongestLabel(objects, ["bench", "umbrella", "kite", "surfboard", "skis", "snowboard"]) || "outside",
    vehicle: strongestLabel(objects, ["car", "truck", "bus", "train", "boat", "bicycle", "motorcycle", "airplane"]) || "vehicle",
    plant: "plant",
    bag: strongestLabel(objects, ["backpack", "handbag", "suitcase"]) || "bag",
    bathroom: strongestLabel(objects, ["toilet", "sink", "toothbrush", "hair drier"]) || "bathroom",
    closeup: "close-up"
  };
  return labels[tag] || displaySceneTag(tag);
}

function strongestLabel(objects, classNames) {
  return findStrongObject(objects, classNames)?.class;
}

function sceneConfidence(tag, objects) {
  const label = labelForSceneObject(tag, objects);
  return objects.find((item) => item.class === label)?.score || 1;
}

function scenePriority(tag) {
  const priority = ["on_table", "on_couch", "on_bed", "near_food", "bowl", "near_toy", "near_computer", "with_person", "floor", "window", "crate", "leash", "blanket", "rug", "food", "toy", "computer", "person", "table", "couch", "bed", "outside", "vehicle", "plant", "bag", "bathroom", "closeup"];
  const index = priority.indexOf(tag);
  return index === -1 ? priority.length : index;
}

function addRelationshipTags(tagSet, objects, petBox) {
  const table = findStrongObject(objects, ["dining table"]);
  const couch = findStrongObject(objects, ["couch", "chair"]);
  const bed = findStrongObject(objects, ["bed"]);
  const person = findStrongObject(objects, ["person"]);
  const food = findStrongObject(objects, ["banana", "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "bowl", "cup", "wine glass", "fork", "knife", "spoon"]);
  const toy = findStrongObject(objects, ["sports ball", "frisbee", "teddy bear", "baseball bat", "baseball glove", "skateboard"]);
  const computer = findStrongObject(objects, ["laptop", "keyboard", "mouse", "cell phone", "tv", "remote"]);

  if (table && petAppearsOnSurface(petBox, predictionBox(table))) tagSet.add("on_table");
  if (couch && petAppearsOnSurface(petBox, predictionBox(couch))) tagSet.add("on_couch");
  if (bed && petAppearsOnSurface(petBox, predictionBox(bed))) tagSet.add("on_bed");
  if (person && boxesAreClose(petBox, predictionBox(person), .18)) tagSet.add("with_person");
  if (food && boxesAreClose(petBox, predictionBox(food), .16)) tagSet.add("near_food");
  if (toy && boxesAreClose(petBox, predictionBox(toy), .18)) tagSet.add("near_toy");
  if (computer && boxesAreClose(petBox, predictionBox(computer), .18)) tagSet.add("near_computer");
}

function findStrongObject(objects, classNames) {
  return objects
    .filter((item) => classNames.includes(item.class))
    .sort((a, b) => scoreDetection(b) - scoreDetection(a))[0];
}

function predictionBox(item) {
  const [x, y, w, h] = item.bbox;
  return { x, y, w, h, right: x + w, bottom: y + h, centerX: x + w / 2, centerY: y + h / 2 };
}

function petAppearsOnSurface(petBox, surfaceBox) {
  const horizontalOverlap = overlapLength(petBox.x, petBox.right, surfaceBox.x, surfaceBox.right);
  const overlapRatio = horizontalOverlap / Math.max(1, Math.min(petBox.w, surfaceBox.w));
  const petBottomNearSurface = petBox.bottom >= surfaceBox.y - petBox.h * .28 && petBox.bottom <= surfaceBox.bottom + petBox.h * .55;
  const petCenterAboveSurfaceBottom = petBox.centerY < surfaceBox.bottom;
  return overlapRatio > .24 && petBottomNearSurface && petCenterAboveSurfaceBottom;
}

function boxesAreClose(a, b, maxGapRatio) {
  const gapX = Math.max(0, Math.max(a.x - b.right, b.x - a.right));
  const gapY = Math.max(0, Math.max(a.y - b.bottom, b.y - a.bottom));
  const imageScale = state.image ? Math.max(state.image.naturalWidth, state.image.naturalHeight) : 1200;
  const closeGap = Math.hypot(gapX, gapY) <= imageScale * maxGapRatio;
  const overlap = boxOverlapArea(a, b) / Math.max(1, Math.min(a.w * a.h, b.w * b.h));
  return closeGap || overlap > .08;
}

function overlapLength(aStart, aEnd, bStart, bEnd) {
  return Math.max(0, Math.min(aEnd, bEnd) - Math.max(aStart, bStart));
}

function boxOverlapArea(a, b) {
  return overlapLength(a.x, a.right, b.x, b.right) * overlapLength(a.y, a.bottom, b.y, b.bottom);
}

function addTagForAny(tagSet, classNames, tag, matches) {
  if (matches.some((item) => classNames.includes(item))) tagSet.add(tag);
}

function displaySceneTag(tag) {
  const labels = {
    on_table: "on a table",
    on_couch: "on a couch",
    on_bed: "on a bed",
    near_food: "near food",
    near_toy: "near a toy",
    near_computer: "near a computer",
    with_person: "with a person",
    floor: "on the floor",
    window: "by a window",
    crate: "near a crate",
    leash: "near a leash",
    bowl: "near a bowl",
    blanket: "on a blanket",
    rug: "on a rug"
  };
  return labels[tag] || tag;
}

function primaryRelationshipText() {
  const priority = ["on_table", "on_couch", "on_bed", "bowl", "near_food", "near_toy", "near_computer", "with_person", "floor", "window", "crate", "leash", "blanket", "rug"];
  const tag = priority.find((item) => state.sceneTags.includes(item));
  return tag ? ` ${displaySceneTag(tag)}` : "";
}

function petConfidenceText(pet) {
  const confidence = Math.round(pet.score * 100);
  const relation = primaryRelationshipText();
  const opener = confidence >= 85 ? "Pretty sure" : confidence >= 65 ? "My best guess" : "Tiny detective guess";
  return `${opener}: ${pet.class}${relation} (${confidence}%).`;
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
