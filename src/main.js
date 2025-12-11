/**
 * main.js - Game Entry Point
 * Top-Down Map + Random Encounter + Battle System
 */

import { Renderer } from './engine/Renderer.js';
import { Skeleton } from './engine/Skeleton.js';
import { EffectManager } from './engine/EffectManager.js';
import { BatteryManager } from './game/systems/BatteryManager.js';
import { GridSystem } from './game/systems/GridSystem.js';
import { CodexManager } from './game/systems/CodexManager.js';
import { BattleSystem } from './game/systems/BattleSystem.js';
import { SpriteManager } from './engine/SpriteManager.js';
import { SoundManager } from './engine/SoundManager.js';
import { SceneManager } from './game/scenes/SceneManager.js';
import { MapScene } from './game/scenes/MapScene.js';
import { UIManager } from './game/ui/UIManager.js';
import { BATTLE_CONFIG, PARTS } from './data/GameConfig.js';

console.log('Hybrid Protocol: Starting...');

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new Renderer(this.canvas);

        this.lastTime = 0;
        this.accumulator = 0;
        this.dt = 1 / 60;
        this.time = 0;
        this.overlay = null;

        this.init();
    }

    init() {
        window.addEventListener('resize', () => this.resize());
        this.resize();

        // Core Systems
        this.battery = new BatteryManager(30);
        this.grid = new GridSystem(5, 5); // Expanded to 25 slots for 5 Parts
        this.codex = new CodexManager();
        this.sprites = new SpriteManager();
        this.sound = new SoundManager();
        this.effects = new EffectManager();

        // Scene System
        this.scene = new SceneManager();
        this.mapScene = new MapScene(this);
        this.battle = new BattleSystem(this);

        // Current encounter zone
        this.currentZone = null;

        // UI (for battle scene)
        this.ui = new UIManager(this);

        // Callbacks
        this.codex.onUnlock = (tier, part) => {
            console.log(`Unlock T${tier} ${part}`);
            // Force status update (re-calc stats)
            this.battle.updateHeroStats();

            // Notification
            this.ui.addFloatingText(`MASTERED: T${tier} ${part}`, this.canvas.width / 2, this.canvas.height * 0.2, '#ffd700');
        };
        this.battery.onDeplete = () => console.log("BATTERY DEPLETED");

        // Load Assets
        this.sprites.load({
            'bg_zone1': 'assets/images/bg_zone1.png',
            'enemy_dummy': 'assets/images/enemy_dummy.jpg',

            'hero_t0_head': 'assets/images/hero_t0_head.png',
            'hero_t0_chest': 'assets/images/hero_t0_chest.png',
            'hero_t0_arm_l': 'assets/images/hero_t0_arm_l.png',
            'hero_t0_arm_r': 'assets/images/hero_t0_arm_r.png',
            'hero_t0_leg_l': 'assets/images/hero_t0_leg_l.png',
            'hero_t0_leg_r': 'assets/images/hero_t0_leg_r.png',

            'icon_battery': 'assets/images/ui_battery.png'
        });

        // Hero (for battle)
        this.skeleton = new Skeleton(0, 0);

        // Input
        this.setupInput();

        requestAnimationFrame((ts) => this.loop(ts));
        console.log('Game Initialized - Map Mode');
    }


    setupInput() {
        this.canvas.addEventListener('pointerdown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Overlay interaction (Close on tap)
            if (this.overlay) {
                // Debounce: verify if enough time passed since opening
                if (Date.now() - (this.overlayOpenTime || 0) > 500) {
                    this.overlay = null;
                }
                return;
            }
            // If overlay is open, block clicks on map?
            if (this.overlay) return;

            if (this.scene.transitioning) return;

            if (this.scene.currentScene === 'map') {
                // Map scene - move character
                if (!this.battery.depleted) {
                    this.mapScene.handleClick(x, y);
                }
            } else if (this.scene.isBattle()) {
                // Battle scene - trigger attack
                if (!this.battle.inCombat) {
                    this.startBattle();
                }
            }
        });

        // Speed button
        const btnSpeed = document.getElementById('btn-speed');
        if (btnSpeed) {
            btnSpeed.addEventListener('click', () => {
                const newSpeed = this.battle.cycleSpeed();
                btnSpeed.textContent = `⚡ ${newSpeed}x`;
            });
        }

        // Immediate fight button
        const btnFight = document.getElementById('btn-fight');
        if (btnFight) {
            btnFight.addEventListener('click', (e) => {
                e.stopPropagation();

                if (this.scene.currentScene !== 'map') return;

                const zone = this.mapScene.currentZone;
                if (!zone || zone.type === 'safe') {
                    this.ui.addFloatingText("안전 지역입니다", this.canvas.width / 2, this.canvas.height * 0.4, '#f00');
                    return;
                }
                this.triggerEncounter(zone);
            });
        }

        // Inventory button
        const btnInventory = document.getElementById('btn-inventory');
        if (btnInventory) {
            const openInventory = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.overlay = 'inventory';
                this.overlayOpenTime = Date.now(); // Set timestamp
                console.log("Overlay OPEN: Inventory");
            };
            btnInventory.addEventListener('click', openInventory);
            btnInventory.addEventListener('touchstart', openInventory, { passive: false });
        }

        // Codex button
        const btnCodex = document.getElementById('btn-codex');
        if (btnCodex) {
            const openCodex = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.overlay = 'codex';
                this.overlayOpenTime = Date.now(); // Set timestamp
                console.log("Overlay OPEN: Codex");
            };
            btnCodex.addEventListener('click', openCodex);
            btnCodex.addEventListener('touchstart', openCodex, { passive: false });
        }
    }

    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.renderer.resize(this.canvas.width, this.canvas.height);
    }

    triggerEncounter(zone) {
        if (this.battery.depleted) {
            console.log("Battery depleted - no encounter");
            return;
        }

        // Consume turn for encounter
        if (!this.battery.consume(BATTLE_CONFIG.TURN_COST_ENTRY)) {
            console.log("Not enough turns");
            return;
        }

        // Reset encounter gauge immediately
        this.mapScene.resetEncounterGauge();

        this.currentZone = zone;
        console.log(`Encounter in ${zone.name}! Starting battle...`);

        this.scene.enterBattle(() => {
            console.log("Fade complete - positioning hero");
            // Position hero for battle
            this.skeleton.x = this.canvas.width * 0.35;
            this.skeleton.y = this.canvas.height * 0.65;
            this.skeleton.setFacing(1);

            // Start battle with small delay to ensure scene is ready
            setTimeout(() => {
                console.log("Starting battle now");
                this.startBattle();
            }, 100);
        });
    }

    startBattle() {
        this.battle.onBattleEnd = (win) => this.onBattleEnd(win);
        this.battle.start(this.codex, this.currentZone);
    }

    onBattleEnd(win) {
        if (win) {
            // Determine Drop
            const maxTier = this.currentZone.dropTier || 1;
            // Weighted random tier (higher tiers rarer, or just random range 1-max)
            // User requested: "High level zone can drop low tier parts"
            // Let's do a simple random for now: 1 to maxTier
            const tier = Math.floor(Math.random() * maxTier) + 1;

            // Determine Part
            const availableParts = this.currentZone.dropParts || PARTS;
            const part = availableParts[Math.floor(Math.random() * availableParts.length)];

            this.grid.addItem(tier, this.codex, part);
            this.ui.addFloatingText(`+T${tier} ${part} 획득!`, this.canvas.width / 2, this.canvas.height * 0.4, '#0f0');
        } else {
            this.battery.consume(BATTLE_CONFIG.TURN_COST_PENALTY);
            this.ui.addFloatingText(`패배!`, this.canvas.width / 2, this.canvas.height * 0.4, '#f00');
        }

        // Return to map after delay
        setTimeout(() => {
            this.scene.exitBattle(() => {
                this.currentZone = null;
            });
        }, 1000);
    }

    showHeroAttack() {
        const ex = this.canvas.width * 0.75;
        const ey = this.canvas.height * 0.65;
        this.effects.addSlash(ex, ey, 1, '#0ff');
    }

    showEnemyAttack() {
        const hx = this.canvas.width * 0.35;
        const hy = this.canvas.height * 0.65;
        this.effects.addSlash(hx, hy, -1, '#f44');
    }

    loop(timestamp) {
        const currentTime = timestamp / 1000;
        if (!this.lastTime) this.lastTime = currentTime;

        const frameTime = Math.min(currentTime - this.lastTime, 0.25);
        this.lastTime = currentTime;
        this.accumulator += frameTime;

        while (this.accumulator >= this.dt) {
            this.update(this.dt);
            this.accumulator -= this.dt;
            this.time += this.dt;
        }

        this.draw();
        requestAnimationFrame((ts) => this.loop(ts));
    }

    update(dt) {
        if (this.overlay) return; // Pause updates when overlay is open

        this.scene.update(dt);
        this.effects.update(dt);
        this.ui.update(dt);

        // Map scene updates
        // Map scene updates
        if (this.scene.currentScene === 'map') {
            const encounterZone = this.mapScene.update(dt);
            if (encounterZone) {
                // Defer encounter trigger to next tick to avoid update loop conflicts
                setTimeout(() => {
                    this.triggerEncounter(encounterZone);
                }, 0);
            }
        }
    }

    draw() {
        this.renderer.clear();
        const ctx = this.renderer.ctx;

        if (this.scene.currentScene === 'map') {
            this.mapScene.draw(ctx, this.canvas);
        } else if (this.scene.isBattle()) {
            this.ui.draw(ctx);
            this.effects.draw(ctx);
        }

        // Global UI Overlay (Inventory/Codex)
        if (this.overlay) {
            this.ui.drawOverlay(ctx);
        }

        // Scene transition overlay
        this.scene.drawTransition(ctx, this.canvas.width, this.canvas.height);
    }
}

// Start
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Ready');
    new Game();
});
