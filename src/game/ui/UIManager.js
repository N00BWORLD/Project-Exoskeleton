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
