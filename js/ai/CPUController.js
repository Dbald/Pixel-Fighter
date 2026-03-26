import { FighterState, ATTACK_STATES } from '../fighters/FighterState.js';

export class CPUController {
    constructor(difficulty = 2) {
        this.difficulty = difficulty; // 1=easy, 2=normal, 3=hard
        this.decisionTimer = 0;
        this.currentDecision = null;

        this.decisionInterval = difficulty === 1 ? 30 : difficulty === 2 ? 15 : 8;
        this.aggressiveness = difficulty === 1 ? 0.3 : difficulty === 2 ? 0.5 : 0.7;
        this.blockReaction = difficulty === 1 ? 0 : difficulty === 2 ? 0.3 : 0.7;
        this.comboChance = difficulty === 1 ? 0.1 : difficulty === 2 ? 0.35 : 0.6;
    }

    getInput(cpu, opponent) {
        this.decisionTimer--;

        const input = {
            left: false, right: false, up: false, down: false,
            light: false, heavy: false, special: false,
            lightPressed: false, heavyPressed: false, specialPressed: false,
        };

        if (cpu.state === FighterState.KO || cpu.state === FighterState.WIN) return input;

        const dist = Math.abs(cpu.x - opponent.x);

        // React to opponent attacks with blocking
        if (ATTACK_STATES.includes(opponent.state) && dist < 50 && Math.random() < this.blockReaction) {
            if (opponent.x > cpu.x) {
                input.left = true;
            } else {
                input.right = true;
            }
            if (Math.random() < 0.3) {
                input.down = true;
            }
            return input;
        }

        if (this.decisionTimer > 0 && this.currentDecision) {
            return this._executeDecision(this.currentDecision, cpu, opponent, input);
        }

        this.decisionTimer = this.decisionInterval + Math.floor(Math.random() * 10);
        this.currentDecision = this._decide(cpu, opponent, dist);

        return this._executeDecision(this.currentDecision, cpu, opponent, input);
    }

    _decide(cpu, opponent, dist) {
        // Close range
        if (dist < 40) {
            const roll = Math.random();
            if (roll < this.aggressiveness) {
                const atkRoll = Math.random();
                if (atkRoll < 0.25) return 'light_attack';
                if (atkRoll < 0.4) return 'heavy_attack';
                if (atkRoll < 0.55) return 'special_attack';
                if (atkRoll < 0.65) return 'uppercut';
                if (atkRoll < 0.75) return 'overhead';
                if (atkRoll < 0.85) return 'sweep';
                return 'combo_attempt';
            }
            if (roll < this.aggressiveness + 0.2) return 'block';
            return 'back_off';
        }

        // Mid range
        if (dist < 80) {
            const roll = Math.random();
            if (roll < this.aggressiveness * 0.8) return 'approach';
            if (roll < this.aggressiveness) return 'special_attack';
            if (roll < 0.7) return 'approach';
            return 'wait';
        }

        // Far range
        const roll = Math.random();
        if (roll < 0.6) return 'approach';
        if (roll < 0.8) return 'jump_in';
        return 'wait';
    }

    _executeDecision(decision, cpu, opponent, input) {
        const moveToward = opponent.x > cpu.x ? 'right' : 'left';
        const moveAway = opponent.x > cpu.x ? 'left' : 'right';

        switch (decision) {
            case 'approach':
                input[moveToward] = true;
                break;

            case 'back_off':
                input[moveAway] = true;
                break;

            case 'jump_in':
                input.up = true;
                input[moveToward] = true;
                if (Math.abs(cpu.x - opponent.x) < 50 && !cpu.isGrounded) {
                    if (Math.random() < 0.5) {
                        input.lightPressed = true;
                    } else {
                        input.heavyPressed = true;
                    }
                }
                break;

            case 'light_attack':
                if (!cpu.isLocked) {
                    input.lightPressed = true;
                }
                break;

            case 'heavy_attack':
                if (!cpu.isLocked) {
                    input.heavyPressed = true;
                }
                break;

            case 'special_attack':
                if (!cpu.isLocked) {
                    input.specialPressed = true;
                }
                break;

            case 'uppercut':
                if (!cpu.isLocked) {
                    input.heavyPressed = true;
                    input.down = true;
                }
                break;

            case 'overhead':
                if (!cpu.isLocked) {
                    input.heavyPressed = true;
                    input[moveToward] = true;
                }
                break;

            case 'sweep':
                if (!cpu.isLocked) {
                    input.down = true;
                    input.specialPressed = true;
                }
                break;

            case 'combo_attempt':
                if (!cpu.isLocked) {
                    input.lightPressed = true;
                    if (cpu.isAttacking && cpu.hitThisAttack && Math.random() < this.comboChance) {
                        const moves = ['lightPressed', 'heavyPressed', 'specialPressed'];
                        input[moves[Math.floor(Math.random() * moves.length)]] = true;
                    }
                }
                break;

            case 'block':
                input[moveAway] = true;
                break;

            case 'wait':
                break;
        }

        return input;
    }
}
