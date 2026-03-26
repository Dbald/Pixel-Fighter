import { FighterState, LOCKED_STATES, ATTACK_STATES, ATTACK_TO_MOVE } from './FighterState.js';

export class Fighter {
    constructor(def, x, facing, playerNum) {
        this.def = def;
        this.playerNum = playerNum;
        this.x = x;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.facing = facing; // 1 = right, -1 = left
        this.hp = def.hp;
        this.maxHp = def.hp;
        this.state = FighterState.IDLE;
        this.stateFrame = 0;
        this.comboCount = 0;
        this.comboTimer = 0;
        this.lastMoveHit = null;
        this.hitThisAttack = false;
        this.groundY = 0;
        this.isGrounded = true;

        // Animation
        this.animFrame = 0;
        this.animTimer = 0;

        // Input buffer for combos
        this.inputBuffer = [];
        this.inputBufferWindow = 10; // frames

        // Width/height for collision
        this.width = 24;
        this.height = 40;
        this.crouchHeight = 28;

        // Rounds won
        this.roundsWon = 0;

        // Hit flash
        this.hitFlash = 0;
        this.blockFlash = 0;
    }

    get currentHeight() {
        return (this.state === FighterState.CROUCH ||
                this.state === FighterState.BLOCK_CROUCH ||
                this.state === FighterState.CROUCH_LIGHT)
            ? this.crouchHeight : this.height;
    }

    get isAttacking() {
        return ATTACK_STATES.includes(this.state);
    }

    get isLocked() {
        return LOCKED_STATES.includes(this.state);
    }

    get currentMoveName() {
        return ATTACK_TO_MOVE[this.state] || null;
    }

    get currentMoveData() {
        const moveName = this.currentMoveName;
        return moveName ? this.def.moves[moveName] : null;
    }

    get isInActiveFrames() {
        const move = this.currentMoveData;
        if (!move) return false;
        return this.stateFrame >= move.startup && this.stateFrame < move.startup + move.active;
    }

    getHitbox() {
        if (!this.isAttacking || !this.isInActiveFrames || this.hitThisAttack) return null;
        const move = this.currentMoveData;
        const hbX = this.x + (this.facing * 10);
        const hbY = this.y - this.currentHeight * 0.6;
        return {
            x: this.facing === 1 ? hbX : hbX - move.range,
            y: hbY,
            width: move.range,
            height: 16,
            move: this.currentMoveName,
            damage: move.damage,
            hitstun: move.hitstun,
            blockstun: move.blockstun,
            knockback: move.knockback,
            type: move.type || 'normal',
        };
    }

    getHurtbox() {
        const h = this.currentHeight;
        return {
            x: this.x - this.width / 2,
            y: this.y - h,
            width: this.width,
            height: h,
        };
    }

    reset(x, facing) {
        this.x = x;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.facing = facing;
        this.hp = this.maxHp;
        this.state = FighterState.IDLE;
        this.stateFrame = 0;
        this.comboCount = 0;
        this.comboTimer = 0;
        this.lastMoveHit = null;
        this.hitThisAttack = false;
        this.inputBuffer = [];
        this.hitFlash = 0;
        this.blockFlash = 0;
        this.isGrounded = true;
    }

    bufferInput(action, frame) {
        this.inputBuffer.push({ action, frame });
        if (this.inputBuffer.length > 12) {
            this.inputBuffer.shift();
        }
    }

    getBufferedAction(currentFrame) {
        for (let i = this.inputBuffer.length - 1; i >= 0; i--) {
            const entry = this.inputBuffer[i];
            if (currentFrame - entry.frame <= this.inputBufferWindow) {
                return entry.action;
            }
        }
        return null;
    }

    canCancelInto(nextMove) {
        const currentMove = this.currentMoveName;
        if (!currentMove) return false;
        const cancels = this.def.comboCancels[currentMove];
        return cancels && cancels.includes(nextMove);
    }

    takeDamage(amount, knockback, stunFrames, isBlocked) {
        if (isBlocked) {
            this.hp -= Math.floor(amount * 0.15); // chip damage
            this.blockFlash = 6;
            this.state = this.state === FighterState.CROUCH || this.state === FighterState.BLOCK_CROUCH
                ? FighterState.BLOCK_CROUCH : FighterState.BLOCK_STAND;
            this.stateFrame = 0;
            this.vx = -this.facing * knockback * 0.5;
            this._blockStunFrames = stunFrames;
        } else {
            // Combo damage scaling
            const scaling = Math.pow(0.85, this.comboCount);
            const scaledDamage = Math.floor(amount * scaling);
            this.hp -= scaledDamage;
            this.hitFlash = 6;
            this.vx = -this.facing * knockback;

            if (this.hp <= 0) {
                this.hp = 0;
                this.state = FighterState.KO;
                this.stateFrame = 0;
                this.vy = -6;
                this.vx = -this.facing * 4;
                return;
            }

            this.state = FighterState.HIT_STUN;
            this.stateFrame = 0;
            this._hitStunFrames = stunFrames;
        }
    }

    update(input, opponent, frameCount, arenaWidth) {
        this.stateFrame++;
        this.animTimer++;

        if (this.hitFlash > 0) this.hitFlash--;
        if (this.blockFlash > 0) this.blockFlash--;

        // Combo timer decay
        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer <= 0) {
                this.comboCount = 0;
            }
        }

        // Apply gravity
        if (!this.isGrounded) {
            this.vy += this.def.gravity;
            this.y += this.vy;
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.vy = 0;
                this.isGrounded = true;
                if (this.state === FighterState.JUMP || this.state === FighterState.JUMP_ATTACK) {
                    this.state = FighterState.IDLE;
                    this.stateFrame = 0;
                }
            }
        }

        // Apply horizontal velocity with friction
        this.x += this.vx;
        this.vx *= 0.85;

        // Arena bounds
        const margin = 12;
        if (this.x < margin) this.x = margin;
        if (this.x > arenaWidth - margin) this.x = arenaWidth - margin;

        // Face opponent
        if (!this.isLocked && this.state !== FighterState.BLOCK_STAND && this.state !== FighterState.BLOCK_CROUCH) {
            if (opponent) {
                this.facing = opponent.x > this.x ? 1 : -1;
            }
        }

        // State machine
        switch (this.state) {
            case FighterState.IDLE:
            case FighterState.WALK_FWD:
            case FighterState.WALK_BACK:
                this._handleMovement(input, opponent);
                this._handleAttackInput(input, frameCount);
                break;

            case FighterState.CROUCH:
                if (!input.down) {
                    this.state = FighterState.IDLE;
                    this.stateFrame = 0;
                } else {
                    this._handleCrouchAttack(input, frameCount);
                    // Check for crouch block
                    if (this._isHoldingBack(input, opponent)) {
                        this.state = FighterState.BLOCK_CROUCH;
                        this.stateFrame = 0;
                    }
                }
                break;

            case FighterState.JUMP:
                this._handleJumpAttack(input, frameCount);
                break;

            case FighterState.LIGHT_ATTACK:
            case FighterState.HEAVY_ATTACK:
            case FighterState.SPECIAL:
            case FighterState.CROUCH_LIGHT:
            case FighterState.JUMP_ATTACK:
                this._handleAttackState(input, frameCount);
                break;

            case FighterState.BLOCK_STAND:
                if (this.stateFrame >= (this._blockStunFrames || 8)) {
                    this.state = FighterState.IDLE;
                    this.stateFrame = 0;
                } else if (!this._isHoldingBack(input, opponent)) {
                    if (this.stateFrame >= 4) {
                        this.state = FighterState.IDLE;
                        this.stateFrame = 0;
                    }
                }
                break;

            case FighterState.BLOCK_CROUCH:
                if (this.stateFrame >= (this._blockStunFrames || 8)) {
                    this.state = input.down ? FighterState.CROUCH : FighterState.IDLE;
                    this.stateFrame = 0;
                } else if (!this._isHoldingBack(input, opponent) && !input.down) {
                    if (this.stateFrame >= 4) {
                        this.state = FighterState.IDLE;
                        this.stateFrame = 0;
                    }
                }
                break;

            case FighterState.HIT_STUN:
                if (this.stateFrame >= (this._hitStunFrames || 12)) {
                    this.state = this.isGrounded ? FighterState.IDLE : FighterState.JUMP;
                    this.stateFrame = 0;
                }
                break;

            case FighterState.KNOCKDOWN:
                if (this.stateFrame >= 30 && this.isGrounded) {
                    this.state = FighterState.IDLE;
                    this.stateFrame = 0;
                }
                break;

            case FighterState.KO:
                // Stay in KO
                break;

            case FighterState.WIN:
                // Stay in WIN
                break;

            case FighterState.INTRO:
                if (this.stateFrame >= 30) {
                    this.state = FighterState.IDLE;
                    this.stateFrame = 0;
                }
                break;
        }
    }

    _isHoldingBack(input, opponent) {
        if (!opponent) return false;
        const isFacingRight = opponent.x > this.x;
        return isFacingRight ? input.left : input.right;
    }

    _handleMovement(input, opponent) {
        if (input.up && this.isGrounded) {
            this.state = FighterState.JUMP;
            this.stateFrame = 0;
            this.vy = this.def.jumpForce;
            this.isGrounded = false;
            if (input.left) this.vx = -this.def.speed * 0.7;
            if (input.right) this.vx = this.def.speed * 0.7;
            return;
        }

        if (input.down) {
            this.state = FighterState.CROUCH;
            this.stateFrame = 0;
            return;
        }

        // Block check
        if (this._isHoldingBack(input, opponent)) {
            this.state = FighterState.BLOCK_STAND;
            this.stateFrame = 0;
            return;
        }

        if (input.left) {
            this.x -= this.def.speed;
            this.state = this.facing === -1 ? FighterState.WALK_FWD : FighterState.WALK_BACK;
        } else if (input.right) {
            this.x += this.def.speed;
            this.state = this.facing === 1 ? FighterState.WALK_FWD : FighterState.WALK_BACK;
        } else {
            this.state = FighterState.IDLE;
        }
    }

    _handleAttackInput(input, frameCount) {
        if (input.specialPressed) {
            this.state = FighterState.SPECIAL;
            this.stateFrame = 0;
            this.hitThisAttack = false;
            return;
        }
        if (input.heavyPressed) {
            this.state = FighterState.HEAVY_ATTACK;
            this.stateFrame = 0;
            this.hitThisAttack = false;
            return;
        }
        if (input.lightPressed) {
            this.state = FighterState.LIGHT_ATTACK;
            this.stateFrame = 0;
            this.hitThisAttack = false;
            return;
        }
    }

    _handleCrouchAttack(input, frameCount) {
        if (input.lightPressed || input.heavyPressed) {
            this.state = FighterState.CROUCH_LIGHT;
            this.stateFrame = 0;
            this.hitThisAttack = false;
        }
    }

    _handleJumpAttack(input, frameCount) {
        if ((input.lightPressed || input.heavyPressed) && this.state !== FighterState.JUMP_ATTACK) {
            this.state = FighterState.JUMP_ATTACK;
            this.stateFrame = 0;
            this.hitThisAttack = false;
        }
    }

    _handleAttackState(input, frameCount) {
        const move = this.currentMoveData;
        if (!move) {
            this.state = FighterState.IDLE;
            this.stateFrame = 0;
            return;
        }

        const totalFrames = move.startup + move.active + move.recovery;

        // Buffer inputs during attack for combo
        if (input.lightPressed) this.bufferInput('light', frameCount);
        if (input.heavyPressed) this.bufferInput('heavy', frameCount);
        if (input.specialPressed) this.bufferInput('special', frameCount);

        // Check for cancel on hit during active or early recovery
        if (this.hitThisAttack && this.stateFrame >= move.startup + move.active - 2) {
            const buffered = this.getBufferedAction(frameCount);
            if (buffered && this.canCancelInto(buffered)) {
                const stateMap = {
                    light: FighterState.LIGHT_ATTACK,
                    heavy: FighterState.HEAVY_ATTACK,
                    special: FighterState.SPECIAL,
                };
                if (stateMap[buffered]) {
                    this.state = stateMap[buffered];
                    this.stateFrame = 0;
                    this.hitThisAttack = false;
                    this.inputBuffer = [];
                    return;
                }
            }
        }

        // Move forward during special attacks
        if (this.state === FighterState.SPECIAL && move.type === 'rush_punch') {
            if (this.stateFrame >= move.startup && this.stateFrame < move.startup + move.active) {
                this.x += this.facing * 4;
            }
        }

        if (this.stateFrame >= totalFrames) {
            if (!this.isGrounded) {
                this.state = FighterState.JUMP;
            } else {
                this.state = FighterState.IDLE;
            }
            this.stateFrame = 0;
        }
    }

    render(ctx, groundY) {
        this.groundY = groundY;
        const renderY = this.isGrounded ? groundY : groundY + (this.y - this.groundY);
        const drawX = Math.round(this.x);
        const drawY = Math.round(renderY);

        // Hit flash effect
        if (this.hitFlash > 0 && this.hitFlash % 2 === 0) {
            ctx.globalAlpha = 0.6;
        }

        this._drawFighter(ctx, drawX, drawY);

        ctx.globalAlpha = 1;
    }

    _drawFighter(ctx, x, y) {
        const p = this.def.palette;
        const f = this.facing;
        const s = this.state;

        // Body dimensions
        let headY = y - this.height;
        let bodyY = y - this.height + 10;
        let legY = y - 14;
        let armOffsetX = 0;
        let armOffsetY = 0;
        let legSpread = 0;
        let crouching = false;
        let attackExtend = 0;

        switch (s) {
            case FighterState.WALK_FWD:
            case FighterState.WALK_BACK:
                legSpread = Math.sin(this.animTimer * 0.3) * 4;
                break;
            case FighterState.CROUCH:
            case FighterState.BLOCK_CROUCH:
            case FighterState.CROUCH_LIGHT:
                crouching = true;
                headY += 12;
                bodyY += 10;
                break;
            case FighterState.JUMP:
            case FighterState.JUMP_ATTACK:
                legSpread = 3;
                break;
            case FighterState.LIGHT_ATTACK:
                attackExtend = this.stateFrame < 6 ? Math.min(this.stateFrame * 3, 12) : Math.max(0, 12 - (this.stateFrame - 6) * 3);
                break;
            case FighterState.HEAVY_ATTACK:
                attackExtend = this.stateFrame < 10 ? Math.min(this.stateFrame * 2, 16) : Math.max(0, 16 - (this.stateFrame - 10) * 2);
                break;
            case FighterState.SPECIAL:
                attackExtend = this.stateFrame < 12 ? Math.min(this.stateFrame * 2, 18) : Math.max(0, 18 - (this.stateFrame - 12) * 2);
                break;
            case FighterState.HIT_STUN:
                headY += 2;
                bodyY += 1;
                break;
            case FighterState.KO:
                this._drawKO(ctx, x, y, p);
                return;
            case FighterState.WIN:
                armOffsetY = -4;
                break;
            case FighterState.BLOCK_STAND:
                armOffsetX = -f * 3;
                break;
        }

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x - 8, y - 2, 16, 3);

        // Legs
        ctx.fillStyle = p.outfit;
        if (crouching) {
            ctx.fillRect(x - 5, legY + 6, 10, 8);
        } else {
            ctx.fillRect(x - 4 - legSpread, legY, 4, 14);
            ctx.fillRect(x + legSpread, legY, 4, 14);
        }

        // Shoes
        ctx.fillStyle = p.shoes;
        if (crouching) {
            ctx.fillRect(x - 6, y - 4, 12, 4);
        } else {
            ctx.fillRect(x - 5 - legSpread, y - 4, 5, 4);
            ctx.fillRect(x + legSpread, y - 4, 5, 4);
        }

        // Body
        ctx.fillStyle = p.outfit;
        const bY = crouching ? bodyY : bodyY;
        ctx.fillRect(x - 6, bY, 12, 16);

        // Belt
        ctx.fillStyle = p.belt;
        ctx.fillRect(x - 6, bY + 12, 12, 2);

        // Accent stripe
        ctx.fillStyle = p.accent;
        ctx.fillRect(x - 6, bY, 12, 2);

        // Arms
        ctx.fillStyle = p.skin;
        // Back arm
        ctx.fillRect(x - 8 * f + armOffsetX, bY + 2 + armOffsetY, 4, 10);
        // Front arm (attack arm)
        if (attackExtend > 0) {
            const armX = x + f * 6;
            const armEndX = armX + f * attackExtend;
            const minX = Math.min(armX, armEndX);
            const armW = Math.abs(attackExtend) + 4;
            ctx.fillRect(minX, bY + 2, armW, 4);
            // Fist
            ctx.fillRect(x + f * (6 + attackExtend), bY + 1, 5, 6);
            // Special move glow
            if (s === FighterState.SPECIAL) {
                ctx.fillStyle = p.accent;
                ctx.globalAlpha = 0.6 + Math.sin(this.stateFrame * 0.5) * 0.3;
                ctx.fillRect(x + f * (8 + attackExtend), bY - 1, 7, 8);
                ctx.globalAlpha = 1;
            }
        } else {
            ctx.fillRect(x + 5 * f + armOffsetX, bY + 2 + armOffsetY, 4, 10);
        }

        // Head
        ctx.fillStyle = p.skin;
        ctx.fillRect(x - 4, headY, 8, 8);

        // Hair
        ctx.fillStyle = p.hair;
        ctx.fillRect(x - 5, headY - 2, 10, 4);
        ctx.fillRect(x - 5 - f * 1, headY - 2, 3, 6);

        // Eyes
        ctx.fillStyle = '#FFF';
        ctx.fillRect(x + f * 1, headY + 3, 3, 2);
        ctx.fillStyle = '#000';
        ctx.fillRect(x + f * 2, headY + 3, 2, 2);

        // Block effect
        if (this.blockFlash > 0) {
            ctx.fillStyle = 'rgba(100,200,255,0.4)';
            ctx.fillRect(x - 10, headY - 4, 20, this.currentHeight + 4);
        }

        // Win pose - raised arms
        if (s === FighterState.WIN) {
            ctx.fillStyle = p.skin;
            ctx.fillRect(x - 8, headY - 8, 4, 8);
            ctx.fillRect(x + 4, headY - 8, 4, 8);
        }
    }

    _drawKO(ctx, x, y, p) {
        // Lying down
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x - 16, y - 4, 32, 3);

        ctx.fillStyle = p.outfit;
        ctx.fillRect(x - 14, y - 10, 28, 8);
        ctx.fillStyle = p.skin;
        ctx.fillRect(x + 14 * this.facing, y - 12, 8, 8);
        ctx.fillStyle = p.hair;
        ctx.fillRect(x + 14 * this.facing, y - 14, 8, 3);
        ctx.fillStyle = p.shoes;
        ctx.fillRect(x - 16 * this.facing, y - 8, 6, 4);
    }
}
