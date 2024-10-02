const timerDisplay = document.querySelector('.timer');
const startButton = document.querySelector ('.start-button');
const skipButton = document.querySelector('.skip-button');
const buttonGroup = document.querySelector('.button-group');
const messageElement = document.querySelector('.message');
const sessionCountElement = document.querySelector('.session-count');

let currentTime;
let intervalId;
let isPaused = false;
let currentMode = 'pomodoro';
let cycleCount = 1;

const modes = {
    pomodoro: { time: 1500, message: '¡Es hora de concentrarse!' },
    shortBreak: { time: 300, message: '¡Toma un pequeño descanso!' },
    longBreak: { time: 900, message: '¡Es hora de un descanso largo!' }
};

buttonGroup.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        setMode(e.target.dataset.mode);
    }
});

startButton.addEventListener('click', () => {
    if (!intervalId) {
        startTimer();
    } else if (isPaused) {
        resumeTimer();
    } else {
        pauseTimer();
    }
});

skipButton.addEventListener('click', () => {
    skipTimer();
});

function setMode(mode) {
    // Remove active class from all buttons
    buttonGroup.querySelectorAll('.blob-btn').forEach(btn => btn.classList.remove('active'));
    // Add active class to selected button
    buttonGroup.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    currentMode = mode;
    currentTime = modes[mode].time;
    messageElement.textContent = modes[mode].message;
    timerDisplay.textContent = formatTime(currentTime);
    updateVisualMode(mode);
    resetTimerUI();
}

function updateVisualMode(mode) {
    document.body.classList.remove('short-break', 'long-break');
    if (mode === 'shortBreak') {
        document.body.classList.add('short-break');
    } else if (mode === 'longBreak') {
        document.body.classList.add('long-break');
    }
}

function startTimer() {
    intervalId = setInterval(updateTimer, 1000);
    startButton.textContent = 'PAUSE';
    skipButton.style.display = 'inline-block';
    isPaused = false;
}

function pauseTimer() {
    clearInterval(intervalId);
    startButton.textContent = 'REANUDAR';
    isPaused = true;
}

function resumeTimer() {
    intervalId = setInterval(updateTimer, 1000);
    startButton.textContent = 'PAUSE';
    isPaused = false;
}

function skipTimer() {
    clearInterval(intervalId);
    if (currentMode === 'pomodoro') {
        if (cycleCount % 4 === 0) {
            setMode('longBreak');
        } else {
            setMode('shortBreak');
        }
    } else {
        setMode('pomodoro');
        cycleCount = cycleCount % 4 + 1;
        updateSessionCount();
    }
    resetTimerUI();
}

function updateTimer() {
    if (currentTime > 0) {
        currentTime -= 1;
        timerDisplay.textContent = formatTime(currentTime);
    } else {
        clearInterval(intervalId);
        skipTimer();
    }
}

function resetTimerUI() {
    clearInterval(intervalId);
    intervalId = null;
    startButton.textContent = 'EMPEZAR';
    skipButton.style.display = 'none';
    isPaused = false;
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function updateSessionCount() {
    sessionCountElement.textContent = `#${cycleCount}`;
}

// Initialize the timer in Pomodoro mode
setMode('pomodoro');
updateSessionCount();

function goBack() {
    // Obtener el conteo de ciclos actual
    const currentCycleCount = cycleCount;
    
    // Redirigir a Lista.html con el conteo de ciclos como parámetro de consulta
    window.location.href = '../Todo.html?cycleCount=' + currentCycleCount;
}