const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game dimensions
const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// Game state
let gameRunning = true;
let score = 0;
let coins = 0;
let lives = 3;
let timeLeft = 300;
let currentWorld = 1;
let currentLevel = 1;
let invincibleFrames = 0;

// Camera
let cameraX = 0;

// Gravity and physics
const GRAVITY = 0.8;
const JUMP_POWER = -12;

// Player object
const player = {
    x: 100,
    y: 300,
    width: 30,
    height: 30,
    vx: 0,
    vy: 0,
    onGround: true,
    facingRight: true,
    invincible: false,
    invincibleTimer: 0,
    animationFrame: 0,
    animationTimer: 0
};

// Platforms
let platforms = [
    // Ground
    { x: 0, y: 370, width: 800, height: 30, type: 'ground' },
    // Platform dasar
    { x: 150, y: 320, width: 80, height: 20, type: 'normal' },
    { x: 300, y: 280, width: 80, height: 20, type: 'normal' },
    { x: 500, y: 310, width: 80, height: 20, type: 'normal' },
    { x: 650, y: 260, width: 80, height: 20, type: 'normal' },
    // Platform melayang
    { x: 200, y: 220, width: 60, height: 15, type: 'normal' },
    { x: 400, y: 200, width: 60, height: 15, type: 'normal' },
    { x: 600, y: 180, width: 60, height: 15, type: 'normal' },
    // Platform untuk lompatan tinggi
    { x: 100, y: 150, width: 50, height: 15, type: 'normal' },
    { x: 700, y: 140, width: 50, height: 15, type: 'normal' }
];

// Enemies
let enemies = [
    { x: 400, y: 355, width: 25, height: 25, type: 'goomba', active: true, direction: 1, speed: 1 },
    { x: 550, y: 295, width: 25, height: 25, type: 'goomba', active: true, direction: -1, speed: 1 },
    { x: 650, y: 245, width: 25, height: 25, type: 'goomba', active: true, direction: 1, speed: 1 }
];

// Items
let items = [
    { x: 250, y: 290, width: 20, height: 20, type: 'coin', collected: false },
    { x: 350, y: 250, width: 20, height: 20, type: 'coin', collected: false },
    { x: 450, y: 280, width: 20, height: 20, type: 'coin', collected: false },
    { x: 550, y: 270, width: 20, height: 20, type: 'coin', collected: false },
    { x: 680, y: 230, width: 20, height: 20, type: 'coin', collected: false },
    { x: 180, y: 120, width: 20, height: 20, type: 'mushroom', collected: false },
    { x: 720, y: 110, width: 20, height: 20, type: 'star', collected: false }
];

// Goal flag
const flag = {
    x: 750,
    y: 340,
    width: 20,
    height: 40,
    reached: false
};

// Power-ups
let powerUp = 'normal'; // normal, super, star
let powerUpTimer = 0;

// Input handling
const keys = {};

// UI Elements
const scoreElement = document.getElementById('score');
const coinsElement = document.getElementById('coins');
const timeElement = document.getElementById('time');
const livesElement = document.getElementById('lives');
const worldElement = document.getElementById('world');
const levelElement = document.getElementById('level');

// Timer interval
let timerInterval;

// Initialize game
function init() {
    resetGame();
    startTimer();
    gameLoop();
    setupControls();
}

// Reset game
function resetGame() {
    gameRunning = true;
    score = 0;
    coins = 0;
    lives = 3;
    timeLeft = 300;
    currentWorld = 1;
    currentLevel = 1;
    invincibleFrames = 0;
    player.x = 100;
    player.y = 300;
    player.vx = 0;
    player.vy = 0;
    player.onGround = true;
    player.invincible = false;
    powerUp = 'normal';
    updateUI();
    
    // Reset enemies
    enemies.forEach(enemy => {
        enemy.active = true;
    });
    
    // Reset items
    items.forEach(item => {
        item.collected = false;
    });
    
    flag.reached = false;
    
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('winScreen').style.display = 'none';
}

// Start timer
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!gameRunning) return;
        if (timeLeft > 0) {
            timeLeft--;
            updateUI();
            if (timeLeft <= 0) {
                gameOver();
            }
        }
    }, 1000);
}

// Update UI
function updateUI() {
    scoreElement.textContent = String(score).padStart(6, '0');
    coinsElement.textContent = String(coins).padStart(2, '0');
    timeElement.textContent = timeLeft;
    livesElement.textContent = lives;
    worldElement.textContent = currentWorld;
    levelElement.textContent = currentLevel;
}

// Game over
function gameOver() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverScreen').style.display = 'flex';
}

// Win level
function winLevel() {
    gameRunning = false;
    document.getElementById('winScreen').style.display = 'flex';
}

// Next level
function nextLevel() {
    currentLevel++;
    if (currentLevel > 3) {
        currentWorld++;
        currentLevel = 1;
    }
    resetGame();
    loadLevel();
}

// Load level based on world and level
function loadLevel() {
    // Reset positions
    player.x = 100;
    player.y = 300;
    cameraX = 0;
    
    // Different level configurations
    if (currentWorld === 1 && currentLevel === 1) {
        platforms = [
            { x: 0, y: 370, width: 800, height: 30, type: 'ground' },
            { x: 150, y: 320, width: 80, height: 20, type: 'normal' },
            { x: 300, y: 280, width: 80, height: 20, type: 'normal' },
            { x: 500, y: 310, width: 80, height: 20, type: 'normal' },
            { x: 650, y: 260, width: 80, height: 20, type: 'normal' },
            { x: 200, y: 220, width: 60, height: 15, type: 'normal' },
            { x: 400, y: 200, width: 60, height: 15, type: 'normal' },
            { x: 600, y: 180, width: 60, height: 15, type: 'normal' }
        ];
        
        enemies = [
            { x: 400, y: 355, width: 25, height: 25, type: 'goomba', active: true, direction: 1, speed: 1 },
            { x: 550, y: 295, width: 25, height: 25, type: 'goomba', active: true, direction: -1, speed: 1 },
            { x: 650, y: 245, width: 25, height: 25, type: 'goomba', active: true, direction: 1, speed: 1 }
        ];
        
        items = [
            { x: 250, y: 290, width: 20, height: 20, type: 'coin', collected: false },
            { x: 350, y: 250, width: 20, height: 20, type: 'coin', collected: false },
            { x: 450, y: 280, width: 20, height: 20, type: 'coin', collected: false },
            { x: 550, y: 270, width: 20, height: 20, type: 'coin', collected: false },
            { x: 680, y: 230, width: 20, height: 20, type: 'coin', collected: false }
        ];
    } else if (currentWorld === 1 && currentLevel === 2) {
        // Level 2 - harder
        platforms = [
            { x: 0, y: 370, width: 800, height: 30, type: 'ground' },
            { x: 100, y: 330, width: 60, height: 15, type: 'normal' },
            { x: 250, y: 300, width: 60, height: 15, type: 'normal' },
            { x: 400, y: 270, width: 60, height: 15, type: 'normal' },
            { x: 550, y: 240, width: 60, height: 15, type: 'normal' },
            { x: 700, y: 210, width: 60, height: 15, type: 'normal' }
        ];
        
        enemies = [
            { x: 200, y: 355, width: 25, height: 25, type: 'goomba', active: true, direction: 1, speed: 1.5 },
            { x: 450, y: 255, width: 25, height: 25, type: 'goomba', active: true, direction: -1, speed: 1.5 },
            { x: 600, y: 225, width: 25, height: 25, type: 'goomba', active: true, direction: 1, speed: 1.5 }
        ];
        
        items = [
            { x: 180, y: 300, width: 20, height: 20, type: 'coin', collected: false },
            { x: 330, y: 270, width: 20, height: 20, type: 'coin', collected: false },
            { x: 480, y: 240, width: 20, height: 20, type: 'coin', collected: false },
            { x: 630, y: 210, width: 20, height: 20, type: 'coin', collected: false }
        ];
    }
}

// Setup keyboard controls
function setupControls() {
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) {
            if (e.key === 'r' || e.key === 'R') {
                resetGame();
            }
            return;
        }
        
        keys[e.key] = true;
        
        // Left arrow
        if (e.key === 'ArrowLeft' || e.key === 'Left' || e.key === 'a' || e.key === 'A') {
            player.vx = -5;
            player.facingRight = false;
        }
        // Right arrow
        if (e.key === 'ArrowRight' || e.key === 'Right' || e.key === 'd' || e.key === 'D') {
            player.vx = 5;
            player.facingRight = true;
        }
        // Jump
        if ((e.key === 'ArrowUp' || e.key === 'Up' || e.key === ' ' || e.key === 'w' || e.key === 'W') && player.onGround) {
            player.vy = JUMP_POWER;
            player.onGround = false;
        }
        // Reset
        if (e.key === 'r' || e.key === 'R') {
            resetGame();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
        if ((e.key === 'ArrowLeft' || e.key === 'Left' || e.key === 'a' || e.key === 'A') && player.vx < 0) {
            player.vx = 0;
        }
        if ((e.key === 'ArrowRight' || e.key === 'Right' || e.key === 'd' || e.key === 'D') && player.vx > 0) {
            player.vx = 0;
        }
    });
    
    // Touch controls for mobile
    document.getElementById('leftBtn').addEventListener('touchstart', () => {
        player.vx = -5;
        player.facingRight = false;
    });
    document.getElementById('leftBtn').addEventListener('touchend', () => {
        if (player.vx < 0) player.vx = 0;
    });
    document.getElementById('rightBtn').addEventListener('touchstart', () => {
        player.vx = 5;
        player.facingRight = true;
    });
    document.getElementById('rightBtn').addEventListener('touchend', () => {
        if (player.vx > 0) player.vx = 0;
    });
    document.getElementById('jumpBtn').addEventListener('click', () => {
        if (player.onGround && gameRunning) {
            player.vy = JUMP_POWER;
            player.onGround = false;
        }
    });
    document.getElementById('resetBtn').addEventListener('click', () => {
        resetGame();
    });
    
    // Mouse controls for buttons
    document.getElementById('leftBtn').addEventListener('mousedown', () => {
        player.vx = -5;
        player.facingRight = false;
    });
    document.getElementById('leftBtn').addEventListener('mouseup', () => {
        if (player.vx < 0) player.vx = 0;
    });
    document.getElementById('rightBtn').addEventListener('mousedown', () => {
        player.vx = 5;
        player.facingRight = true;
    });
    document.getElementById('rightBtn').addEventListener('mouseup', () => {
        if (player.vx > 0) player.vx = 0;
    });
}

// Update player physics
function updatePlayer() {
    // Apply gravity
    player.vy += GRAVITY;
    
    // Update position
    player.x += player.vx;
    player.y += player.vy;
    
    // Platform collision
    player.onGround = false;
    for (let platform of platforms) {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y < platform.y + platform.height) {
            
            // Collision from top
            if (player.vy > 0 && player.y + player.height - player.vy <= platform.y) {
                player.y = platform.y - player.height;
                player.vy = 0;
                player.onGround = true;
            }
            // Collision from bottom
            else if (player.vy < 0 && player.y >= platform.y + platform.height) {
                player.y = platform.y + platform.height;
                player.vy = 0;
            }
            // Collision from sides
            else if (player.vx > 0) {
                player.x = platform.x - player.width;
            } else if (player.vx < 0) {
                player.x = platform.x + platform.width;
            }
        }
    }
    
    // Boundary limits
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > GAME_WIDTH) player.x = GAME_WIDTH - player.width;
    
    // Death pit
    if (player.y > GAME_HEIGHT) {
        die();
    }
    
    // Update camera
    cameraX = Math.max(0, Math.min(player.x - GAME_WIDTH / 2, GAME_WIDTH - GAME_WIDTH));
    
    // Update invincibility frames
    if (player.invincible) {
        player.invincibleTimer--;
        if (player.invincibleTimer <= 0) {
            player.invincible = false;
        }
    }
}

// Update enemies
function updateEnemies() {
    for (let enemy of enemies) {
        if (!enemy.active) continue;
        
        // Basic AI movement
        enemy.x += enemy.direction * enemy.speed;
        
        // Reverse direction at boundaries
        if (enemy.x < 100 || enemy.x + enemy.width > GAME_WIDTH - 100) {
            enemy.direction *= -1;
        }
        
        // Enemy collision with player
        if (!player.invincible && 
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            
            // Player stomps enemy
            if (player.vy > 0 && player.y + player.height - player.vy <= enemy.y + 10) {
                enemy.active = false;
                player.vy = -8;
                score += 100;
                updateUI();
            } else {
                die();
            }
        }
    }
}

// Update items
function updateItems() {
    for (let item of items) {
        if (item.collected) continue;
        
        // Item collision
        if (player.x < item.x + item.width &&
            player.x + player.width > item.x &&
            player.y < item.y + item.height &&
            player.y + player.height > item.y) {
            
            item.collected = true;
            
            if (item.type === 'coin') {
                score += 100;
                coins++;
                updateUI();
            } else if (item.type === 'mushroom') {
                score += 1000;
                powerUp = 'super';
                powerUpTimer = 600;
            } else if (item.type === 'star') {
                score += 1000;
                powerUp = 'star';
                powerUpTimer = 300;
                player.invincible = true;
                player.invincibleTimer = 300;
            }
        }
    }
}

// Update flag collision
function updateFlag() {
    if (!flag.reached &&
        player.x < flag.x + flag.width &&
        player.x + player.width > flag.x &&
        player.y < flag.y + flag.height &&
        player.y + player.height > flag.y) {
        flag.reached = true;
        
        // Bonus based on remaining time
        score += timeLeft * 10;
        updateUI();
        winLevel();
    }
}

// Player die
function die() {
    lives--;
    updateUI();
    
    if (lives <= 0) {
        gameOver();
    } else {
        // Respawn player
        player.x = 100;
        player.y = 300;
        player.vx = 0;
        player.vy = 0;
        player.invincible = true;
        player.invincibleTimer = 60;
    }
}

// Draw background
function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Clouds
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.arc(100 + cameraX * 0.3, 50, 30, 0, Math.PI * 2);
    ctx.arc(130 + cameraX * 0.3, 40, 35, 0, Math.PI * 2);
    ctx.arc(160 + cameraX * 0.3, 50, 30, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(500 + cameraX * 0.5, 80, 25, 0, Math.PI * 2);
    ctx.arc(530 + cameraX * 0.5, 70, 30, 0, Math.PI * 2);
    ctx.arc(560 + cameraX * 0.5, 80, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // Hills
    ctx.fillStyle = '#5cb85c';
    ctx.beginPath();
    ctx.moveTo(0 - cameraX, 350);
    ctx.bezierCurveTo(100 - cameraX, 300, 200 - cameraX, 320, 300 - cameraX, 350);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(400 - cameraX, 350);
    ctx.bezierCurveTo(500 - cameraX, 300, 600 - cameraX, 320, 800 - cameraX, 350);
    ctx.fill();
}

// Draw platforms
function drawPlatforms() {
    for (let platform of platforms) {
        if (platform.type === 'ground') {
            // Ground with grass effect
            ctx.fillStyle = '#8B5A2B';
            ctx.fillRect(platform.x - cameraX, platform.y, platform.width, platform.height);
            ctx.fillStyle = '#6B3A0B';
            for (let i = 0; i < platform.width / 20; i++) {
                ctx.fillRect(platform.x - cameraX + i * 20, platform.y - 5, 10, 5);
            }
        } else {
            // Brick platform
            ctx.fillStyle = '#CD853F';
            ctx.fillRect(platform.x - cameraX, platform.y, platform.width, platform.height);
            ctx.fillStyle = '#8B4513';
            for (let i = 0; i < platform.width / 10; i++) {
                ctx.fillRect(platform.x - cameraX + i * 10, platform.y, 5, 5);
            }
        }
    }
}

// Draw enemies
function drawEnemies() {
    for (let enemy of enemies) {
        if (!enemy.active) continue;
        
        if (enemy.type === 'goomba') {
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(enemy.x - cameraX, enemy.y, enemy.width, enemy.height);
            ctx.fillStyle = '#5C3317';
            ctx.fillRect(enemy.x - cameraX + 5, enemy.y, 15, 10);
            ctx.fillStyle = 'white';
            ctx.fillRect(enemy.x - cameraX + 5, enemy.y + 15, 5, 5);
            ctx.fillRect(enemy.x - cameraX + 15, enemy.y + 15, 5, 5);
            ctx.fillStyle = 'black';
            ctx.fillRect(enemy.x - cameraX + 6, enemy.y + 15, 3, 5);
            ctx.fillRect(enemy.x - cameraX + 16, enemy.y + 15, 3, 5);
            // Eyebrows
            ctx.fillStyle = '#3a1f0d';
            ctx.fillRect(enemy.x - cameraX + 4, enemy.y + 12, 8, 2);
            ctx.fillRect(enemy.x - cameraX + 14, enemy.y + 12, 8, 2);
        }
    }
}

// Draw items
function drawItems() {
    for (let item of items) {
        if (item.collected) continue;
        
        if (item.type === 'coin') {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.ellipse(item.x - cameraX + 10, item.y + 10, 8, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFA500';
            ctx.beginPath();
            ctx.arc(item.x - cameraX + 10, item.y + 10, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.fillText('★', item.x - cameraX + 7, item.y + 14);
        } else if (item.type === 'mushroom') {
            ctx.fillStyle = '#FF4444';
            ctx.fillRect(item.x - cameraX + 5, item.y + 5, 10, 15);
            ctx.fillStyle = '#FFAAAA';
            ctx.fillRect(item.x - cameraX + 8, item.y, 4, 5);
            ctx.fillStyle = 'white';
            ctx.fillRect(item.x - cameraX + 6, item.y + 8, 3, 4);
            ctx.fillRect(item.x - cameraX + 11, item.y + 8, 3, 4);
        } else if (item.type === 'star') {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 72 - 90) * Math.PI / 180;
                const x1 = item.x - cameraX + 10 + Math.cos(angle) * 10;
                const y1 = item.y + 10 + Math.sin(angle) * 10;
                const x2 = item.x - cameraX + 10 + Math.cos(angle + 36 * Math.PI / 180) * 4;
                const y2 = item.y + 10 + Math.sin(angle + 36 * Math.PI / 180) * 4;
                if (i === 0) ctx.moveTo(x1, y1);
                else ctx.lineTo(x1, y1);
                ctx.lineTo(x2, y2);
            }
            ctx.fill();
        }
    }
}

// Draw flag
function drawFlag() {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(flag.x - cameraX, flag.y, 5, flag.height);
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.moveTo(flag.x - cameraX + 5, flag.y);
    ctx.lineTo(flag.x - cameraX + 40, flag.y + 15);
    ctx.lineTo(flag.x - cameraX + 5, flag.y + 30);
    ctx.fill();
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(flag.x - cameraX + 22, flag.y + 15, 8, 0, Math.PI * 2);
    ctx.fill();
}

// Draw player
function drawPlayer() {
    // Blink effect when invincible
    if (player.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
        return;
    }
    
    // Update animation
    player.animationTimer++;
    if (player.animationTimer > 10) {
        player.animationTimer = 0;
        player.animationFrame = (player.animationFrame + 1) % 4;
    }
    
    const bodyColor = player.invincible ? '#FFD700' : '#FF4444';
    
    // Hat
    ctx.fillStyle = '#CC0000';
    ctx.fillRect(player.x - cameraX + 5, player.y - 5, 20, 8);
    
    // Body
    ctx.fillStyle = bodyColor;
    ctx.fillRect(player.x - cameraX + 8, player.y, 14, 6);
    ctx.fillRect(player.x - cameraX + 5, player.y + 6, 20, 18);
    
    // Overalls
    ctx.fillStyle = '#0000AA';
    ctx.fillRect(player.x - cameraX + 5, player.y + 12, 20, 12);
    ctx.fillRect(player.x - cameraX + 8, player.y + 24, 5, 6);
    ctx.fillRect(player.x - cameraX + 17, player.y + 24, 5, 6);
    
    // Eyes
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x - cameraX + 8, player.y + 10, 4, 3);
    ctx.fillRect(player.x - cameraX + 18, player.y + 10, 4, 3);
    ctx.fillStyle = 'black';
    ctx.fillRect(player.x - cameraX + 9, player.y + 11, 2, 2);
    ctx.fillRect(player.x - cameraX + 19, player.y + 11, 2, 2);
    
    // Mustache
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(player.x - cameraX + 6, player.y + 14, 8, 3);
    ctx.fillRect(player.x - cameraX + 16, player.y + 14, 8, 3);
    
    // Walking animation (legs)
    if (Math.abs(player.vx) > 0 && player.onGround) {
        const legOffset = player.animationFrame * 2;
        ctx.fillStyle = '#0000AA';
        ctx.fillRect(player.x - cameraX + 8, player.y + 28, 4, 8 - legOffset);
        ctx.fillRect(player.x - cameraX + 18, player.y + 28, 4, 8 + legOffset);
    } else {
        ctx.fillRect(player.x - cameraX + 8, player.y + 28, 4, 8);
        ctx.fillRect(player.x - cameraX + 18, player.y + 28, 4, 8);
    }
}

// Main game loop
function gameLoop() {
    if (!gameRunning) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // Update game logic
    updatePlayer();
    updateEnemies();
    updateItems();
    updateFlag();
    
    // Clear canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Draw everything
    drawBackground();
    drawPlatforms();
    drawItems();
    drawEnemies();
    drawPlayer();
    drawFlag();
    
    requestAnimationFrame(gameLoop);
}

// Start the game
init();