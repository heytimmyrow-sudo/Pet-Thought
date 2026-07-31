import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync("game.js", "utf8");
const functionNames = [
  "sceneTagsFromPredictions",
  "addRelationshipTags",
  "findStrongObject",
  "predictionBox",
  "petAppearsOnSurface",
  "boxesAreClose",
  "overlapLength",
  "boxOverlapArea",
  "addTagForAny",
  "scoreDetection"
];
const functions = functionNames.map((name) => {
  const start = source.indexOf(`function ${name}`);
  if (start < 0) throw new Error(`Missing function ${name}`);
  const braceStart = source.indexOf("{", start);
  let depth = 0;
  for (let index = braceStart; index < source.length; index++) {
    if (source[index] === "{") depth++;
    if (source[index] === "}" && --depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`Unclosed function ${name}`);
});

const sandbox = {
  state: {
    image: {
      naturalWidth: 1000,
      naturalHeight: 750
    }
  }
};
vm.createContext(sandbox);
vm.runInContext(functions.join("\n"), sandbox);

const cases = [
  {
    name: "cat on table",
    pet: { class: "cat", score: .96, bbox: [350, 230, 220, 300] },
    predictions: [
      { class: "cat", score: .96, bbox: [350, 230, 220, 300] },
      { class: "dining table", score: .92, bbox: [110, 500, 780, 180] }
    ],
    expected: ["on_table", "table"]
  },
  {
    name: "dog near toy",
    pet: { class: "dog", score: .94, bbox: [250, 250, 280, 280] },
    predictions: [
      { class: "dog", score: .94, bbox: [250, 250, 280, 280] },
      { class: "sports ball", score: .9, bbox: [545, 430, 90, 90] }
    ],
    expected: ["near_toy", "toy"]
  },
  {
    name: "pet with person",
    pet: { class: "cat", score: .95, bbox: [400, 260, 220, 260] },
    predictions: [
      { class: "cat", score: .95, bbox: [400, 260, 220, 260] },
      { class: "person", score: .91, bbox: [290, 120, 360, 560] }
    ],
    expected: ["with_person", "person"]
  },
  {
    name: "pet near laptop",
    pet: { class: "cat", score: .95, bbox: [180, 230, 260, 260] },
    predictions: [
      { class: "cat", score: .95, bbox: [180, 230, 260, 260] },
      { class: "laptop", score: .88, bbox: [450, 330, 260, 160] }
    ],
    expected: ["near_computer", "computer"]
  },
  {
    name: "pet near bowl",
    pet: { class: "dog", score: .95, bbox: [250, 260, 260, 270] },
    predictions: [
      { class: "dog", score: .95, bbox: [250, 260, 260, 270] },
      { class: "bowl", score: .9, bbox: [520, 430, 120, 80] }
    ],
    expected: ["near_food", "bowl"]
  },
  {
    name: "pet on floor",
    pet: { class: "dog", score: .95, bbox: [300, 480, 260, 250] },
    predictions: [
      { class: "dog", score: .95, bbox: [300, 480, 260, 250] }
    ],
    expected: ["floor"]
  }
];

const failures = [];
cases.forEach((item) => {
  const tags = sandbox.sceneTagsFromPredictions(item.predictions, item.pet);
  item.expected.forEach((tag) => {
    if (!tags.includes(tag)) failures.push(`${item.name}: expected ${tag}, got ${tags.join(", ")}`);
  });
});

const result = { casesChecked: cases.length, failures };
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
