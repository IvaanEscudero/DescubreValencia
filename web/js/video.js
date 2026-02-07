function setupVideoControls(videoElement, playPauseBtn, stopBtn, forwardBtn, volumeControl, volumeBtn, currentTime, totalTime, progressBar, fullscreenBtn) {

    // Event for play/pause toggle
    playPauseBtn.addEventListener('click', function () {
        playPause(videoElement, playPauseBtn)
    });

    // Event to stop the video and reset it
    stopBtn.addEventListener('click', function () {
        videoElement.pause();
        videoElement.currentTime = 0;
    });

    // Event to forward the video by 10 seconds
    forwardBtn.addEventListener('click', function () {
        videoElement.currentTime += 10;
    });

    // Event to adjust the volume
    volumeControl.addEventListener('input', function () {
        videoElement.volume = volumeControl.value;
        if (videoElement.volume === 0) {
            volumeBtn.classList.add("muted");
        } else {
            volumeBtn.classList.remove("muted");
        }
    });

    videoElement.addEventListener('loadeddata', () => {
        currentTime.textContent = formatTime(videoElement.currentTime)
        totalTime.textContent = formatTime(videoElement.duration)
    });

    videoElement.addEventListener('timeupdate', () => {
        currentTime.textContent = formatTime(videoElement.currentTime);
        const progress = (videoElement.currentTime / videoElement.duration) * 100;
        progressBar.value = progress;
    })

    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            videoElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    videoElement.addEventListener("click", () => {
        playPause(videoElement, playPauseBtn)
    })

    videoElement.addEventListener("play", function () {
        playPauseBtn.classList.remove("play-btn");
        playPauseBtn.classList.add("pause-btn");
        videoElement.classList.remove("on-pause")
        videoElement.classList.add("on-play")
    });


    videoElement.addEventListener("pause", function () {
        playPauseBtn.classList.add("play-btn");
        playPauseBtn.classList.remove("pause-btn");
        videoElement.classList.remove("on-play")
        videoElement.classList.add("on-pause")
    });

}

// Setup controls for all videos
const videoElements = document.querySelectorAll('.video');
videoElements.forEach((video, index) => {
    const playPauseBtn = document.querySelectorAll('.play-pause-btn')[index];
    const stopBtn = document.querySelectorAll('.stop-btn')[index];
    const forwardBtn = document.querySelectorAll('.forward-btn')[index];
    const volumeControl = document.querySelectorAll('.volume-control')[index];
    const volumeBtn = document.querySelectorAll('.volume-btn')[index];
    const currentTime = document.querySelectorAll('.current-time')[index];
    const totalTime = document.querySelectorAll('.total-time')[index];
    const progressBar = document.querySelectorAll('.progress-bar')[index];
    const fullscreenBtn = document.querySelectorAll('.fullscreen-btn')[index];

    setupVideoControls(video, playPauseBtn, stopBtn, forwardBtn, volumeControl, volumeBtn, currentTime, totalTime, progressBar, fullscreenBtn);
});

// Mute/unmute functionality
function mute(volumeBtn) {
    const videoElement = volumeBtn.closest('.video-container').querySelector('.video');
    const volumeControl = volumeBtn.closest('.video-container').querySelector('.volume-control');

    if (videoElement.volume === 0) {
        videoElement.volume = volumeControl.value;
        volumeBtn.classList.remove("muted");
    } else {
        videoElement.volume = 0;
        volumeBtn.classList.add("muted");
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
}

function playPause(videoElement, playPauseBtn) {
    if (videoElement.paused) {
        videoElement.play();
    } else {
        videoElement.pause();
    }
}