export class TouchController {
    constructor() {
        this.state = {
            left: false,
            right: false,
            up: false,
            down: false,
            light: false,
            heavy: false,
            special: false,
            start: false,
            tab: false,
        };

        this.justPressedState = {
            left: false,
            right: false,
            up: false,
            down: false,
            light: false,
            heavy: false,
            special: false,
            start: false,
            tab: false,
        };

        this.isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
        this._activeTouches = new Map();

        if (this.isTouchDevice) {
            this._bindEvents();
        }
    }

    _bindEvents() {
        const opts = { passive: false };

        // D-pad buttons
        const dpadBtns = document.querySelectorAll('.dpad-btn');
        dpadBtns.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const dir = btn.dataset.dir;
                this._press(dir);
                btn.classList.add('active');
            }, opts);

            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                const dir = btn.dataset.dir;
                this._release(dir);
                btn.classList.remove('active');
            }, opts);

            btn.addEventListener('touchcancel', (e) => {
                const dir = btn.dataset.dir;
                this._release(dir);
                btn.classList.remove('active');
            }, opts);
        });

        // Action buttons
        const actionBtns = document.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                this._press(action);
                btn.classList.add('active');
            }, opts);

            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                this._release(action);
                btn.classList.remove('active');
            }, opts);

            btn.addEventListener('touchcancel', (e) => {
                const action = btn.dataset.action;
                this._release(action);
                btn.classList.remove('active');
            }, opts);
        });

        // Menu buttons
        const menuBtns = document.querySelectorAll('.menu-btn');
        menuBtns.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                this._press(action);
                btn.classList.add('active');
            }, opts);

            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                this._release(action);
                btn.classList.remove('active');
            }, opts);

            btn.addEventListener('touchcancel', (e) => {
                const action = btn.dataset.action;
                this._release(action);
                btn.classList.remove('active');
            }, opts);
        });

        // Prevent default on the canvas to stop scrolling/zooming
        const canvas = document.getElementById('gameCanvas');
        canvas.addEventListener('touchstart', (e) => e.preventDefault(), opts);
        canvas.addEventListener('touchmove', (e) => e.preventDefault(), opts);

        // Prevent context menu on long press
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    _press(action) {
        if (!this.state[action]) {
            this.justPressedState[action] = true;
        }
        this.state[action] = true;
    }

    _release(action) {
        this.state[action] = false;
    }

    getInput() {
        return {
            left: this.state.left,
            right: this.state.right,
            up: this.state.up,
            down: this.state.down,
            light: this.state.light,
            heavy: this.state.heavy,
            special: this.state.special,
            lightPressed: this.justPressedState.light,
            heavyPressed: this.justPressedState.heavy,
            specialPressed: this.justPressedState.special,
        };
    }

    wasStartPressed() {
        return this.justPressedState.start;
    }

    wasTabPressed() {
        return this.justPressedState.tab;
    }

    wasAnyPressed() {
        return Object.values(this.justPressedState).some(v => v);
    }

    postUpdate() {
        for (const key of Object.keys(this.justPressedState)) {
            this.justPressedState[key] = false;
        }
    }
}
