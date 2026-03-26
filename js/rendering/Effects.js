export class Effects {
    constructor() {
        this.particles = [];
        this.texts = [];
        this.screenShake = 0;
        this.shakeIntensity = 0;
        this.flashAlpha = 0;
        this.flashColor = '#FFF';
    }

    addHitSpark(x, y, type = 'light') {
        const count = type === 'heavy' ? 8 : 5;
        const speed = type === 'heavy' ? 4 : 2.5;
        const colors = type === 'special'
            ? ['#00FFFF', '#FF00FF', '#FFFF00', '#FFFFFF']
            : ['#FFFF00', '#FF8800', '#FF4400', '#FFFFFF'];

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i / count) + Math.random() * 0.5;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed * (0.5 + Math.random()),
                vy: Math.sin(angle) * speed * (0.5 + Math.random()),
                life: 8 + Math.random() * 6,
                maxLife: 14,
                size: type === 'heavy' ? 3 : 2,
                color: colors[Math.floor(Math.random() * colors.length)],
            });
        }
    }

    addBlockSpark(x, y) {
        for (let i = 0; i < 4; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 3,
                life: 6,
                maxLife: 6,
                size: 2,
                color: '#88CCFF',
            });
        }
    }

    addComboText(x, y, count) {
        this.texts.push({
            text: `${count} HIT`,
            x, y: y - 20,
            vy: -0.5,
            life: 40,
            maxLife: 40,
            color: count >= 5 ? '#FF4400' : count >= 3 ? '#FFAA00' : '#FFFF00',
            size: count >= 5 ? 10 : count >= 3 ? 9 : 8,
        });
    }

    addKOText(x, y) {
        this.texts.push({
            text: 'K.O.!',
            x, y,
            vy: 0,
            life: 90,
            maxLife: 90,
            color: '#FF0000',
            size: 20,
        });
    }

    addRoundText(text) {
        this.texts.push({
            text,
            x: 192,
            y: 100,
            vy: 0,
            life: 60,
            maxLife: 60,
            color: '#FFFFFF',
            size: 16,
        });
    }

    shake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.screenShake = duration;
    }

    flash(color = '#FFF', alpha = 0.5) {
        this.flashColor = color;
        this.flashAlpha = alpha;
    }

    update() {
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Update texts
        for (let i = this.texts.length - 1; i >= 0; i--) {
            const t = this.texts[i];
            t.y += t.vy;
            t.life--;
            if (t.life <= 0) {
                this.texts.splice(i, 1);
            }
        }

        // Update shake
        if (this.screenShake > 0) {
            this.screenShake--;
        }

        // Fade flash
        if (this.flashAlpha > 0) {
            this.flashAlpha -= 0.05;
            if (this.flashAlpha < 0) this.flashAlpha = 0;
        }
    }

    getShakeOffset() {
        if (this.screenShake <= 0) return { x: 0, y: 0 };
        return {
            x: (Math.random() - 0.5) * this.shakeIntensity * 2,
            y: (Math.random() - 0.5) * this.shakeIntensity * 2,
        };
    }

    render(ctx, width, height) {
        // Draw particles
        for (const p of this.particles) {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.fillRect(Math.round(p.x - p.size / 2), Math.round(p.y - p.size / 2), p.size, p.size);
        }
        ctx.globalAlpha = 1;

        // Draw texts
        for (const t of this.texts) {
            const alpha = Math.min(1, t.life / 10);
            const scale = t.life > t.maxLife - 5 ? 1 + (t.maxLife - t.life) * 0.1 : 1;
            ctx.globalAlpha = alpha;
            ctx.font = `bold ${Math.round(t.size * scale)}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // Shadow
            ctx.fillStyle = '#000';
            ctx.fillText(t.text, Math.round(t.x) + 1, Math.round(t.y) + 1);
            // Text
            ctx.fillStyle = t.color;
            ctx.fillText(t.text, Math.round(t.x), Math.round(t.y));
        }
        ctx.globalAlpha = 1;

        // Screen flash
        if (this.flashAlpha > 0) {
            ctx.fillStyle = this.flashColor;
            ctx.globalAlpha = this.flashAlpha;
            ctx.fillRect(0, 0, width, height);
            ctx.globalAlpha = 1;
        }
    }

    clear() {
        this.particles = [];
        this.texts = [];
        this.screenShake = 0;
        this.flashAlpha = 0;
    }
}
