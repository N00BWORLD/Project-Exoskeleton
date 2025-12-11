export class CodexManager {
    constructor() {
        this.unlockedTiers = new Set();   // Mastered tiers (permanent)
        this.discoveredTiers = new Set(); // Seen tiers (fog of war removed)
        this.prefix = "ExoSkeleton_Codex_v2";
        this.onUnlock = null;    // Called when merging 5x Tier -> Unlock Tier
        this.load();
    }

    // Called when player first obtains an item of this tier (removes ?)
    discover(tier) {
        if (!this.discoveredTiers.has(tier)) {
            this.discoveredTiers.add(tier);
            console.log(`CODEX: Tier ${tier} DISCOVERED (Fog of War lifted)`);
            return true;
        }
        return false;
    }

    isDiscovered(tier) {
        return this.discoveredTiers.has(tier);
    }

    // Called when player merges 5x of a tier (permanent unlock)
    unlock(tier) {
        if (!this.unlockedTiers.has(tier)) {
            this.unlockedTiers.add(tier);
            this.save();
            console.log(`CODEX: Tier ${tier} MASTERED! Preserved for next run.`);
            if (this.onUnlock) this.onUnlock(tier);
            return true;
        }
        return false;
    }

    isUnlocked(tier) {
        return this.unlockedTiers.has(tier);
    }

    save() {
        const data = JSON.stringify([...this.unlockedTiers]);
        localStorage.setItem(this.prefix, data);
    }

    load() {
        const data = localStorage.getItem(this.prefix);
        if (data) {
            try {
                const arr = JSON.parse(data);
                this.unlockedTiers = new Set(arr);
                console.log("CODEX: Loaded", this.unlockedTiers);
            } catch (e) {
                console.error("CODEX: Load failed", e);
            }
        }
    }

    reset() {
        this.unlockedTiers.clear();
        this.discoveredTiers.clear();
        this.save();
    }
}
