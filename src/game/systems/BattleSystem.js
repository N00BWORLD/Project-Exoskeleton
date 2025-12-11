import { BATTLE_CONFIG, MASTERY_BONUS } from '../../data/GameConfig.js';

export class BattleSystem {
    constructor(game) {
        this.game = game; // Reference to main game (for rendering/sound access if needed)
        // Or better: Pass systems in methods to keep it decoupled.

        this.inCombat = false;

        // Stats
        this.heroHP = 100;
        this.heroMaxHP = 100;
        this.heroATK = 10;
        this.critChance = 0;

        this.enemyHP = 100;
        this.enemyMaxHP = 100;
        this.enemyATK = 10;

        this.onBattleEnd = null; // Callback
    }

    calculateStats(codex, zone) {
        // 1. Base Stats
        const stats = { ...MASTERY_BONUS };
        Object.keys(stats).forEach(k => stats[k] = 0);

        stats.maxHP = 100;
        stats.atk = 5;

        // 2. Mastery Bonus
        codex.unlockedTiers.forEach(tier => {
            for (const [key, val] of Object.entries(MASTERY_BONUS)) {
                if (stats[key] !== undefined) {
                    stats[key] += val * tier;
                }
            }
        });

        this.heroMaxHP = stats.maxHP;
        this.heroATK = stats.atk;
        this.critChance = stats.crit || 0;

        // 3. Enemy Stats
        const zoneMult = zone.getZoneMult ? zone.getZoneMult() : 1.0;
        this.enemyMaxHP = Math.floor(BATTLE_CONFIG.ENEMY_BASE_HP * zoneMult);
        this.enemyATK = Math.floor(BATTLE_CONFIG.ENEMY_BASE_ATK * zoneMult);
    }

    start(codex, zone) {
        this.inCombat = true;
        this.calculateStats(codex, zone);
        this.heroHP = this.heroMaxHP;
        this.enemyHP = this.enemyMaxHP;

        console.log(`BATTLE START! Hero(HP:${this.heroHP}, ATK:${this.heroATK}) vs Enemy(HP:${this.enemyHP}, ATK:${this.enemyATK})`);

        this.combatStep(true);
    }

    combatStep(isHeroTurn) {
        if (!this.inCombat) return;

        // Death Check
        if (this.heroHP <= 0) {
            this.finish(false);
            return;
        }
        if (this.enemyHP <= 0) {
            this.finish(true);
            return;
        }

        setTimeout(() => {
            // Visual/Sound Effects triggered via Main Game reference
            this.game.sound.playHit();

            if (isHeroTurn) {
                // Hero Attack
                let dmg = this.heroATK;
                let isCrit = false;
                if (Math.random() * 100 < this.critChance) {
                    dmg *= 2;
                    isCrit = true;
                    console.log("CRITICAL HIT!");
                }
                this.enemyHP -= dmg;

                // Visuals
                this.game.skeleton.root.x += 30;
                setTimeout(() => this.game.skeleton.root.x -= 30, 100);
                this.game.enemyShake = 10;

                // Floating Damage Text (at enemy position)
                const ex = this.game.canvas.width * 0.75;
                const ey = this.game.canvas.height * 0.5;
                const dmgText = isCrit ? `${dmg} 크리티컬!` : `-${dmg}`;
                const dmgColor = isCrit ? '#ff0' : '#fff';
                this.game.addFloatingText(dmgText, ex, ey, dmgColor);

                console.log(`Hero hits! Enemy HP: ${this.enemyHP}`);
            } else {
                // Enemy Attack
                const dmg = this.enemyATK;
                this.heroHP -= dmg;

                // Visuals
                this.game.skeleton.root.x -= 20;
                setTimeout(() => this.game.skeleton.root.x += 20, 100);

                // Floating Damage Text (at hero position)
                const hx = this.game.canvas.width * 0.35;
                const hy = this.game.canvas.height * 0.5;
                this.game.addFloatingText(`-${dmg}`, hx, hy, '#f66');

                console.log(`Enemy hits! Hero HP: ${this.heroHP}`);
            }

            this.combatStep(!isHeroTurn);

        }, BATTLE_CONFIG.TURN_DURATION_MS);
    }

    finish(win) {
        this.inCombat = false;

        if (win) {
            console.log("VICTORY! Looting...");
            // Reward Logic handled by Main (Callback)
            if (this.onBattleEnd) this.onBattleEnd(true);
        } else {
            console.log("DEFEAT!");
            if (this.onBattleEnd) this.onBattleEnd(false);
        }

        // Reset HP for display?
        this.heroHP = this.heroMaxHP;
    }
}
