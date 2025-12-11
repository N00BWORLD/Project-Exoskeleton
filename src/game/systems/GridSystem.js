export class GridSystem {
    constructor(cols = 4, rows = 4) {
        this.cols = cols;
        this.rows = rows;
        this.cells = new Array(cols * rows).fill(null); // Flat array for 2D grid
        this.dirty = false; // Flag for renderer
    }

    // Add item to first empty slot
    addItem(tier, codex, part = 'Head') {
        const emptyIndex = this.cells.indexOf(null);
        if (emptyIndex === -1) {
            return false; // Grid full
        }

        // Register Discovery (Fog of War removal)
        // Codex needs to handle part-based discovery now, but for now we stick to Tier discovery compatibility
        if (codex) codex.discover(tier);

        this.cells[emptyIndex] = {
            tier: tier,
            part: part,
            id: Date.now() + Math.random()
        };
        this.dirty = true;

        // Trigger Merge Check
        this.tryAutoMergeAndUnlock(codex);
        return true;
    }

    // Core Mechanic: 5-Match Merge & Codex Unlock
    tryAutoMergeAndUnlock(codex) {
        // 1. Group by Tier AND Part
        // Key format: "TIER_PART" (e.g. "1_Head")
        const inventory = {};

        this.cells.forEach((item, index) => {
            if (!item) return;
            // Fallback for old items without part
            const part = item.part || 'Head';
            const key = `${item.tier}_${part}`;

            if (!inventory[key]) inventory[key] = [];
            inventory[key].push(index);
        });

        let changed = false;

        // 2. Check for 5-Matches
        for (const key in inventory) {
            const indices = inventory[key];
            const [tierStr, part] = key.split('_');
            const tier = parseInt(tierStr);

            if (indices.length >= 5) {
                const sets = Math.floor(indices.length / 5);

                for (let i = 0; i < sets; i++) {
                    // a) Remove 5 items, keep 1 for upgrade
                    // Strategy: Use the LAST index as the upgrade slot
                    const upgradeIdx = indices.pop();
                    const removeIndices = [indices.pop(), indices.pop(), indices.pop(), indices.pop()];

                    // Clear 4 slots
                    removeIndices.forEach(idx => this.cells[idx] = null);

                    // Upgrade the 5th slot
                    this.cells[upgradeIdx].tier += 1;
                    this.cells[upgradeIdx].part = part; // Keep same part
                    this.cells[upgradeIdx].id = Date.now(); // Refresh ID

                    // Register Discovery of new Tier immediately
                    if (codex) codex.discover(this.cells[upgradeIdx].tier);

                    // b) Unlock (Master) the Source Tier in Codex
                    if (this.codex) {
                        const isNew = this.codex.unlock(tier, part);
                        if (isNew) {
                            console.log(`NEW DISCOVERY: Tier ${tier} (${part}) MASTERED!`);
                            this.updateHeroVisuals(); // Refresh Equipment
                        }
                    }
                    console.log(`MERGE: 5x T${tier} (${part}) -> 1x T${tier + 1} (${part})`);
                    changed = true;
                }
            }
        }

        // 3. Recursive Check
        if (changed) {
            this.dirty = true;
            this.tryAutoMergeAndUnlock(codex);
        }
    }

    // Debug: Print Grid state
    debugPrint() {
        let out = "";
        for (let y = 0; y < this.rows; y++) {
            let line = "|";
            for (let x = 0; x < this.cols; x++) {
                const item = this.cells[y * this.cols + x];
                line += ` ${item ? item.tier : '.'} |`;
            }
            out += "\n" + line;
        }
        console.log(out);
    }
}
