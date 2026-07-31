const W = 960;
const H = 540;
const floor = { x: 0, y: 500, w: W, h: 40 };
const wall = (x, y, w, h) => ({ x, y, w, h });
const mag = (x, y, polarity = 1, strength = 720) => ({ x, y, r: 130, polarity, strength });
const spike = (x, y, w = 54) => ({ x, y, w, h: 18, type: "spikes" });
const electric = (x, y, w, h, polarity = 1) => ({ x, y, w, h, type: "electric", activePolarity: polarity });
const crusher = (x, y, w, h, axis = "y", distance = 90, speed = 1) => ({ x, y, w, h, type: "crusher", axis, distance, speed });
const platform = (x, y, w, h, dx, dy, polarity = 1) => ({ x, y, w, h, dx, dy, polarity });
const door = (x, y, w, h, openPolarity = 1) => ({ x, y, w, h, openPolarity });
const box = (x, y) => ({ x, y, w: 40, h: 40 });
const plate = (x, y, id) => ({ x, y, w: 60, h: 12, id });

export const baseGameLevels = [
  {
    id: "training_floor", name: "First Pickup", targetTime: 24, spawn: { x: 44, y: 430 }, package: { x: 170, y: 452 },
    delivery: { x: 828, y: 432, w: 74, h: 68 },
    walls: [floor, wall(0, 0, 20, H), wall(940, 0, 20, H), wall(300, 430, 110, 18), wall(610, 428, 120, 18)],
    magnets: [mag(472, 430, 1, 560)], hazards: [spike(520, 482, 70)]
  },
  {
    id: "jump_and_flip", name: "Jump And Flip", targetTime: 28, spawn: { x: 50, y: 430 }, package: { x: 115, y: 452 },
    delivery: { x: 830, y: 254, w: 74, h: 68 },
    walls: [floor, wall(205, 418, 150, 18), wall(456, 344, 150, 18), wall(720, 326, 210, 18)],
    magnets: [mag(500, 288, -1, 700), mag(760, 262, 1, 620)], hazards: [spike(365, 482, 80)]
  },
  {
    id: "package_arc", name: "Package Arc", targetTime: 30, spawn: { x: 45, y: 430 }, package: { x: 178, y: 452 },
    delivery: { x: 820, y: 432, w: 78, h: 68 },
    walls: [floor, wall(286, 452, 86, 18), wall(420, 394, 100, 18), wall(620, 440, 96, 18)],
    magnets: [mag(386, 356, 1, 760), mag(692, 370, -1, 680)], hazards: [spike(540, 482, 84)]
  },
  {
    id: "sliding_bridge", name: "Sliding Bridge", targetTime: 32, spawn: { x: 46, y: 430 }, package: { x: 98, y: 452 },
    delivery: { x: 826, y: 432, w: 74, h: 68 },
    walls: [floor, wall(260, 440, 90, 18), wall(690, 440, 240, 18)],
    platforms: [platform(410, 420, 155, 18, 145, 0, 1)], magnets: [mag(440, 348, 1, 550)], hazards: [spike(570, 482, 90)]
  },
  {
    id: "red_door", name: "Red Door", targetTime: 34, spawn: { x: 44, y: 430 }, package: { x: 120, y: 452 },
    delivery: { x: 830, y: 432, w: 74, h: 68 },
    walls: [floor, wall(330, 390, 90, 18), wall(660, 390, 100, 18)],
    doors: [door(555, 378, 34, 122, -1)], magnets: [mag(510, 330, -1, 620)], hazards: [spike(250, 482, 70)]
  },
  {
    id: "blue_lift", name: "Blue Lift", targetTime: 36, spawn: { x: 50, y: 430 }, package: { x: 132, y: 452 },
    delivery: { x: 812, y: 236, w: 84, h: 70 },
    walls: [floor, wall(690, 306, 232, 18), wall(344, 402, 98, 18)],
    platforms: [platform(505, 430, 116, 18, 0, -150, -1)], magnets: [mag(562, 312, -1, 760)], hazards: [spike(454, 482, 70)]
  },
  {
    id: "plate_gate", name: "Plate Gate", targetTime: 38, spawn: { x: 48, y: 430 }, package: { x: 140, y: 452 },
    delivery: { x: 826, y: 432, w: 74, h: 68 },
    walls: [floor, wall(210, 420, 120, 18), wall(690, 430, 220, 18)],
    plates: [plate(416, 488, "gate")], doors: [door(606, 378, 34, 122, "gate")], magnets: [mag(430, 405, 1, 560)], hazards: [spike(500, 482, 76)]
  },
  {
    id: "moving_saw", name: "Moving Charge", targetTime: 40, spawn: { x: 44, y: 430 }, package: { x: 110, y: 452 },
    delivery: { x: 826, y: 432, w: 74, h: 68 },
    walls: [floor, wall(285, 414, 135, 18), wall(650, 408, 130, 18)],
    movingHazards: [crusher(492, 458, 38, 38, "x", 170, 1.4)], magnets: [mag(355, 350, 1, 650), mag(700, 350, -1, 650)]
  },
  {
    id: "throw_lane", name: "Throw Lane", targetTime: 42, spawn: { x: 48, y: 430 }, package: { x: 120, y: 452 },
    delivery: { x: 816, y: 250, w: 84, h: 70 },
    walls: [floor, wall(252, 430, 90, 18), wall(440, 360, 120, 18), wall(690, 320, 230, 18)],
    magnets: [mag(480, 285, 1, 820), mag(765, 265, -1, 520)], hazards: [spike(580, 482, 120)]
  },
  {
    id: "crusher_intro", name: "Crusher Intro", targetTime: 40, spawn: { x: 42, y: 430 }, package: { x: 118, y: 452 },
    delivery: { x: 830, y: 432, w: 74, h: 68 },
    walls: [floor, wall(250, 420, 120, 18), wall(612, 420, 120, 18)],
    hazards: [crusher(445, 345, 72, 42, "y", 110, 1.2)], magnets: [mag(330, 360, 1, 620), mag(680, 360, -1, 620)]
  },
  {
    id: "electric_choice", name: "Electric Choice", targetTime: 42, spawn: { x: 48, y: 430 }, package: { x: 126, y: 452 },
    delivery: { x: 828, y: 432, w: 74, h: 68 },
    walls: [floor, wall(280, 430, 150, 18), wall(620, 430, 130, 18)],
    hazards: [electric(480, 405, 26, 95, 1), electric(548, 405, 26, 95, -1)], magnets: [mag(335, 354, 1, 620), mag(690, 354, -1, 620)]
  },
  {
    id: "box_button", name: "Box Button", targetTime: 45, spawn: { x: 48, y: 430 }, package: { x: 105, y: 452 },
    delivery: { x: 828, y: 432, w: 74, h: 68 },
    walls: [floor, wall(232, 438, 110, 18), wall(700, 430, 210, 18)],
    boxes: [box(394, 452)], plates: [plate(550, 488, "boxgate")], doors: [door(650, 378, 34, 122, "boxgate")], magnets: [mag(500, 390, 1, 760)], hazards: [spike(450, 482, 70)]
  },
  {
    id: "combo_one", name: "Combo One", targetTime: 48, spawn: { x: 42, y: 430 }, package: { x: 110, y: 452 },
    delivery: { x: 812, y: 222, w: 88, h: 72 },
    walls: [floor, wall(234, 430, 120, 18), wall(472, 368, 130, 18), wall(704, 294, 224, 18)],
    platforms: [platform(360, 420, 96, 18, 115, -45, 1)], hazards: [spike(610, 482, 94), electric(655, 312, 26, 92, -1)], magnets: [mag(430, 330, 1, 700), mag(735, 235, -1, 650)]
  },
  {
    id: "combo_two", name: "Combo Two", targetTime: 50, spawn: { x: 48, y: 430 }, package: { x: 122, y: 452 },
    delivery: { x: 824, y: 432, w: 76, h: 68 },
    walls: [floor, wall(220, 418, 90, 18), wall(718, 430, 190, 18)],
    boxes: [box(384, 452)], plates: [plate(510, 488, "finalgate")], doors: [door(625, 378, 34, 122, "finalgate")],
    hazards: [crusher(462, 360, 72, 38, "y", 110, 1.45), spike(318, 482, 70)], magnets: [mag(420, 355, 1, 760), mag(720, 355, -1, 600)]
  },
  {
    id: "final_sort", name: "Final Sort", targetTime: 55, spawn: { x: 44, y: 430 }, package: { x: 118, y: 452 },
    delivery: { x: 810, y: 222, w: 88, h: 72 },
    walls: [floor, wall(205, 430, 100, 18), wall(388, 366, 118, 18), wall(604, 308, 120, 18), wall(760, 294, 168, 18)],
    platforms: [platform(512, 430, 110, 18, 0, -124, -1)], boxes: [box(338, 452)], plates: [plate(650, 296, "last")], doors: [door(744, 294, 32, 118, "last")],
    hazards: [spike(280, 482, 72), electric(565, 326, 24, 104, 1), crusher(690, 170, 58, 36, "y", 94, 1.4)],
    magnets: [mag(426, 300, 1, 720), mag(610, 235, -1, 720), mag(820, 218, 1, 520)]
  }
];
