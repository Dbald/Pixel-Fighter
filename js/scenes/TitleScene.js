import { CharSelectScene } from './CharSelectScene.js';

export class TitleScene {
    constructor(game) {
        this.game = game;
        this.frame = 0;
        this.menuIndex = 0;
        this.menuItems = [
            { label: 'VS CPU', mode: 'cpu' },
            { label: '2 PLAYERS', mode: 'versus' },
        ];
    }

    enter() {
        this.frame = 0;
        this.menuIndex = 0;
    }

    exit() {}

    update() {
        this.frame++;

        const input = this.game.input;

        if (input.wasPressed('KeyW') || input.wasPressed('ArrowUp')) {
            this.menuIndex = (this.menuIndex - 1 + this.menuItems.length) % this.menuItems.length;
            this.game.audio.playMenuMove();
        }
        if (input.wasPressed('KeyS') || input.wasPressed('ArrowDown')) {
            this.menuIndex = (this.menuIndex + 1) % this.menuItems.length;
            this.game.audio.playMenuMove();
        }

        if (input.wasPressed('Enter') || input.wasPressed('Space') ||
            input.wasPressed('KeyF') || input.wasPressed('KeyG')) {
            this.game.audio.playMenuSelect();
            const mode = this.menuItems[this.menuIndex].mode;
            this.game.switchScene(new CharSelectScene(this.game, mode));
        }
    }

    render(ctx) {
        const w = this.game.WIDTH;
        const h = this.game.HEIGHT;
        const r = this.game.renderer;

        // Background
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#0a0a2e');
        grad.addColorStop(0.5, '#1a0a3e');
        grad.addColorStop(1, '#0a0a1e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Animated background lines
        for (let i = 0; i < 10; i++) {
            const ly = (this.frame * 0.5 + i * 25) % (h + 20) - 10;
            ctx.fillStyle = `rgba(255,0,255,${0.05 + Math.sin(this.frame * 0.02 + i) * 0.03})`;
            ctx.fillRect(0, ly, w, 1);
        }

        // Title
        const titleY = 50 + Math.sin(this.frame * 0.03) * 3;

        // Title shadow
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#330066';
        ctx.fillText('STREET PIXEL', w / 2 + 2, titleY + 2);
        ctx.fillStyle = '#FF00FF';
        ctx.fillText('STREET PIXEL', w / 2, titleY);

        ctx.font = 'bold 24px monospace';
        ctx.fillStyle = '#663300';
        ctx.fillText('FIGHTER', w / 2 + 2, titleY + 24);
        ctx.fillStyle = '#FFCC00';
        ctx.fillText('FIGHTER', w / 2, titleY + 22);

        // Decorative line
        ctx.fillStyle = '#FF00FF';
        ctx.fillRect(w / 2 - 80, titleY + 38, 160, 1);
        ctx.fillStyle = '#00FFFF';
        ctx.fillRect(w / 2 - 60, titleY + 40, 120, 1);

        // Menu items
        const menuStartY = 130;
        for (let i = 0; i < this.menuItems.length; i++) {
            const my = menuStartY + i * 18;
            const selected = i === this.menuIndex;

            if (selected) {
                // Selection highlight
                ctx.fillStyle = 'rgba(255,0,255,0.15)';
                ctx.fillRect(w / 2 - 50, my - 7, 100, 14);

                // Blinking arrow
                if (this.frame % 30 < 20) {
                    r.drawTextWithShadow('>', w / 2 - 42, my, '#FFCC00', '#000', 8);
                }
            }

            const color = selected ? '#FFFFFF' : '#888888';
            r.drawTextWithShadow(this.menuItems[i].label, w / 2, my, color, '#000', 8);
        }

        // Footer
        if (this.frame % 60 < 45) {
            r.drawText('PRESS ENTER TO START', w / 2, h - 30, '#888', 6);
        }

        // Controls hint
        r.drawText('P1: WASD + F/G/H    P2: ARROWS + 7/8/9', w / 2, h - 14, '#555', 5);
    }
}
