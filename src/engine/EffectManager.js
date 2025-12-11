/**
 * EffectManager.js - Handles visual effects (slash, hit, etc.)
 */
export class EffectManager {
    constructor() {
        this.effects = [];
    }

    // Add a slash effect at position
    addSlash(x, y, direction = 1, color = '#fff') {
        this.effects.push({
            type: 'slash',
            x: x,
            y: y,
            direction: direction, // 1 = right, -1 = left
            color: color,
            life: 0.3, // seconds
            maxLife: 0.3
        });
    }

    // Add a hit flash effect
    addHitFlash(x, y, color = '#f00') {
        this.effects.push({
            type: 'hit',
            x: x,
            y: y,
            color: color,
            life: 0.15,
            maxLife: 0.15
        });
    }

    update(dt) {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            this.effects[i].life -= dt;
            if (this.effects[i].life <= 0) {
                this.effects.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        for (const effect of this.effects) {
            const progress = 1 - (effect.life / effect.maxLife);

            if (effect.type === 'slash') {
                this.drawSlash(ctx, effect, progress);
            } else if (effect.type === 'hit') {
                this.drawHit(ctx, effect, progress);
            }
        }
    }

    drawSlash(ctx, effect, progress) {
        ctx.save();
        ctx.translate(effect.x, effect.y);
        ctx.scale(effect.direction, 1);

        // Slash arc
        const alpha = 1 - progress;
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 8 - progress * 6;
        ctx.lineCap = 'round';
        ctx.globalAlpha = alpha;

        ctx.beginPath();
        const startAngle = -Math.PI * 0.4 + progress * 0.2;
        const endAngle = Math.PI * 0.3 + progress * 0.5;
        const radius = 60 + progress * 30;
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.stroke();

        // Inner glow
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#fff';
        ctx.globalAlpha = alpha * 0.7;
        ctx.beginPath();
        ctx.arc(0, 0, radius - 5, startAngle, endAngle);
        ctx.stroke();

        ctx.restore();
    }

    drawHit(ctx, effect, progress) {
        ctx.save();
        ctx.translate(effect.x, effect.y);

        const alpha = 1 - progress;
        const size = 30 + progress * 20;

        // Flash burst
        ctx.globalAlpha = alpha * 0.8;
        ctx.fillStyle = effect.color;

        // Star shape
        for (let i = 0; i < 4; i++) {
            ctx.save();
            ctx.rotate((Math.PI / 4) * i + progress * 0.5);
            ctx.fillRect(-size / 2, -3, size, 6);
            ctx.restore();
        }

        ctx.restore();
    }
}
