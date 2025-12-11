export class SpriteManager {
    constructor() {
        this.images = {};
        this.queue = 0;
        this.loaded = 0;
        this.onProgress = null;
        this.onComplete = null;
    }

    load(assets) {
        this.queue = Object.keys(assets).length;
        this.loaded = 0;

        for (const [name, src] of Object.entries(assets)) {
            const img = new Image();
            img.src = src;

            img.onload = () => {
                this.loaded++;
                this.images[name] = img;
                this.checkComplete();
            };

            img.onerror = () => {
                console.warn(`Failed to load asset: ${name} at ${src}`);
                this.loaded++; // Count as handled even if failed
                this.images[name] = null; // Mark as missing
                this.checkComplete();
            };
        }
    }

    checkComplete() {
        if (this.onProgress) {
            this.onProgress(this.loaded, this.queue);
        }
        if (this.loaded >= this.queue) {
            console.log(`Assets Loaded: ${this.loaded}/${this.queue}`);
            if (this.onComplete) this.onComplete();
        }
    }

    get(name) {
        return this.images[name];
    }
}
