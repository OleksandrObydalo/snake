document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('startBtn');
    const scoreElement = document.getElementById('score');
    const upBtn = document.getElementById('upBtn');
    const downBtn = document.getElementById('downBtn');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');

    // Game constants
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    
    // Game variables
    let snake = [];
    let food = {};
    let velocityX = 0;
    let velocityY = 0;
    let score = 0;
    let gameInterval;
    let gameSpeed = 150; // milliseconds
    let gameRunning = false;

    // Colors
    const snakeColor = '#4CAF50';
    const snakeHeadColor = '#388E3C';
    const foodColor = '#F44336';
    const gridColor = '#e0e0e0';

    // Initialize game
    function initGame() {
        // Reset snake
        snake = [
            { x: 10, y: 10 }
        ];
        
        // Place food
        placeFood();
        
        // Reset score and direction
        score = 0;
        scoreElement.textContent = score;
        velocityX = 0;
        velocityY = 0;
        
        // Clear any existing interval
        if (gameInterval) {
            clearInterval(gameInterval);
        }
        
        // Draw initial state
        drawGame();
    }

    // Start game
    function startGame() {
        if (gameRunning) {
            // If game is already running, restart it
            gameRunning = false;
            clearInterval(gameInterval);
        }
        
        gameRunning = true;
        startBtn.textContent = 'Restart Game';
        initGame();
        
        // Set direction to start moving right automatically
        velocityX = 1;
        velocityY = 0;
        
        // Set game loop
        gameInterval = setInterval(updateGame, gameSpeed);
    }

    // Update game state
    function updateGame() {
        // Calculate new head position
        let headX = snake[0].x + velocityX;
        let headY = snake[0].y + velocityY;
        
        // Allow passing through walls (wrap around)
        if (headX < 0) headX = tileCount - 1;
        if (headY < 0) headY = tileCount - 1;
        if (headX >= tileCount) headX = 0;
        if (headY >= tileCount) headY = 0;
        
        // Check for collision with snake body only
        if (checkSnakeCollision(headX, headY)) {
            gameOver();
            return;
        }
        
        // Add new head
        snake.unshift({ x: headX, y: headY });
        
        // Check if food is eaten
        if (headX === food.x && headY === food.y) {
            // Increase score
            score++;
            scoreElement.textContent = score;
            
            // Speed up the game slightly
            if (score % 5 === 0 && gameSpeed > 50) {
                clearInterval(gameInterval);
                gameSpeed -= 10;
                gameInterval = setInterval(updateGame, gameSpeed);
            }
            
            // Place new food
            placeFood();
        } else {
            // Remove tail if no food was eaten
            snake.pop();
        }
        
        // Draw updated state
        drawGame();
    }

    // Draw game elements
    function drawGame() {
        // Clear canvas
        ctx.fillStyle = '#eee';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        drawGrid();
        
        // Draw snake
        drawSnake();
        
        // Draw food
        drawFood();
    }

    // Draw grid
    function drawGrid() {
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 0.5;
        
        for (let i = 0; i < tileCount; i++) {
            // Vertical lines
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.stroke();
            
            // Horizontal lines
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.stroke();
        }
    }

    // Draw snake
    function drawSnake() {
        snake.forEach((segment, index) => {
            // Use different color for head
            ctx.fillStyle = index === 0 ? snakeHeadColor : snakeColor;
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
            
            // Add eyes to head
            if (index === 0) {
                ctx.fillStyle = 'white';
                
                // Determine eye positions based on direction
                let eyeOffsetX1, eyeOffsetY1, eyeOffsetX2, eyeOffsetY2;
                
                if (velocityX === 1) { // Right
                    eyeOffsetX1 = eyeOffsetX2 = 14;
                    eyeOffsetY1 = 6;
                    eyeOffsetY2 = 14;
                } else if (velocityX === -1) { // Left
                    eyeOffsetX1 = eyeOffsetX2 = 6;
                    eyeOffsetY1 = 6;
                    eyeOffsetY2 = 14;
                } else if (velocityY === 1) { // Down
                    eyeOffsetX1 = 6;
                    eyeOffsetX2 = 14;
                    eyeOffsetY1 = eyeOffsetY2 = 14;
                } else { // Up or default
                    eyeOffsetX1 = 6;
                    eyeOffsetX2 = 14;
                    eyeOffsetY1 = eyeOffsetY2 = 6;
                }
                
                ctx.beginPath();
                ctx.arc(segment.x * gridSize + eyeOffsetX1, segment.y * gridSize + eyeOffsetY1, 2, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(segment.x * gridSize + eyeOffsetX2, segment.y * gridSize + eyeOffsetY2, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Add border to snake segments
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        });
    }

    // Draw food
    function drawFood() {
        ctx.fillStyle = foodColor;
        ctx.beginPath();
        const centerX = food.x * gridSize + gridSize / 2;
        const centerY = food.y * gridSize + gridSize / 2;
        const radius = gridSize / 2 - 2;
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add shine to food
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(centerX - radius / 3, centerY - radius / 3, radius / 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Place food at random position
    function placeFood() {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        
        // Make sure food doesn't appear on snake
        while (checkSnakeCollision(food.x, food.y)) {
            food = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
        }
    }

    // Check if given coordinates collide with snake
    function checkSnakeCollision(x, y) {
        return snake.some(segment => segment.x === x && segment.y === y);
    }

    // Game over
    function gameOver() {
        clearInterval(gameInterval);
        gameRunning = false;
        startBtn.textContent = 'Start Game';
        
        // Display game over
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 15);
        
        ctx.font = '20px Arial';
        ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 15);
    }

    // Handle keyboard controls
    document.addEventListener('keydown', (e) => {
        if (!gameRunning && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
                            e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
            startGame();
        }
        
        switch(e.key) {
            case 'ArrowUp':
                if (velocityY !== 1) { // Prevent moving directly opposite
                    velocityX = 0;
                    velocityY = -1;
                }
                break;
            case 'ArrowDown':
                if (velocityY !== -1) {
                    velocityX = 0;
                    velocityY = 1;
                }
                break;
            case 'ArrowLeft':
                if (velocityX !== 1) {
                    velocityX = -1;
                    velocityY = 0;
                }
                break;
            case 'ArrowRight':
                if (velocityX !== -1) {
                    velocityX = 1;
                    velocityY = 0;
                }
                break;
        }
    });
    
    // Handle button controls
    startBtn.addEventListener('click', startGame);
    
    upBtn.addEventListener('click', () => {
        if (velocityY !== 1) {
            velocityX = 0;
            velocityY = -1;
        }
        if (!gameRunning) startGame();
    });
    
    downBtn.addEventListener('click', () => {
        if (velocityY !== -1) {
            velocityX = 0;
            velocityY = 1;
        }
        if (!gameRunning) startGame();
    });
    
    leftBtn.addEventListener('click', () => {
        if (velocityX !== 1) {
            velocityX = -1;
            velocityY = 0;
        }
        if (!gameRunning) startGame();
    });
    
    rightBtn.addEventListener('click', () => {
        if (velocityX !== -1) {
            velocityX = 1;
            velocityY = 0;
        }
        if (!gameRunning) startGame();
    });

    // Initialize game state
    initGame();
});