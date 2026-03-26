import { TitleScene } from './TitleScene.js';
import { PixelFont } from '../rendering/PixelFont.js';

export class HowToPlayScene {
    constructor(game) {
        this.game = game;
        this.frame = 0;
        this.page = 0;
        this.totalPages = 3;
    }

    enter() {
        this.frame = 0;
        this.page = 0;
    }

    exit() {}

    update() {
        this.frame++;
        const input = this.game.input;

        if (input.wasPressed('KeyD') || input.wasPressed('ArrowRight')) {
            if (this.page < this.totalPages - 1) {
                this.page++;
                this.game.audio.playMenuMove();
            }
        }
        if (input.wasPressed('KeyA') || input.wasPressed('ArrowLeft')) {
            if (this.page > 0) {
                this.page--;
                this.game.audio.playMenuMove();
            }
        }
        if (input.wasPressed('Escape') || input.wasPressed('Backspace')) {
            this.game.switchScene(new TitleScene(this.game));
        }
    }

    render(ctx) {
        const w = this.game.WIDTH;
        const h = this.game.HEIGHT;

        // Background
        ctx.fillStyle = '#0a0a2e';
        ctx.fillRect(0, 0, w, h);

        // Title bar
        ctx.fillStyle = '#1a0a3e';
        ctx.fillRect(0, 0, w, 18);
        PixelFont.draw(ctx, 'HOW TO PLAY', w / 2, 8, { color: '#FFCC00', scale: 2, shadow: true });

        // Page indicator
        PixelFont.draw(ctx, `PAGE ${this.page + 1}/${this.totalPages}`, w / 2, h - 6, { color: '#666', scale: 1 });

        switch (this.page) {
            case 0: this._renderControls(ctx, w, h); break;
            case 1: this._renderMoves(ctx, w, h); break;
            case 2: this._renderTips(ctx, w, h); break;
        }

        // Navigation
        if (this.page > 0) {
            PixelFont.draw(ctx, '< A/LEFT', 40, h - 14, { color: '#888', scale: 1 });
        }
        if (this.page < this.totalPages - 1) {
            PixelFont.draw(ctx, 'D/RIGHT >', w - 40, h - 14, { color: '#888', scale: 1 });
        }
        PixelFont.draw(ctx, 'ESC: BACK TO MENU', w / 2, h - 14, { color: '#555', scale: 1 });
    }

    _renderControls(ctx, w, h) {
        const col1 = w * 0.25;
        const col2 = w * 0.75;

        PixelFont.draw(ctx, 'CONTROLS', w / 2, 28, { color: '#FFF', scale: 2, shadow: true });

        // Player 1
        PixelFont.draw(ctx, 'PLAYER 1', col1, 46, { color: '#3388FF', scale: 1, shadow: true });
        const p1Controls = [
            ['MOVE', 'A / D'],
            ['JUMP', 'W'],
            ['CROUCH', 'S'],
            ['LIGHT ATTACK', 'F'],
            ['HEAVY ATTACK', 'G'],
            ['SPECIAL', 'H'],
            ['BLOCK', 'HOLD BACK'],
        ];
        for (let i = 0; i < p1Controls.length; i++) {
            const y = 58 + i * 12;
            PixelFont.draw(ctx, p1Controls[i][0], col1 - 30, y, { color: '#AAA', scale: 1, align: 'left' });
            PixelFont.draw(ctx, p1Controls[i][1], col1 + 50, y, { color: '#FFCC00', scale: 1, align: 'right' });
        }

        // Player 2
        PixelFont.draw(ctx, 'PLAYER 2', col2, 46, { color: '#FF4444', scale: 1, shadow: true });
        const p2Controls = [
            ['MOVE', 'ARROWS'],
            ['JUMP', 'UP'],
            ['CROUCH', 'DOWN'],
            ['LIGHT ATTACK', 'J / 7'],
            ['HEAVY ATTACK', 'K / 8'],
            ['SPECIAL', 'L / 9'],
            ['BLOCK', 'HOLD BACK'],
        ];
        for (let i = 0; i < p2Controls.length; i++) {
            const y = 58 + i * 12;
            PixelFont.draw(ctx, p2Controls[i][0], col2 - 30, y, { color: '#AAA', scale: 1, align: 'left' });
            PixelFont.draw(ctx, p2Controls[i][1], col2 + 50, y, { color: '#FFCC00', scale: 1, align: 'right' });
        }

        PixelFont.draw(ctx, 'BLOCK: HOLD DIRECTION AWAY FROM OPPONENT', w / 2, 158, { color: '#888', scale: 1 });
        PixelFont.draw(ctx, 'COMBO LIST IN MATCH: PRESS TAB', w / 2, 170, { color: '#888', scale: 1 });
    }

    _renderMoves(ctx, w, h) {
        PixelFont.draw(ctx, 'MOVE LIST', w / 2, 28, { color: '#FFF', scale: 2, shadow: true });

        const moves = [
            ['LIGHT ATTACK', 'FAST JAB. CHAINS INTO OTHER MOVES.', '#00CC44'],
            ['HEAVY ATTACK', 'SLOWER BUT MORE DAMAGE.', '#FF4400'],
            ['SPECIAL', 'UNIQUE MOVE PER FIGHTER.', '#FF00FF'],
            ['UPPERCUT', 'CROUCH + HEAVY. LAUNCHES OPPONENT.', '#FFCC00'],
            ['OVERHEAD', 'FORWARD + HEAVY. BEATS CROUCH BLOCK.', '#FF8800'],
            ['SWEEP', 'CROUCH + SPECIAL. KNOCKS DOWN. LOW.', '#00CCFF'],
            ['CROUCH LIGHT', 'CROUCH + LIGHT. LOW HIT.', '#88CC44'],
            ['CROUCH HEAVY', 'CROUCH + HEAVY. STRONGER LOW.', '#CC8844'],
            ['JUMP LIGHT', 'JUMP + LIGHT. AIR ATTACK.', '#88CC44'],
            ['JUMP HEAVY', 'JUMP + HEAVY. POWERFUL AIR HIT.', '#CC8844'],
        ];

        for (let i = 0; i < moves.length; i++) {
            const y = 44 + i * 14;
            PixelFont.draw(ctx, moves[i][0], 10, y, { color: moves[i][2], scale: 1, align: 'left' });
            PixelFont.draw(ctx, moves[i][1], w - 10, y, { color: '#888', scale: 1, align: 'right' });
        }

        PixelFont.draw(ctx, 'COMBOS: CHAIN ATTACKS ON HIT!', w / 2, 192, { color: '#FFCC00', scale: 1, shadow: true });
    }

    _renderTips(ctx, w, h) {
        PixelFont.draw(ctx, 'TIPS AND STRATEGY', w / 2, 28, { color: '#FFF', scale: 2, shadow: true });

        const tips = [
            'BLOCK BY HOLDING AWAY FROM YOUR OPPONENT',
            'STANDING BLOCK STOPS HIGH AND MID ATTACKS',
            'CROUCH BLOCK STOPS LOW ATTACKS',
            'OVERHEADS BEAT CROUCH BLOCK',
            'SWEEPS BEAT STANDING BLOCK',
            'CHAIN LIGHT INTO HEAVY INTO SPECIAL',
            'UPPERCUT IS A GREAT COMBO FINISHER',
            'JUMP ATTACKS START AIR COMBOS',
            'EACH FIGHTER HAS UNIQUE SPECIAL MOVES',
            'BEST 2 OUT OF 3 ROUNDS WINS THE MATCH',
            'PRESS TAB DURING FIGHT TO SEE COMBOS',
        ];

        for (let i = 0; i < tips.length; i++) {
            const y = 46 + i * 14;
            const bullet = (this.frame + i * 5) % 60 < 50 ? '>' : ' ';
            PixelFont.draw(ctx, `${bullet} ${tips[i]}`, w / 2, y, { color: '#CCC', scale: 1 });
        }
    }
}
