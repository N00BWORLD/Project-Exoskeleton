import { Bone } from './Bone.js';

export class Skeleton {
    constructor(x, y) {
        // Root (Center of body)
        this.root = new Bone("Root");
        this.root.x = x;
        this.root.y = y;

        // Direction: 1 = facing right, -1 = facing left
        this.facing = 1;

        // Attack animation state
        this.isAttacking = false;
        this.attackTime = 0;
        this.attackDuration = 0.3; // seconds

        // === 6-PART STRUCTURE + WEAPON ===
        // 1. Chest (Body/Torso)
        this.chest = new Bone("Chest", 50);
        this.root.addChild(this.chest);
        this.chest.x = 0;
        this.chest.y = 0;
        this.chest.imageName = 'hero_t0_chest';

        // 2. Head
        this.head = new Bone("Head", 40);
        this.chest.addChild(this.head);
        this.head.x = 0;
        this.head.y = -50;
        this.head.imageName = 'hero_t0_head';

        // 3. Left Arm
        this.armL = new Bone("Arm_L", 45);
        this.chest.addChild(this.armL);
        this.armL.x = -40;
        this.armL.y = -20;
        this.armL.rotation = Math.PI / 6;
        this.armL.imageName = 'hero_t0_arm_l';

        // 4. Right Arm (Weapon Arm)
        this.armR = new Bone("Arm_R", 45);
        this.chest.addChild(this.armR);
        this.armR.x = 40;
        this.armR.y = -20;
        this.armR.rotation = -Math.PI / 6;
        this.armR.imageName = 'hero_t0_arm_r';

        // 5. Sword (attached to right arm)
        this.sword = new Bone("Sword", 60);
        this.armR.addChild(this.sword);
        this.sword.x = 45; // End of arm
        this.sword.y = 0;
        this.sword.rotation = 0;
        this.sword.imageName = 'weapon_sword';

        // 6. Left Leg
        this.legL = new Bone("Leg_L", 50);
        this.root.addChild(this.legL);
        this.legL.x = -15;
        this.legL.y = 40;
        this.legL.imageName = 'hero_t0_leg_l';

        // 7. Right Leg
        this.legR = new Bone("Leg_R", 50);
        this.root.addChild(this.legR);
        this.legR.x = 15;
        this.legR.y = 40;
        this.legR.imageName = 'hero_t0_leg_r';

        this.root.updateWorldTransform();
    }

    // Set facing direction
    setFacing(direction) {
        this.facing = direction >= 0 ? 1 : -1;
    }

    // Trigger slash attack
    attack() {
        if (!this.isAttacking) {
            this.isAttacking = true;
            this.attackTime = 0;
        }
    }

    equip(boneName, imageName) {
        const findBone = (bone) => {
            if (bone.name === boneName) return bone;
            for (const child of bone.children) {
                const found = findBone(child);
                if (found) return found;
            }
            return null;
        };

        const target = findBone(this.root);
        if (target) {
            if (!target.attachments) target.attachments = [];
            target.attachments = [imageName];
        }
    }

    update(dt, totalTime) {
        // Idle Animation
        this.chest.scaleY = 1 + Math.sin(totalTime * 3) * 0.02;

        // Attack Animation
        if (this.isAttacking) {
            this.attackTime += dt;
            const progress = this.attackTime / this.attackDuration;

            if (progress < 0.5) {
                // Wind up - arm goes back
                this.armR.rotation = -Math.PI / 6 - progress * Math.PI * 0.8;
                this.sword.rotation = -progress * Math.PI * 0.3;
            } else if (progress < 1.0) {
                // Slash - arm swings forward
                const swingProgress = (progress - 0.5) * 2;
                this.armR.rotation = -Math.PI / 6 - Math.PI * 0.4 + swingProgress * Math.PI * 1.2;
                this.sword.rotation = -Math.PI * 0.15 + swingProgress * Math.PI * 0.6;
            } else {
                // Done
                this.isAttacking = false;
                this.armR.rotation = -Math.PI / 6;
                this.sword.rotation = 0;
            }
        } else {
            // Normal arm sway when not attacking
            this.armL.rotation = Math.PI / 6 + Math.sin(totalTime * 2) * 0.1;
            this.armR.rotation = -Math.PI / 6 - Math.sin(totalTime * 2) * 0.1;
        }

        this.root.updateWorldTransform();
    }

    draw(ctx, spriteManager) {
        ctx.save();
        ctx.translate(this.root.x, this.root.y);

        // Flip based on facing direction
        ctx.scale(this.facing, 1);

        const allBones = [];
        const collect = (b) => {
            allBones.push(b);
            b.children.forEach(collect);
        };
        collect(this.root);

        for (const bone of allBones) {
            const m = bone.worldMatrix;
            ctx.setTransform(m[0] * this.facing, m[1], m[2] * this.facing, m[3], m[4] * this.facing, m[5]);

            if (spriteManager) {
                this.drawLayer(ctx, spriteManager, bone.imageName);
                if (bone.attachments) {
                    for (const att of bone.attachments) {
                        this.drawLayer(ctx, spriteManager, att);
                    }
                }
            } else {
                this.drawDebugBone(ctx, bone);
            }
        }
        ctx.restore();
    }

    drawLayer(ctx, spriteManager, imageName) {
        if (!imageName) return;
        const img = spriteManager.get(imageName);
        if (img) {
            const targetSize = imageName.includes('sword') ? 80 : 70;
            const scale = targetSize / Math.max(img.width, img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            ctx.drawImage(img, -w / 2, -h / 2, w, h);
        }
    }

    drawDebugBone(ctx, bone) {
        ctx.fillStyle = bone.color || '#555';
        ctx.fillRect(-10, -20, 20, 40);
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(bone.name, 0, 5);
    }
}
