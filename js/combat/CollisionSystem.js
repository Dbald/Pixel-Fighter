import { FighterState } from '../fighters/FighterState.js';

export class CollisionSystem {
    static testAABB(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    static check(attacker, defender) {
        const hitbox = attacker.getHitbox();
        if (!hitbox) return null;

        const hurtbox = defender.getHurtbox();
        if (!this.testAABB(hitbox, hurtbox)) return null;

        return hitbox;
    }

    static isBlocking(defender, attacker, hit) {
        const { state } = defender;
        const isStandBlock = state === FighterState.BLOCK_STAND;
        const isCrouchBlock = state === FighterState.BLOCK_CROUCH;

        if (!isStandBlock && !isCrouchBlock) return false;

        // Low attacks can't be blocked standing
        if (hit && hit.low && isStandBlock) return false;
        // Overhead attacks can't be blocked crouching
        if (hit && hit.overhead && isCrouchBlock) return false;

        return true;
    }

    static pushApart(f1, f2, minDist = 20) {
        const dist = Math.abs(f1.x - f2.x);
        if (dist < minDist) {
            const overlap = minDist - dist;
            const push = overlap / 2;
            if (f1.x < f2.x) {
                f1.x -= push;
                f2.x += push;
            } else {
                f1.x += push;
                f2.x -= push;
            }
        }
    }
}
