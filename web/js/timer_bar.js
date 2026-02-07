const canvas = document.getElementById("timerBar");
const ctx = canvas.getContext("2d");

// Clase Time
class Time {
    constructor(maxTime) {
        this.time = 0;
        this.maxTime = maxTime;
    }

    update() {
        if (this.time < this.maxTime) {
            this.time++;
        }
    }

    resetTime() {
        this.time = 0;
    }
    getProgress() {
        return (this.time / this.maxTime) * 100;
    }
}

// Instanciar la clase Time con una duración de 10 segundos (10000 ms)
let time = new Time(600);

// Configuración del canvas
canvas.width = window.innerWidth * 0.8;
canvas.height = 100;

function drawTimeline() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar línea base
    ctx.beginPath();
    ctx.moveTo(50, canvas.height / 2);
    ctx.lineTo(canvas.width - 50, canvas.height / 2);
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 6;
    ctx.stroke();

    // Dibujar barra de progreso
    const progress = time.getProgress();  // Obtener el progreso en porcentaje
    ctx.beginPath();
    ctx.moveTo(50, canvas.height / 2);
    ctx.lineTo(50 + ((canvas.width - 100) * (progress / 100)), canvas.height / 2);
    ctx.strokeStyle = "#4CAF50"; // Color de la barra de tiempo
    ctx.lineWidth = 6;
    ctx.stroke();

    // Dibujar círculo de progreso
    let xPos = 50 + ((canvas.width - 100) * (progress / 100));
    ctx.beginPath();
    ctx.arc(xPos, canvas.height / 2, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#4CAF50";
    ctx.fill();
}

function animateTimeline(timestamp) {
    time.update();
    drawTimeline();
    if (time.time < time.maxTime) {
        requestAnimationFrame(animateTimeline);  // Continuar la animación mientras no haya llegado al tiempo máximo
    }
}

// Iniciar la animación
animateTimeline();