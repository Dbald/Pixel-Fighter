export const FighterState = {
    IDLE: 'idle',
    WALK_FWD: 'walk_fwd',
    WALK_BACK: 'walk_back',
    JUMP: 'jump',
    CROUCH: 'crouch',
    LIGHT_ATTACK: 'light_attack',
    HEAVY_ATTACK: 'heavy_attack',
    SPECIAL: 'special',
    CROUCH_LIGHT: 'crouch_light',
    JUMP_ATTACK: 'jump_attack',
    BLOCK_STAND: 'block_stand',
    BLOCK_CROUCH: 'block_crouch',
    HIT_STUN: 'hit_stun',
    KNOCKDOWN: 'knockdown',
    KO: 'ko',
    WIN: 'win',
    INTRO: 'intro',
};

// States where the fighter can't act
export const LOCKED_STATES = [
    FighterState.LIGHT_ATTACK,
    FighterState.HEAVY_ATTACK,
    FighterState.SPECIAL,
    FighterState.CROUCH_LIGHT,
    FighterState.JUMP_ATTACK,
    FighterState.HIT_STUN,
    FighterState.KNOCKDOWN,
    FighterState.KO,
    FighterState.WIN,
    FighterState.INTRO,
];

// States where the fighter is attacking
export const ATTACK_STATES = [
    FighterState.LIGHT_ATTACK,
    FighterState.HEAVY_ATTACK,
    FighterState.SPECIAL,
    FighterState.CROUCH_LIGHT,
    FighterState.JUMP_ATTACK,
];

// Map attack states to move names
export const ATTACK_TO_MOVE = {
    [FighterState.LIGHT_ATTACK]: 'light',
    [FighterState.HEAVY_ATTACK]: 'heavy',
    [FighterState.SPECIAL]: 'special',
    [FighterState.CROUCH_LIGHT]: 'crouch_light',
    [FighterState.JUMP_ATTACK]: 'jump_attack',
};
