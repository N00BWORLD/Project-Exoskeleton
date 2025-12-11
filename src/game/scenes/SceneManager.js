/**
 * SceneManager.js - Manages scene transitions
 */
export class SceneManager {
    constructor() {
        this.currentScene = 'map'; // 'map' or 'battle'
        this.transitioning = false;
        this.transitionAlpha = 0;
        this.transitionCallback = null;
    }

    isMap() {
        return this.currentScene === 'map';
    }

    isBattle() {
        return this.currentScene === 'battle';
    }

    // Switch to battle scene
    enterBattle(callback) {
        if (this.transitioning) return;
        this.fadeOut(() => {
            this.currentScene = 'battle';
            if (callback) callback();
            this.fadeIn();
        });
    }

    // Return to map
    exitBattle(callback) {
        if (this.transitioning) return;
        this.fadeOut(() => {
            this.currentScene = 'map';
            if (callback) callback();
            this.fadeIn();
        });
    }

    fadeOut(callback) {
        this.transitioning = true;
        this.transitionAlpha = 0;
        this.transitionCallback = callback;
        this.fadeDirection = 1; // Fading to black
    }

    fadeIn() {
        this.fadeDirection = -1; // Fading from black
    }

    update(dt) {
        if (!this.transitioning) return;

        this.transitionAlpha += this.fadeDirection * dt * 4; // Fast fade

        if (this.transitionAlpha >= 1 && this.fadeDirection === 1) {
            // Fully black, execute callback
            this.transitionAlpha = 1;
            if (this.transitionCallback) {
                this.transitionCallback();
                this.transitionCallback = null;
            }
        } else if (this.transitionAlpha <= 0 && this.fadeDirection === -1) {
            // Fully visible, done
            this.transitionAlpha = 0;
            this.transitioning = false;
        }
    }

    drawTransition(ctx, width, height) {
        if (this.transitionAlpha > 0) {
            ctx.fillStyle = `rgba(0,0,0,${this.transitionAlpha})`;
            ctx.fillRect(0, 0, width, height);
        }
    }
}
