import { Renderer } from './engine/Renderer.js';
import { Skeleton } from './engine/Skeleton.js';
import { LangSystem } from './core/Lang.js';

console.log('Hybrid Protocol: Starting...');

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new Renderer(this.canvas);

        this.lastTime = 0;
        this.init();
    }

    init() {
        // Handle resize
        window.addEventListener('resize', () => this.resize());
        this.resize();

        // Setup Skeleton (Center of Hero View roughly)
        // Hero View is at 60% height to 70% height.
        // Let's position him in the middle of the screen for now to verify.
        this.skeleton = new Skeleton(this.canvas.width / 2, this.canvas.height * 0.65);

        // Start Loop
        requestAnimationFrame((ts) => this.loop(ts));
        console.log('Game Initialized');
    }

    resize() {
        const container = document.getElementById('game-container');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.renderer.resize(this.canvas.width, this.canvas.height);

        if (this.skeleton) {
            this.skeleton.root.x = this.canvas.width / 2;
            this.skeleton.root.y = this.canvas.height * 0.65;
        }
    }

    loop(timestamp) {
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.update(dt, timestamp / 1000);
        this.draw();

        requestAnimationFrame((ts) => this.loop(ts));
    }

    update(dt, totalTime) {
        if (this.skeleton) {
            this.skeleton.update(dt, totalTime);
        }
    }

    draw() {
        this.renderer.clear();

        if (this.skeleton) {
            this.skeleton.draw(this.renderer.ctx);
        }

        // Debug placeholder
        const ctx = this.renderer.ctx;
        ctx.fillStyle = '#f90';
        ctx.font = '20px monospace';
        // Use Localization System
        const title = LangSystem.get("GAME_TITLE");
        ctx.fillText(`${title} (Hybrid Protocol)`, 20, 30);
    }
}

// Start the game
window.game = new Game();
