export class Pipe {
    constructor(x, canvasHeight, gapY = null) {
        this.x = x;
        this.width = 70;
        this.gapSize = 160;
        this.gapY = gapY || Math.random() * (canvasHeight - this.gapSize - 200) + 100;
        this.scored = false;
        this.canvasHeight = canvasHeight;
        this.colors = {
            top: this.generateGradient('top'),
            bottom: this.generateGradient('bottom')
        };
    }

    generateGradient(position) {
        const hue = Math.random() * 60 + 200;
        return {
            light: `hsl(${hue}, 70%, 50%)`,
            dark: `hsl(${hue}, 70%, 35%)`
        };
    }

    update(speed, isFrozen) {
        if (!isFrozen) {
            this.x -= speed;
        }
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }

    getTopBounds() {
        return { x: this.x, y: 0, width: this.width, height: this.gapY };
    }

    getBottomBounds() {
        return { x: this.x, y: this.gapY + this.gapSize, width: this.width, height: this.canvasHeight - this.gapY - this.gapSize };
    }

    getGapBounds() {
        return { x: this.x, y: this.gapY, width: this.width, height: this.gapSize };
    }

    draw(ctx, isFrozen) {
        if (isFrozen) {
            ctx.globalAlpha = 0.7;
        }

        this.drawPipe(ctx, this.x, 0, this.width, this.gapY, this.colors.top, true);
        this.drawPipe(ctx, this.x, this.gapY + this.gapSize, this.width, this.canvasHeight - this.gapY - this.gapSize, this.colors.bottom, false);

        ctx.globalAlpha = 1;
    }

    drawPipe(ctx, x, y, w, h, colors, isTop) {
        const capHeight = 30;
        const capWidth = w + 10;
        const capX = x - 5;

        const pipeGradient = ctx.createLinearGradient(x, 0, x + w, 0);
        pipeGradient.addColorStop(0, colors.dark);
        pipeGradient.addColorStop(0.3, colors.light);
        pipeGradient.addColorStop(0.7, colors.light);
        pipeGradient.addColorStop(1, colors.dark);

        ctx.fillStyle = pipeGradient;
        ctx.fillRect(x, y, w, h);

        let capY = isTop ? y + h - capHeight : y;
        const capGradient = ctx.createLinearGradient(capX, 0, capX + capWidth, 0);
        capGradient.addColorStop(0, colors.dark);
        capGradient.addColorStop(0.5, colors.light);
        capGradient.addColorStop(1, colors.dark);
        ctx.fillStyle = capGradient;
        ctx.fillRect(capX, capY, capWidth, capHeight);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect(capX + 5, capY + 5, capWidth - 10, capHeight - 10);
    }
}

export class PipeManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.pipes = [];
        this.pipeInterval = 1800;
        this.lastPipeTime = 0;
        this.baseSpeed = 3;
    }

    reset() {
        this.pipes = [];
        this.lastPipeTime = 0;
    }

    update(deltaTime, abilities) {
        let currentSpeed = this.baseSpeed;

        if (abilities.has('speed')) {
            currentSpeed *= 1.5;
        }
        if (abilities.has('slow')) {
            currentSpeed *= 0.5;
        }

        const isFrozen = abilities.has('freeze');

        this.lastPipeTime += deltaTime;
        if (this.lastPipeTime > this.pipeInterval && !isFrozen) {
            this.pipes.push(new Pipe(this.canvas.width, this.canvas.height));
            this.lastPipeTime = 0;
        }

        for (let i = this.pipes.length - 1; i >= 0; i--) {
            this.pipes[i].update(currentSpeed, isFrozen);
            if (this.pipes[i].isOffScreen()) {
                this.pipes.splice(i, 1);
            }
        }
    }

    checkCollision(birdBounds, isInvincible) {
        if (isInvincible) return false;

        for (let pipe of this.pipes) {
            const top = pipe.getTopBounds();
            const bottom = pipe.getBottomBounds();

            if (this.rectIntersect(birdBounds, top) || this.rectIntersect(birdBounds, bottom)) {
                return true;
            }
        }
        return false;
    }

    checkScoring(birdX) {
        let score = 0;
        for (let pipe of this.pipes) {
            if (!pipe.scored && pipe.x + pipe.width < birdX) {
                pipe.scored = true;
                score = 1;
            }
        }
        return score;
    }

    rectIntersect(a, b) {
        return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
    }

    draw(ctx, isFrozen) {
        for (let pipe of this.pipes) {
            pipe.draw(ctx, isFrozen);
        }
    }
}
