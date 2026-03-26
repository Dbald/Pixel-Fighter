import { InputManager } from './InputManager.js';
import { AudioManager } from './AudioManager.js';
import { Renderer } from '../rendering/Renderer.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Internal resolution for pixel art
        this.WIDTH = 384;
        this.HEIGHT = 216;
        this.canvas.width = this.WIDTH;
        this.canvas.height = this.HEIGHT;

        this.input = new InputManager();
        this.audio = new AudioManager();
        this.renderer = new Renderer(this.ctx, this.WIDTH, this.HEIGHT);

        this.currentScene = null;
        this.running = false;

        // Fixed timestep
        this.TICK_RATE = 1000 / 60;
        this.lastTime = 0;
        this.accumulator = 0;

        this._resizeCanvas();
        window.addEventListener('resize', () => this._resizeCanvas());
    }

    _resizeCanvas() {
        const scaleX = window.innerWidth / this.WIDTH;
        const scaleY = window.innerHeight / this.HEIGHT;
        const scale = Math.floor(Math.min(scaleX, scaleY)) || 1;
        this.canvas.style.width = (this.WIDTH * scale) + 'px';
        this.canvas.style.height = (this.HEIGHT * scale) + 'px';
    }

    switchScene(scene) {
        if (this.currentScene && this.currentScene.exit) {
            this.currentScene.exit();
        }
        this.currentScene = scene;
        if (this.currentScene && this.currentScene.enter) {
            this.currentScene.enter();
        }
    }

    start() {
        this.running = true;
        this.lastTime = performance.now();
        this._loop(this.lastTime);
    }

    _loop(timestamp) {
        if (!this.running) return;

        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.accumulator += dt;

        // Cap accumulator to prevent spiral of death
        if (this.accumulator > 200) {
            this.accumulator = 200;
        }

        while (this.accumulator >= this.TICK_RATE) {
            if (this.currentScene && this.currentScene.update) {
                this.currentScene.update(this.TICK_RATE / 1000);
            }
            this.input.postUpdate();
            this.accumulator -= this.TICK_RATE;
        }

        this.ctx.imageSmoothingEnabled = false;
        this.renderer.clear();

        if (this.currentScene && this.currentScene.render) {
            this.currentScene.render(this.ctx);
        }

        requestAnimationFrame((t) => this._loop(t));
    }
}
