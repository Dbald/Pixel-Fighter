import { Fighter } from '../fighters/Fighter.js';
import { FighterState } from '../fighters/FighterState.js';
import { CollisionSystem } from '../combat/CollisionSystem.js';
import { CPUController } from '../ai/CPUController.js';
import { ArenaRenderer } from '../rendering/ArenaRenderer.js';
import { HUD } from '../rendering/HUD.js';
import { Effects } from '../rendering/Effects.js';
import { ResultScene } from './ResultScene.js';
import { PixelFont } from '../rendering/PixelFont.js';
import { FIGHTERS, FIGHTER_LIST } from '../data/FighterDefs.js';

const MatchPhase = {
    ROUND_INTRO: 'round_intro',
    FIGHTING: 'fighting',
    ROUND_END: 'round_end',
    MATCH_END: 'match_end',
};

const MOVE_LABELS = {
    light: 'L',
    heavy: 'H',
    special: 'SP',
    crouch_light: 'cL',
    crouch_heavy: 'cH',
    jump_attack: 'jL',
    jump_heavy: 'jH',
    uppercut: 'DP',
    overhead: 'OH',
    sweep: 'SW',
};

export class FightScene {
    constructor(game, p1Def, p2Def, arenaDef, mode) {
        this.game = game;
        this.p1Def = p1Def;
        this.p2Def = p2Def;
        this.arenaDef = arenaDef;
        this.mode = mode;

        this.arenaWidth = game.WIDTH;
        this.groundY = Math.floor(game.HEIGHT * arenaDef.groundY);

        this.p1 = new Fighter(p1Def, 100, 1, 1);
        this.p2 = new Fighter(p2Def, this.arenaWidth - 100, -1, 2);
        this.p1.groundY = this.groundY;
        this.p2.groundY = this.groundY;

        this.cpuController = mode === 'cpu' ? new CPUController(2) : null;

        this.effects = new Effects();
        this.phase = MatchPhase.ROUND_INTRO;
        this.phaseTimer = 0;
        this.roundTimer = 60;
        this.currentRound = 1;
        this.frameCount = 0;

        // Combo tracking
        this.p1ComboCount = 0;
        this.p2ComboCount = 0;
        this.p1ComboTimer = 0;
        this.p2ComboTimer = 0;

        this.introText = '';
        this.introTextTimer = 0;

        // Pause / combo list
        this.showComboList = false;
    }

    enter() {
        this._startRound();
    }

    exit() {}

    _startRound() {
        const startX1 = 100;
        const startX2 = this.arenaWidth - 100;
        this.p1.reset(startX1, 1);
        this.p2.reset(startX2, -1);
        this.p1.state = FighterState.INTRO;
        this.p2.state = FighterState.INTRO;
        this.p1.stateFrame = 0;
        this.p2.stateFrame = 0;
        this.roundTimer = 60;
        this.phase = MatchPhase.ROUND_INTRO;
        this.phaseTimer = 0;
        this.p1ComboCount = 0;
        this.p2ComboCount = 0;
        this.effects.clear();
        this.introText = `ROUND ${this.currentRound}`;
        this.introTextTimer = 0;
        this.game.audio.playRoundBell();
    }

    _emptyInput() {
        return { left: false, right: false, up: false, down: false, light: false, heavy: false, special: false, lightPressed: false, heavyPressed: false, specialPressed: false };
    }

    update() {
        this.frameCount++;

        // Toggle combo list
        if (this.game.input.wasPressed('Tab') || this.game.input.wasPressed('KeyC')) {
            this.showComboList = !this.showComboList;
        }

        if (this.showComboList) return; // Pause when viewing combos

        this.phaseTimer++;
        this.effects.update();

        switch (this.phase) {
            case MatchPhase.ROUND_INTRO:
                this._updateIntro();
                break;
            case MatchPhase.FIGHTING:
                this._updateFighting();
                break;
            case MatchPhase.ROUND_END:
                this._updateRoundEnd();
                break;
            case MatchPhase.MATCH_END:
                this._updateMatchEnd();
                break;
        }
    }

    _updateIntro() {
        this.introTextTimer++;

        if (this.introTextTimer === 30) {
            this.introText = 'FIGHT!';
        }

        if (this.introTextTimer >= 50) {
            this.phase = MatchPhase.FIGHTING;
            this.phaseTimer = 0;
            this.introText = '';
        }

        const empty = this._emptyInput();
        this.p1.update(empty, this.p2, this.frameCount, this.arenaWidth);
        this.p2.update(empty, this.p1, this.frameCount, this.arenaWidth);
    }

    _updateFighting() {
        // Timer
        this.roundTimer -= 1 / 60;
        if (this.roundTimer <= 0) {
            this.roundTimer = 0;
            this._endRound();
            return;
        }

        // Get inputs
        const p1Input = this.game.input.getPlayerInput(1);
        const p2Input = this.mode === 'versus'
            ? this.game.input.getPlayerInput(2)
            : this.cpuController.getInput(this.p2, this.p1);

        // Update fighters
        this.p1.update(p1Input, this.p2, this.frameCount, this.arenaWidth);
        this.p2.update(p2Input, this.p1, this.frameCount, this.arenaWidth);

        // Push apart
        CollisionSystem.pushApart(this.p1, this.p2);

        // Check hits: P1 attacking P2
        const hitP1onP2 = CollisionSystem.check(this.p1, this.p2);
        if (hitP1onP2) {
            this._resolveHit(this.p1, this.p2, hitP1onP2, true);
        }

        // Check hits: P2 attacking P1
        const hitP2onP1 = CollisionSystem.check(this.p2, this.p1);
        if (hitP2onP1) {
            this._resolveHit(this.p2, this.p1, hitP2onP1, false);
        }

        // Combo timer decay
        if (this.p1ComboTimer > 0) {
            this.p1ComboTimer--;
            if (this.p1ComboTimer <= 0) this.p1ComboCount = 0;
        }
        if (this.p2ComboTimer > 0) {
            this.p2ComboTimer--;
            if (this.p2ComboTimer <= 0) this.p2ComboCount = 0;
        }

        // Check KO
        if (this.p1.hp <= 0 || this.p2.hp <= 0) {
            this._endRound();
        }
    }

    _resolveHit(attacker, defender, hit, isP1Attacking) {
        attacker.hitThisAttack = true;
        const isBlocked = CollisionSystem.isBlocking(defender, attacker, hit);

        if (isBlocked) {
            defender.takeDamage(hit.damage, hit.knockback, hit.blockstun, true);
            this.game.audio.playBlock();
            this.effects.addBlockSpark(
                (attacker.x + defender.x) / 2,
                defender.y - defender.currentHeight * 0.6
            );
        } else {
            defender.takeDamage(hit.damage, hit.knockback, hit.hitstun, false);

            // Track combos
            if (isP1Attacking) {
                this.p1ComboCount++;
                this.p1ComboTimer = 45;
                defender.comboCount = this.p1ComboCount;
                attacker.lastMoveHit = hit.move;
            } else {
                this.p2ComboCount++;
                this.p2ComboTimer = 45;
                defender.comboCount = this.p2ComboCount;
                attacker.lastMoveHit = hit.move;
            }

            const hitType = hit.move === 'special' ? 'special' :
                           (hit.move === 'heavy' || hit.move === 'crouch_heavy' || hit.move === 'jump_heavy' || hit.move === 'uppercut' || hit.move === 'overhead') ? 'heavy' : 'light';
            this.game.audio.playHit(hitType);
            if (hitType === 'special') {
                this.game.audio.playSpecial();
            }

            this.effects.addHitSpark(
                (attacker.x + defender.x) / 2,
                defender.y - defender.currentHeight * 0.6,
                hitType
            );

            const comboCount = isP1Attacking ? this.p1ComboCount : this.p2ComboCount;
            if (comboCount >= 2) {
                this.effects.addComboText(
                    defender.x,
                    defender.y - defender.currentHeight,
                    comboCount
                );
            }

            // Screen shake on heavy hits
            if (hitType === 'heavy' || hitType === 'special') {
                this.effects.shake(hitType === 'special' ? 4 : 2, 6);
            }

            // KO flash
            if (defender.hp <= 0) {
                this.effects.flash('#FFF', 0.6);
                this.effects.shake(6, 12);
                this.game.audio.playKO();
            }

            // Knockdown from sweep
            if (hit.knockdown && defender.state === FighterState.HIT_STUN) {
                defender.state = FighterState.KNOCKDOWN;
                defender.stateFrame = 0;
                defender.vy = -3;
                defender.isGrounded = false;
            }

            // Launcher pops opponent up
            if (hit.launcher && defender.state === FighterState.HIT_STUN) {
                defender.vy = -7;
                defender.isGrounded = false;
            }
        }
    }

    _endRound() {
        this.phase = MatchPhase.ROUND_END;
        this.phaseTimer = 0;

        if (this.p1.hp <= 0 && this.p2.hp <= 0) {
            // Draw
        } else if (this.p2.hp <= 0) {
            this.p1.roundsWon++;
            this.p1.state = FighterState.WIN;
            if (this.p2.state !== FighterState.KO) {
                this.p2.state = FighterState.KO;
            }
        } else if (this.p1.hp <= 0) {
            this.p2.roundsWon++;
            this.p2.state = FighterState.WIN;
            if (this.p1.state !== FighterState.KO) {
                this.p1.state = FighterState.KO;
            }
        } else {
            if (this.p1.hp >= this.p2.hp) {
                this.p1.roundsWon++;
                this.p1.state = FighterState.WIN;
            } else {
                this.p2.roundsWon++;
                this.p2.state = FighterState.WIN;
            }
        }

        this.effects.addKOText(this.game.WIDTH / 2, this.game.HEIGHT / 2 - 20);
    }

    _updateRoundEnd() {
        const empty = this._emptyInput();
        this.p1.update(empty, this.p2, this.frameCount, this.arenaWidth);
        this.p2.update(empty, this.p1, this.frameCount, this.arenaWidth);

        if (this.phaseTimer >= 90) {
            if (this.p1.roundsWon >= 2 || this.p2.roundsWon >= 2) {
                this.phase = MatchPhase.MATCH_END;
                this.phaseTimer = 0;
                this.game.audio.playWin();
            } else {
                this.currentRound++;
                this._startRound();
            }
        }
    }

    _updateMatchEnd() {
        if (this.phaseTimer >= 60) {
            const winner = this.p1.roundsWon >= 2 ? this.p1 : this.p2;
            const winnerNum = winner === this.p1 ? 1 : 2;
            this.game.switchScene(new ResultScene(
                this.game, winner.def, winnerNum,
                this.p1Def, this.p2Def, this.arenaDef, this.mode,
                this.p1.roundsWon, this.p2.roundsWon
            ));
        }
    }

    render(ctx) {
        const w = this.game.WIDTH;
        const h = this.game.HEIGHT;

        // Apply screen shake
        const shake = this.effects.getShakeOffset();
        ctx.save();
        ctx.translate(Math.round(shake.x), Math.round(shake.y));

        // Draw arena
        ArenaRenderer.render(ctx, this.arenaDef, w, h, this.frameCount);

        // Draw fighters (back one first)
        const f1Behind = this.p1.y < this.p2.y;
        if (f1Behind) {
            this.p1.render(ctx, this.groundY);
            this.p2.render(ctx, this.groundY);
        } else {
            this.p2.render(ctx, this.groundY);
            this.p1.render(ctx, this.groundY);
        }

        ctx.restore();

        // Effects
        this.effects.render(ctx, w, h);

        // HUD
        HUD.render(ctx, this.p1, this.p2, this.roundTimer, this.currentRound, w, this.p1ComboCount, this.p2ComboCount);

        // Intro text
        if (this.introText) {
            const alpha = this.introText === 'FIGHT!' ? 1 : Math.min(1, this.introTextTimer / 10);
            ctx.globalAlpha = alpha;
            const scale = this.introText === 'FIGHT!' ? 3 : 2;
            PixelFont.draw(ctx, this.introText, w / 2, h / 2 - 12, {
                color: this.introText === 'FIGHT!' ? '#FF4400' : '#FFFFFF',
                scale,
                shadow: true,
                shadowColor: '#000',
            });
            ctx.globalAlpha = 1;
        }

        // Combo list hint
        if (this.phase === MatchPhase.FIGHTING) {
            PixelFont.draw(ctx, 'TAB: COMBOS', w / 2, h - 4, { color: '#555', scale: 1 });
        }

        // Combo list overlay
        if (this.showComboList) {
            this._renderComboList(ctx, w, h);
        }
    }

    _renderComboList(ctx, w, h) {
        // Darken background
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, w, h);

        PixelFont.draw(ctx, 'COMBO LIST', w / 2, 10, { color: '#FFCC00', scale: 2, shadow: true });

        // P1 combos on left, P2 combos on right
        const fighters = [this.p1Def, this.p2Def];
        const labels = ['P1', 'P2'];
        const xPositions = [w * 0.25, w * 0.75];

        for (let fi = 0; fi < 2; fi++) {
            const fighter = fighters[fi];
            const cx = xPositions[fi];

            PixelFont.draw(ctx, `${labels[fi]}: ${fighter.name}`, cx, 26, { color: '#FFF', scale: 1, shadow: true });

            const routes = fighter.comboRoutes;
            for (let i = 0; i < routes.length && i < 8; i++) {
                const route = routes[i];
                const ry = 38 + i * 14;

                // Combo name
                PixelFont.draw(ctx, route.name, cx, ry, { color: '#AAA', scale: 1, align: 'center' });

                // Combo inputs
                const inputStr = route.inputs.map(m => MOVE_LABELS[m] || m).join(' > ');
                PixelFont.draw(ctx, inputStr, cx, ry + 7, { color: '#FFCC00', scale: 1, align: 'center' });
            }
        }

        // Move legend at bottom
        const legendY = h - 30;
        PixelFont.draw(ctx, 'MOVE LEGEND', w / 2, legendY, { color: '#888', scale: 1 });
        PixelFont.draw(ctx, 'L=LIGHT  H=HEAVY  SP=SPECIAL  DP=UPPERCUT', w / 2, legendY + 8, { color: '#666', scale: 1 });
        PixelFont.draw(ctx, 'OH=OVERHEAD  SW=SWEEP  CL/CH=CROUCH  JL/JH=JUMP', w / 2, legendY + 16, { color: '#666', scale: 1 });

        PixelFont.draw(ctx, 'PRESS TAB TO CLOSE', w / 2, h - 6, { color: '#555', scale: 1 });
    }
}
