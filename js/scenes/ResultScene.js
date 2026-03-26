import { CharSelectScene } from './CharSelectScene.js';
import { FightScene } from './FightScene.js';
import { TitleScene } from './TitleScene.js';

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
                case 0: // Rematch
                    this.game.switchScene(new FightScene(
                        this.game, this.p1Def, this.p2Def, this.arenaDef, this.mode
                    ));
                    break;
                case 1: // Character select
                    this.game.switchScene(new CharSelectScene(this.game, this.mode));
                    break;
                case 2: // Quit
                    this.game.switchScene(new TitleScene(this.game));
                    break;
            }
        }
    }

    render(ctx) {
        const w = this.game.WIDTH;
        const h = this.game.HEIGHT;
        const r = this.game.renderer;

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
            ctx.moveTo(w / 2, 60);
            ctx.lineTo(w / 2 + Math.cos(angle) * len, 60 + Math.sin(angle) * len);
            ctx.stroke();
        }

        // Winner portrait
        const p = this.winnerDef.palette;
        const px = w / 2;
        const py = 55;

        // Large character
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
        // Victory arms up
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

        r.drawTextWithShadow(winLabel, w / 2, 95, winColor, '#000', 14);
        r.drawTextWithShadow(this.winnerDef.name.toUpperCase(), w / 2, 112, '#FFF', '#000', 10);

        // Score
        r.drawText(`${this.p1Def.name} ${this.p1Rounds} - ${this.p2Rounds} ${this.p2Def.name}`, w / 2, 128, '#AAA', 6);

        // Menu
        const menuY = 148;
        for (let i = 0; i < this.menuItems.length; i++) {
            const my = menuY + i * 16;
            const selected = i === this.menuIndex;

            if (selected) {
                ctx.fillStyle = 'rgba(255,204,0,0.1)';
                ctx.fillRect(w / 2 - 60, my - 6, 120, 12);
                if (this.frame % 30 < 20) {
                    r.drawText('>', w / 2 - 50, my, '#FFCC00', 7, 'left');
                }
            }

            r.drawTextWithShadow(
                this.menuItems[i],
                w / 2, my,
                selected ? '#FFF' : '#666',
                '#000', 7
            );
        }
    }
}
