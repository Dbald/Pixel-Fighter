import { Game } from './core/Game.js';
import { TitleScene } from './scenes/TitleScene.js';

const canvas = document.getElementById('gameCanvas');
const game = new Game(canvas);

// Start with title screen
game.switchScene(new TitleScene(game));
game.start();
