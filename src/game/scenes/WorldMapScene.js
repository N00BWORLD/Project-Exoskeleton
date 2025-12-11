/**
 * WorldMapScene.js - World map UI with stage selection
 */
import { STAGES } from '../../data/StageData.js';

export class WorldMapScene {
    constructor(game) {
        this.game = game;
        this.selectedStage = null;
        this.stageButtons = [];
        this.totalClears = 0; // Total battles won

        this.setupButtons();
    }

    setupButtons() {
        // Create button positions for stages
        this.stageButtons = STAGES.map((stage, index) => ({
            id: stage.id,
            x: 60 + (index % 2) * 150,
            y: 200 + Math.floor(index / 2) * 100,
            width: 130,
            height: 70,
            stage: stage
        }));
    }

    addClear() {
        this.totalClears++;
        this.checkUnlocks();
    }

    checkUnlocks() {
        for (const stage of STAGES) {
            if (!stage.unlocked && this.totalClears >= stage.requiredClears) {
                stage.unlocked = true;
                console.log(`Unlocked: ${stage.name}!`);
            }
        }
    }

    handleClick(x, y) {
        for (const btn of this.stageButtons) {
            if (x >= btn.x && x <= btn.x + btn.width &&
                y >= btn.y && y <= btn.y + btn.height) {

                if (btn.stage.unlocked) {
                    this.selectedStage = btn.stage;
                    return btn.stage;
                } else {
                    console.log(`Stage locked! Need ${btn.stage.requiredClears} clears`);
                    return null;
                }
            }
        }
        return null;
    }

    draw(ctx, canvas) {
        const { battery } = this.game;

        // Background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Title
        ctx.fillStyle = '#f90';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ WORLD MAP', canvas.width / 2, 50);

        // Turns remaining
        ctx.fillStyle = battery.depleted ? '#f00' : '#0f0';
        ctx.font = '18px monospace';
        ctx.fillText(`턴: ${battery.currentTurns} / ${battery.maxTurns}`, canvas.width / 2, 80);

        // Total clears
        ctx.fillStyle = '#aaa';
        ctx.font = '14px monospace';
        ctx.fillText(`총 클리어: ${this.totalClears}`, canvas.width / 2, 105);

        // Stage buttons
        for (const btn of this.stageButtons) {
            this.drawStageButton(ctx, btn);
        }

        // Instructions
        ctx.fillStyle = '#666';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('스테이지를 선택하세요', canvas.width / 2, canvas.height - 30);
    }

    drawStageButton(ctx, btn) {
        const stage = btn.stage;
        const locked = !stage.unlocked;

        // Button background
        ctx.fillStyle = locked ? '#333' : '#2a4a6a';
        ctx.fillRect(btn.x, btn.y, btn.width, btn.height);

        // Border
        ctx.strokeStyle = locked ? '#555' : '#4a8aba';
        ctx.lineWidth = 2;
        ctx.strokeRect(btn.x, btn.y, btn.width, btn.height);

        // Stage name
        ctx.fillStyle = locked ? '#666' : '#fff';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(stage.name, btn.x + btn.width / 2, btn.y + 25);

        // Tier info
        ctx.font = '12px monospace';
        ctx.fillStyle = locked ? '#555' : '#aaa';
        ctx.fillText(`T${stage.dropTier} 드롭`, btn.x + btn.width / 2, btn.y + 45);

        // Lock icon or difficulty
        if (locked) {
            ctx.fillStyle = '#888';
            ctx.font = '20px monospace';
            ctx.fillText('🔒', btn.x + btn.width / 2, btn.y + btn.height - 8);
        } else {
            ctx.fillStyle = '#ff0';
            const stars = '★'.repeat(Math.ceil(stage.difficulty));
            ctx.fillText(stars, btn.x + btn.width / 2, btn.y + btn.height - 8);
        }
    }
}
