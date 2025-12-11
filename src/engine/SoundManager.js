export class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = true;
    }

    playHit() {
        if (!this.enabled) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Connect
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        // Sound Profile: Quick low frequency drop (Thud)
        // Frequency: 150Hz -> 50Hz
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.1);

        // Volume: Loud -> Zero
        gain.gain.setValueAtTime(1.0, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        // Type
        osc.type = 'square'; // Crunchier than sine

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }
}
