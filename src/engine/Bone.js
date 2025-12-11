/**
 * Bone.js
 * The fundamental unit of the ExoFrame Skeletal Engine.
 * Uses Float32Array for high-performance matrix math (Affine 2D).
 * Matrix format: [a, b, c, d, tx, ty]
 * a = scaleX * cos
 * b = scaleX * sin
 * c = scaleY * -sin
 * d = scaleY * cos
 * tx, ty = translation
 */
export class Bone {
    constructor(name, length = 50) {
        this.name = name;
        this.length = length; // Visual debugging length
        this.parent = null;
        this.children = [];

        // Local Transform Properties (Ease of access for animation)
        this.x = 0;
        this.y = 0;
        this.rotation = 0; // Radians
        this.scaleX = 1;
        this.scaleY = 1;

        // Visual Asset (Placeholder)
        this.image = null; // Set this to an Image object to render sprite instead of line

        // Matrices
        // [0:a, 1:b, 2:c, 3:d, 4:tx, 5:ty]
        this.localMatrix = new Float32Array([1, 0, 0, 1, 0, 0]);
        this.worldMatrix = new Float32Array([1, 0, 0, 1, 0, 0]);
    }

    addChild(bone) {
        bone.parent = this;
        this.children.push(bone);
        return bone;
    }

    /**
     * Updates the local matrix based on transform properties,
     * then propagates to world matrix.
     */
    updateWorldTransform() {
        // 1. Calculate Local Matrix
        const c = Math.cos(this.rotation);
        const s = Math.sin(this.rotation);

        // a, b
        this.localMatrix[0] = c * this.scaleX;
        this.localMatrix[1] = s * this.scaleX;
        // c, d (Note: 2D rotation matrix usually has -sin in [0][1] or similar, 
        // but for <canvas> transform(a, b, c, d, e, f):
        // a (m11), b (m12), c (m21), d (m22), e (dx), f (dy)
        // Rotation: [cos, sin, -sin, cos]
        this.localMatrix[2] = -s * this.scaleY;
        this.localMatrix[3] = c * this.scaleY;
        // tx, ty
        this.localMatrix[4] = this.x;
        this.localMatrix[5] = this.y;

        // 2. Calculate World Matrix
        if (this.parent) {
            const pm = this.parent.worldMatrix;
            const lm = this.localMatrix;

            // Matrix Multiplication: PM * LM
            // a = pm.a * lm.a + pm.c * lm.b
            this.worldMatrix[0] = pm[0] * lm[0] + pm[2] * lm[1];
            // b = pm.b * lm.a + pm.d * lm.b
            this.worldMatrix[1] = pm[1] * lm[0] + pm[3] * lm[1];
            // c = pm.a * lm.c + pm.c * lm.d
            this.worldMatrix[2] = pm[0] * lm[2] + pm[2] * lm[3];
            // d = pm.b * lm.c + pm.d * lm.d
            this.worldMatrix[3] = pm[1] * lm[2] + pm[3] * lm[3];
            // tx = pm.a * lm.tx + pm.c * lm.ty + pm.tx
            this.worldMatrix[4] = pm[0] * lm[4] + pm[2] * lm[5] + pm[4];
            // ty = pm.b * lm.tx + pm.d * lm.ty + pm.ty
            this.worldMatrix[5] = pm[1] * lm[4] + pm[3] * lm[5] + pm[5];
        } else {
            // Root bone: World = Local
            this.worldMatrix.set(this.localMatrix);
        }

        // 3. Recursively update children
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].updateWorldTransform();
        }
    }
}
