import { Bone } from './Bone.js';

export class Skeleton {
    constructor(x, y) {
        // Create Hierarchy
        this.root = new Bone("Root");
        this.root.x = x;
        this.root.y = y;

        // Spine -> Head
        this.spine = new Bone("Spine", 40);
        this.root.addChild(this.spine);
        this.spine.x = 0;
        this.spine.y = -40;
        this.spine.rotation = -Math.PI / 2; // -90 degrees
        this.spine.imageName = 'hero_body';

        this.head = new Bone("Head", 30);
        this.spine.addChild(this.head);
        this.head.x = 40;
        this.head.y = 0;
        this.head.rotation = 0;
        this.head.color = '#f00';
        this.head.imageName = 'hero_head';

        // Arms (Right)
        this.armR = new Bone("Arm_R", 30);
        this.spine.addChild(this.armR);
        this.armR.x = 30;
        this.armR.y = 20;
        this.armR.rotation = Math.PI / 4; // 45 degrees
        this.armR.imageName = 'hero_arm_upper';

        this.forearmR = new Bone("Forearm_R", 30);
        this.armR.addChild(this.forearmR);
        this.forearmR.x = 40;
        this.forearmR.imageName = 'hero_arm_lower';

        // Additional Hand Bone for Weapon
        this.handR = new Bone("Hand_R", 10);
        this.forearmR.addChild(this.handR);
        this.handR.x = 30;
        this.handR.imageName = 'hero_hand';

        // Legs (Right)
        this.legR = new Bone("Leg_R", 30);
        this.root.addChild(this.legR);
        this.legR.x = 10;
        this.legR.y = 10;
        this.legR.rotation = Math.PI / 2; // 90 degrees down
        this.legR.imageName = 'hero_leg_upper';

        this.shinR = new Bone("Shin_R", 40);
        this.legR.addChild(this.shinR);
        this.shinR.x = 30;
        this.shinR.imageName = 'hero_leg_lower';

        this.footR = new Bone("Foot_R", 15);
        this.shinR.addChild(this.footR);
        this.footR.x = 40;
        this.footR.imageName = 'hero_foot';

        // Initial Calculation
        this.root.updateWorldTransform();
    }

    // Helper to equip items
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
            // If attachments doesn't exist, init it
            if (!target.attachments) target.attachments = [];

            // For now, clear previous attachments in this slot/bone? 
            // Or just append? User said Layering. 
            // Let's assume 1 attachment per bone for now (e.g. Helm on Head).
            target.attachments = [imageName];
            console.log(`Equipped ${imageName} on ${boneName}`);
        }
    }

    update(dt, totalTime) {
        // Procedural Animation (Idle Breathe/Sway)
        this.spine.scaleX = 1 + Math.sin(totalTime * 4) * 0.02;
        this.root.rotation = Math.sin(totalTime) * 0.05;
        this.armR.rotation = (Math.PI / 4) + Math.sin(totalTime * 3) * 0.1;

        this.root.updateWorldTransform();
    }

    draw(ctx, spriteManager) {
        ctx.save();
        ctx.translate(this.root.x, this.root.y);

        // Flatten bones list for loop
        const allBones = [];
        const collect = (b) => {
            allBones.push(b);
            b.children.forEach(collect);
        };
        collect(this.root);

        for (const bone of allBones) {
            const m = bone.worldMatrix;
            ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);

            // 1. Draw Base Sprite
            if (spriteManager) {
                this.drawLayer(ctx, spriteManager, bone.imageName);

                // 2. Draw Attachments (Equipment)
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
            // Scale to reasonable size (images are 1024x1024, scale down to ~50-80px)
            const targetSize = 60; // Base size for body parts
            const scale = targetSize / Math.max(img.width, img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            // Draw centered
            ctx.drawImage(img, -w / 2, -h / 2, w, h);
        }
    }

    drawDebugBone(ctx, bone) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(bone.length, 0);
        ctx.strokeStyle = bone.color || '#fff';
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}
