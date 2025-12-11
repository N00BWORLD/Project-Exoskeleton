import { ZONES } from '../../data/GameConfig.js';

export class ZoneManager {
    constructor() {
        this.currentZone = 0; // Start at Zone 0 (Simulation Room)
    }

    getZoneName() {
        return ZONES[this.currentZone] ? ZONES[this.currentZone].name : "Unknown Sector";
    }

    getZoneColor() {
        const colors = ['#222', '#333', '#113', '#311', '#000'];
        return colors[this.currentZone] || '#000';
    }

    getZoneMult() {
        return ZONES[this.currentZone] ? ZONES[this.currentZone].mult : 1.0;
    }

    getDropTier() {
        // Zone 0 -> Tier 1, Zone 1 -> Tier 2, etc.
        return this.currentZone + 1;
    }

    advance() {
        if (this.currentZone < ZONES.length - 1) {
            this.currentZone++;
            console.log(`Advanced to Zone ${this.currentZone}: ${this.getZoneName()}`);
            return true;
        }
        return false;
    }

    reset() {
        this.currentZone = 0;
        console.log("Reset to Zone 0");
    }
}
