import { FRUIT_TYPES } from './fruits.js';

export class UI {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    drawScore(score) {
        const ctx = this.ctx;
        ctx.save();

        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.font = 'bold 64px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const gradient = ctx.createLinearGradient(0, 40, 0, 100);
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(1, '#FFA500');
        ctx.fillStyle = gradient;

        ctx.fillText(score.toString(), this.canvas.width / 2, 40);

        ctx.restore();
    }

    drawAbilityIndicators(activeAbilities) {
        const ctx = this.ctx;
        const startY = 120;
        const spacing = 50;

        activeAbilities.forEach((ability, index) => {
            const y = startY + index * spacing;
            this.drawAbilityBar(ability, 20, y);
        });
    }

    drawAbilityBar(ability, x, y) {
        const ctx = this.ctx;
        const config = FRUIT_TYPES[ability.type];
        const width = 140;
        const height = 36;
        const progress = ability.remaining / ability.max;

        ctx.save();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 8);
        ctx.fill();

        ctx.fillStyle = config.color + '80';
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, (width - 4) * progress, height - 4, 6);
        ctx.fill();

        ctx.font = '24px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(config.emoji, x + 8, y + height / 2);

        ctx.font = '14px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(config.name, x + 40, y + height / 2);

        ctx.restore();
    }

    drawStartScreen() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.save();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, w, h);

        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const titleGradient = ctx.createLinearGradient(w / 2 - 100, h / 2 - 50, w / 2 + 100, h / 2 + 50);
        titleGradient.addColorStop(0, '#FF6B6B');
        titleGradient.addColorStop(0.5, '#FFD93D');
        titleGradient.addColorStop(1, '#6BCB77');
        ctx.fillStyle = titleGradient;
        ctx.fillText('🐦 Flappy Bird', w / 2, h / 2 - 120);

        ctx.font = '24px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('🍎 特殊水果版 🍊', w / 2, h / 2 - 70);

        ctx.font = '20px Arial';
        ctx.fillStyle = 'white';

        const fruits = Object.entries(FRUIT_TYPES);
        const cols = 2;
        const startY = h / 2 - 30;
        const rowHeight = 32;

        fruits.forEach(([key, config], i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = w / 2 - 160 + col * 180;
            const y = startY + row * rowHeight;

            ctx.textAlign = 'left';
            ctx.fillStyle = 'white';
            ctx.fillText(`${config.emoji} ${config.name}`, x, y);
        });

        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        const pulse = Math.sin(Date.now() * 0.005) * 0.2 + 0.8;
        ctx.globalAlpha = pulse;
        ctx.fillStyle = '#4ECDC4';
        ctx.fillText('点击或按空格开始!', w / 2, h - 80);

        ctx.restore();
    }

    drawGameOverScreen(score, highScore) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.save();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, w, h);

        ctx.font = 'bold 56px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FF6B6B';
        ctx.fillText('游戏结束!', w / 2, h / 2 - 100);

        ctx.font = '32px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`得分: ${score}`, w / 2, h / 2 - 20);

        if (score >= highScore && score > 0) {
            ctx.font = '24px Arial';
            ctx.fillStyle = '#FFD700';
            ctx.fillText('🎉 新纪录! 🎉', w / 2, h / 2 + 30);
        }

        ctx.font = '24px Arial';
        ctx.fillStyle = '#AAA';
        ctx.fillText(`最高分: ${highScore}`, w / 2, h / 2 + 70);

        ctx.font = 'bold 26px Arial';
        const pulse = Math.sin(Date.now() * 0.005) * 0.2 + 0.8;
        ctx.globalAlpha = pulse;
        ctx.fillStyle = '#4ECDC4';
        ctx.fillText('点击或按空格重新开始', w / 2, h - 60);

        ctx.restore();
    }
}
