import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync("game.js", "utf8");
const names = ["phrases", "sharedPacks", "scenePhrasePacks", "shortPhrases"];
const sceneKeywords = {
  table: /table|surface|height|platform/i,
  food: /snack|food|edible|crumb|plate|meal|bite|smell|treat/i,
  couch: /couch|cushion|furniture|soft spot|comfort|relaxation/i,
  bed: /bed|blanket|pillow|nap|softness|resting|sleep/i,
  person: /human|person|staff|pack|warmth|assistant|admire|trainable|lap/i,
  computer: /keyboard|screen|work|computer|laptop|meeting|spreadsheet|productivity/i,
  toy: /toy|throw|play|object|treasure|selected|attacked|thing/i,
  outside: /outdoor|outside|nature|leaf|garden|yard|fresh air|adventure|smells|field/i,
  vehicle: /vehicle|car|ride|travel|transportation|moving box|window|journey/i,
  plant: /plant|leaf|green|garden|botan|leafy|greenery/i,
  bag: /bag|luggage|container|portable|packed|supplies|carry|adventure/i,
  bathroom: /bath|bathroom|water|sink|wet|plumbing|splash/i,
  closeup: /face|close-up|nose|portrait|foreground|camera|closer|cuteness|puppy/i
};

function extractConst(name) {
  const start = source.indexOf(`const ${name} = `);
  if (start < 0) throw new Error(`Missing ${name}`);
  const valueStart = source.indexOf("=", start) + 1;
  let index = valueStart;
  while (/\s/.test(source[index])) index++;
  const opener = source[index];
  const closer = opener === "{" ? "}" : opener === "[" ? "]" : "";
  if (!closer) throw new Error(`Unsupported ${name}`);

  let depth = 0;
  let quote = null;
  let escape = false;
  for (; index < source.length; index++) {
    const char = source[index];
    if (quote) {
      if (escape) escape = false;
      else if (char === "\\") escape = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === opener) depth++;
    if (char === closer && --depth === 0) return source.slice(valueStart, index + 1);
  }
  throw new Error(`Unclosed ${name}`);
}

function walk(value, path, all) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (typeof item === "string") all.push({ path: `${path}[${index}]`, phrase: item });
      else walk(item, `${path}[${index}]`, all);
    });
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, child]) => walk(child, `${path}.${key}`, all));
  }
}

function hasSuspiciousCharacter(text) {
  return [...text].some((char) => [0xfffd, 0xc3, 0xe2].includes(char.charCodeAt(0)));
}

function checkPhrase(path, phrase, failures) {
  if (!phrase.trim()) failures.push(`${path}: empty phrase`);
  if (phrase.length > 110) failures.push(`${path}: too long (${phrase.length}) ${phrase}`);
  if (/\s{2,}/.test(phrase)) failures.push(`${path}: double spaces ${phrase}`);
  if (/\s+[,.!?]/.test(phrase)) failures.push(`${path}: bad punctuation spacing ${phrase}`);
  if (!/[.!?]$/.test(phrase)) failures.push(`${path}: missing ending punctuation ${phrase}`);
  if (hasSuspiciousCharacter(phrase)) failures.push(`${path}: suspicious encoded character ${phrase}`);
}

const data = Object.fromEntries(names.map((name) => [name, vm.runInNewContext(`(${extractConst(name)})`)]));
const all = [];
names.forEach((name) => walk(data[name], name, all));

const failures = [];
const seen = new Map();
all.forEach((item) => {
  checkPhrase(item.path, item.phrase, failures);
  const key = item.phrase.toLowerCase();
  if (seen.has(key)) failures.push(`${item.path}: duplicate of ${seen.get(key)} (${item.phrase})`);
  else seen.set(key, item.path);
});

Object.entries(data.scenePhrasePacks).forEach(([tag, pack]) => {
  const sceneRule = sceneKeywords[tag];
  if (!sceneRule) failures.push(`scenePhrasePacks.${tag}: missing keyword rule`);
  Object.entries(pack).forEach(([pet, phrases]) => {
    phrases.forEach((phrase, index) => {
      if (sceneRule && !sceneRule.test(phrase)) {
        failures.push(`scenePhrasePacks.${tag}.${pet}[${index}]: does not clearly reference ${tag}: ${phrase}`);
      }
    });
  });
});

const pets = ["cat", "dog", "either"];
const moods = ["random", "food", "royalty", "chaos", "nap", "dramatic", "compliment", "birthday", "morning", "apology", "holiday", "hungry", "sleepy", "guilty", "excited", "fancy", "confused", "boss"];
const sceneTags = Object.keys(data.scenePhrasePacks);
function phrasePool(pet, mood) {
  return data.phrases[pet]?.[mood] || data.sharedPacks[mood] || data.phrases.either.compliment;
}

pets.forEach((pet) => {
  moods.forEach((mood) => {
    const pool = phrasePool(pet, mood);
    if (!Array.isArray(pool) || !pool.length) failures.push(`generator.${pet}.${mood}: missing fallback pool`);
    (pool || []).forEach((phrase) => checkPhrase(`generator.${pet}.${mood}.fallback`, phrase, failures));
  });
});

sceneTags.forEach((tag) => {
  const sceneRule = sceneKeywords[tag];
  pets.forEach((pet) => {
    const pack = data.scenePhrasePacks[tag];
    const candidates = [...(pack[pet] || []), ...(pack.either || [])];
    if (!candidates.length) failures.push(`generator.${tag}.${pet}: no scene candidates`);
    moods.forEach((mood) => {
      candidates.forEach((phrase) => {
        checkPhrase(`generator.${tag}.${pet}.${mood}`, phrase, failures);
        if (sceneRule && !sceneRule.test(phrase)) {
          failures.push(`generator.${tag}.${pet}.${mood}: generated off-scene phrase ${phrase}`);
        }
      });
    });
  });
});

const summary = {
  totalPhrases: all.length,
  regularPetPhrases: Object.values(data.phrases).flatMap((moodPacks) => Object.values(moodPacks).flat()).length,
  sharedPhrases: Object.values(data.sharedPacks).flat().length,
  scenePhrases: Object.values(data.scenePhrasePacks).flatMap((pack) => Object.values(pack).flat()).length,
  shortPhrases: data.shortPhrases.length,
  generatorCasesChecked: pets.length * moods.length + sceneTags.length * pets.length * moods.length,
  failures
};

console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exit(1);
