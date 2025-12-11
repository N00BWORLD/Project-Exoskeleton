/**
 * UIManager - Handles all UI rendering for battle scene
 */
export class UIManager {
    constructor(game) {
        this.game = game;
        this.floatingTexts = [];
    }

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

    draw(ctx) {
        // Reset transform at the start
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        this.drawBackground(ctx);
        this.drawEnemy(ctx);
        this.drawHero(ctx);
        this.drawHUD(ctx);
        this.drawFloatingTexts(ctx);

        // Overlays
        if (this.game.overlay) {
            this.drawOverlay(ctx);
        }
    }

    drawOverlay(ctx) {
        // Dim background
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

        if (this.game.overlay === 'inventory') {
            this.drawInventory(ctx);
        } else if (this.game.overlay === 'codex') {
            this.drawCodex(ctx);
        }

        // Close instruction
        ctx.fillStyle = '#fff';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("TAP SCREEN TO CLOSE", this.game.canvas.width / 2, this.game.canvas.height - 30);
    }

    drawInventory(ctx) {
        // Reusing existing grid drawing logic
        ctx.fillStyle = '#448';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("🎒 EQUIPMENT (CUBES)", this.game.canvas.width / 2, 60);

        // Use existing drawGrid method, but we can override position/style inside it 
        // OR just call it. drawGrid uses hardcoded coordinates.
        // Let's assume drawGrid works at (20,100).
        this.drawGrid(ctx);
    }

    drawCodex(ctx) {
        const { canvas, codex } = this.game;

        ctx.fillStyle = '#884';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("📖 CODEX", canvas.width / 2, 60);

        const startY = 100;
        const lineHeight = 35;

        for (let i = 1; i <= 9; i++) { // Show Tiers 1-9
            const y = startY + (i - 1) * lineHeight;
            const isDiscovered = codex.isDiscovered(i);
            const isUnlocked = codex.isUnlocked(i);

            // Tier Label
            ctx.textAlign = 'left';
            ctx.fillStyle = isDiscovered ? `hsl(${i * 40}, 70%, 50%)` : '#444';
            ctx.fillText(`TIER ${i}`, 40, y);

            // Status
            ctx.textAlign = 'right';
            if (isUnlocked) {
                ctx.fillStyle = '#ffd700';
                ctx.fillText("MASTERED", canvas.width - 40, y);
            } else if (isDiscovered) {
                ctx.fillStyle = '#fff';
                ctx.fillText("FOUND", canvas.width - 40, y);
            } else {
                ctx.fillStyle = '#666';
                ctx.fillText("???", canvas.width - 40, y);
            }
        }
    }

    drawBackground(ctx) {
        const { canvas, sprites } = this.game;
        const bg = sprites.get('bg_zone1');

        if (bg) {
            ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    drawEnemy(ctx) {
        const { canvas, sprites, currentZone } = this.game;
        const ex = canvas.width * 0.75;
        const ey = canvas.height * 0.65;

        ctx.save();
        ctx.translate(ex, ey);

        const enemySprite = sprites.get('enemy_dummy');
        if (enemySprite) {
            const w = 150, h = 150;
            ctx.drawImage(enemySprite, -w / 2, -h / 2, w, h);
        } else {
            // Fallback placeholder
            ctx.fillStyle = '#c33';
            ctx.fillRect(-40, -40, 80, 80);
            ctx.fillStyle = '#ff0';
            ctx.fillRect(-20, -10, 10, 10);
            ctx.fillRect(10, -10, 10, 10);
        }

        // Enemy name based on current zone
        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        const name = currentZone ? currentZone.name + " 적" : "Enemy";
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
        const { canvas, battery, battle, currentZone } = this.game;
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Top Bar
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, canvas.width, 70);

        ctx.fillStyle = '#f90';
        ctx.font = 'bold 18px monospace';
        ctx.fillText('⚔️ BATTLE', 20, 25);

        // Zone info
        ctx.fillStyle = '#aaa';
        ctx.font = '14px monospace';
        const zoneName = currentZone ? currentZone.name : "Unknown";
        ctx.fillText(`Zone: ${zoneName}`, 20, 48);

        // Turns
        ctx.fillStyle = battery.depleted ? '#f00' : '#0f0';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${battery.currentTurns}/${battery.maxTurns}`, canvas.width - 20, 40);
        ctx.textAlign = 'left';

        // HP Bars
        if (battle.inCombat || battle.heroHP < battle.heroMaxHP) {
            // Hero HP bar
            const hPct = Math.max(0, battle.heroHP / battle.heroMaxHP);
            const hx = canvas.width * 0.35;
            const hy = canvas.height * 0.55;
            ctx.fillStyle = '#333';
            ctx.fillRect(hx - 50, hy, 100, 12);
            ctx.fillStyle = hPct > 0.3 ? '#0f0' : '#f00';
            ctx.fillRect(hx - 50, hy, 100 * hPct, 12);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.strokeRect(hx - 50, hy, 100, 12);

            // Hero HP text
            ctx.fillStyle = '#fff';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${battle.heroHP}/${battle.heroMaxHP}`, hx, hy + 10);

            // Enemy HP bar
            const ePct = Math.max(0, battle.enemyHP / battle.enemyMaxHP);
            const ex = canvas.width * 0.75;
            const ey = canvas.height * 0.55;
            ctx.fillStyle = '#333';
            ctx.fillRect(ex - 50, ey, 100, 12);
            ctx.fillStyle = '#f44';
            ctx.fillRect(ex - 50, ey, 100 * ePct, 12);
            ctx.strokeRect(ex - 50, ey, 100, 12);

            // Enemy HP text
            ctx.fillText(`${battle.enemyHP}/${battle.enemyMaxHP}`, ex, ey + 10);
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
