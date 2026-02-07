// Classes for game elements

// Background class
class Background {
    constructor(src) {
        this.image = new Image();
        this.image.src = src;
    }
    draw() {
        ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height);
    }
}

// Player class
class Player {
    constructor(x, y, speed, name) {
        this.x = x;
        this.y = y;
        this.speed = 0.5 * speed;
        this.direction = "down";
        this.name = name;
        this.sprites = {
            up: new Image(),
            down: new Image(),
            left: new Image(),
            right: new Image()
        };
        this.sprites.up.src = "img/left.png";
        this.sprites.down.src = "img/right.png";
        this.sprites.left.src = "img/left.png";
        this.sprites.right.src = "img/right.png";
        this.moving = false;
    }

    move() {
        if (!this.moving) return;
        let newX = this.x;
        let newY = this.y;

        switch (this.direction) {
            case "up": newY -= this.speed; break;
            case "down": newY += this.speed; break;
            case "left": newX -= this.speed; break;
            case "right": newX += this.speed; break;
        }

        // Prevent player from moving out of bounds
        if (newX < 0 || newX > (canvas.width - 50) || newY < 0 || newY > (canvas.height - 60)) {
            return;
        }

        this.x = newX;
        this.y = newY;
    }

    draw() {
        ctx.save(); 

        const playerWidth = 50;
        const playerHeight = 50;

        const textWidth = ctx.measureText(this.name).width + 10;
        const textHeight = 20;
        const textX = this.x + playerWidth / 2 - textWidth / 2;
        const textY = this.y - 15;

        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(textX, textY - textHeight + 5, textWidth, textHeight);

        ctx.fillStyle = "white";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.name, this.x + playerWidth / 2, textY);

        ctx.restore();
        ctx.drawImage(this.sprites[this.direction], this.x, this.y, playerWidth, playerHeight);
    }
}

// Point class for targets to find
class Point {
    constructor(id, x, y, message, size = 70) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.message = message;
        this.size = size;
        this.image = new Image();
        this.image.src = "img/point.svg";
        this.loaded = false;
        this.image.onload = () => {
            this.loaded = true;
        };
    }

    draw() {
        if (this.loaded && discoveredPlaces.includes(this.id)) {
            ctx.drawImage(this.image, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
            this.showMessage();
        }
    }

    isNear(player) {
        const proximity = 50;
        const distance = Math.sqrt((player.x - this.x) ** 2 + (player.y - this.y) ** 2);

        if (distance < proximity) {
            return true;
        }
        return false;
    }

    showMessage() {
        ctx.save(); 
    
        ctx.font = "16px Arial";
        const textWidth = ctx.measureText(this.message).width + 20;
        const textHeight = 30;
    
        const rectX = this.x - textWidth / 2;
        const rectY = this.y - this.size / 2 - textHeight - 5;
    
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(rectX, rectY, textWidth, textHeight);
    
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(this.message, this.x, rectY + textHeight / 2 + 5);
    
        ctx.restore();
    }
    
}

// Game status variables
let totalTime;
let timeLeft;
let totalPlaces;
let discoveredPlaces;
let gameTimer;
let gameEnded = true;
let animationFrameId;

// Constants and game objects
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const availablePoints = [
    new Point(1, 703, 225, "Mestalla"),
    new Point(2, 328, 592,"Plaza de Toros"),
    new Point(3, 821, 505, "Oceanografic"),
    new Point(4, 282, 589, "Estacion del Norte"),
    new Point(5, 724, 94, "Universitat de Valencia"),
    new Point(6, 937, 391, "Malvarrossa"),
    new Point(7, 351, 303, "Porta de la Mar"),
    new Point(8, 135, 213, "Parc Botànic"),
    new Point(9, 316, 140, "Torres de Serrano"),
    new Point(10, 764, 598, "Ciudad de las Artes y las Ciencias"),
];
const points = [];
const background = new Background("img/valencia_mapa.png");
const player = new Player(100, 100, 10);

// Keyboard event listeners for movement
window.addEventListener("keydown", (event) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
    }
    switch (event.key) {
        case "ArrowUp":
            player.direction = "up";
            player.moving = true;
            break;
        case "ArrowDown":
            player.direction = "down";
            player.moving = true;
            break;
        case "ArrowLeft":
            player.direction = "left";
            player.moving = true;
            break;
        case "ArrowRight":
            player.direction = "right";
            player.moving = true;
            break;
    }
});

window.addEventListener("keyup", (event) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        player.moving = false;
    }
});

// Function to update the timer
function updateTime() {

    if (timeLeft > 0) {
        timeLeft--;

    } else {
        gameEnded = true;
    }
}

// Function to draw the bar
function drawStatusBar() {

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(10, 10, 250, 70);

    ctx.fillStyle = "white";
    ctx.font = "18px Impact";
    ctx.fillText(`Lugares Descubiertos: ${discoveredPlaces.length} / ${totalPlaces}`, 20, 30);

    const timeBarWidth = 230;
    const timeBarHeight = 20;
    const timeBarX = 20;
    const timeBarY = 40;

    ctx.fillStyle = "#555";
    ctx.fillRect(timeBarX, timeBarY, timeBarWidth, timeBarHeight);

    ctx.fillStyle = "#009073";
    ctx.fillRect(timeBarX, timeBarY, (timeBarWidth * timeLeft) / totalTime, timeBarHeight);
}


// Main drawing function
function draw() {
    if (gameEnded) {
        cancelAnimationFrame(animationFrameId);
        clearInterval(gameTimer);
        canvas.style.display = 'none';
        textGame.style.display = 'block';
        textGame.innerHTML = `
                    <h3>¡Se acabó el juego!</h3>
                    <p>¡Has encontrado ${discoveredPlaces.length} de ${totalPlaces} lugares!</p>
                    <button onclick="startGame();" class="btn btn-primary">Volver a Jugar</button>
                `;
        return;
    }


    ctx.clearRect(0, 0, canvas.width, canvas.height);
    background.draw();
    points.forEach(point => {
        point.draw();
    });
    player.move();
    player.draw();

    drawStatusBar();

    points.forEach(point => {
        if (point.isNear(player) && !discoveredPlaces.includes(point.id)) {
            discoveredPlaces.push(point.id);
            if (discoveredPlaces.length === totalPlaces) {
                gameEnded = true;
            }
        }
    });

    animationFrameId = requestAnimationFrame(draw);
}

// Form submit handler to start the game
document.getElementById('gameForm').addEventListener('submit', function (event) {
    event.preventDefault();
    startGame();
});

function startGame() {
    const restPoints = availablePoints.slice();
    const playerName = document.getElementById('playerName').value;
    const playerSpeed = parseInt(document.getElementById('playerSpeed').value);
    const numPlaces = parseInt(document.getElementById('numPlaces').value);
    const textGame = document.getElementById('textGame');
    const difficulty = document.getElementById('difficulty').value;

    if (!gameEnded) {
        clearInterval(gameTimer);
        cancelAnimationFrame(animationFrameId);
    }

    player.x = 100;
    player.y = 100;
    player.name = playerName;
    player.baseSpeed = playerSpeed;
    player.speed = playerSpeed;
    player.direction = "down";
    player.moving = false;

    // Reset points array and pick random points
    points.length = 0;
    for (let i = 0; i < numPlaces; i++) {
        const randomIndex = Math.floor(Math.random() * restPoints.length);
        points.push(restPoints[randomIndex]);
        restPoints.splice(randomIndex, 1);
    }
    gameEnded = false;
    totalPlaces = points.length;
    discoveredPlaces = [];

    if (difficulty === 'low') {
        d_time = totalPlaces * 10
    } else if (difficulty === 'medium') {
        d_time = totalPlaces * 7
    } else {
        d_time = totalPlaces * 5
    }
    totalTime = timeLeft = d_time / (2 * (playerSpeed / 10));


    canvas.style.display = 'none';
    textGame.style.display = 'block';
    textGame.innerHTML = `
                <h3>¡Hola, ${playerName}!</h3>
                <p>Encuentra los ${numPlaces} lugares en el mapa.</p>
                <h3>Controles del Juego</h3>
                <p><img src="./img/arrow_keys.png" alt="Controles del teclado" width="100" height="auto">: Mover al jugador</p>
                <button id="startButton" class="btn btn-primary">Aceptar</button>
            `;
}

// Start the game when the user clicks the button
document.getElementById('textGame').addEventListener('click', function (event) {
    if (event.target.id === 'startButton') {
        document.getElementById('gameCanvas').style.display = 'block';
        document.getElementById('textGame').style.display = 'none';
        gameTimer = setInterval(updateTime, 1000); // Start the timer
        draw();
    }
});
