/**
 * MapScene.js - Top-down map with character movement and random encounters
 */
import { STAGES } from '../../data/StageData.js';

export class MapScene {
    constructor(game) {
        this.game = game;

        // Player position
        this.playerX = 80;
        this.playerY = 180;
        this.playerSpeed = 120; // pixels per second
        this.playerSize = 12;

        // Target position
        this.targetX = this.playerX;
        this.targetY = this.playerY;
        this.isMoving = false;

        // Encounter system
        this.stepCounter = 0;
        this.stepsPerCheck = 225; // Check every 225 pixels
        this.encounterGauge = 0; // 0-100 visual gauge
        this.currentZone = null;
        // Define hunting zones
        this.zones = [
            {
                id: 0,
                name: '안전지대',
                x: 20, y: 100, width: 120, height: 150,
                color: '#2a4a2a',
                encounterRate: 0,
                difficulty: 0,
                dropTier: 0
            },
            {
                id: 1,
                name: '저렙 수풀',
                x: 160, y: 150, width: 100, height: 200,
                color: '#3a6a3a',
                encounterRate: 1.0, // 100%
                difficulty: 1.0,
                dropTier: 1
            },
            {
                id: 2,
                name: '중렙 숲',
                x: 280, y: 100, width: 100, height: 180,
                color: '#2a5a2a',
                encounterRate: 1.0, // 100%
                difficulty: 1.5,
                dropTier: 2
            },
            {
                id: 3,
                name: '고렙 황무지',
                x: 160, y: 380, width: 150, height: 100,
                color: '#5a3a2a',
                encounterRate: 1.0, // 100%
                difficulty: 2.5,
                dropTier: 3
            }
        ];
    }

    handleClick(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.isMoving = true;
    }

    update(dt) {
        if (!this.isMoving) return null;

        const dx = this.targetX - this.playerX;
        const dy = this.targetY - this.playerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) {
            this.isMoving = false;
            return null;
        }

        const moveX = (dx / dist) * this.playerSpeed * dt;
        const moveY = (dy / dist) * this.playerSpeed * dt;

        this.playerX += moveX;
        this.playerY += moveY;

        this.stepCounter += Math.sqrt(moveX * moveX + moveY * moveY);
        this.currentZone = this.getZoneAt(this.playerX, this.playerY);

        // Update encounter gauge
        if (this.currentZone && this.currentZone.encounterRate > 0) {
            this.encounterGauge = (this.stepCounter / this.stepsPerCheck) * 100;
            if (this.encounterGauge > 100) this.encounterGauge = 100;
        } else {
            this.encounterGauge = 0;
        }

        // Check for random encounter
        if (this.stepCounter >= this.stepsPerCheck) {
            this.stepCounter = 0;
            this.encounterGauge = 0;

            if (this.currentZone && this.currentZone.encounterRate > 0) {
                if (Math.random() < this.currentZone.encounterRate) {
                    this.isMoving = false;
                    return this.currentZone;
                }
            }
        }

        return null;
    }

    getZoneAt(x, y) {
        for (const zone of this.zones) {
            if (x >= zone.x && x <= zone.x + zone.width &&
                y >= zone.y && y <= zone.y + zone.height) {
                return zone;
            }
        }
        return null;
    }

    resetEncounterGauge() {
        this.stepCounter = 0;
        this.encounterGauge = 0;
        this.isMoving = false;
        this.targetX = this.playerX;
        this.targetY = this.playerY;
    }

    draw(ctx, canvas) {
        // Reset transform to avoid artifacts from battle scene
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw zones
        for (const zone of this.zones) {
            ctx.fillStyle = zone.color;
            ctx.fillRect(zone.x, zone.y, zone.width, zone.height);

            ctx.strokeStyle = '#444';
            ctx.lineWidth = 2;
            ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);

            ctx.fillStyle = '#aaa';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(zone.name, zone.x + zone.width / 2, zone.y + 15);

            if (zone.dropTier > 0) {
                ctx.fillStyle = '#ff0';
                ctx.fillText(`T${zone.dropTier}`, zone.x + zone.width / 2, zone.y + zone.height - 8);
            }
        }

        // Draw path line
        if (this.isMoving) {
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(this.playerX, this.playerY);
            ctx.lineTo(this.targetX, this.targetY);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Draw player
        ctx.fillStyle = '#0ff';
        ctx.beginPath();
        ctx.arc(this.playerX, this.playerY, this.playerSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        this.drawHUD(ctx, canvas);
    }

    drawHUD(ctx, canvas) {
        const { battery } = this.game;

        // Top bar
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, canvas.width, 70);

        ctx.fillStyle = '#f90';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('EXPLORATION', 15, 22);

        ctx.fillStyle = battery.depleted ? '#f00' : '#0f0';
        ctx.font = '14px monospace';
        ctx.fillText(`턴: ${battery.currentTurns}/${battery.maxTurns}`, 15, 42);

        // Encounter gauge
        if (this.currentZone && this.currentZone.encounterRate > 0) {
            ctx.fillStyle = '#333';
            ctx.fillRect(15, 50, 150, 12);

            const gaugeWidth = (this.encounterGauge / 100) * 150;
            ctx.fillStyle = this.encounterGauge > 80 ? '#f44' : '#fa0';
            ctx.fillRect(15, 50, gaugeWidth, 12);

            ctx.strokeStyle = '#666';
            ctx.lineWidth = 1;
            ctx.strokeRect(15, 50, 150, 12);

            ctx.fillStyle = '#fff';
            ctx.font = '9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`조우 ${Math.floor(this.encounterGauge)}%`, 90, 60);
        }

        // Zone info
        ctx.textAlign = 'right';
        ctx.fillStyle = '#aaa';
        ctx.font = '14px monospace';
        if (this.currentZone) {
            ctx.fillText(this.currentZone.name, canvas.width - 15, 22);
            if (this.currentZone.encounterRate > 0) {
                ctx.fillStyle = '#f44';
                ctx.fillText(`⚠️ 위험구역`, canvas.width - 15, 42);
            } else {
                ctx.fillStyle = '#0f0';
                ctx.fillText('안전', canvas.width - 15, 42);
            }
        }

        ctx.textAlign = 'center';
        ctx.fillStyle = '#666';
        ctx.font = '12px monospace';
        ctx.fillText('터치하여 이동', canvas.width / 2, canvas.height - 15);
    }
}
