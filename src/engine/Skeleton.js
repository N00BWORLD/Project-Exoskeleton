/**
 * Skeleton.js - Static Character Renderer
 * No animation, just draws hero parts at fixed positions
 */
export class Skeleton {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.facing = 1; // 1 = right, -1 = left

        // Part offsets (relative to center)
        this.parts = {
            head: { x: 0, y: -60, size: 70 },
            chest: { x: 0, y: 0, size: 80 },
            arm_l: { x: -50, y: -10, size: 60 },
            arm_r: { x: 50, y: -10, size: 60 },
            leg_l: { x: -20, y: 60, size: 65 },
            leg_r: { x: 20, y: 60, size: 65 }
        };

        // Current tier (for image selection)
        this.tier = 0;
    }

    setFacing(direction) {
        this.facing = direction >= 0 ? 1 : -1;
    }

    setTier(tier) {
        this.tier = tier;
    }

    draw(ctx, spriteManager) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.facing, 1); // Flip if facing left

        // Draw each part
        for (const [name, part] of Object.entries(this.parts)) {
            const imgName = `hero_t${this.tier}_${name}`;
            const img = spriteManager.get(imgName);

            if (img) {
                const scale = part.size / Math.max(img.width, img.height);
                const w = img.width * scale;
                const h = img.height * scale;
                ctx.drawImage(img, part.x - w / 2, part.y - h / 2, w, h);
            } else {
                // Debug placeholder
                ctx.fillStyle = '#444';
                ctx.fillRect(part.x - 20, part.y - 25, 40, 50);
                ctx.fillStyle = '#fff';
                ctx.font = '10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(name, part.x, part.y);
            }
        }

        ctx.restore();
    }
}
