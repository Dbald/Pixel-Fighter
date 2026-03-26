export class HUD {
    static render(ctx, p1, p2, timer, round, width, comboCountP1, comboCountP2) {
        const barWidth = 140;
        const barHeight = 10;
        const barY = 10;
        const p1BarX = 20;
        const p2BarX = width - 20 - barWidth;

        // Health bar backgrounds
        ctx.fillStyle = '#333';
        ctx.fillRect(p1BarX - 1, barY - 1, barWidth + 2, barHeight + 2);
        ctx.fillRect(p2BarX - 1, barY - 1, barWidth + 2, barHeight + 2);

        // Health bar borders
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(p1BarX - 1, barY - 1, barWidth + 2, barHeight + 2);
        ctx.strokeRect(p2BarX - 1, barY - 1, barWidth + 2, barHeight + 2);

        // P1 health (fills from left)
        const p1Pct = p1.hp / p1.maxHp;
        const p1Color = p1Pct > 0.5 ? '#00CC44' : p1Pct > 0.25 ? '#CCAA00' : '#CC2200';
        ctx.fillStyle = '#550000';
        ctx.fillRect(p1BarX, barY, barWidth, barHeight);
        ctx.fillStyle = p1Color;
        ctx.fillRect(p1BarX, barY, Math.floor(barWidth * p1Pct), barHeight);

        // Damage flash
        if (p1.hitFlash > 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillRect(p1BarX + Math.floor(barWidth * p1Pct), barY, 4, barHeight);
        }

        // P2 health (fills from right)
        const p2Pct = p2.hp / p2.maxHp;
        const p2Color = p2Pct > 0.5 ? '#00CC44' : p2Pct > 0.25 ? '#CCAA00' : '#CC2200';
        ctx.fillStyle = '#550000';
        ctx.fillRect(p2BarX, barY, barWidth, barHeight);
        ctx.fillStyle = p2Color;
        const p2BarFill = Math.floor(barWidth * p2Pct);
        ctx.fillRect(p2BarX + barWidth - p2BarFill, barY, p2BarFill, barHeight);

        if (p2.hitFlash > 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillRect(p2BarX + barWidth - p2BarFill - 4, barY, 4, barHeight);
        }

        // Player names
        ctx.font = 'bold 7px monospace';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFF';
        ctx.textAlign = 'left';
        ctx.fillText(p1.def.name.toUpperCase(), p1BarX, barY + barHeight + 8);
        ctx.textAlign = 'right';
        ctx.fillText(p2.def.name.toUpperCase(), p2BarX + barWidth, barY + barHeight + 8);

        // Round indicators
        for (let i = 0; i < 2; i++) {
            const rx = p1BarX + 20 + i * 12;
            ctx.fillStyle = i < p1.roundsWon ? '#FFCC00' : '#444';
            ctx.fillRect(rx, barY + barHeight + 12, 6, 6);
            ctx.strokeStyle = '#888';
            ctx.strokeRect(rx, barY + barHeight + 12, 6, 6);
        }
        for (let i = 0; i < 2; i++) {
            const rx = p2BarX + barWidth - 32 + i * 12;
            ctx.fillStyle = i < p2.roundsWon ? '#FFCC00' : '#444';
            ctx.fillRect(rx, barY + barHeight + 12, 6, 6);
            ctx.strokeStyle = '#888';
            ctx.strokeRect(rx, barY + barHeight + 12, 6, 6);
        }

        // Timer
        ctx.fillStyle = '#000';
        ctx.fillRect(width / 2 - 14, barY - 2, 28, 16);
        ctx.strokeStyle = '#FFCC00';
        ctx.strokeRect(width / 2 - 14, barY - 2, 28, 16);
        ctx.fillStyle = timer <= 10 ? '#FF4400' : '#FFF';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(Math.ceil(timer).toString(), width / 2, barY + 6);

        // Round indicator text
        ctx.font = '5px monospace';
        ctx.fillStyle = '#AAA';
        ctx.fillText(`ROUND ${round}`, width / 2, barY + 18);

        // Combo counters
        if (comboCountP1 >= 2) {
            ctx.font = 'bold 8px monospace';
            ctx.fillStyle = comboCountP1 >= 5 ? '#FF4400' : '#FFCC00';
            ctx.textAlign = 'left';
            ctx.fillText(`${comboCountP1} HITS!`, p1BarX, barY + barHeight + 24);
        }
        if (comboCountP2 >= 2) {
            ctx.font = 'bold 8px monospace';
            ctx.fillStyle = comboCountP2 >= 5 ? '#FF4400' : '#FFCC00';
            ctx.textAlign = 'right';
            ctx.fillText(`${comboCountP2} HITS!`, p2BarX + barWidth, barY + barHeight + 24);
        }
    }
}
