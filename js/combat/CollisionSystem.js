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

    static isBlocking(defender, attacker) {
        const { state } = defender;
        if (state === 'block_stand' || state === 'block_crouch') return true;
        return false;
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
