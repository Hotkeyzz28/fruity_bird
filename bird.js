export class Bird {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.reset();
    }

    reset() {
        this.x = this.canvas.width * 0.25;
        this.y = this.canvas.height / 2;
        this.velocity = 0;
        this.gravity = 0.4;
        this.flapStrength = -9;
        this.rotation = 0;
        this.baseSize = 30;
        this.size = this.baseSize;
        this.isInvincible = false;
        this.canBounce = false;
        this.hasMagnet = false;
        this.flapAnimation = 0;
        this.trail = [];
    }

    flap() {
        this.velocity = this.flapStrength;
        if (this.gravity < 0) {
            this.velocity = -this.flapStrength;
        }
    }

    update(deltaTime, abilities) {
        this.flapAnimation += 0.2;

        let currentGravity = this.gravity;
        let currentFlapStrength = this.flapStrength;

        if (abilities.has('gravity')) {
            currentGravity = -this.gravity;
        }

        this.velocity += currentGravity;
        this.y += this.velocity;

        if (abilities.has('shrink')) {
            this.size = this.baseSize * 0.5;
        } else if (abilities.has('giant')) {
            this.size = this.baseSize * 1.8;
        } else {
            this.size = this.baseSize;
        }

        this.isInvincible = abilities.has('invincible');
        this.canBounce = abilities.has('bounce');
        this.hasMagnet = abilities.has('magnet');

        const targetRotation = Math.min(Math.max(this.velocity * 3, -30), 45);
        this.rotation += (targetRotation - this.rotation) * 0.1;

        this.trail.unshift({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 10) this.trail.pop();
        for (let t of this.trail) {
            t.alpha -= 0.1;
        }
    }

    bounce() {
        if (this.canBounce) {
            this.velocity = this.flapStrength * 0.8;
            return true;
        }
        return false;
    }

    getBounds() {
        const half = this.size / 2;
        return {
            x: this.x - half * 0.7, y: this.y - half * 0.7, width: this.size * 0.7, height: this.size * 0.7
        };
    }

    draw() {
        const ctx = this.ctx;

        for (let i = this.trail.length - 1; i >= 0; i--) {
            const t = this.trail[i];
            if (t.alpha > 0) {
                ctx.save();
                ctx.translate(t.x, t.y);
                ctx.globalAlpha = t.alpha * 0.3;
                ctx.beginPath();
                ctx.arc(0, 0, this.size * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 200, 100, 0.5)';
                ctx.fill();
                ctx.restore();
            }
        }

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);

        const wingOffset = Math.sin(this.flapAnimation) * 3;

        if (this.isInvincible) {
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 0.8, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 215, 0, ${0.5 + Math.sin(Date.now() * 0.01) * 0.3);
            ctx.lineWidth = 4;
            ctx.stroke();
        }

        const bodyGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 0.5);
        bodyGradient.addColorStop(0, '#FFD700');
        bodyGradient.addColorStop(0.5, '#FFA500');
        bodyGradient.addColorStop(1, '#FF8C00');
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = bodyGradient;
        ctx.fill();
        ctx.strokeStyle = '#CC7000';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#FFE4B5';
        ctx.beginPath();
        ctx.ellipse(-this.size * 0.3, wingOffset, this.size * 0.3, this.size * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.size * 0.2, -this.size * 0.1, this.size * 0.18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.size * 0.25, -this.size * 0.1, this.size * 0.08, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FF6347';
        ctx.beginPath();
        ctx.moveTo(this.size * 0.35, 0);
        ctx.lineTo(this.size * 0.6, this.size * 0.05);
        ctx.lineTo(this.size * 0.35, this.size * 0.15);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

export class BirdClone {
    constructor(canvas, x, y) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = x;
        this.y = y;
        this.baseY = y;
        this.time = Math.random() * Math.PI * 2;
        this.size = 20;
        this.lifetime = 0;
        this.maxLifetime = 6000;
    }

    update(deltaTime, mainBirdY) {
        this.time += deltaTime * 0.005;
        this.y = this.baseY + Math.sin(this.time) * 30;
        this.lifetime += deltaTime;
        return this.lifetime < this.maxLifetime;
    }

    draw() {
        const ctx = this.ctx;
        const alpha = 1 - (this.lifetime / this.maxLifetime);

        ctx.save();
        ctx.globalAlpha = alpha * 0.7;
        ctx.translate(this.x, this.y);

        const gradient = ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = '#EE82EE';
        ctx.fill();

        ctx.restore();
    }
}
