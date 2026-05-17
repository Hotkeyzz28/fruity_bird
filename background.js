export class Background {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.time = 0;

        // 星星
        this.stars = [];
        for (let i = 0; i < 80; i++) {
            this.stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1,
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                twinkleOffset: Math.random() * Math.PI * 2
            });
        }

        // 星云/云朵
        this.clouds = [];
        for (let i = 0; i < 8; i++) {
            this.clouds.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height * 0.5,
                width: Math.random() * 200 + 100,
                height: Math.random() * 80 + 40,
                speed: Math.random() * 0.3 + 0.1,
                color: `hsla(${Math.random() * 60 + 280}, 70%, 60%, 0.15)`
            });
        }

        // 装饰粒子
        this.decorations = [];
        for (let i = 0; i < 15; i++) {
            this.decorations.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 15 + 5,
                speed: Math.random() * 0.5 + 0.2,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                type: Math.floor(Math.random() * 3),
                color: `hsla(${Math.random() * 360}, 80%, 70%, 0.3)`
            });
        }

        this.activeTint = null;
        this.tintIntensity = 0;
    }

    setActiveAbility(abilityType) {
        const tints = {
            gravity: { r: 180, g: 100, b: 255 },
            speed: { r: 255, g: 100, b: 100 },
            slow: { r: 100, g: 150, b: 255 },
            invincible: { r: 255, g: 215, b: 0 },
            doubleScore: { r: 255, g: 105, b: 180 },
            magnet: { r: 100, g: 255, b: 200 },
            shrink: { r: 255, g: 165, b: 0 },
            giant: { r: 255, g: 69, b: 0 },
            freeze: { r: 135, g: 206, b: 235 },
            bounce: { r: 50, g: 205, b: 50 },
            clone: { r: 238, g: 130, b: 238 }
        };
        this.activeTint = tints[abilityType] || null;
    }

    update(deltaTime) {
        this.time += deltaTime;

        // 更新云朵
        for (let cloud of this.clouds) {
            cloud.x -= cloud.speed;
            if (cloud.x + cloud.width < 0) {
                cloud.x = this.canvas.width + cloud.width;
                cloud.y = Math.random() * this.canvas.height * 0.5;
            }
        }

        // 更新装饰物
        for (let deco of this.decorations) {
            deco.x -= deco.speed;
            deco.rotation += deco.rotationSpeed;
            if (deco.x + deco.size < 0) {
                deco.x = this.canvas.width + deco.size;
                deco.y = Math.random() * this.canvas.height;
            }
        }
    }

    draw(activeAbilities) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // 渐变天空背景
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#0f0c29');
        gradient.addColorStop(0.3, '#302b63');
        gradient.addColorStop(0.6, '#24243e');
        gradient.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // 彩色光晕效果
        this.drawGlowEffects();

        // 绘制星云
        for (let cloud of this.clouds) {
            this.drawCloud(cloud);
        }

        // 绘制星星
        for (let star of this.stars) {
            const twinkle = Math.sin(this.time * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size * (0.5 + twinkle * 0.5), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + twinkle * 0.7})`;
            ctx.fill();
        }

        // 绘制装饰形状
        for (let deco of this.decorations) {
            this.drawDecoration(deco);
        }

        // 能力激活时的色调叠加
        if (activeAbilities.length > 0) {
            this.drawAbilityTint(activeAbilities);
        }
    }

    drawGlowEffects() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // 浮动的彩色光环
        const glows = [
            { x: w * 0.2, y: h * 0.2, r: 150, color: 'rgba(255, 100, 200, 0.1)' },
            { x: w * 0.8, y: h * 0.3, r: 120, color: 'rgba(100, 150, 255, 0.1)' },
            { x: w * 0.5, y: h * 0.7, r: 180, color: 'rgba(150, 255, 200, 0.08)' }
        ];

        for (let glow of glows) {
            const pulse = Math.sin(this.time * 0.001 + glow.x) * 0.2 + 1;
            const gradient = ctx.createRadialGradient(
                glow.x, glow.y, 0,
                glow.x, glow.y, glow.r * pulse
            );
            gradient.addColorStop(0, glow.color);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);
        }
    }

    drawCloud(cloud) {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = cloud.color;

        // 云朵由多个圆组成
        const circles = [
            { x: cloud.x, y: cloud.y, r: cloud.height * 0.5 },
            { x: cloud.x + cloud.width * 0.25, y: cloud.y - cloud.height * 0.2, r: cloud.height * 0.4 },
            { x: cloud.x + cloud.width * 0.5, y: cloud.y, r: cloud.height * 0.5 },
            { x: cloud.x + cloud.width * 0.75, y: cloud.y - cloud.height * 0.1, r: cloud.height * 0.35 }
        ];

        for (let c of circles) {
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    drawDecoration(deco) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(deco.x, deco.y);
        ctx.rotate(deco.rotation);
        ctx.fillStyle = deco.color;
        ctx.strokeStyle = deco.color;
        ctx.lineWidth = 2;

        if (deco.type === 0) {
            // 三角形
            ctx.beginPath();
            ctx.moveTo(0, -deco.size);
            ctx.lineTo(-deco.size * 0.866, deco.size * 0.5);
            ctx.lineTo(deco.size * 0.866, deco.size * 0.5);
            ctx.closePath();
            ctx.stroke();
        } else if (deco.type === 1) {
            // 圆圈
            ctx.beginPath();
            ctx.arc(0, 0, deco.size * 0.5, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            // 菱形
            ctx.beginPath();
            ctx.moveTo(0, -deco.size);
            ctx.lineTo(deco.size * 0.6, 0);
            ctx.lineTo(0, deco.size);
            ctx.lineTo(-deco.size * 0.6, 0);
            ctx.closePath();
            ctx.stroke();
        }
        ctx.restore();
    }

    drawAbilityTint(activeAbilities) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        const tints = {
            gravity: 'rgba(180, 100, 255, 0.1)',
            speed: 'rgba(255, 100, 100, 0.1)',
            slow: 'rgba(100, 150, 255, 0.1)',
            invincible: 'rgba(255, 215, 0, 0.12)',
            doubleScore: 'rgba(255, 105, 180, 0.1)',
            magnet: 'rgba(100, 255, 200, 0.1)',
            shrink: 'rgba(255, 165, 0, 0.1)',
            giant: 'rgba(255, 69, 0, 0.1)',
            freeze: 'rgba(135, 206, 235, 0.12)',
            bounce: 'rgba(50, 205, 50, 0.1)',
            clone: 'rgba(238, 130, 238, 0.1)'
        };

        for (let ability of activeAbilities) {
            if (tints[ability.type]) {
                ctx.fillStyle = tints[ability.type];
                ctx.fillRect(0, 0, w, h);
            }
        }
    }
}
