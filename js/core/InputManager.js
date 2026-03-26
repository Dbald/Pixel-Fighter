export class InputManager {
    constructor() {
        this.keys = {};
        this.justPressed = {};
        this.justReleased = {};

        this.p1Map = {
            'KeyA': 'left',
            'KeyD': 'right',
            'KeyW': 'up',
            'KeyS': 'down',
            'KeyF': 'light',
            'KeyG': 'heavy',
            'KeyH': 'special',
        };

        this.p2Map = {
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'Numpad1': 'light',
            'Numpad2': 'heavy',
            'Numpad3': 'special',
            'Digit7': 'light',
            'Digit8': 'heavy',
            'Digit9': 'special',
        };

        window.addEventListener('keydown', (e) => {
            if (!this.keys[e.code]) {
                this.justPressed[e.code] = true;
            }
            this.keys[e.code] = true;
            e.preventDefault();
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.justReleased[e.code] = true;
            e.preventDefault();
        });
    }

    isDown(code) {
        return !!this.keys[code];
    }

    wasPressed(code) {
        return !!this.justPressed[code];
    }

    getPlayerInput(player) {
        const map = player === 1 ? this.p1Map : this.p2Map;
        const input = {
            left: false,
            right: false,
            up: false,
            down: false,
            light: false,
            heavy: false,
            special: false,
            lightPressed: false,
            heavyPressed: false,
            specialPressed: false,
        };

        for (const [code, action] of Object.entries(map)) {
            if (this.keys[code]) {
                input[action] = true;
            }
            if (this.justPressed[code]) {
                input[action + 'Pressed'] = true;
            }
        }

        return input;
    }

    postUpdate() {
        this.justPressed = {};
        this.justReleased = {};
    }

    anyKeyPressed() {
        return Object.keys(this.justPressed).length > 0;
    }

    getLastPressedCode() {
        const codes = Object.keys(this.justPressed);
        return codes.length > 0 ? codes[0] : null;
    }
}
