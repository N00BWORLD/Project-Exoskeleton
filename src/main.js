/**
 * main.js - Game Entry Point
 * Refactored to be lightweight (~100 lines)
 * All UI logic moved to UIManager, Input logic to InputManager
 */

import { Renderer } from './engine/Renderer.js';
import { Skeleton } from './engine/Skeleton.js';
import { BatteryManager } from './game/systems/BatteryManager.js';
import { GridSystem } from './game/systems/GridSystem.js';
import { ZoneManager } from './game/systems/ZoneManager.js';
import { CodexManager } from './game/systems/CodexManager.js';
import { BattleSystem } from './game/systems/BattleSystem.js';
import { SpriteManager } from './engine/SpriteManager.js';
import { SoundManager } from './engine/SoundManager.js';
import { UIManager } from './game/ui/UIManager.js';
import { InputManager } from './game/ui/InputManager.js';
import { BATTLE_CONFIG } from './data/GameConfig.js';

console.log('Hybrid Protocol: Starting...');

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new Renderer(this.canvas);

        // Fixed timestep loop
        this.lastTime = 0;
        this.accumulator = 0;
        this.dt = 1 / 60;
        this.time = 0;

        this.init();
    }

    init() {
        window.addEventListener('resize', () => this.resize());
        this.resize();

        // Core Systems
        this.battery = new BatteryManager(30);
        this.grid = new GridSystem(4, 4);
        this.zone = new ZoneManager();
        this.codex = new CodexManager();
        this.sprites = new SpriteManager();
        this.sound = new SoundManager();
        this.battle = new BattleSystem(this);

        // UI & Input Managers
        this.ui = new UIManager(this);
        this.input = new InputManager(this);

        // Callbacks
        this.codex.onUnlock = (tier) => {
            console.log(`Unlock T${tier}, Updating Visuals...`);
            this.updateHeroVisuals();
        };
        this.battery.onDeplete = () => console.log("BATTERY DEPLETED");

        // Load Assets
        this.sprites.load({
            'bg_zone1': 'assets/images/bg_zone1.png',
            'enemy_dummy': 'assets/images/enemy_dummy.png',

            // Hero Parts (Tier 0 - Base)
            'hero_t0_head': 'assets/images/hero_t0_head.png',
            'hero_t0_chest': 'assets/images/hero_t0_chest.png',
            'hero_t0_arm_l': 'assets/images/hero_t0_arm_l.png',
            'hero_t0_arm_r': 'assets/images/hero_t0_arm_r.png',
            'hero_t0_leg_l': 'assets/images/hero_t0_leg_l.png',
            'hero_t0_leg_r': 'assets/images/hero_t0_leg_r.png',

            // Weapons
            'weapon_sword': 'assets/images/weapon_sword.png',

            'icon_battery': 'assets/images/ui_battery.png'
        });

        // Hero
        this.skeleton = new Skeleton(this.canvas.width / 2, this.canvas.height * 0.65);
        this.updateHeroVisuals();
        this.enemyShake = 0;

        this.input.setup();
        requestAnimationFrame((ts) => this.loop(ts));
        console.log('Game Initialized');
    }

    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.renderer.resize(this.canvas.width, this.canvas.height);
        if (this.skeleton) {
            this.skeleton.root.x = this.canvas.width / 2;
            this.skeleton.root.y = this.canvas.height * 0.65;
        }
    }

    startBattle() {
        this.battle.onBattleEnd = (win) => this.onBattleEnd(win);
        this.battle.start(this.codex, this.zone);
    }

    onBattleEnd(win) {
        if (win) {
            const tier = this.zone.getDropTier();
            this.grid.addItem(tier, this.codex);
            this.ui.addFloatingText(`+T${tier} 아이템 획득!`, this.canvas.width / 2, this.canvas.height * 0.4, '#0f0');
        } else {
            this.battery.consume(BATTLE_CONFIG.TURN_COST_PENALTY);
            this.ui.addFloatingText(`패배! -${BATTLE_CONFIG.TURN_COST_PENALTY} 턴`, this.canvas.width / 2, this.canvas.height * 0.4, '#f00');
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
        if (this.skeleton) this.skeleton.update(dt, totalTime);
        if (this.enemyShake > 0) {
            this.enemyShake -= dt * 100;
            if (this.enemyShake < 0) this.enemyShake = 0;
        }
        this.ui.update(dt);
    }

    draw() {
        this.renderer.clear();
        this.ui.draw(this.renderer.ctx);
    }

    updateHeroVisuals() {
        let maxTier = 0;
        this.codex.unlockedTiers.forEach(tier => {
            if (tier > maxTier) maxTier = tier;
        });
        if (maxTier >= 1) {
            this.skeleton.equip("Head", "t1_helm");
            this.skeleton.equip("Arm_R", "t1_weapon");
        }
        if (maxTier >= 2) {
            this.skeleton.equip("Head", "t2_helm");
            this.skeleton.equip("Arm_R", "t2_weapon");
        }
    }
}

// Start
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Ready');
    new Game();
});
