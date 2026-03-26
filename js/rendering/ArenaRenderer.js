export class ArenaRenderer {
    static render(ctx, arena, width, height, frameCount) {
        const p = arena.palette;
        const groundY = Math.floor(height * arena.groundY);

        // Sky gradient
        const grad = ctx.createLinearGradient(0, 0, 0, groundY);
        grad.addColorStop(0, p.sky);
        grad.addColorStop(1, p.skyGrad);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, groundY);

        // Background buildings
        this._drawBuildings(ctx, p, width, groundY, frameCount, arena.id);

        // Ground
        ctx.fillStyle = p.ground;
        ctx.fillRect(0, groundY, width, height - groundY);

        // Ground line
        ctx.fillStyle = p.groundLine;
        ctx.fillRect(0, groundY, width, 2);

        // Arena-specific features
        this._drawFeatures(ctx, arena, width, height, groundY, frameCount);

        return groundY;
    }

    static _drawBuildings(ctx, p, width, groundY, frame, arenaId) {
        // Far buildings
        ctx.fillStyle = p.building1;
        for (let i = 0; i < 8; i++) {
            const bx = i * 55 - 10;
            const bh = 30 + (i * 17 % 40);
            ctx.fillRect(bx, groundY - bh, 45, bh);
            // Windows
            ctx.fillStyle = this._windowColor(arenaId, frame, i);
            for (let wy = groundY - bh + 5; wy < groundY - 5; wy += 8) {
                for (let wx = bx + 4; wx < bx + 42; wx += 10) {
                    ctx.fillRect(wx, wy, 4, 4);
                }
            }
            ctx.fillStyle = p.building1;
        }

        // Near buildings
        ctx.fillStyle = p.building2;
        for (let i = 0; i < 6; i++) {
            const bx = i * 75 + 10;
            const bh = 20 + (i * 23 % 30);
            ctx.fillRect(bx, groundY - bh, 60, bh);
        }
    }

    static _windowColor(arenaId, frame, index) {
        if (arenaId === 'neon_alley') {
            const colors = ['#FF00FF', '#00FFFF', '#FFFF00', '#FF4400'];
            const flicker = Math.sin(frame * 0.05 + index * 2) > 0;
            return flicker ? colors[index % colors.length] : '#222233';
        }
        if (arenaId === 'rooftop') {
            return Math.sin(frame * 0.02 + index) > 0.3 ? '#FFCC44' : '#333344';
        }
        if (arenaId === 'metro') {
            return '#4466AA';
        }
        return '#FFAA44';
    }

    static _drawFeatures(ctx, arena, width, height, groundY, frame) {
        switch (arena.id) {
            case 'neon_alley':
                this._drawNeonAlley(ctx, arena.palette, width, groundY, frame);
                break;
            case 'rooftop':
                this._drawRooftop(ctx, arena.palette, width, groundY, frame);
                break;
            case 'metro':
                this._drawMetro(ctx, arena.palette, width, height, groundY, frame);
                break;
            case 'dojo':
                this._drawDojo(ctx, arena.palette, width, height, groundY, frame);
                break;
        }
    }

    static _drawNeonAlley(ctx, p, width, groundY, frame) {
        // Neon signs
        const signs = [
            { x: 60, y: groundY - 55, text: 'FIGHT', color: '#FF00FF' },
            { x: 280, y: groundY - 45, text: 'PIXEL', color: '#00FFFF' },
        ];
        for (const sign of signs) {
            const flicker = Math.sin(frame * 0.1 + sign.x) > -0.2;
            if (flicker) {
                ctx.fillStyle = sign.color;
                ctx.globalAlpha = 0.8 + Math.sin(frame * 0.15) * 0.2;
                ctx.font = 'bold 8px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(sign.text, sign.x, sign.y);
                ctx.globalAlpha = 1;
            }
        }

        // Puddle reflections
        ctx.fillStyle = 'rgba(0,255,255,0.1)';
        ctx.fillRect(40, groundY + 4, 60, 2);
        ctx.fillRect(200, groundY + 6, 80, 2);

        // Steam
        for (let i = 0; i < 3; i++) {
            const sx = 100 + i * 120;
            const sy = groundY - 5 - Math.sin(frame * 0.03 + i) * 10;
            ctx.fillStyle = 'rgba(200,200,200,0.15)';
            ctx.fillRect(sx, sy, 6 + Math.sin(frame * 0.05 + i) * 3, 4);
        }
    }

    static _drawRooftop(ctx, p, width, groundY, frame) {
        // Antenna
        ctx.fillStyle = '#555566';
        ctx.fillRect(320, groundY - 70, 2, 70);
        ctx.fillRect(314, groundY - 68, 14, 2);

        // Blinking light
        if (Math.sin(frame * 0.08) > 0) {
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(320, groundY - 72, 3, 3);
        }

        // Birds (occasional)
        if (frame % 300 < 100) {
            for (let i = 0; i < 3; i++) {
                const bx = (frame * 0.5 + i * 40) % (width + 40) - 20;
                const by = 15 + i * 8 + Math.sin(frame * 0.1 + i) * 3;
                ctx.fillStyle = '#222';
                ctx.fillRect(bx - 2, by, 2, 1);
                ctx.fillRect(bx + 1, by, 2, 1);
                ctx.fillRect(bx, by + 1, 1, 1);
            }
        }
    }

    static _drawMetro(ctx, p, width, height, groundY, frame) {
        // Pillars
        for (let i = 0; i < 4; i++) {
            const px = 50 + i * 100;
            ctx.fillStyle = '#3a3a4a';
            ctx.fillRect(px, groundY - 60, 6, 60);
            ctx.fillRect(px - 4, groundY - 62, 14, 4);
        }

        // Tracks
        ctx.fillStyle = '#666677';
        ctx.fillRect(0, groundY + 10, width, 2);
        ctx.fillRect(0, groundY + 16, width, 2);

        // Track ties
        for (let i = 0; i < 30; i++) {
            ctx.fillStyle = '#554433';
            ctx.fillRect(i * 14, groundY + 8, 4, 12);
        }

        // Platform edge warning
        ctx.fillStyle = '#FFCC00';
        for (let i = 0; i < width; i += 12) {
            ctx.fillRect(i, groundY + 2, 8, 2);
        }

        // Lights
        for (let i = 0; i < 5; i++) {
            const lx = 30 + i * 80;
            const flicker = Math.sin(frame * 0.04 + i * 1.5) > -0.1;
            if (flicker) {
                ctx.fillStyle = 'rgba(180,200,255,0.3)';
                ctx.fillRect(lx - 8, groundY - 55, 16, 3);
            }
        }
    }

    static _drawDojo(ctx, p, width, height, groundY, frame) {
        // Wooden floor planks
        ctx.fillStyle = '#5a4030';
        for (let i = 0; i < width; i += 20) {
            ctx.fillRect(i, groundY + 2, 18, height - groundY - 2);
            ctx.fillStyle = '#4a3020';
            ctx.fillRect(i + 18, groundY + 2, 2, height - groundY - 2);
            ctx.fillStyle = '#5a4030';
        }

        // Lanterns
        const lanterns = [60, 180, 300];
        for (const lx of lanterns) {
            // String
            ctx.fillStyle = '#888';
            ctx.fillRect(lx, groundY - 55, 1, 10);
            // Lantern body
            const glow = Math.sin(frame * 0.06 + lx) * 0.2 + 0.8;
            ctx.fillStyle = '#CC0000';
            ctx.globalAlpha = glow;
            ctx.fillRect(lx - 4, groundY - 45, 9, 12);
            ctx.globalAlpha = 1;
            // Top/bottom caps
            ctx.fillStyle = '#AA8800';
            ctx.fillRect(lx - 5, groundY - 46, 11, 2);
            ctx.fillRect(lx - 5, groundY - 33, 11, 2);
        }

        // Banner
        ctx.fillStyle = '#CC0000';
        ctx.fillRect(15, groundY - 65, 20, 40);
        ctx.fillStyle = '#FFCC00';
        ctx.font = '6px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('\u6B66', 25, groundY - 45);

        ctx.fillStyle = '#CC0000';
        ctx.fillRect(width - 35, groundY - 65, 20, 40);
        ctx.fillStyle = '#FFCC00';
        ctx.fillText('\u9053', width - 25, groundY - 45);
    }
}
