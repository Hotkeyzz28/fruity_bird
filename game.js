import { Background } from './background.js';
import { Bird, BirdClone } from './bird.js';
import { PipeManager } from './pipes.js';
import { FruitManager, AbilityManager } from './fruits.js';
import { UI } from './ui.js';

const GAME_STATE = {
    START: 'start',
    PLAYING: 'playing',
    GAME_OVER: 'game_over'
};

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.setupCanvas();

        this.state = GAME_STATE.START;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('flappyHighScore') || '0');

        this.background = new Background(this.canvas);
        this.bird = new Bird(this.canvas);
        this.pipeManager = new PipeManager(this.canvas);
        this.fruitManager = new FruitManager(this.canvas);
        this.abilityManager = new AbilityManager();
        this.ui = new UI(this.canvas);

        this.clones = [];

        this.lastTime = 0;
        this.setupEventListeners();
        this.gameLoop(0);
    }

    setupCanvas() {
        const container = document.getElementById('game-container');
        this.canvas.width = Math.min(480, window.innerWidth);
        this.canvas.height = Math.min(800, window.innerHeight);

        window.addEventListener('resize', () => {
            this.canvas.width = Math.min(480, window.innerWidth);
            this.canvas.height = Math.min(800, window.innerHeight);
        });
    }

    setupEventListeners() {
        const handleInput = (e) => {
            e.preventDefault();
            if (this.state === GAME_STATE.START || this.state === GAME_STATE.GAME_OVER) {
                this.startGame();
            } else if (this.state === GAME_STATE.PLAYING) {
                this.bird.flap();
            }
        };

        this.canvas.addEventListener('click', handleInput);
        this.canvas.addEventListener('touchstart', handleInput);
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                handleInput(e);
            }
        });
    }

    startGame() {
        this.state = GAME_STATE.PLAYING;
        this.score = 0;
        this.bird.reset();
        this.pipeManager.reset();
        this.fruitManager.reset();
        this.abilityManager.reset();
        this.clones = [];
    }

    gameOver() {
        this.state = GAME_STATE.GAME_OVER;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('flappyHighScore', this.highScore.toString());
        }
    }

    update(deltaTime) {
        this.background.update(deltaTime);

        if (this.state === GAME_STATE.PLAYING) {
            const abilities = this.abilityManager;
            this.bird.update(deltaTime, abilities);

            if (this.bird.y > this.canvas.height || this.bird.y < 0) {
                if (this.bird.y > this.canvas.height && this.bird.bounce()) {
                } else if (!abilities.has('invincible')) {
                    this.gameOver();
                }
            }

            this.pipeManager.update(deltaTime, abilities);

            const birdBounds = this.bird.getBounds();
            if (this.pipeManager.checkCollision(birdBounds, abilities.has('invincible'))) {
                this.gameOver();
            }

            let scoreGain = this.pipeManager.checkScoring(this.bird.x);
            if (scoreGain > 0) {
                if (abilities.shouldDoubleScore()) {
                    scoreGain *= 2;
                }
                this.score += scoreGain;
            }

            this.fruitManager.update(deltaTime, this.bird.x, this.bird.y, abilities.has('magnet'));
            const collectedType = this.fruitManager.checkCollection(birdBounds);
            if (collectedType) {
                this.abilityManager.addAbility(collectedType);
                if (collectedType === 'clone') {
                    this.clones.push(new BirdClone(this.canvas, this.bird.x - 60, this.bird.y));
                }
            }

            this.abilityManager.update(deltaTime);

            for (let i = this.clones.length - 1; i >= 0; i--) {
                if (!this.clones[i].update(deltaTime, this.bird.y)) {
                    this.clones.splice(i, 1);
                } else {
                    const cloneBounds = {
                        x: this.clones[i].x - 10,
                        y: this.clones[i].y - 10,
                        width: 20,
                        height: 20
                    };
                    const cloneScore = this.pipeManager.checkScoring(this.clones[i].x);
                    if (cloneScore > 0) {
                        this.score += cloneScore;
                    }
                }
            }
        }
    }

    draw() {
        const activeAbilities = this.abilityManager.getActiveAbilities();
        this.background.draw(activeAbilities);
        this.pipeManager.draw(this.background.ctx, this.abilityManager.isFrozen());
        this.fruitManager.draw(this.background.ctx);
        for (let clone of this.clones) {
            clone.draw();
        }
        this.bird.draw();
        this.ui.drawScore(this.score);
        this.ui.drawAbilityIndicators(activeAbilities);

        if (this.state === GAME_STATE.START) {
            this.ui.drawStartScreen();
        } else if (this.state === GAME_STATE.GAME_OVER) {
            this.ui.drawGameOverScreen(this.score, this.highScore);
        }
    }

    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame((t) => this.gameLoop(t));
    }
}

window.addEventListener('load', () => {
    new Game();
});
