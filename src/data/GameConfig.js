// Game Configuration & Balance Data

export const BATTLE_CONFIG = {
    TURN_COST_ENTRY: 1,
    TURN_COST_PENALTY: 2,
    ENEMY_BASE_HP: 30,
    ENEMY_BASE_ATK: 3,
    TURN_DURATION_MS: 500
};

// Stats gained for EACH Mastered (Unlocked) Tier in Codex
// Adding a new key here automatically adds it to the Hero's stats calculation.
export const MASTERY_BONUS = {
    maxHP: 50,    // Health
    atk: 10,      // Attack Power
    crit: 1,      // Critical Chance (%)
    loot: 1,      // Item Drop Rate (%) - Added as requested
    // easy examples to add:
    // evasion: 0,
    // vamp: 0
};

export const ZONES = [
    { name: "Simulation Room", mult: 0.5 }, // Test Zone
    { name: "Scrap Yard", mult: 1.0 },
    { name: "Hydraulic Plant", mult: 1.5 },
    { name: "Core Reactor", mult: 2.5 }
];
