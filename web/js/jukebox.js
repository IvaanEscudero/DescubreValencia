const audioPlayer = document.getElementById('audio-player');
const audioSource = document.getElementById('audio-source');
const audioFile = document.getElementById('audio-file');
const durationElem = document.getElementById('duration');
const timeRemainingElem = document.getElementById('time-remaining');
const playbackStatusElem = document.getElementById('playback-status');
const coverImage = document.getElementById('cover-image');
const statusIcon = document.getElementById('status-icon');

// Función para cargar y reproducir un nuevo archivo de audio con su portada y nombre de la canción
function playAudio(audioPath, coverPath, songName, button) {
    audioSource.src = audioPath;
    audioPlayer.load(); // Carga el nuevo audio
    audioPlayer.play();

    audioFile.textContent = songName; // Muestra el nombre de la canción
    coverImage.src = coverPath; // Asigna la imagen de portada

    // Agrega la animación de rotación a la portada
    coverImage.classList.add('cover-rotate');

    statusIcon.className = 'fa-solid fa-circle-play'; // Ícono de reproducción

    // Quitar la clase activa de todos los botones
    document.querySelectorAll('.playlist button').forEach(btn => btn.classList.remove('active'));

    // Agregar la clase activa solo al botón seleccionado
    button.classList.add('active');
}

// Evento cuando el archivo de audio se ha cargado completamente
audioPlayer.addEventListener('loadeddata', () => {
    const totalDuration = audioPlayer.duration;

    durationElem.textContent = `Duración total: ${formatTime(totalDuration)}`;
});

// Evento para actualizar la información mientras se reproduce
audioPlayer.addEventListener('timeupdate', () => {
    const currentTime = audioPlayer.currentTime;
    const timeRemaining = audioPlayer.duration - currentTime;


    timeRemainingElem.textContent = `Tiempo restante: ${formatTime(timeRemaining)}`;
});

// Evento para detectar cuando el audio ha terminado
audioPlayer.addEventListener('ended', () => {
    statusIcon.className = 'fa-solid fa-circle-stop'; // Ícono de stop

    // Detener la animación de rotación cuando termine el audio
    coverImage.classList.remove('cover-rotate');

    document.querySelectorAll('.playlist button').forEach(btn => btn.classList.remove('active'));

});

// Detectar cuando se pausa el audio
audioPlayer.addEventListener('pause', () => {
    statusIcon.className = 'fa-solid fa-circle-pause'; // Ícono de pausa
    // Detener la animación de rotación cuando el audio esté pausado
    coverImage.classList.remove('cover-rotate');
});

// Detectar cuando se reproduce el audio
audioPlayer.addEventListener('play', () => {
    statusIcon.className = 'fa-solid fa-circle-play'; // Ícono de reproducción
    // Agregar la animación de rotación cuando el audio esté en reproducción
    coverImage.classList.add('cover-rotate');
});


function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
}

