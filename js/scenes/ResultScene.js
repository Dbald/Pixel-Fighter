import { CharSelectScene } from './CharSelectScene.js';
import { FightScene } from './FightScene.js';
import { TitleScene } from './TitleScene.js';
import { PixelFont } from '../rendering/PixelFont.js';

export class ResultScene {
    constructor(game, winnerDef, winnerNum, p1Def, p2Def, arenaDef, mode, p1Rounds, p2Rounds) {
        this.game = game;
        this.winnerDef = winnerDef;
        this.winnerNum = winnerNum;
        this.p1Def = p1Def;
        this.p2Def = p2Def;
        this.arenaDef = arenaDef;
        this.mode = mode;
        this.p1Rounds = p1Rounds;
        this.p2Rounds = p2Rounds;
        this.frame = 0;
        this.menuIndex = 0;
        this.menuItems = ['REMATCH', 'CHARACTER SELECT', 'QUIT'];
    }

    enter() {
        this.frame = 0;
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
            switch (this.menuIndex) {
                case 0:
                    this.game.switchScene(new FightScene(
                        this.game, this.p1Def, this.p2Def, this.arenaDef, this.mode
                    ));
                    break;
                case 1:
                    this.game.switchScene(new CharSelectScene(this.game, this.mode));
                    break;
                case 2:
                    this.game.switchScene(new TitleScene(this.game));
                    break;
            }
        }
    }

    render(ctx) {
        const w = this.game.WIDTH;
        const h = this.game.HEIGHT;

        // Background
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#0a0a1e');
        grad.addColorStop(1, '#1a0a3e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Victory flash lines
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i / 12) + this.frame * 0.01;
            const len = 80 + Math.sin(this.frame * 0.05 + i) * 20;
            ctx.strokeStyle = `rgba(255,204,0,${0.1 + Math.sin(this.frame * 0.03 + i) * 0.05})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(w / 2, 55);
            ctx.lineTo(w / 2 + Math.cos(angle) * len, 55 + Math.sin(angle) * len);
            ctx.stroke();
        }

        // Winner portrait
        const p = this.winnerDef.palette;
        const px = w / 2;
        const py = 50;

        ctx.fillStyle = p.skin;
        ctx.fillRect(px - 6, py - 20, 12, 12);
        ctx.fillStyle = p.hair;
        ctx.fillRect(px - 7, py - 22, 14, 5);
        ctx.fillStyle = p.outfit;
        ctx.fillRect(px - 8, py - 8, 16, 16);
        ctx.fillStyle = p.accent;
        ctx.fillRect(px - 8, py - 8, 16, 3);
        ctx.fillStyle = p.belt;
        ctx.fillRect(px - 8, py + 5, 16, 2);
        ctx.fillStyle = p.outfit;
        ctx.fillRect(px - 6, py + 8, 5, 12);
        ctx.fillRect(px + 1, py + 8, 5, 12);
        ctx.fillStyle = p.skin;
        ctx.fillRect(px - 12, py - 18, 5, 10);
        ctx.fillRect(px + 7, py - 18, 5, 10);

        // Winner text
        const isP1Win = this.winnerNum === 1;
        const winLabel = this.mode === 'cpu'
            ? (isP1Win ? 'YOU WIN!' : 'YOU LOSE!')
            : `PLAYER ${this.winnerNum} WINS!`;

        const winColor = this.mode === 'cpu'
            ? (isP1Win ? '#FFCC00' : '#FF4400')
            : '#FFCC00';

        PixelFont.draw(ctx, winLabel, w / 2, 88, { color: winColor, scale: 2, shadow: true });
        PixelFont.draw(ctx, this.winnerDef.name, w / 2, 104, { color: '#FFF', scale: 2, shadow: true });

        // Score
        PixelFont.draw(ctx, `${this.p1Def.name} ${this.p1Rounds} - ${this.p2Rounds} ${this.p2Def.name}`, w / 2, 118, { color: '#AAA', scale: 1 });

        // Menu
        const menuY = 138;
        for (let i = 0; i < this.menuItems.length; i++) {
            const my = menuY + i * 14;
            const selected = i === this.menuIndex;

            if (selected) {
                ctx.fillStyle = 'rgba(255,204,0,0.1)';
                ctx.fillRect(w / 2 - 60, my - 4, 120, 10);
                if (this.frame % 30 < 20) {
                    PixelFont.draw(ctx, '>', w / 2 - 52, my, { color: '#FFCC00', scale: 1, align: 'left' });
                }
            }

            PixelFont.draw(ctx, this.menuItems[i], w / 2, my, {
                color: selected ? '#FFF' : '#666',
                scale: 1,
                shadow: true,
            });
        }
    }
}
