// Focus Shield - Auto Discipline System with Work Tracker, Penalties, Pomodoro, and Score Machine

// Timer variables
let timer;
let customTimerDuration = 25 * 60; // Default 25 minutes in seconds
let originalTimerDuration = 25 * 60; // Store original duration for penalties
let time = customTimerDuration; // Start with custom duration
let isRunning = false;
let focusedTime = 0;
let distractedTime = 0;
let lastHiddenTime = null;

// Pomodoro variables
let pomodoroMode = false;
let currentPhase = 'work'; // 'work', 'shortBreak', 'longBreak'
let workSessions = 0;
let pomodoroTime = 25 * 60; // 25 minutes in seconds
let breakTime = 5 * 60; // 5 minutes in seconds
let longBreakTime = 15 * 60; // 15 minutes in seconds

// Score system
let score = 0;
let scoreMultiplier = 1;
let scoreHistory = [];

// Stats and achievements
let stats = {
    totalFocusedTime: 0,
    totalDistractedTime: 0,
    completedSessions: 0,
    penalties: 0,
    streak: 0,
    lastSessionDate: null,
    achievements: [],
    totalScore: 0,
    dailyGoal: 4, // Daily goal in hours
    soundEnabled: true
};

let isBreakMode = false;

// DOM elements
const display = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const pomodoroBtn = document.getElementById('pomodoro-btn');
const timerDisplayContainer = document.querySelector('.timer-container-outer');
const timerHoursInput = document.getElementById('timer-hours');
const timerMinutesInput = document.getElementById('timer-minutes');
const timerSecondsInput = document.getElementById('timer-seconds');
const timerLabelInput = document.getElementById('timer-label');
const timerThemeInput = document.getElementById('timer-theme');
const setTimerBtn = document.getElementById('set-timer-btn');
const presetBtns = document.querySelectorAll('.preset-btn');
const dailyGoalInput = document.getElementById('daily-goal-input');
const setDailyGoalBtn = document.getElementById('set-daily-goal-btn');
const breakModeBtn = document.getElementById('break-mode-btn');

// Create label element for timer display
const sessionLabelDisplay = document.createElement('div');
sessionLabelDisplay.id = 'session-label-display';
sessionLabelDisplay.className = 'h5 text-muted mb-2';
display.parentNode.insertBefore(sessionLabelDisplay, display);
const blockedList = document.getElementById('blocked-sites');
const newSiteInput = document.getElementById('new-site');
const addBtn = document.getElementById('add-site-btn');

// Progress chart elements
const chartFocusedTimeEl = document.getElementById('chart-focused-time');
const chartDistractedTimeEl = document.getElementById('chart-distracted-time');
const chartEfficiencyEl = document.getElementById('chart-efficiency');

// Progress chart variable
let progressChart = null;

// Score machine elements
const scoreDisplay = document.createElement('div');
scoreDisplay.id = 'score-machine';
scoreDisplay.innerHTML = `
    <div class="score-container">
        <div class="score-header">SCORE MACHINE</div>
        <div class="score-value" id="current-score">0</div>
        <div class="score-multiplier">x<span id="multiplier">1</span></div>
        <div class="score-effects" id="score-effects"></div>
    </div>
`;

// Penalty modal
const penaltyModal = document.createElement('div');
penaltyModal.className = 'modal';
penaltyModal.innerHTML = `
    <div class="modal-content penalty-modal">
        <h2>🚫 PENALTY APPLIED!</h2>
        <div id="penalty-reason"></div>
        <div class="score-loss">
            <span class="loss-amount" id="score-loss-amount"></span>
            <span class="loss-text">POINTS LOST</span>
        </div>
        <div class="penalty-message" id="penalty-message"></div>
        <button class="btn btn-danger" id="penalty-accept">Accept Penalty</button>
    </div>
`;

// Insert new elements
document.querySelector('.card-body').appendChild(pomodoroBtn);
document.querySelector('#features .container').appendChild(scoreDisplay);
document.body.appendChild(penaltyModal);

// Load stats from localStorage
function loadStats() {
    const saved = localStorage.getItem('focusShieldStats');
    if (saved) {
        stats = { ...stats, ...JSON.parse(saved) };
        score = stats.totalScore || 0;
    }
    updateUI();
    if (dailyGoalInput) dailyGoalInput.value = stats.dailyGoal;
}

// Save stats to localStorage
function saveStats() {
    stats.totalScore = score;
    localStorage.setItem('focusShieldStats', JSON.stringify(stats));
    localStorage.setItem('focusShieldScore', score);
    localStorage.setItem('scoreHistory', JSON.stringify(scoreHistory));
}

// Update UI with current stats
function updateUI() {
    const dailyProgress = document.getElementById('daily-progress');
    const dailyStats = document.getElementById('daily-stats');
    const streakDisplay = document.getElementById('streak-display');
    const achievementsList = document.getElementById('achievements-list');
    const multiplierDisplay = document.getElementById('multiplier');
    const levelBadge = document.getElementById('level-badge');

    // Calculate daily progress based on user-defined goal
    const dailyGoalInSeconds = (stats.dailyGoal || 4) * 60 * 60;
    const progressPercent = Math.min((focusedTime / dailyGoalInSeconds) * 100, 100);
    if (dailyProgress) dailyProgress.style.width = `${progressPercent}%`;

    const focusedMinutes = Math.floor(focusedTime / 60);
    const distractedMinutes = Math.floor(distractedTime / 60);
    if (dailyStats) dailyStats.textContent = `Goal: ${stats.dailyGoal}h | Focused: ${focusedMinutes}m | Distracted: ${distractedMinutes}m`;
    if (streakDisplay) streakDisplay.textContent = `🔥 ${stats.streak} Day Streak`;

    // Update level rank
    const rank = getRank(score);
    if (levelBadge) {
        levelBadge.textContent = `Rank: ${rank.name}`;
        levelBadge.className = `badge ${rank.class} rounded-pill shadow-sm`;
    }

    // Update score machine with count-up animation
    animateScoreCount(score);
    if (multiplierDisplay) multiplierDisplay.textContent = scoreMultiplier;

    // Update achievements
    if (achievementsList) {
        achievementsList.innerHTML = '';
        if (stats.achievements.length === 0) {
            achievementsList.innerHTML = '<span class="badge bg-secondary">No achievements yet</span>';
        } else {
            stats.achievements.forEach(achievement => {
                const badge = document.createElement('span');
                badge.className = 'badge bg-success me-1 mb-1 shadow-sm';
                badge.textContent = achievement;
                achievementsList.appendChild(badge);
            });
        }
    }

    if (pomodoroMode) updatePomodoroDisplay();
    else updateDisplay();

    updateProgressChart();
}

let lastAnimatedScore = 0;
function animateScoreCount(target) {
    const scoreEl = document.getElementById('current-score');
    if (!scoreEl) return;
    
    const start = lastAnimatedScore;
    const duration = 1000;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuad = t => t * (2 - t);
        const current = Math.floor(start + (target - start) * easeOutQuad(progress));
        scoreEl.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            lastAnimatedScore = target;
        }
    }
    requestAnimationFrame(update);
}

function getRank(score) {
    if (score >= 6000) return { name: 'Focus Master', class: 'bg-danger' };
    if (score >= 3000) return { name: 'Zen Monk', class: 'bg-warning text-dark' };
    if (score >= 1500) return { name: 'Deep Diver', class: 'bg-info' };
    if (score >= 500) return { name: 'Apprentice', class: 'bg-primary' };
    return { name: 'Novice', class: 'bg-secondary' };
}

// Update regular timer display
function updateDisplay() {
    const hours = Math.floor(Math.abs(time) / 3600);
    const minutes = Math.floor((Math.abs(time) % 3600) / 60);
    const seconds = Math.abs(time) % 60;
    const sign = time < 0 ? '-' : '';
    display.textContent = `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Update Pomodoro display
function updatePomodoroDisplay() {
    let currentTime;
    if (currentPhase === 'work') {
        currentTime = pomodoroTime;
    } else if (currentPhase === 'shortBreak') {
        currentTime = breakTime;
    } else {
        currentTime = longBreakTime;
    }

    const hours = Math.floor(currentTime / 3600);
    const minutes = Math.floor((currentTime % 3600) / 60);
    const seconds = currentTime % 60;
    display.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Update phase indicator
    const phaseIndicator = document.getElementById('phase-indicator');
    if (phaseIndicator) {
        phaseIndicator.textContent = currentPhase === 'work' ? '🍅 Work Session' :
                                   currentPhase === 'shortBreak' ? '☕ Short Break' : '🏖️ Long Break';
        phaseIndicator.className = currentPhase === 'work' ? 'phase-work' :
                                 currentPhase === 'shortBreak' ? 'phase-break' : 'phase-long-break';
    }
}

// Score machine functions
function addScore(points, reason) {
    const actualPoints = points * scoreMultiplier;
    score += actualPoints;
    scoreHistory.push({ points: actualPoints, reason, timestamp: Date.now() });

    // Animate score increase
    animateScoreIncrease(actualPoints);

    // Check for multiplier increases
    if (stats.streak >= 7) scoreMultiplier = 2;
    else if (stats.streak >= 3) scoreMultiplier = 1.5;
    else scoreMultiplier = 1;

    updateUI();
    saveStats();
}

function deductScore(points, reason) {
    const actualPoints = points;
    score = Math.max(0, score - actualPoints);
    scoreHistory.push({ points: -actualPoints, reason, timestamp: Date.now() });

    // Show penalty modal
    showPenaltyModal(reason, actualPoints);

    updateUI();
    saveStats();
}

function animateScoreIncrease(points) {
    const effectsContainer = document.getElementById('score-effects');
    const effect = document.createElement('div');
    effect.className = 'score-effect';
    effect.textContent = `+${points}`;
    effectsContainer.appendChild(effect);

    setTimeout(() => {
        effect.remove();
    }, 2000);
}

// Penalty modal functions
function showPenaltyModal(reason, pointsLost) {
    const reasonElement = document.getElementById('penalty-reason');
    const amountElement = document.getElementById('score-loss-amount');
    const messageElement = document.getElementById('penalty-message');

    reasonElement.textContent = reason;
    amountElement.textContent = pointsLost;

    const messages = [
        "Focus is key! Don't let distractions win.",
        "Every distraction costs you progress.",
        "Stay disciplined to maximize your score!",
        "Remember: consistency builds champions."
    ];
    messageElement.textContent = messages[Math.floor(Math.random() * messages.length)];

    penaltyModal.style.display = 'flex';

    // Animate score loss
    amountElement.style.animation = 'scoreLoss 0.5s ease-in-out';
}

function hidePenaltyModal() {
    penaltyModal.style.display = 'none';
}

// Pomodoro functions
function togglePomodoroMode() {
    pomodoroMode = !pomodoroMode;
    pomodoroBtn.textContent = pomodoroMode ? 'Exit Pomodoro' : 'Pomodoro Mode';

    if (pomodoroMode) {
        resetTimer();
        startPomodoroSession();
        addPhaseIndicator();
    } else {
        removePhaseIndicator();
        resetTimer();
    }
}

function startPomodoroSession() {
    currentPhase = 'work';
    pomodoroTime = 25 * 60;
    workSessions = 0;
    updatePomodoroDisplay();
}

function addPhaseIndicator() {
    if (!document.getElementById('phase-indicator')) {
        const indicator = document.createElement('div');
        indicator.id = 'phase-indicator';
        indicator.className = 'phase-work';
        indicator.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            z-index: 1000;
        `;
        document.body.appendChild(indicator);
    }
}

function removePhaseIndicator() {
    const indicator = document.getElementById('phase-indicator');
    if (indicator) indicator.remove();
}

function nextPomodoroPhase() {
    if (currentPhase === 'work') {
        workSessions++;
        if (workSessions % 4 === 0) {
            currentPhase = 'longBreak';
            longBreakTime = 15 * 60;
        } else {
            currentPhase = 'shortBreak';
            breakTime = 5 * 60;
        }
    } else {
        currentPhase = 'work';
        pomodoroTime = 25 * 60;
    }
    updatePomodoroDisplay();
}

// Check and update streak
function updateStreak() {
    const today = new Date().toDateString();
    if (stats.lastSessionDate !== today) {
        if (stats.lastSessionDate === new Date(Date.now() - 86400000).toDateString()) {
            stats.streak++;
        } else {
            stats.streak = 1;
        }
        stats.lastSessionDate = today;
    }
}

// Check for achievements
function checkAchievements() {
    const newAchievements = [];

    if (stats.totalFocusedTime >= 3600 && !stats.achievements.includes('1 Hour Focused')) {
        newAchievements.push('1 Hour Focused');
    }
    if (stats.completedSessions >= 5 && !stats.achievements.includes('5 Sessions Complete')) {
        newAchievements.push('5 Sessions Complete');
    }
    if (stats.streak >= 7 && !stats.achievements.includes('Week Streak')) {
        newAchievements.push('Week Streak');
    }
    if (stats.totalDistractedTime < 300 && stats.totalFocusedTime > 1800 && !stats.achievements.includes('Focused Master')) {
        newAchievements.push('Focused Master');
    }

    if (newAchievements.length > 0) {
        stats.achievements.push(...newAchievements);
        showAchievementNotification(newAchievements);
    }
}

// Show achievement notification
function showAchievementNotification(achievements) {
    const notification = document.createElement('div');
    notification.className = 'alert alert-success position-fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.innerHTML = `
        <strong>🎉 Achievement Unlocked!</strong><br>
        ${achievements.join(', ')}
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Apply penalty for distraction
function applyPenalty() {
    if (isBreakMode) return; // No penalties during break mode
    
    // Visual feedback for penalty
    document.body.style.animation = 'none';
    document.body.classList.add('screen-shake');
    setTimeout(() => {
        document.body.classList.remove('screen-shake');
        document.body.style.border = '4px solid #ef4444';
        setTimeout(() => document.body.style.border = 'none', 500);
    }, 10);

    stats.penalties++;
    stats.totalDistractedTime += distractedTime;

    // Add penalty time to the timer (2 minutes penalty for each distraction)
    const penaltyTime = 2 * 60; // 2 minutes in seconds
    if (pomodoroMode) {
        if (currentPhase === 'work') {
            pomodoroTime += penaltyTime;
        } else if (currentPhase === 'shortBreak') {
            breakTime += penaltyTime;
        } else {
            longBreakTime += penaltyTime;
        }
    } else {
        time += penaltyTime;
    }

    // Still deduct points as additional penalty
    deductScore(25, 'Distraction detected - Time penalty applied');

    // Show penalty modal with time increase info
    showPenaltyModal(`Time penalty applied! +${Math.floor(penaltyTime/60)} minutes added to your timer.`, 'distraction');

    // Audio warning for distraction
    playNotification('warning');

    // Show motivational message
    showMotivationalMessage('Stay focused! Every distraction adds time to your session.');
}

// Audio Notification System (Web Audio API)
function playNotification(type) {
    if (!stats.soundEnabled) return;

    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        if (type === 'success') {
            // Pleasant double-beep
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.3);
        } else if (type === 'warning') {
            // Low buzzing tone
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(120, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.5);
        }
    } catch (e) {
        console.error('Audio play failed:', e);
    }
}

// Show motivational message
function showMotivationalMessage(message) {
    const msg = document.createElement('div');
    msg.className = 'alert alert-info position-fixed';
    msg.style.bottom = '20px';
    msg.style.left = '20px';
    msg.style.zIndex = '9999';
    msg.innerHTML = `<strong>💪 ${message}</strong>`;
    document.body.appendChild(msg);

    setTimeout(() => {
        msg.remove();
    }, 4000);
}

// Timer functions
startBtn.addEventListener('click', () => {
    if (!isRunning) {
        isRunning = true;
        
        // Add visual pulse effect
        if (timerDisplayContainer) {
            timerDisplayContainer.style.borderColor = timerThemeInput.value;
            timerDisplayContainer.classList.add('timer-glow');
        }
        
        timer = setInterval(() => {
            if (pomodoroMode) {
                if (currentPhase === 'work') {
                    pomodoroTime--;
                    focusedTime++;
                    stats.totalFocusedTime++;
                    if (pomodoroTime <= 0) {
                        playNotification('success');
                        addScore(50, 'Completed work session');
                        nextPomodoroPhase();
                    }
                } else if (currentPhase === 'shortBreak') {
                    breakTime--;
                    if (breakTime <= 0) {
                        nextPomodoroPhase();
                    }
                } else {
                    longBreakTime--;
                    if (longBreakTime <= 0) {
                        nextPomodoroPhase();
                    }
                }
            } else {
                time--; // Count down instead of up
                focusedTime++;
                stats.totalFocusedTime++;
                // Award points for focused time (every 5 minutes)
                if (focusedTime % 300 === 0) {
                    addScore(10, '5 minutes focused');
                }
                // Check if timer reached zero
                if (time <= 0) {
                    isRunning = false;
                    clearInterval(timer);
                    
                    if (isBreakMode) {
                        playNotification('success');
                        showMotivationalMessage('☕ Break finished! Ready to focus again?');
                        toggleBreakMode(); // Automatically exit break mode
                    } else {
                        playNotification('success');
                        addScore(50, 'Timer completed successfully!');
                        showMotivationalMessage('🎉 Timer completed! Great job staying focused! How about a short break?');
                    }
                    
                    checkAchievements();
                    saveStats();
                }
            }
            updateUI();
            checkAchievements();
            saveStats();
        }, 1000);
        showMotivationalMessage('Great! Stay focused and productive.');
    }
});

pauseBtn.addEventListener('click', () => {
    isRunning = false;
    clearInterval(timer);
    if (timerDisplayContainer) {
        timerDisplayContainer.classList.remove('timer-glow');
    }
});

resetBtn.addEventListener('click', () => {
    isRunning = false;
    clearInterval(timer);
    if (timerDisplayContainer) {
        timerDisplayContainer.classList.remove('timer-glow');
    }
    if (pomodoroMode) {
        startPomodoroSession();
    } else {
        time = customTimerDuration; // Reset to custom duration instead of 0
        focusedTime = 0;
        distractedTime = 0;
        updateDisplay();
    }
    updateUI();
});

// Pomodoro button
pomodoroBtn.addEventListener('click', togglePomodoroMode);

// Timer duration controls
setTimerBtn.addEventListener('click', () => {
    const h = parseInt(timerHoursInput.value) || 0;
    const m = parseInt(timerMinutesInput.value) || 0;
    const s = parseInt(timerSecondsInput.value) || 0;
    
    const totalSeconds = (h * 3600) + (m * 60) + s;
    
    if (totalSeconds >= 1) {
        customTimerDuration = totalSeconds;
        originalTimerDuration = customTimerDuration;
        time = customTimerDuration;
        
        // Update session label
        const label = timerLabelInput.value.trim() || 'Focus Session';
        sessionLabelDisplay.textContent = label;
        
        // Update theme color
        const themeColor = timerThemeInput.value;
        display.style.color = themeColor;
        startBtn.style.backgroundColor = themeColor;
        startBtn.style.borderColor = themeColor;
        
        updateDisplay();
        showMotivationalMessage(`Timer set to ${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s > 0 ? s + 's ' : ''}. Good luck!`);
    } else {
        showMotivationalMessage('Please enter a duration of at least 1 second.');
    }
});

// Preset buttons
presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        timerHoursInput.value = btn.dataset.h;
        timerMinutesInput.value = btn.dataset.m;
        timerSecondsInput.value = btn.dataset.s;
        
        // Automatically set the timer when a preset is clicked
        setTimerBtn.click();
    });
});

// Theme color change live preview
timerThemeInput.addEventListener('input', (e) => {
    const color = e.target.value;
    display.style.color = color;
});

// Penalty modal accept button
document.getElementById('penalty-accept').addEventListener('click', hidePenaltyModal);

startBtn.addEventListener('click', () => {
    if (!isRunning) {
        isRunning = true;
        timer = setInterval(() => {
            time++;
            focusedTime++;
            stats.totalFocusedTime++;
            updateUI();
            checkAchievements();
            saveStats();
        }, 1000);
        showMotivationalMessage('Great! Stay focused and productive.');
    }
});

pauseBtn.addEventListener('click', () => {
    isRunning = false;
    clearInterval(timer);
});

resetBtn.addEventListener('click', () => {
    isRunning = false;
    clearInterval(timer);
    time = 0;
    focusedTime = 0;
    distractedTime = 0;
    updateDisplay();
    updateUI();
});

// Enhanced distraction detection - detects both tab switches and app switches
let windowBlurred = false;
let blurStartTime = null;

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (isRunning) {
            lastHiddenTime = Date.now();
            showMotivationalMessage('⚠️ Tab switched! This counts as distraction.');
        }
    } else {
        if (lastHiddenTime && isRunning) {
            const awayDuration = Math.floor((Date.now() - lastHiddenTime) / 1000);
            distractedTime += awayDuration;
            applyPenalty();
            lastHiddenTime = null;
        }
    }
});

// Detect when user switches to other applications (window loses focus)
window.addEventListener('blur', () => {
    if (isRunning && !document.hidden) { // Only if not already detected by visibility change
        windowBlurred = true;
        blurStartTime = Date.now();
        showMotivationalMessage('🚨 Switched to another app! Stay focused!');
    }
});

window.addEventListener('focus', () => {
    if (windowBlurred && isRunning) {
        const awayDuration = Math.floor((Date.now() - blurStartTime) / 1000);
        distractedTime += awayDuration;
        applyPenalty();
        windowBlurred = false;
        blurStartTime = null;
    }
});

// Blocklist functionality
addBtn.addEventListener('click', () => {
    const site = newSiteInput.value.trim();
    if (site) {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `${site} <button class="btn btn-sm btn-outline-danger remove-btn">Remove</button>`;
        blockedList.appendChild(li);
        newSiteInput.value = '';
    }
});

blockedList.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-btn')) {
        e.target.parentElement.remove();
    }
});

// Progress Chart Functions
function initializeProgressChart() {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;

    progressChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Focused Time', 'Distracted Time'],
            datasets: [{
                data: [0, 0],
                backgroundColor: [
                    'rgba(25, 135, 84, 0.8)',  // Success green
                    'rgba(220, 53, 69, 0.8)'   // Danger red
                ],
                borderColor: [
                    'rgba(25, 135, 84, 1)',
                    'rgba(220, 53, 69, 1)'
                ],
                borderWidth: 2,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const minutes = Math.floor(context.parsed / 60);
                            const seconds = context.parsed % 60;
                            return `${context.label}: ${minutes}m ${seconds}s`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });
}

function updateProgressChart() {
    if (!progressChart) return;

    const focusedMinutes = Math.floor(focusedTime / 60);
    const distractedMinutes = Math.floor(distractedTime / 60);
    const totalTime = focusedTime + distractedTime;

    // Update chart data
    progressChart.data.datasets[0].data = [focusedTime, distractedTime];
    progressChart.update();

    // Update display elements
    if (chartFocusedTimeEl) {
        chartFocusedTimeEl.textContent = `${focusedMinutes}m`;
    }
    if (chartDistractedTimeEl) {
        chartDistractedTimeEl.textContent = `${distractedMinutes}m`;
    }
    if (chartEfficiencyEl) {
        const efficiency = totalTime > 0 ? Math.round((focusedTime / totalTime) * 100) : 0;
        chartEfficiencyEl.textContent = `${efficiency}%`;
    }
}

// Slide Navigation Logic
function initializeSlideNav() {
    const sections = document.querySelectorAll('section');
    const dots = document.querySelectorAll('.dot');

    // Dot click scrolling
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const targetId = dot.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Intersection Observer for active state and reveal animation
    const observerOptions = {
        threshold: 0.2 // Lowered threshold for better detection
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Update dots
                const sectionId = entry.target.id;
                dots.forEach(dot => {
                    dot.classList.toggle('active', dot.getAttribute('data-target') === sectionId);
                });

                // Trigger reveal animation
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
}

// Daily focus goal functionality
setDailyGoalBtn.addEventListener('click', () => {
    const newGoal = parseInt(dailyGoalInput.value);
    if (newGoal >= 1) {
        stats.dailyGoal = newGoal;
        saveStats();
        updateUI();
        showMotivationalMessage(`Daily goal updated to ${newGoal} hours.`);
    } else {
        showMotivationalMessage('Please enter a goal of at least 1 hour.');
    }
});

// Break mode functionality
function toggleBreakMode() {
    isBreakMode = !isBreakMode;
    if (isBreakMode) {
        breakModeBtn.classList.remove('btn-outline-success');
        breakModeBtn.classList.add('btn-success');
        breakModeBtn.innerHTML = '<i class="fas fa-check"></i> Focus Mode';
        sessionLabelDisplay.textContent = '☕ Break Time';
        display.style.color = '#198754'; // Success green
        showMotivationalMessage('Enjoy your break! Distraction tracking is disabled.');
    } else {
        breakModeBtn.classList.remove('btn-success');
        breakModeBtn.classList.add('btn-outline-success');
        breakModeBtn.innerHTML = '<i class="fas fa-coffee"></i> Break Mode';
        sessionLabelDisplay.textContent = 'Focus Session';
        display.style.color = timerThemeInput.value;
        showMotivationalMessage('Back to focus! Stay disciplined.');
    }
}

breakModeBtn.addEventListener('click', toggleBreakMode);

/* Theme Management Class */
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('focusShieldTheme') || 'midnight';
        this.primaryColor = localStorage.getItem('focusShieldPrimary') || '#22d3ee';
        this.secondaryColor = localStorage.getItem('focusShieldSecondary') || '#818cf8';
        this.init();
    }

    init() {
        this.applyTheme();
        this.setupListeners();
    }

    applyTheme() {
        // Toggle theme attribute on html element
        document.documentElement.setAttribute('data-theme', this.theme === 'arctic' ? 'light' : 'dark');
        
        // Dynamically set CSS variables
        document.documentElement.style.setProperty('--primary', this.primaryColor);
        document.documentElement.style.setProperty('--secondary', this.secondaryColor);
        
        // Update settings UI states
        const modeRadio = document.getElementById(this.theme === 'arctic' ? 'mode-light' : 'mode-dark');
        if (modeRadio) modeRadio.checked = true;
        
        const picker = document.getElementById('accent-color-picker');
        if (picker) picker.value = this.primaryColor;
        
        // Update active UI elements color (like the timer)
        if (display && !isBreakMode) {
            display.style.color = this.primaryColor;
        }
    }

    setupListeners() {
        document.getElementById('mode-dark')?.addEventListener('change', () => this.setMode('midnight'));
        document.getElementById('mode-light')?.addEventListener('change', () => this.setMode('arctic'));
        document.getElementById('accent-color-picker')?.addEventListener('input', (e) => this.setAccentColor(e.target.value));
        
        document.querySelectorAll('.theme-preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setAccentColor(btn.dataset.primary, btn.dataset.secondary);
            });
        });
    }

    setMode(mode) {
        this.theme = mode;
        this.applyTheme();
        this.save();
    }

    setAccentColor(primary, secondary = null) {
        this.primaryColor = primary;
        if (secondary) {
            this.secondaryColor = secondary;
        } else {
            // If only primary is provided, generate a complementary secondary (subtle shift)
            this.secondaryColor = primary;
        }
        this.applyTheme();
        this.save();
    }

    save() {
        localStorage.setItem('focusShieldTheme', this.theme);
        localStorage.setItem('focusShieldPrimary', this.primaryColor);
        localStorage.setItem('focusShieldSecondary', this.secondaryColor);
    }
}

// Sound Settings Initializer
const soundToggle = document.getElementById('sound-effects-toggle');
if (soundToggle) {
    soundToggle.checked = stats.soundEnabled;
    soundToggle.addEventListener('change', (e) => {
        stats.soundEnabled = e.target.checked;
        saveStats();
        // Play a test sound if enabled
        if (stats.soundEnabled) playNotification('success');
    });
}

// Initialize everything on load
loadStats();
if (soundToggle) soundToggle.checked = stats.soundEnabled;
const themeManager = new ThemeManager();
initializeProgressChart();
initializeSlideNav(); // Ensure slide nav is initialized
updateDisplay();
updateStreak();
updateUI();
updateProgressChart();

// Advanced UI Interactions
document.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
});

// Dynamic Status Bar Messages (Student-Centric)
const statusMessages = [
    "System: Deep-Study Mode Active",
    "System: Minimizing Exam Anxiety...",
    "System: Flow State Probability: 98%",
    "System: Guarding Academic Focus",
    "System: Pomodoro Cycle: Optimizing...",
    "System: Achievement: 100% Focused Study"
];

const statusTextEl = document.querySelector('.status-tracker span:last-child');
if (statusTextEl) {
    setInterval(() => {
        const msg = statusMessages[Math.floor(Math.random() * statusMessages.length)];
        statusTextEl.style.opacity = 0;
        setTimeout(() => {
            statusTextEl.textContent = msg;
            statusTextEl.style.opacity = 1;
        }, 500);
    }, 10000);
}