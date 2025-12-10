export class Bone {
    constructor(name, length = 50) {
        this.name = name;
        this.length = length; // Visual length for debug rendering

        // Local Transform (Relative to Parent)
        this.x = 0;
        this.y = 0;
        this.rotation = 0; // Radians
        this.scaleX = 1;
        this.scaleY = 1;

        // World Transform (Computed)
        this.worldX = 0;
        this.worldY = 0;
        this.worldRotation = 0;
        this.worldScaleX = 1;
        this.worldScaleY = 1;

        // Hierarchy
        this.parent = null;
        this.children = [];
    }

    addChild(bone) {
        bone.parent = this;
        this.children.push(bone);
        return bone; // Return for chaining
    }

    // The heart of the skeletal system
    updateWorldTransform() {
        if (this.parent) {
            // 1. Apply Parent's World Transform to Local Transform
            // WorldRot = ParentWorldRot + LocalRot
            this.worldRotation = this.parent.worldRotation + this.rotation;

            // WorldScale (Simplified, usually more complex)
            this.worldScaleX = this.parent.worldScaleX * this.scaleX;
            this.worldScaleY = this.parent.worldScaleY * this.scaleY;

            // WorldPos = ParentWorldPos + (Rotate(LocalPos) * ParentScale)
            // Rotate LocalPos by ParentWorldRotation
            const c = Math.cos(this.parent.worldRotation);
            const s = Math.sin(this.parent.worldRotation);

            const rx = this.x * this.parent.worldScaleX;
            const ry = this.y * this.parent.worldScaleY;

            this.worldX = this.parent.worldX + (rx * c - ry * s);
            this.worldY = this.parent.worldY + (rx * s + ry * c);

        } else {
            // Root Bone
            this.worldX = this.x;
            this.worldY = this.y;
            this.worldRotation = this.rotation;
            this.worldScaleX = this.scaleX;
            this.worldScaleY = this.scaleY;
        }

        // Recursively update children
        for (const child of this.children) {
            child.updateWorldTransform();
        }
    }
}
