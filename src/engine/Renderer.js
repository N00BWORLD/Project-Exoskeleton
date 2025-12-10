export class Renderer {
    constructor(canvas) {
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
    }

    resize(w, h) {
        this.width = w;
        this.height = h;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}
