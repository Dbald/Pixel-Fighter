import { CharSelectScene } from './CharSelectScene.js';
import { HowToPlayScene } from './HowToPlayScene.js';
import { PixelFont } from '../rendering/PixelFont.js';

export class TitleScene {
    constructor(game) {
        this.game = game;
        this.frame = 0;
        this.menuIndex = 0;
        this.menuItems = [
            { label: 'VS CPU', action: 'cpu' },
            { label: '2 PLAYERS', action: 'versus' },
            { label: 'HOW TO PLAY', action: 'howtoplay' },
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
            const action = this.menuItems[this.menuIndex].action;
            if (action === 'howtoplay') {
                this.game.switchScene(new HowToPlayScene(this.game));
            } else {
                this.game.switchScene(new CharSelectScene(this.game, action));
            }
        }
    }

    render(ctx) {
        const w = this.game.WIDTH;
        const h = this.game.HEIGHT;

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
        const titleY = 45 + Math.sin(this.frame * 0.03) * 3;

        PixelFont.draw(ctx, 'STREET PIXEL', w / 2, titleY, {
            color: '#FF00FF', scale: 3, shadow: true, shadowColor: '#330066',
        });
        PixelFont.draw(ctx, 'FIGHTER', w / 2, titleY + 22, {
            color: '#FFCC00', scale: 3, shadow: true, shadowColor: '#663300',
        });

        // Decorative line
        ctx.fillStyle = '#FF00FF';
        ctx.fillRect(w / 2 - 80, titleY + 38, 160, 1);
        ctx.fillStyle = '#00FFFF';
        ctx.fillRect(w / 2 - 60, titleY + 40, 120, 1);

        // Menu items
        const menuStartY = 115;
        for (let i = 0; i < this.menuItems.length; i++) {
            const my = menuStartY + i * 16;
            const selected = i === this.menuIndex;

            if (selected) {
                ctx.fillStyle = 'rgba(255,0,255,0.15)';
                ctx.fillRect(w / 2 - 50, my - 5, 100, 12);

                if (this.frame % 30 < 20) {
                    PixelFont.draw(ctx, '>', w / 2 - 42, my, { color: '#FFCC00', scale: 1, align: 'left' });
                }
            }

            PixelFont.draw(ctx, this.menuItems[i].label, w / 2, my, {
                color: selected ? '#FFFFFF' : '#666666',
                scale: 1,
                shadow: true,
            });
        }

        // Footer
        if (this.frame % 60 < 45) {
            PixelFont.draw(ctx, 'PRESS ENTER TO START', w / 2, h - 28, { color: '#888', scale: 1 });
        }

        // Controls hint
        PixelFont.draw(ctx, 'P1: WASD + F/G/H', w / 2, h - 16, { color: '#555', scale: 1 });
        PixelFont.draw(ctx, 'P2: ARROWS + J/K/L', w / 2, h - 8, { color: '#555', scale: 1 });
    }
}
