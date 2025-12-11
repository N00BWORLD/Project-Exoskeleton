import { LangSystem } from '../../core/Lang.js';

/**
 * UIManager - Handles all UI rendering
 * Extracted from main.js for cleaner architecture
 */
export class UIManager {
    constructor(game) {
        this.game = game;
        this.floatingTexts = [];
    }

    // Add floating text at position
    addFloatingText(text, x, y, color = '#fff') {
        this.floatingTexts.push({
            text: text,
            x: x,
            y: y,
            color: color,
            life: 1.5,
            dy: -60
        });
    }

    // Update floating texts (call from game.update)
    update(dt) {
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.dy * dt;
            ft.life -= dt;
            if (ft.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    // Main draw call
    draw(ctx) {
        this.drawBackground(ctx);
        this.drawEnemy(ctx);
        this.drawHero(ctx);
        this.drawHUD(ctx);
        this.drawGrid(ctx);
        this.drawFloatingTexts(ctx);
    }

    drawBackground(ctx) {
        const { canvas, sprites, zone } = this.game;
        const bg = sprites.get('bg_zone1');

        if (bg) {
            ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = zone.getZoneColor();
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    drawEnemy(ctx) {
        const { canvas, sprites, zone } = this.game;
        const ex = canvas.width * 0.75;
        const ey = canvas.height * 0.65;

        const shakeX = (Math.random() - 0.5) * this.game.enemyShake;
        const shakeY = (Math.random() - 0.5) * this.game.enemyShake;

        ctx.save();
        ctx.translate(ex + shakeX, ey + shakeY);

        const enemySprite = sprites.get('enemy_dummy');
        if (enemySprite) {
            const w = 150, h = 150;
            ctx.drawImage(enemySprite, -w / 2, -h / 2, w, h);
        } else {
            ctx.fillStyle = '#c33';
            ctx.fillRect(-40, -40, 80, 80);
            ctx.fillStyle = '#ff0';
            ctx.fillRect(-20, -10, 10, 10);
            ctx.fillRect(10, -10, 10, 10);
        }

        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        const name = zone.currentZone === 0 ? "Training Dummy" : "Hostile Unit";
        ctx.fillText(name, 0, -80);

        ctx.restore();
    }

    drawHero(ctx) {
        const { skeleton, sprites } = this.game;
        if (skeleton) {
            skeleton.draw(ctx, sprites);
        }
    }

    drawHUD(ctx) {
        const { canvas, battery, zone, battle } = this.game;
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Top Bar
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, canvas.width, 80);

        ctx.fillStyle = '#f90';
        ctx.font = 'bold 20px monospace';
        ctx.fillText(LangSystem.get("GAME_TITLE"), 20, 30);

        ctx.fillStyle = '#fff';
        ctx.font = '16px monospace';
        ctx.fillText(`ZONE: ${zone.getZoneName()} (T${zone.getDropTier()})`, 20, 55);

        // Turns
        ctx.fillStyle = battery.depleted ? '#f00' : '#0f0';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${battery.currentTurns} / ${battery.maxTurns} TURNS`, canvas.width - 20, 55);
        ctx.textAlign = 'left';

        // HP Bars
        if (battle.inCombat || battle.heroHP < battle.heroMaxHP) {
            const hPct = battle.heroHP / battle.heroMaxHP;
            ctx.fillStyle = '#f00';
            ctx.fillRect(canvas.width / 2 - 50, canvas.height * 0.55, 100 * hPct, 10);
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(canvas.width / 2 - 50, canvas.height * 0.55, 100, 10);

            const ePct = battle.enemyHP / battle.enemyMaxHP;
            const ex = canvas.width * 0.75;
            const ey = canvas.height * 0.65;
            ctx.fillStyle = '#f00';
            ctx.fillRect(ex - 40, ey - 60, 80 * ePct, 10);
        }
    }

    drawGrid(ctx) {
        const { grid, codex } = this.game;
        const cellSize = 40;
        const startX = 20;
        const startY = 100;

        ctx.strokeStyle = '#444';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < grid.cells.length; i++) {
            const x = startX + (i % grid.cols) * cellSize;
            const y = startY + Math.floor(i / grid.cols) * cellSize;

            ctx.strokeRect(x, y, cellSize, cellSize);

            const item = grid.cells[i];
            if (item) {
                const isDiscovered = codex.isDiscovered(item.tier);
                const isMastered = codex.isUnlocked(item.tier);

                if (isDiscovered) {
                    ctx.fillStyle = `hsl(${item.tier * 40}, 70%, 50%)`;
                    ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);

                    ctx.fillStyle = '#fff';
                    ctx.font = '16px sans-serif';
                    ctx.fillText(item.tier, x + cellSize / 2, y + cellSize / 2);

                    if (isMastered) {
                        ctx.strokeStyle = '#ffd700';
                        ctx.lineWidth = 3;
                        ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
                    }
                } else {
                    ctx.fillStyle = '#222';
                    ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
                    ctx.fillStyle = '#666';
                    ctx.font = 'bold 20px monospace';
                    ctx.fillText("?", x + cellSize / 2, y + cellSize / 2);
                }
            }
        }
    }

    drawFloatingTexts(ctx) {
        ctx.save();
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';

        for (const ft of this.floatingTexts) {
            ctx.globalAlpha = Math.min(1, ft.life);
            ctx.fillStyle = ft.color;
            ctx.fillText(ft.text, ft.x, ft.y);
        }

        ctx.restore();
    }
}
