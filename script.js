
// =====================================
// STAR CATCHER GAME
// Task 03 + Task 04
// =====================================

// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// HTML elements
const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");
const livesElement = document.getElementById("lives");
const highScoreElement = document.getElementById("highScore");

const message = document.getElementById("message");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const soundBtn = document.getElementById("soundBtn");

const motionToggle = document.getElementById("motionToggle");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

// =====================================
// GAME CONFIGURATION
// =====================================

const TARGET_SCORE = 300;
const MAX_LIVES = 3;

let gameState = "start";

let score = 0;
let lives = MAX_LIVES;
let level = 1;

let stars = [];
let particles = [];

let spawnTimer = 0;
let lastTime = 0;

let keys = {};

// =====================================
// LOCAL STORAGE
// =====================================

function loadSetting(key, defaultValue) {
    try {
        const value = localStorage.getItem(key);
        return value === null ? defaultValue : value;
    } catch (error) {
        return defaultValue;
    }
}

function saveSetting(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.log("Unable to save setting.");
    }
}

let highScore = Math.max(
    0,
    Number(loadSetting("highScore", "0")) || 0
);

let soundEnabled =
    loadSetting("soundEnabled", "true") === "true";

let reducedMotion =
    loadSetting("reducedMotion", "false") === "true";

// =====================================
// BASKET
// =====================================

const basket = {
    x: 350,
    y: 440,
    width: 100,
    height: 30,
    speed: 7
};

// =====================================
// SETTINGS
// =====================================

motionToggle.checked = reducedMotion;

function updateSoundButton() {
    soundBtn.textContent = soundEnabled
        ? "🔊 Sound ON"
        : "🔇 Sound OFF";
}

function updateUI() {

    scoreElement.textContent = score;
    livesElement.textContent = lives;
    levelElement.textContent = level;
    highScoreElement.textContent = highScore;

    pauseBtn.disabled = gameState !== "playing";

    if (gameState === "playing") {
        startBtn.textContent = "▶ Playing";
        startBtn.disabled = true;
    } else if (gameState === "paused") {
        startBtn.textContent = "▶ Resume";
        startBtn.disabled = false;
    } else if (gameState === "start") {
        startBtn.textContent = "▶ Start Game";
        startBtn.disabled = false;
    } else {
        startBtn.textContent = "▶ Start Game";
        startBtn.disabled = true;
    }

    updateSoundButton();
}

// =====================================
// MESSAGE DISPLAY
// =====================================

function showMessage(title, description) {

    const heading = document.createElement("h2");
    const paragraph = document.createElement("p");

    heading.textContent = title;
    paragraph.textContent = description;

    message.replaceChildren(heading, paragraph);
}

// =====================================
// AUDIO FEEDBACK
// =====================================

let audioContext = null;

function playTone(frequency, duration) {

    if (!soundEnabled) return;

    try {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) return;

        if (!audioContext) {
            audioContext = new AudioContextClass();
        }

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = "sine";

        gain.gain.setValueAtTime(
            0.08,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + duration
        );

        oscillator.start();
        oscillator.stop(
            audioContext.currentTime + duration
        );

    } catch (error) {
        console.log("Audio unavailable.");
    }
}

function playCatchSound() {
    playTone(650, 0.15);
}

function playGameOverSound() {
    playTone(180, 0.45);
}

function playWinSound() {
    playTone(850, 0.35);
}

// =====================================
// SOUND SETTING
// =====================================

soundBtn.addEventListener("click", () => {

    soundEnabled = !soundEnabled;

    saveSetting("soundEnabled", String(soundEnabled));

    updateSoundButton();

});

// =====================================
// REDUCED MOTION SETTING
// =====================================

motionToggle.addEventListener("change", () => {

    reducedMotion = motionToggle.checked;

    saveSetting("reducedMotion", String(reducedMotion));

    if (reducedMotion) {
        particles = [];
    }

});

// =====================================
// START GAME
// =====================================

function startGame() {

    if (gameState === "playing") return;

    if (gameState === "start" || gameState === "paused") {

        gameState = "playing";

        showMessage(
            "⭐ Game Running!",
            "Catch stars using your basket. Good luck!"
        );

        updateUI();
    }

}

// =====================================
// PAUSE GAME
// =====================================

function pauseGame() {

    if (gameState !== "playing") return;

    gameState = "paused";

    keys = {};

    showMessage(
        "⏸ Game Paused",
        "Click Resume to continue playing."
    );

    updateUI();
}

// =====================================
// RESTART GAME
// =====================================

function restartGame() {

    score = 0;
    lives = MAX_LIVES;
    level = 1;

    stars = [];
    particles = [];

    spawnTimer = 0;

    basket.x = (canvas.width - basket.width) / 2;

    keys = {};

    gameState = "playing";

    showMessage(
        "🔄 Game Restarted!",
        "Catch the stars and reach 300 points."
    );

    updateUI();

}

// =====================================
// WIN AND LOSE
// =====================================

function endGame(result) {

    if (gameState !== "playing") return;

    gameState = result;

    keys = {};
    stars = [];
    particles = [];

    if (result === "win") {

        showMessage(
            "🎉 Congratulations! You Win!",
            "You reached 300 points. Amazing performance!"
        );

        playWinSound();

    } else {

        showMessage(
            "💔 Game Over!",
            "You lost all your lives. Click Restart to play again."
        );

        playGameOverSound();
    }

    updateUI();

}

// =====================================
// SCORE AND LEVEL PROGRESSION
// =====================================

function updateScore() {

    score += 10;

    if (score > highScore) {

        highScore = score;

        saveSetting("highScore", String(highScore));

    }

    level = Math.min(
        3,
        Math.floor(score / 100) + 1
    );

    updateUI();

    if (score >= TARGET_SCORE) {

        score = TARGET_SCORE;

        updateUI();

        endGame("win");

    }

}

// =====================================
// CREATE FALLING STARS
// =====================================

function spawnStar() {

    stars.push({

        x: Math.random() * (canvas.width - 40) + 20,

        y: -20,

        radius: 14,

        speed: 2 + level * 1.2

    });

}

// =====================================
// VISUAL PARTICLE EFFECT
// =====================================

function createParticles(x, y) {

    if (reducedMotion) return;

    for (let i = 0; i < 8; i++) {

        particles.push({

            x: x,
            y: y,

            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,

            life: 25

        });

    }

}

function updateParticles(deltaTime) {

    const factor = deltaTime / 16.67;

    particles.forEach(particle => {

        particle.x += particle.vx * factor;
        particle.y += particle.vy * factor;

        particle.life -= factor;

    });

    particles = particles.filter(
        particle => particle.life > 0
    );

}

function drawParticles() {

    particles.forEach(particle => {

        ctx.globalAlpha = particle.life / 25;

        ctx.fillStyle = "#ffd700";

        ctx.beginPath();

        ctx.arc(
            particle.x,
            particle.y,
            4,
            0,
            Math.PI * 2
        );

        ctx.fill();

    });

    ctx.globalAlpha = 1;

}

// =====================================
// UPDATE BASKET
// =====================================

function updateBasket(deltaTime) {

    const factor = deltaTime / 16.67;

    if (
        keys["ArrowLeft"] ||
        keys["a"] ||
        keys["A"]
    ) {

        basket.x -= basket.speed * factor;

    }

    if (
        keys["ArrowRight"] ||
        keys["d"] ||
        keys["D"]
    ) {

        basket.x += basket.speed * factor;

    }

    basket.x = Math.max(
        0,
        Math.min(
            canvas.width - basket.width,
            basket.x
        )
    );

}

// =====================================
// UPDATE FALLING STARS
// =====================================

function updateStars(deltaTime) {

    spawnTimer += deltaTime;

    const spawnInterval = Math.max(
        350,
        1000 - level * 180
    );

    if (spawnTimer >= spawnInterval) {

        spawnStar();

        spawnTimer = 0;

    }

    const factor = deltaTime / 16.67;

    // Create a new array to avoid splice/forEach skipping stars.
    const remainingStars = [];

    for (const star of stars) {

        star.y += star.speed * factor;

        // Basket collision detection
        const caught =

            star.y + star.radius >= basket.y &&

            star.y - star.radius <= basket.y + basket.height &&

            star.x >= basket.x &&

            star.x <= basket.x + basket.width;

        if (caught) {

            createParticles(star.x, star.y);

            updateScore();

            playCatchSound();

            continue;

        }

        // Star missed
        if (star.y - star.radius > canvas.height) {

            lives = Math.max(0, lives - 1);

            updateUI();

            if (lives === 0) {

                endGame("lose");

            }

            continue;

        }

        remainingStars.push(star);

    }

    stars = remainingStars;

}

// =====================================
// DRAW GAME BACKGROUND
// =====================================

function drawBackground() {

    ctx.fillStyle = "#ffffff";

    for (let i = 0; i < 35; i++) {

        const x = (i * 137) % canvas.width;
        const y = (i * 79) % canvas.height;

        ctx.fillRect(x, y, 2, 2);

    }

}

// =====================================
// DRAW FALLING STARS
// =====================================

function drawStars() {

    ctx.font = "28px Arial";
    ctx.textAlign = "center";

    stars.forEach(star => {

        ctx.fillText(
            "⭐",
            star.x,
            star.y
        );

    });

}

// =====================================
// DRAW BASKET
// =====================================

function drawBasket() {

    ctx.fillStyle = "#ffae00";

    ctx.fillRect(
        basket.x,
        basket.y,
        basket.width,
        basket.height
    );

    ctx.fillStyle = "#ffffff";

    ctx.font = "18px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        "BASKET",
        basket.x + basket.width / 2,
        basket.y + 21
    );

}

// =====================================
// DRAW GAME
// =====================================

function drawGame() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawBackground();

    drawStars();

    drawBasket();

    if (!reducedMotion) {
        drawParticles();
    }

    ctx.fillStyle = "#ffffff";

    ctx.font = "18px Arial";
    ctx.textAlign = "left";

    ctx.fillText(
        "Level " + level,
        15,
        30
    );

}

// =====================================
// MAIN GAME LOOP
// =====================================

function gameLoop(timestamp) {

    const deltaTime = Math.min(
        timestamp - (lastTime || timestamp),
        50
    );

    lastTime = timestamp;

    if (gameState === "playing") {

        updateBasket(deltaTime);

        updateStars(deltaTime);

    }

    if (!reducedMotion) {

        updateParticles(deltaTime);

    }

    drawGame();

    requestAnimationFrame(gameLoop);

}

// =====================================
// KEYBOARD CONTROLS
// =====================================

document.addEventListener("keydown", event => {

    if (
        ["ArrowLeft", "ArrowRight", " "].includes(event.key)
    ) {

        event.preventDefault();

    }

    if (event.key === " " && !event.repeat) {

        if (gameState === "playing") {

            pauseGame();

        } else if (gameState === "paused") {

            startGame();

        }

        return;

    }

    keys[event.key] = true;

});

document.addEventListener("keyup", event => {

    keys[event.key] = false;

});

// Stop movement when browser loses focus
window.addEventListener("blur", () => {

    keys = {};

});

// =====================================
// BUTTON CONTROLS
// =====================================

startBtn.addEventListener("click", startGame);

pauseBtn.addEventListener("click", pauseGame);

restartBtn.addEventListener("click", restartGame);

// =====================================
// MOBILE TOUCH CONTROLS
// =====================================

function holdButton(button, key) {

    button.addEventListener("pointerdown", event => {

        event.preventDefault();

        keys[key] = true;

        button.setPointerCapture(event.pointerId);

    });

    function release() {

        keys[key] = false;

    }

    button.addEventListener("pointerup", release);

    button.addEventListener("pointercancel", release);

    button.addEventListener("lostpointercapture", release);

}

holdButton(leftBtn, "ArrowLeft");

holdButton(rightBtn, "ArrowRight");

// =====================================
// INITIALIZE GAME
// =====================================

function initializeGame() {

    highScoreElement.textContent = highScore;

    updateSoundButton();

    updateUI();

    drawGame();

    requestAnimationFrame(gameLoop);

}

initializeGame();
