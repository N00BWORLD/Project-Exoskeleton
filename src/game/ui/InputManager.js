import { GridSystem } from '../systems/GridSystem.js';
import { BATTLE_CONFIG } from '../../data/GameConfig.js';

/**
 * InputManager - Handles all user input
 * Extracted from main.js for cleaner architecture
 */
export class InputManager {
    constructor(game) {
        this.game = game;
    }

    setup() {
        this.setupBattleInput();
        this.setupDebugInput();
    }

    setupBattleInput() {
        const { canvas, battery, battle } = this.game;

        const triggerBattle = () => {
            if (battery.depleted || battle.inCombat) return;
            if (battery.consume(BATTLE_CONFIG.TURN_COST_ENTRY)) {
                this.game.startBattle();
            }
        };

        canvas.addEventListener('pointerdown', triggerBattle);

        const btnScan = document.getElementById('btn-scan');
        if (btnScan) {
            btnScan.addEventListener('click', triggerBattle);
        }

        // Speed toggle button
        const btnSpeed = document.getElementById('btn-speed');
        if (btnSpeed) {
            btnSpeed.addEventListener('click', () => {
                const newSpeed = this.game.battle.cycleSpeed();
                btnSpeed.textContent = `⚡ ${newSpeed}x`;
            });
        }
    }

    setupDebugInput() {
        const { zone, battery, codex } = this.game;

        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyZ') {
                zone.advance();
                battery.addTurns(10);
                console.log("Boss Defeated! Zone Up & Battery +10");
            }
            if (e.code === 'KeyR') {
                zone.reset();
                battery.reset();
                this.game.grid = new GridSystem(4, 4);
                console.log("Returned to Base. Reset.");
            }
            if (e.code === 'KeyC') {
                codex.unlock(zone.getDropTier());
            }
        });
    }
}
