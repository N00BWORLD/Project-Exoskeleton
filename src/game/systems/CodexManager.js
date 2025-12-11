export class CodexManager {
    constructor() {
        this.unlockedTiers = new Set();   // Mastered tiers (permanent)
        this.discoveredTiers = new Set(); // Seen tiers (fog of war removed)
        this.prefix = "ExoSkeleton_Codex_v2";
        this.onUnlock = null;    // Called when merging 5x Tier -> Unlock Tier
        this.load();
    }

    // Called when player first obtains an item of this tier (removes ?)
    discover(tier, part = 'Head') {
        const key = `${tier}_${part}`;
        if (!this.discoveredTiers.has(key)) {
            this.discoveredTiers.add(key);
            console.log(`CODEX: Tier ${tier} (${part}) DISCOVERED`);
            return true;
        }
        return false;
    }

    isDiscovered(tier, part = 'Head') {
        return this.discoveredTiers.has(`${tier}_${part}`);
    }

    // Called when player merges 5x of a tier (permanent unlock)
    unlock(tier, part = 'Head') {
        const key = `${tier}_${part}`;
        if (!this.unlockedTiers.has(key)) {
            this.unlockedTiers.add(key);
            this.save();
            console.log(`CODEX: Tier ${tier} (${part}) MASTERED! Preserved for next run.`);
            if (this.onUnlock) this.onUnlock(tier, part);
            return true;
        }
        return false;
    }

    isUnlocked(tier, part = 'Head') {
        return this.unlockedTiers.has(`${tier}_${part}`);
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
                this.unlockedTiers = new Set();
                arr.forEach(item => {
                    // Migration for old number-only saves
                    if (typeof item === 'number') {
                        this.unlockedTiers.add(`${item}_Head`);
                        this.unlockedTiers.add(`${item}_Core`);
                        this.unlockedTiers.add(`${item}_Arm`);
                        this.unlockedTiers.add(`${item}_Leg`);
                        this.unlockedTiers.add(`${item}_Thruster`);
                    } else {
                        this.unlockedTiers.add(item);
                    }
                });
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
