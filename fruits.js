export const FRUIT_TYPES = {
    gravity: { emoji: '🍎', name: '反重力', duration: 4000, color: '#8B008B' },
    speed: { emoji: '🍊', name: '加速', duration: 3500, color: '#FF4500' },
    slow: { emoji: '🍋', name: '减速', duration: 4000, color: '#9ACD32' },
    invincible: { emoji: '🍇', name: '无敌', duration: 3000, color: '#FFD700' },
    doubleScore: { emoji: '🍓', name: '双倍得分', duration: 5000, color: '#FF69B4' },
    magnet: { emoji: '🍑', name: '磁铁', duration: 4500, color: '#40E0D0' },
    shrink: { emoji: '🍒', name: '缩小', duration: 4000, color: '#FF6347' },
    giant: { emoji: '🍉', name: '巨型', duration: 4000, color: '#FF4500' },
    freeze: { emoji: '🍈', name: '时间冻结', duration: 2500, color: '#87CEEB' },
    bounce: { emoji: '🍌', name: '弹跳', duration: 5000, color: '#32CD32' },
    clone: { emoji: '🥝', name: '分身', duration: 6000, color: '#EE82EE' }
};

const FRUIT_KEYS = Object.keys(FRUIT_TYPES);

export class Fruit {
    constructor(x, y, type = null) {
        this.x = x;
        this.y = y;
        this.type = type || FRUIT_KEYS[Math.floor(Math.random() * FRUIT_KEYS.length)];
        this.size = 35;
        this.collected = false;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.bobTime = 0;
        this.particles = [];
    }

    update(deltaTime, birdX, birdY, hasMagnet) {
        this.bobTime += deltaTime;

        if (hasMagnet) {
            const dx = birdX - this.x;
            const dy = birdY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
                this.x += dx * 0.05;
                this.y += dy * 0.05;
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].life -= deltaTime;
            this.particles[i].y += this.particles[i].vy;
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    collect() {
        this.collected = true;
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i;
            this.particles.push({
                x: this.x, y: this.y,
                vx: Math.cos(angle) * 3, vy: Math.sin(angle) * 3,
                life: 500, color: FRUIT_TYPES[this.type].color
            });
        }
    }

    getBounds() {
        return {
            x: this.x - this.size / 2, y: this.y - this.size / 2,
            width: this.size, height: this.size
        };
    }

    draw(ctx) {
        const bob = Math.sin(this.bobTime * 0.005 + this.bobOffset) * 5;
        const y = this.y + bob;

        if (!this.collected) {
            const glowGradient = ctx.createRadialGradient(this.x, y, 0, this.x, y, this.size);
            glowGradient.addColorStop(0, FRUIT_TYPES[this.type].color + '60');
            glowGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = glowGradient;
            ctx.fillRect(this.x - this.size, y - this.size, this.size * 2, this.size * 2);

            ctx.font = `${this.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(FRUIT_TYPES[this.type].emoji, this.x, y);
        }

        for (let p of this.particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5 * (p.life / 500), 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        }
    }
}

export class FruitManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.fruits = [];
        this.fruitInterval = 2500;
        this.lastFruitTime = 0;
    }

    reset() {
        this.fruits = [];
        this.lastFruitTime = 0;
    }

    update(deltaTime, birdX, birdY, hasMagnet) {
        this.lastFruitTime += deltaTime;
        if (this.lastFruitTime > this.fruitInterval && this.fruits.length < 3) {
            const x = this.canvas.width + 50;
            const y = Math.random() * (this.canvas.height - 200) + 100;
            this.fruits.push(new Fruit(x, y));
            this.lastFruitTime = 0;
        }

        for (let i = this.fruits.length - 1; i >= 0; i--) {
            const fruit = this.fruits[i];
            fruit.update(deltaTime, birdX, birdY, hasMagnet);

            if (!fruit.collected) {
                fruit.x -= 2;
            }

            if (fruit.collected && fruit.particles.length === 0) {
                this.fruits.splice(i, 1);
            } else if (fruit.x < -100 && !fruit.collected) {
                this.fruits.splice(i, 1);
            }
        }
    }

    checkCollection(birdBounds) {
        for (let fruit of this.fruits) {
            if (!fruit.collected) {
                const fruitBounds = fruit.getBounds();
                if (this.rectIntersect(birdBounds, fruitBounds)) {
                    fruit.collect();
                    return fruit.type;
                }
            }
        }
        return null;
    }

    rectIntersect(a, b) {
        return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
    }

    draw(ctx) {
        for (let fruit of this.fruits) {
            fruit.draw(ctx);
        }
    }
}

export class AbilityManager {
    constructor() {
        this.abilities = new Map();
    }

    reset() {
        this.abilities.clear();
    }

    addAbility(type) {
        const config = FRUIT_TYPES[type];
        if (this.abilities.has(type)) {
            this.abilities.get(type).remaining = config.duration;
        } else {
            this.abilities.set(type, { remaining: config.duration, max: config.duration });
        }
    }

    update(deltaTime) {
        for (let [type, data] of this.abilities) {
            data.remaining -= deltaTime;
            if (data.remaining <= 0) {
                this.abilities.delete(type);
            }
        }
    }

    has(type) {
        return this.abilities.has(type);
    }

    getActiveAbilities() {
        const result = [];
        for (let [type, data] of this.abilities) {
            result.push({ type, remaining: data.remaining, max: data.max });
        }
        return result;
    }

    shouldDoubleScore() {
        return this.has('doubleScore');
    }

    isFrozen() {
        return this.has('freeze');
    }
}
