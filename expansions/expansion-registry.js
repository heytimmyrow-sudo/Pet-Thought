import { baseGameLevels } from "../levels/base-game.js";

export const expansionRegistry = [
  {
    id: "base_game",
    name: "Base Game",
    version: "1.0.0",
    description: "Fifteen short factory deliveries that teach polarity flipping, package handling, hazards, and compact puzzle routes.",
    cover: "M",
    availability: "installed",
    levels: baseGameLevels
  },
  {
    id: "factory_after_dark",
    name: "Factory After Dark",
    version: "0.1.0",
    description: "Night-shift routes with shutters, searchlights, and stronger magnetic pulses.",
    cover: "☾",
    availability: "locked",
    levels: []
  },
  {
    id: "frozen_warehouse",
    name: "Frozen Warehouse",
    version: "0.1.0",
    description: "Slippery floors and chilly conveyor puzzles for careful package control.",
    cover: "*",
    availability: "coming_soon",
    levels: []
  },
  {
    id: "zero_gravity_shipping",
    name: "Zero-Gravity Shipping",
    version: "0.1.0",
    description: "Orbital shipping bays where polarity nudges everything through low gravity.",
    cover: "0G",
    availability: "coming_soon",
    levels: []
  },
  {
    id: "robot_recycling_center",
    name: "Robot Recycling Center",
    version: "0.1.0",
    description: "Compressed scrap mazes with crushers, plates, and magnetic box chains.",
    cover: "R",
    availability: "locked",
    levels: []
  },
  {
    id: "future_pack_slot_01",
    name: "Future Pack Slot",
    version: "0.0.0",
    description: "Reserved for a later delivery district.",
    cover: "+",
    availability: "coming_soon",
    levels: []
  }
];
