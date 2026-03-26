import { FIGHTERS, FIGHTER_LIST } from '../data/FighterDefs.js';
import { ARENAS, ARENA_LIST } from '../data/ArenaDefs.js';
import { FightScene } from './FightScene.js';
import { TitleScene } from './TitleScene.js';

export class CharSelectScene {
    constructor(game, mode) {
        this.game = game;
        this.mode = mode; // 'cpu' or 'versus'
        this.frame = 0;

        this.p1Selection = 0;
        this.p2Selection = 1;
        this.p1Confirmed = false;
        this.p2Confirmed = false;
        this.arenaSelection = 0;
        this.selectingArena = false;
    }

    enter() {
        this.frame = 0;
        this.p1Confirmed = false;
        this.p2Confirmed = false;
        this.selectingArena = false;
    }

    exit() {}

    update() {
        this.frame++;
        const input = this.game.input;

        if (this.selectingArena) {
            this._updateArenaSelect(input);
            return;
        }

        // P1 controls
        if (!this.p1Confirmed) {
            if (input.wasPressed('KeyA')) {
                this.p1Selection = (this.p1Selection - 1 + FIGHTER_LIST.length) % FIGHTER_LIST.length;
                this.game.audio.playMenuMove();
            }
            if (input.wasPressed('KeyD')) {
                this.p1Selection = (this.p1Selection + 1) % FIGHTER_LIST.length;
                this.game.audio.playMenuMove();
            }
            if (input.wasPressed('KeyF') || input.wasPressed('KeyG')) {
                this.p1Confirmed = true;
                this.game.audio.playMenuSelect();
            }
        }

        // P2 controls (or CPU auto-select)
        if (this.mode === 'versus' && !this.p2Confirmed) {
            if (input.wasPressed('ArrowLeft')) {
                this.p2Selection = (this.p2Selection - 1 + FIGHTER_LIST.length) % FIGHTER_LIST.length;
                this.game.audio.playMenuMove();
            }
            if (input.wasPressed('ArrowRight')) {
                this.p2Selection = (this.p2Selection + 1) % FIGHTER_LIST.length;
                this.game.audio.playMenuMove();
            }
            if (input.wasPressed('Numpad1') || input.wasPressed('Numpad2') ||
                input.wasPressed('Digit7') || input.wasPressed('Digit8')) {
                this.p2Confirmed = true;
                this.game.audio.playMenuSelect();
            }
        } else if (this.mode === 'cpu') {
            this.p2Confirmed = true;
            // CPU picks a random different fighter
            if (this.p1Confirmed) {
                if (this.p2Selection === this.p1Selection) {
                    this.p2Selection = (this.p1Selection + 1 + Math.floor(Math.random() * (FIGHTER_LIST.length - 1))) % FIGHTER_LIST.length;
                }
            }
        }

        // Both confirmed -> arena select
        if (this.p1Confirmed && this.p2Confirmed) {
            this.selectingArena = true;
            this.game.audio.playMenuSelect();
        }

        // Back to title
        if (input.wasPressed('Escape')) {
            this.game.switchScene(new TitleScene(this.game));
        }
    }

    _updateArenaSelect(input) {
        if (input.wasPressed('KeyA') || input.wasPressed('ArrowLeft')) {
            this.arenaSelection = (this.arenaSelection - 1 + ARENA_LIST.length) % ARENA_LIST.length;
            this.game.audio.playMenuMove();
        }
        if (input.wasPressed('KeyD') || input.wasPressed('ArrowRight')) {
            this.arenaSelection = (this.arenaSelection + 1) % ARENA_LIST.length;
            this.game.audio.playMenuMove();
        }
        if (input.wasPressed('Enter') || input.wasPressed('Space') ||
            input.wasPressed('KeyF') || input.wasPressed('KeyG')) {
            this.game.audio.playMenuSelect();
            const p1Def = FIGHTERS[FIGHTER_LIST[this.p1Selection]];
            const p2Def = FIGHTERS[FIGHTER_LIST[this.p2Selection]];
            const arenaDef = ARENAS[ARENA_LIST[this.arenaSelection]];
            this.game.switchScene(new FightScene(this.game, p1Def, p2Def, arenaDef, this.mode));
        }
        if (input.wasPressed('Escape')) {
            this.selectingArena = false;
            this.p1Confirmed = false;
            this.p2Confirmed = false;
        }
    }

    render(ctx) {
        const w = this.game.WIDTH;
        const h = this.game.HEIGHT;
        const r = this.game.renderer;

        // Background
        ctx.fillStyle = '#0a0a2e';
        ctx.fillRect(0, 0, w, h);

        // Title bar
        ctx.fillStyle = '#1a0a3e';
        ctx.fillRect(0, 0, w, 24);
        r.drawTextWithShadow('SELECT YOUR FIGHTER', w / 2, 12, '#FFCC00', '#000', 10);

        if (this.selectingArena) {
            this._renderArenaSelect(ctx, w, h, r);
            return;
        }

        // Fighter cards
        const cardW = 70;
        const cardH = 90;
        const startX = (w - (FIGHTER_LIST.length * (cardW + 8) - 8)) / 2;

        for (let i = 0; i < FIGHTER_LIST.length; i++) {
            const fighter = FIGHTERS[FIGHTER_LIST[i]];
            const cx = startX + i * (cardW + 8);
            const cy = 40;

            const isP1 = i === this.p1Selection;
            const isP2 = i === this.p2Selection;

            // Card background
            ctx.fillStyle = '#1a1a3a';
            ctx.fillRect(cx, cy, cardW, cardH);

            // Selection borders
            if (isP1) {
                ctx.strokeStyle = this.p1Confirmed ? '#00FF00' : '#3388FF';
                ctx.lineWidth = 2;
                ctx.strokeRect(cx - 1, cy - 1, cardW + 2, cardH + 2);
                r.drawText('P1', cx + 8, cy + 6, '#3388FF', 6);
            }
            if (isP2) {
                ctx.strokeStyle = this.p2Confirmed ? '#00FF00' : '#FF4444';
                ctx.lineWidth = 2;
                ctx.strokeRect(cx - 1, cy - 1, cardW + 2, cardH + 2);
                r.drawText('P2', cx + cardW - 8, cy + 6, '#FF4444', 6);
            }

            // Fighter preview (mini pixel art)
            this._drawFighterPreview(ctx, fighter, cx + cardW / 2, cy + 40);

            // Fighter name
            r.drawText(fighter.name.toUpperCase(), cx + cardW / 2, cy + cardH - 20, '#FFF', 7);

            // Archetype
            ctx.fillStyle = fighter.palette.accent;
            r.drawText(fighter.archetype.toUpperCase(), cx + cardW / 2, cy + cardH - 10, fighter.palette.accent, 5);
        }

        // Stats panel for P1 selection
        const selFighter = FIGHTERS[FIGHTER_LIST[this.p1Selection]];
        this._drawStats(ctx, r, selFighter, 20, 145, w);

        // Instructions
        if (!this.p1Confirmed) {
            r.drawText('P1: A/D to select, F to confirm', w / 2, h - 20, '#888', 5);
        } else if (this.mode === 'versus' && !this.p2Confirmed) {
            r.drawText('P2: Arrows to select, 7 to confirm', w / 2, h - 20, '#888', 5);
        }
        r.drawText('ESC to go back', w / 2, h - 10, '#555', 5);
    }

    _drawFighterPreview(ctx, fighter, x, y) {
        const p = fighter.palette;
        // Simple standing pose
        // Head
        ctx.fillStyle = p.skin;
        ctx.fillRect(x - 3, y - 16, 6, 6);
        // Hair
        ctx.fillStyle = p.hair;
        ctx.fillRect(x - 4, y - 18, 8, 3);
        // Body
        ctx.fillStyle = p.outfit;
        ctx.fillRect(x - 4, y - 10, 8, 10);
        // Accent
        ctx.fillStyle = p.accent;
        ctx.fillRect(x - 4, y - 10, 8, 2);
        // Belt
        ctx.fillStyle = p.belt;
        ctx.fillRect(x - 4, y - 2, 8, 2);
        // Legs
        ctx.fillStyle = p.outfit;
        ctx.fillRect(x - 3, y, 3, 8);
        ctx.fillRect(x + 1, y, 3, 8);
        // Shoes
        ctx.fillStyle = p.shoes;
        ctx.fillRect(x - 3, y + 8, 3, 2);
        ctx.fillRect(x + 1, y + 8, 3, 2);
    }

    _drawStats(ctx, r, fighter, x, y, width) {
        const barW = 60;
        const stats = [
            { label: 'SPD', value: fighter.speed / 5, color: '#00CCFF' },
            { label: 'PWR', value: fighter.moves.heavy.damage / 200, color: '#FF4400' },
            { label: 'HP', value: fighter.hp / 1200, color: '#00CC44' },
        ];

        r.drawTextWithShadow(fighter.name, width / 2, y, '#FFF', '#000', 8);
        r.drawText(`"${fighter.subtitle}"`, width / 2, y + 12, '#AAA', 5);

        const statsStartX = width / 2 - 50;
        for (let i = 0; i < stats.length; i++) {
            const sy = y + 22 + i * 10;
            r.drawText(stats[i].label, statsStartX, sy, '#888', 5, 'left');
            ctx.fillStyle = '#333';
            ctx.fillRect(statsStartX + 25, sy - 3, barW, 5);
            ctx.fillStyle = stats[i].color;
            ctx.fillRect(statsStartX + 25, sy - 3, Math.floor(barW * stats[i].value), 5);
        }
    }

    _renderArenaSelect(ctx, w, h, r) {
        r.drawTextWithShadow('SELECT ARENA', w / 2, 40, '#FFCC00', '#000', 10);

        const arena = ARENAS[ARENA_LIST[this.arenaSelection]];

        // Arena preview box
        ctx.fillStyle = arena.palette.sky;
        ctx.fillRect(w / 2 - 80, 55, 160, 80);
        ctx.fillStyle = arena.palette.ground;
        ctx.fillRect(w / 2 - 80, 110, 160, 25);
        ctx.fillStyle = arena.palette.groundLine;
        ctx.fillRect(w / 2 - 80, 110, 160, 2);
        // Accent details
        ctx.fillStyle = arena.palette.accent1;
        ctx.fillRect(w / 2 - 40, 70, 20, 4);
        ctx.fillStyle = arena.palette.accent2;
        ctx.fillRect(w / 2 + 20, 80, 20, 4);

        ctx.strokeStyle = '#FFCC00';
        ctx.lineWidth = 2;
        ctx.strokeRect(w / 2 - 81, 54, 162, 82);

        r.drawTextWithShadow(arena.name.toUpperCase(), w / 2, 150, '#FFF', '#000', 8);

        // Arrows
        if (this.frame % 40 < 30) {
            r.drawText('<', w / 2 - 100, 95, '#FFCC00', 12);
            r.drawText('>', w / 2 + 100, 95, '#FFCC00', 12);
        }

        r.drawText('PRESS ENTER OR F TO FIGHT', w / 2, h - 20, '#888', 5);
        r.drawText('ESC to go back', w / 2, h - 10, '#555', 5);
    }
}
