import { PixelFont } from './PixelFont.js';

export class HUD {
    static render(ctx, p1, p2, timer, round, width, comboCountP1, comboCountP2) {
        const barWidth = 140;
        const barHeight = 8;
        const barY = 8;
        const p1BarX = 20;
        const p2BarX = width - 20 - barWidth;

        // Health bar backgrounds
        ctx.fillStyle = '#222';
        ctx.fillRect(p1BarX - 1, barY - 1, barWidth + 2, barHeight + 2);
        ctx.fillRect(p2BarX - 1, barY - 1, barWidth + 2, barHeight + 2);

        // Health bar borders
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        ctx.strokeRect(p1BarX - 1, barY - 1, barWidth + 2, barHeight + 2);
        ctx.strokeRect(p2BarX - 1, barY - 1, barWidth + 2, barHeight + 2);

        // P1 health (fills from left)
        const p1Pct = p1.hp / p1.maxHp;
        const p1Color = p1Pct > 0.5 ? '#00CC44' : p1Pct > 0.25 ? '#CCAA00' : '#CC2200';
        ctx.fillStyle = '#440000';
        ctx.fillRect(p1BarX, barY, barWidth, barHeight);
        ctx.fillStyle = p1Color;
        ctx.fillRect(p1BarX, barY, Math.floor(barWidth * p1Pct), barHeight);

        // Damage flash
        if (p1.hitFlash > 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillRect(p1BarX + Math.floor(barWidth * p1Pct), barY, 3, barHeight);
        }

        // P2 health (fills from right)
        const p2Pct = p2.hp / p2.maxHp;
        const p2Color = p2Pct > 0.5 ? '#00CC44' : p2Pct > 0.25 ? '#CCAA00' : '#CC2200';
        ctx.fillStyle = '#440000';
        ctx.fillRect(p2BarX, barY, barWidth, barHeight);
        ctx.fillStyle = p2Color;
        const p2BarFill = Math.floor(barWidth * p2Pct);
        ctx.fillRect(p2BarX + barWidth - p2BarFill, barY, p2BarFill, barHeight);

        if (p2.hitFlash > 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillRect(p2BarX + barWidth - p2BarFill - 3, barY, 3, barHeight);
        }

        // Player names
        PixelFont.draw(ctx, p1.def.name, p1BarX, barY + barHeight + 7, { color: '#FFF', scale: 1, align: 'left' });
        PixelFont.draw(ctx, p2.def.name, p2BarX + barWidth, barY + barHeight + 7, { color: '#FFF', scale: 1, align: 'right' });

        // Round indicators
        for (let i = 0; i < 2; i++) {
            const rx = p1BarX + 40 + i * 10;
            ctx.fillStyle = i < p1.roundsWon ? '#FFCC00' : '#333';
            ctx.fillRect(rx, barY + barHeight + 12, 5, 5);
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 1;
            ctx.strokeRect(rx, barY + barHeight + 12, 5, 5);
        }
        for (let i = 0; i < 2; i++) {
            const rx = p2BarX + barWidth - 50 + i * 10;
            ctx.fillStyle = i < p2.roundsWon ? '#FFCC00' : '#333';
            ctx.fillRect(rx, barY + barHeight + 12, 5, 5);
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 1;
            ctx.strokeRect(rx, barY + barHeight + 12, 5, 5);
        }

        // Timer
        ctx.fillStyle = '#000';
        ctx.fillRect(width / 2 - 12, barY - 2, 24, 14);
        ctx.strokeStyle = '#FFCC00';
        ctx.lineWidth = 1;
        ctx.strokeRect(width / 2 - 12, barY - 2, 24, 14);
        const timerColor = timer <= 10 ? '#FF4400' : '#FFF';
        PixelFont.draw(ctx, Math.ceil(timer).toString(), width / 2, barY + 4, { color: timerColor, scale: 1 });

        // Round text
        PixelFont.draw(ctx, `ROUND ${round}`, width / 2, barY + 16, { color: '#777', scale: 1 });

        // Combo counters
        if (comboCountP1 >= 2) {
            const cColor = comboCountP1 >= 5 ? '#FF4400' : '#FFCC00';
            PixelFont.draw(ctx, `${comboCountP1} HITS!`, p1BarX, barY + barHeight + 22, { color: cColor, scale: 1, align: 'left', shadow: true });
        }
        if (comboCountP2 >= 2) {
            const cColor = comboCountP2 >= 5 ? '#FF4400' : '#FFCC00';
            PixelFont.draw(ctx, `${comboCountP2} HITS!`, p2BarX + barWidth, barY + barHeight + 22, { color: cColor, scale: 1, align: 'right', shadow: true });
        }
    }
}
