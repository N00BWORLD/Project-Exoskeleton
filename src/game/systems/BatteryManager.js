export class BatteryManager {
    constructor(maxTurns = 30) {
        this.maxTurns = maxTurns;
        this.currentTurns = maxTurns;
        this.depleted = false;

        // UI Callbacks
        this.onEnergyChange = null;
        this.onDeplete = null;
    }

    consume(amount) {
        if (this.depleted) return false;

        this.currentTurns -= amount;
        if (this.currentTurns <= 0) {
            this.currentTurns = 0;
            this.depleted = true;
            if (this.onDeplete) this.onDeplete();
        }

        if (this.onEnergyChange) {
            this.onEnergyChange(this.currentTurns, this.maxTurns);
        }

        return true;
    }

    reset() {
        this.currentTurns = this.maxTurns;
        this.depleted = false;
        if (this.onEnergyChange) {
            this.onEnergyChange(this.currentTurns, this.maxTurns);
        }
    }

    addTurns(amount) {
        this.currentTurns = Math.min(this.currentTurns + amount, this.maxTurns);
        if (this.onEnergyChange) {
            this.onEnergyChange(this.currentTurns, this.maxTurns);
        }
    }
}
