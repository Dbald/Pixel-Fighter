import { FIGHTERS, FIGHTER_LIST } from '../data/FighterDefs.js';
import { ARENAS, ARENA_LIST } from '../data/ArenaDefs.js';
import { FightScene } from './FightScene.js';
import { TitleScene } from './TitleScene.js';
import { PixelFont } from '../rendering/PixelFont.js';

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
            if (input.wasPressed('KeyF') || input.wasPressed('KeyG') || input.wasPressed('Enter') || input.wasPressed('Space')) {
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
                input.wasPressed('Digit7') || input.wasPressed('Digit8') ||
                input.wasPressed('KeyJ') || input.wasPressed('KeyK')) {
                this.p2Confirmed = true;
                this.game.audio.playMenuSelect();
            }
        } else if (this.mode === 'cpu') {
            this.p2Confirmed = true;
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

        // Background
        ctx.fillStyle = '#0a0a2e';
        ctx.fillRect(0, 0, w, h);

        // Title bar
        ctx.fillStyle = '#1a0a3e';
        ctx.fillRect(0, 0, w, 18);
        PixelFont.draw(ctx, 'SELECT YOUR FIGHTER', w / 2, 8, { color: '#FFCC00', scale: 2, shadow: true });

        if (this.selectingArena) {
            this._renderArenaSelect(ctx, w, h);
            return;
        }

        // Fighter cards
        const cardW = 70;
        const cardH = 90;
        const startX = (w - (FIGHTER_LIST.length * (cardW + 8) - 8)) / 2;

        for (let i = 0; i < FIGHTER_LIST.length; i++) {
            const fighter = FIGHTERS[FIGHTER_LIST[i]];
            const cx = startX + i * (cardW + 8);
            const cy = 28;

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
                PixelFont.draw(ctx, 'P1', cx + 10, cy + 5, { color: '#3388FF', scale: 1, align: 'left' });
            }
            if (isP2) {
                ctx.strokeStyle = this.p2Confirmed ? '#00FF00' : '#FF4444';
                ctx.lineWidth = 2;
                ctx.strokeRect(cx - 1, cy - 1, cardW + 2, cardH + 2);
                PixelFont.draw(ctx, 'P2', cx + cardW - 10, cy + 5, { color: '#FF4444', scale: 1, align: 'right' });
            }

            // Fighter preview
            this._drawFighterPreview(ctx, fighter, cx + cardW / 2, cy + 40);

            // Fighter name
            PixelFont.draw(ctx, fighter.name, cx + cardW / 2, cy + cardH - 18, { color: '#FFF', scale: 1, shadow: true });

            // Archetype
            PixelFont.draw(ctx, fighter.archetype, cx + cardW / 2, cy + cardH - 8, { color: fighter.palette.accent, scale: 1 });
        }

        // Stats panel for P1 selection
        const selFighter = FIGHTERS[FIGHTER_LIST[this.p1Selection]];
        this._drawStats(ctx, selFighter, w, h);

        // Instructions
        if (!this.p1Confirmed) {
            PixelFont.draw(ctx, 'P1: A/D TO SELECT. F TO CONFIRM', w / 2, h - 18, { color: '#888', scale: 1 });
        } else if (this.mode === 'versus' && !this.p2Confirmed) {
            PixelFont.draw(ctx, 'P2: ARROWS TO SELECT. J TO CONFIRM', w / 2, h - 18, { color: '#888', scale: 1 });
        }
        PixelFont.draw(ctx, 'ESC: BACK', w / 2, h - 8, { color: '#555', scale: 1 });
    }

    _drawFighterPreview(ctx, fighter, x, y) {
        const p = fighter.palette;
        ctx.fillStyle = p.skin;
        ctx.fillRect(x - 3, y - 16, 6, 6);
        ctx.fillStyle = p.hair;
        ctx.fillRect(x - 4, y - 18, 8, 3);
        ctx.fillStyle = p.outfit;
        ctx.fillRect(x - 4, y - 10, 8, 10);
        ctx.fillStyle = p.accent;
        ctx.fillRect(x - 4, y - 10, 8, 2);
        ctx.fillStyle = p.belt;
        ctx.fillRect(x - 4, y - 2, 8, 2);
        ctx.fillStyle = p.outfit;
        ctx.fillRect(x - 3, y, 3, 8);
        ctx.fillRect(x + 1, y, 3, 8);
        ctx.fillStyle = p.shoes;
        ctx.fillRect(x - 3, y + 8, 3, 2);
        ctx.fillRect(x + 1, y + 8, 3, 2);
    }

    _drawStats(ctx, fighter, w, h) {
        const barW = 50;
        const stats = [
            { label: 'SPD', value: fighter.speed / 5, color: '#00CCFF' },
            { label: 'PWR', value: fighter.moves.heavy.damage / 200, color: '#FF4400' },
            { label: 'HP', value: fighter.hp / 1200, color: '#00CC44' },
        ];

        const baseY = 132;
        PixelFont.draw(ctx, fighter.name, w / 2, baseY, { color: '#FFF', scale: 1, shadow: true });
        PixelFont.draw(ctx, `"${fighter.subtitle}"`, w / 2, baseY + 10, { color: '#AAA', scale: 1 });

        const statsStartX = w / 2 - 40;
        for (let i = 0; i < stats.length; i++) {
            const sy = baseY + 20 + i * 10;
            PixelFont.draw(ctx, stats[i].label, statsStartX, sy, { color: '#888', scale: 1, align: 'left' });
            ctx.fillStyle = '#333';
            ctx.fillRect(statsStartX + 25, sy - 2, barW, 5);
            ctx.fillStyle = stats[i].color;
            ctx.fillRect(statsStartX + 25, sy - 2, Math.floor(barW * stats[i].value), 5);
        }
    }

    _renderArenaSelect(ctx, w, h) {
        PixelFont.draw(ctx, 'SELECT ARENA', w / 2, 30, { color: '#FFCC00', scale: 2, shadow: true });

        const arena = ARENAS[ARENA_LIST[this.arenaSelection]];

        // Arena preview box
        ctx.fillStyle = arena.palette.sky;
        ctx.fillRect(w / 2 - 80, 48, 160, 80);
        ctx.fillStyle = arena.palette.ground;
        ctx.fillRect(w / 2 - 80, 103, 160, 25);
        ctx.fillStyle = arena.palette.groundLine;
        ctx.fillRect(w / 2 - 80, 103, 160, 2);
        ctx.fillStyle = arena.palette.accent1;
        ctx.fillRect(w / 2 - 40, 63, 20, 4);
        ctx.fillStyle = arena.palette.accent2;
        ctx.fillRect(w / 2 + 20, 73, 20, 4);

        ctx.strokeStyle = '#FFCC00';
        ctx.lineWidth = 2;
        ctx.strokeRect(w / 2 - 81, 47, 162, 82);

        PixelFont.draw(ctx, arena.name, w / 2, 142, { color: '#FFF', scale: 1, shadow: true });

        // Arrows
        if (this.frame % 40 < 30) {
            PixelFont.draw(ctx, '<', w / 2 - 100, 88, { color: '#FFCC00', scale: 2 });
            PixelFont.draw(ctx, '>', w / 2 + 100, 88, { color: '#FFCC00', scale: 2 });
        }

        PixelFont.draw(ctx, 'PRESS ENTER OR F TO FIGHT', w / 2, h - 18, { color: '#888', scale: 1 });
        PixelFont.draw(ctx, 'ESC: BACK', w / 2, h - 8, { color: '#555', scale: 1 });
    }
}
