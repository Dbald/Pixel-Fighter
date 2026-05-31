import { TouchController } from './TouchController.js';

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
            // Numpad (right side, num lock on)
            'Numpad1': 'light',
            'Numpad2': 'heavy',
            'Numpad3': 'special',
            // Number row fallback
            'Digit7': 'light',
            'Digit8': 'heavy',
            'Digit9': 'special',
            // Right-hand letter keys (J/K/L) - easiest to reach
            'KeyJ': 'light',
            'KeyK': 'heavy',
            'KeyL': 'special',
        };

        // Touch controller for mobile/tablet
        this.touch = new TouchController();

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
        // Map touch buttons to keyboard equivalents
        if (code === 'Enter' || code === 'Space') {
            if (this.touch.wasStartPressed()) return true;
            // Also allow light touch button to confirm menus
            if (this.touch.justPressedState.light) return true;
        }
        if (code === 'Tab' || code === 'KeyC') {
            if (this.touch.wasTabPressed()) return true;
        }
        // D-pad maps for menu navigation
        if (code === 'KeyW' || code === 'ArrowUp') {
            if (this.touch.justPressedState.up) return true;
        }
        if (code === 'KeyS' || code === 'ArrowDown') {
            if (this.touch.justPressedState.down) return true;
        }
        if (code === 'KeyA' || code === 'ArrowLeft') {
            if (this.touch.justPressedState.left) return true;
        }
        if (code === 'KeyD' || code === 'ArrowRight') {
            if (this.touch.justPressedState.right) return true;
        }
        // Confirm actions
        if (code === 'KeyF' || code === 'KeyG') {
            if (this.touch.wasStartPressed() || this.touch.justPressedState.light) return true;
        }
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

        // Merge touch input for Player 1 (touch controls always map to P1)
        if (player === 1 && this.touch.isTouchDevice) {
            const touchInput = this.touch.getInput();
            input.left = input.left || touchInput.left;
            input.right = input.right || touchInput.right;
            input.up = input.up || touchInput.up;
            input.down = input.down || touchInput.down;
            input.light = input.light || touchInput.light;
            input.heavy = input.heavy || touchInput.heavy;
            input.special = input.special || touchInput.special;
            input.lightPressed = input.lightPressed || touchInput.lightPressed;
            input.heavyPressed = input.heavyPressed || touchInput.heavyPressed;
            input.specialPressed = input.specialPressed || touchInput.specialPressed;
        }

        return input;
    }

    postUpdate() {
        this.justPressed = {};
        this.justReleased = {};
        this.touch.postUpdate();
    }

    anyKeyPressed() {
        if (this.touch.wasAnyPressed()) return true;
        return Object.keys(this.justPressed).length > 0;
    }

    getLastPressedCode() {
        const codes = Object.keys(this.justPressed);
        return codes.length > 0 ? codes[0] : null;
    }
}
