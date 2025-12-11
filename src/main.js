import { Renderer } from './engine/Renderer.js';
import { Skeleton } from './engine/Skeleton.js';
import { LangSystem } from './core/Lang.js';
import { BatteryManager } from './game/systems/BatteryManager.js';
import { GridSystem } from './game/systems/GridSystem.js';
import { ZoneManager } from './game/systems/ZoneManager.js';
import { CodexManager } from './game/systems/CodexManager.js';
import { BattleSystem } from './game/systems/BattleSystem.js';
import { SpriteManager } from './engine/SpriteManager.js';
import { SoundManager } from './engine/SoundManager.js';
import { BATTLE_CONFIG, MASTERY_BONUS } from './data/GameConfig.js';

console.log('Hybrid Protocol: Starting...');

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new Renderer(this.canvas);

        // ExoFrame Loop
        this.lastTime = 0;
        this.accumulator = 0;
        this.dt = 1 / 60;
        this.time = 0;

        this.init();
    }

    init() {
        window.addEventListener('resize', () => this.resize());
        this.resize();

        // 1. Core Systems
        this.battery = new BatteryManager(30);
        this.grid = new GridSystem(4, 4);
        this.zone = new ZoneManager();
        this.codex = new CodexManager();
        this.codex.onUnlock = (tier) => {
            console.log(`Main: Unlock Detected T${tier}, Updating Visuals...`);
            this.updateHeroVisuals(); // Update Stats & Visuals
        };
        this.sprites = new SpriteManager();
        this.sound = new SoundManager();
        this.battle = new BattleSystem(this);

        // 2. Load Assets
        this.sprites.load({
            // Backgrounds
            'bg_zone1': 'assets/images/bg_zone1.png',

            // Enemies
            'enemy_dummy': 'assets/images/enemy_dummy.png',

            // Hero Parts
            'hero_head': 'assets/images/hero_head.png',
            'hero_body': 'assets/images/hero_body.png',
            'hero_arm_upper': 'assets/images/hero_arm_upper.png',
            'hero_arm_lower': 'assets/images/hero_arm_lower.png',
            'hero_leg_upper': 'assets/images/hero_leg_upper.png',
            'hero_leg_lower': 'assets/images/hero_leg_lower.png',

            // Icons
            'icon_battery': 'assets/images/ui_battery.png'
        });

        this.battery.onDeplete = () => {
            console.log("BATTERY DEPLETED - RETURN TO BASE");
        };

        this.skeleton = new Skeleton(this.canvas.width / 2, this.canvas.height * 0.65);
        this.updateHeroVisuals(); // Apply Loadout

        // State
        this.enemyShake = 0;
        this.floatingTexts = []; // [{text, x, y, color, life, dy}]

        this.setupInput();

        requestAnimationFrame((ts) => this.loop(ts));
        console.log('Game Initialized (Auto-Battle Ready)');
    }

    setupInput() {
        // ACTION: Click Canvas OR Button to Battle
        const triggerBattle = () => {
            if (this.battery.depleted || this.battle.inCombat) return;
            if (this.battery.consume(BATTLE_CONFIG.TURN_COST_ENTRY)) {
                this.startBattle();
            }
        };

        this.canvas.addEventListener('pointerdown', triggerBattle);

        const btnScan = document.getElementById('btn-scan');
        if (btnScan) {
            btnScan.addEventListener('click', triggerBattle);
        }

        // Debug Controls
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyZ') {
                this.zone.advance();
                this.battery.addTurns(10);
                console.log("Boss Defeated! Zone Up & Battery +10");
            }
            if (e.code === 'KeyR') {
                this.zone.reset();
                this.battery.reset();
                this.grid = new GridSystem(4, 4);
                console.log("Returned to Base. Reset.");
            }
            if (e.code === 'KeyC') {
                // Cheat: Register current zone tier
                this.codex.unlock(this.zone.getDropTier());
            }
        });
    }

    resize() {
        // Match canvas to its container
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.renderer.resize(this.canvas.width, this.canvas.height);

        // Reposition skeleton
        if (this.skeleton) {
            this.skeleton.root.x = this.canvas.width / 2;
            this.skeleton.root.y = this.canvas.height * 0.65;
        }
        console.log(`Canvas resized to ${this.canvas.width}x${this.canvas.height}`);
    }

    startBattle() {
        // Set callback for when battle ends
        this.battle.onBattleEnd = (win) => this.inputEndBattle(win);
        // Start the battle
        this.battle.start(this.codex, this.zone);
    }

    inputEndBattle(win) {
        if (win) {
            // Victory: Give loot
            const tier = this.zone.getDropTier();
            this.grid.addItem(tier, this.codex);
            console.log(`Looted Tier ${tier} item!`);

            // Floating text for loot
            this.addFloatingText(`+T${tier} 아이템 획득!`, this.canvas.width / 2, this.canvas.height * 0.4, '#0f0');
        } else {
            // Defeat: Additional penalty
            this.battery.consume(BATTLE_CONFIG.TURN_COST_PENALTY);
            console.log(`Defeated! Lost ${BATTLE_CONFIG.TURN_COST_PENALTY} extra turns.`);

            // Floating text for defeat
            this.addFloatingText(`패배! -${BATTLE_CONFIG.TURN_COST_PENALTY} 턴`, this.canvas.width / 2, this.canvas.height * 0.4, '#f00');
        }
    }

    loop(timestamp) {
        const currentTime = timestamp / 1000;
        if (!this.lastTime) this.lastTime = currentTime;

        const frameTime = Math.min(currentTime - this.lastTime, 0.25);
        this.lastTime = currentTime;

        this.accumulator += frameTime;

        while (this.accumulator >= this.dt) {
            this.update(this.dt, this.time);
            this.accumulator -= this.dt;
            this.time += this.dt;
        }

        this.draw();
        requestAnimationFrame((ts) => this.loop(ts));
    }

    update(dt, totalTime) {
        if (this.skeleton) {
            this.skeleton.update(dt, totalTime);
        }

        // Decay Shake
        if (this.enemyShake > 0) {
            this.enemyShake -= dt * 100; // Fast decay
            if (this.enemyShake < 0) this.enemyShake = 0;
        }

        // Update Floating Texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.dy * dt;
            ft.life -= dt;
            if (ft.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    // Add floating text at position
    addFloatingText(text, x, y, color = '#fff') {
        this.floatingTexts.push({
            text: text,
            x: x,
            y: y,
            color: color,
            life: 1.5, // seconds
            dy: -60   // pixels per second upward
        });
    }

    // Check Codex and update Skeleton's equipment
    updateHeroVisuals() {
        let maxTier = 0;
        // Find max unlocked tier
        this.codex.unlockedTiers.forEach(tier => {
            if (tier > maxTier) maxTier = tier;
        });

        console.log(`Updating Visuals for Max Tier: ${maxTier}`);

        // Base sets
        if (maxTier >= 1) {
            this.skeleton.equip("Head", "t1_helm");
            this.skeleton.equip("Hand_R", "t1_weapon");
        }
        if (maxTier >= 2) {
            this.skeleton.equip("Head", "t2_helm");
            this.skeleton.equip("Hand_R", "t2_weapon");
        }
        // Future tiers...
    }

    drawEnemy(ctx) {
        // Placeholder Enemy on the Right
        const ex = this.canvas.width * 0.75;
        const ey = this.canvas.height * 0.65;

        // Shake logic
        const shakeX = (Math.random() - 0.5) * this.enemyShake;
        const shakeY = (Math.random() - 0.5) * this.enemyShake;

        ctx.save();
        ctx.translate(ex + shakeX, ey + shakeY);

        const enemySprite = this.sprites.get('enemy_dummy'); // Dynamic later
        if (enemySprite) {
            // Draw Sprite Centered
            // scale?
            const w = 150;
            const h = 150;
            ctx.drawImage(enemySprite, -w / 2, -h / 2, w, h);
        } else {
            // Body
            ctx.fillStyle = '#c33'; // Enemy Red
            ctx.fillRect(-40, -40, 80, 80); // 80x80 box

            // Eyes
            ctx.fillStyle = '#ff0';
            ctx.fillRect(-20, -10, 10, 10);
            ctx.fillRect(10, -10, 10, 10);
        }

        // Name Tag
        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        // Generic Name based on Zone?
        // For Test Zone (Index 0): "Training Dummy"
        const name = this.zone.currentZone === 0 ? "Training Dummy" : "Hostile Unit";
        ctx.fillText(name, 0, -80); // Higher up due to sprite size

        ctx.restore();
    }

    draw() {
        // Clear
        this.renderer.clear();
        const ctx = this.renderer.ctx;

        // 1. Draw Background
        const bg = this.sprites.get('bg_zone1'); // Dynamic based on zone later
        if (bg) {
            // Scale BG to cover canvas
            ctx.drawImage(bg, 0, 0, this.canvas.width, this.canvas.height);

            // Dark Overlay for mood
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Fallback
            ctx.fillStyle = this.zone.getZoneColor();
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // 2. Draw Enemy
        this.drawEnemy(ctx);

        // 3. Draw Skeleton
        if (this.skeleton) {
            this.skeleton.draw(ctx, this.sprites);
        }

        // 4. UI Overlay
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Top Info Bar
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, this.canvas.width, 80);

        ctx.fillStyle = '#f90';
        ctx.font = 'bold 20px monospace';
        const title = LangSystem.get("GAME_TITLE");
        ctx.fillText(title, 20, 30);

        // Zone Info
        ctx.fillStyle = '#fff';
        ctx.font = '16px monospace';
        ctx.fillText(`ZONE: ${this.zone.getZoneName()} (T${this.zone.getDropTier()})`, 20, 55);

        // Turn/Battery Counter
        const turnColor = this.battery.depleted ? '#f00' : '#0f0';
        ctx.fillStyle = turnColor;
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${this.battery.currentTurns} / ${this.battery.maxTurns} TURNS`, this.canvas.width - 20, 55);
        ctx.textAlign = 'left';

        // Battle UI (If in combat)
        if (this.battle.inCombat || this.battle.heroHP < this.battle.heroMaxHP) {
            // Hero HP
            const hPct = this.battle.heroHP / this.battle.heroMaxHP;
            ctx.fillStyle = '#f00';
            ctx.fillRect(this.canvas.width / 2 - 50, this.canvas.height * 0.55, 100 * hPct, 10);
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(this.canvas.width / 2 - 50, this.canvas.height * 0.55, 100, 10);

            // Enemy HP
            const ePct = this.battle.enemyHP / this.battle.enemyMaxHP;
            const ex = this.canvas.width * 0.75;
            const ey = this.canvas.height * 0.65;
            ctx.fillStyle = '#f00';
            ctx.fillRect(ex - 40, ey - 60, 80 * ePct, 10);
        }

        // 5. Draw Grid (Inventory)
        this.drawGrid(ctx);

        // 6. Draw Floating Texts
        this.drawFloatingTexts(ctx);
    }

    drawFloatingTexts(ctx) {
        ctx.save();
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';

        for (const ft of this.floatingTexts) {
            const alpha = Math.min(1, ft.life); // Fade out
            ctx.globalAlpha = alpha;
            ctx.fillStyle = ft.color;
            ctx.fillText(ft.text, ft.x, ft.y);
        }

        ctx.restore();
    }

    drawGrid(ctx) {
        const cellSize = 40;
        const startX = 20;
        const startY = 100;

        ctx.strokeStyle = '#444';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < this.grid.cells.length; i++) {
            const x = startX + (i % this.grid.cols) * cellSize;
            const y = startY + Math.floor(i / this.grid.cols) * cellSize;

            ctx.strokeRect(x, y, cellSize, cellSize);

            const item = this.grid.cells[i];
            if (item) {
                // Check Discovery & Mastery
                const isDiscovered = this.codex.isDiscovered(item.tier);
                const isMastered = this.codex.isUnlocked(item.tier);

                if (isDiscovered) {
                    // DRAW ITEM
                    ctx.fillStyle = `hsl(${item.tier * 40}, 70%, 50%)`;
                    ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);

                    ctx.fillStyle = '#fff';
                    ctx.font = '16px sans-serif';
                    ctx.fillText(item.tier, x + cellSize / 2, y + cellSize / 2);

                    // Mastery Indicator (Gold Border)
                    if (isMastered) {
                        ctx.strokeStyle = '#ffd700'; // Gold
                        ctx.lineWidth = 3;
                        ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
                    }

                } else {
                    // FOG OF WAR (?)
                    ctx.fillStyle = `#222`;
                    ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);

                    ctx.fillStyle = '#666';
                    ctx.font = 'bold 20px monospace';
                    ctx.fillText("?", x + cellSize / 2, y + cellSize / 2);
                }
            }
        }
    }
}

// CRITICAL: Actually start the game!
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Ready - Creating Game Instance');
    new Game();
});
