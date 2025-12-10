import { Bone } from './Bone.js';

export class Skeleton {
    constructor(x, y) {
        // Create a standard Humanoid Rig
        this.root = new Bone("Root", 0);
        this.root.x = x;
        this.root.y = y;

        // Body
        this.body = new Bone("Body", 60);
        this.root.addChild(this.body);
        this.body.rotation = -Math.PI / 2; // Point Upwards

        // Head
        this.head = new Bone("Head", 30);
        this.body.addChild(this.head);
        this.head.x = 60; // Attach to top of body

        // Arms (Left/Right)
        this.armL = new Bone("Arm_L", 40);
        this.body.addChild(this.armL);
        this.armL.x = 50;
        this.armL.y = -15; // Shoulder offset
        this.armL.rotation = Math.PI / 4; // T-pose adjustment

        this.forearmL = new Bone("Forearm_L", 40);
        this.armL.addChild(this.forearmL);
        this.forearmL.x = 40;

        this.armR = new Bone("Arm_R", 40);
        this.body.addChild(this.armR);
        this.armR.x = 50;
        this.armR.y = 15;
        this.armR.rotation = -Math.PI / 4;

        this.forearmR = new Bone("Forearm_R", 40);
        this.armR.addChild(this.forearmR);
        this.forearmR.x = 40;

        // Initialize
        this.root.updateWorldTransform();
    }

    update(dt, totalTime) {
        // Procedural Idle Animation
        // Breathe: Scale body slightly
        this.body.scaleX = 1 + Math.sin(totalTime * 2) * 0.05;

        // Sway: Rotate root slightly
        this.root.rotation = Math.sin(totalTime) * 0.05;

        // Arms: Idle swing
        this.armL.rotation = (Math.PI / 4) + Math.sin(totalTime * 1.5 + 1) * 0.1;
        this.armR.rotation = (-Math.PI / 4) + Math.sin(totalTime * 1.5) * 0.1;

        // Recalculate Matrices
        this.root.updateWorldTransform();
    }

    draw(ctx) {
        this.drawBone(ctx, this.root);
    }

    drawBone(ctx, bone) {
        // 1. Calculate End Point for visualization
        const c = Math.cos(bone.worldRotation);
        const s = Math.sin(bone.worldRotation);

        const endX = bone.worldX + (c * bone.length * bone.worldScaleX);
        const endY = bone.worldY + (s * bone.length * bone.worldScaleY);

        // 2. Draw Bone (Line)
        ctx.beginPath();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.moveTo(bone.worldX, bone.worldY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // 3. Draw Joint (Circle)
        ctx.beginPath();
        ctx.fillStyle = '#0f0'; // Green for joints
        ctx.arc(bone.worldX, bone.worldY, 4, 0, Math.PI * 2);
        ctx.fill();

        // 4. Draw children
        for (const child of bone.children) {
            this.drawBone(ctx, child);
        }
    }
}
