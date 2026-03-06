// ------------------------------
// GLOBAL VARIABLES
// ------------------------------

let words = [];
let angle = 0;
let spinning = false;
let timer;
let timeLeft = 300;
let paused = false;

const canvas = document.getElementById("wheelCanvas");
let ctx = canvas ? canvas.getContext("2d") : null;

const selectionSound = new Audio("ding.mp3");
const spinSound = new Audio("wheel.mp3");
const timerStartSound = new Audio("start.mp3");
const timerEndSound = new Audio("end.mp3");
const alarmSound = new Audio("alarm.mp3");

// ------------------------------
// WHEEL FUNCTIONS
// ------------------------------

function getColor(i) {
  if (words.length % 2 === 0) {
    return i % 2 === 0 ? "#000000" : "#f0ceb2";
  } else {
    const colors = ["#000000", "#f0ceb2", "#444"];
    return colors[i % 3];
  }
}

function drawWheel() {
  if (!ctx) return;
  const size = canvas.width / 2;
  const arc = (Math.PI * 2) / words.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < words.length; i++) {
    let angleStart = i * arc;

    ctx.beginPath();
    ctx.moveTo(size, size);
    ctx.arc(size, size, size, angleStart, angleStart + arc);
    ctx.fillStyle = getColor(i);
    ctx.fill();

    ctx.save();
    ctx.translate(size, size);
    ctx.rotate(angleStart + arc / 2);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(words[i], size / 2, 5);
    ctx.restore();
  }
}

function drawRotatedWheel() {
  if (!ctx) return;
  const size = canvas.width / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(size, size);
  ctx.rotate(angle);
  ctx.translate(-size, -size);
  drawWheel();
  ctx.restore();
}

function spinWheel() {
  if (spinning) return;

  spinning = true;
  canvas.classList.add("spinGlow");

  spinSound.loop = true;
  spinSound.play();

  let angularVelocity = Math.random() * 0.3 + 0.4;

  function rotate() {
    angularVelocity *= 0.98; // friction
    angle += angularVelocity;

    drawRotatedWheel();

    if (angularVelocity > 0.002) {
      requestAnimationFrame(rotate);
    } else {
      spinning = false;
      spinSound.pause();
      spinSound.currentTime = 0;
      selectWord();
    }
  }

  rotate();
}

function handleSpin() {
  const input = document.getElementById("wordInput").value;

  if (words.length === 0) {
    words = input.split(",").map(w => w.trim()).filter(w => w !== "");
    if (words.length < 2) {
      alert("enter at least 2 words la bro");
      return;
    }
    document.getElementById("wordList").innerText = "Words added: " + words.join(", ");
    drawWheel();

    document.getElementById("inputSection").style.display = "none";
    document.getElementById("clearWordsBtn").style.display = "inline";
  }

  document.getElementById("selectedWord").style.display = "none";
  document.getElementById("startTimerBtn").style.display = "none";
  document.getElementById("wheelContainer").style.display = "flex";

  spinWheel();
}

function selectWord() {
  canvas.classList.remove("spinGlow");

  const arc = 2 * Math.PI / words.length;
  let normalizedAngle = angle % (2 * Math.PI);
  if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;

  let index = Math.floor((words.length - (normalizedAngle / (2 * Math.PI)) * words.length)) % words.length;
  if (index < 0) index += words.length;

  const chosen = words[index];

  document.getElementById("wheelContainer").style.display = "none";

  const selectedEl = document.getElementById("selectedWord");
  selectedEl.innerText = chosen;
  selectedEl.style.display = "block";

  document.getElementById("startTimerBtn").style.display = "inline";

  localStorage.setItem("topicWord", chosen);
  selectionSound.play();
}

function goToTimer() {
  // play start sound on user click
  timerStartSound.play().catch(() => {});
  window.location.href = "timer.html";
}

// ------------------------------
// TIMER FUNCTIONS
// ------------------------------

window.onload = function() {
  const topicElement = document.getElementById("topicWord");
  if (topicElement) {
    const topic = localStorage.getItem("topicWord");
    topicElement.innerText = "Topic: " + topic;
    startTimer();
  }
};

function startTimer() {
  timer = setInterval(() => {
    if (paused) return;

    timeLeft--;
    updateTimer();

    if (timeLeft <= 0) {
      clearInterval(timer);
      timerEndSound.play();
    }
  }, 1000);
}

function pauseTimer() {
  paused = !paused;
  const btn = document.getElementById("pauseBtn");
  if (btn) btn.innerText = paused ? "Resume" : "Pause";
}

function readyNext() {
  timeLeft = 60;
  document.getElementById("timerLabel").innerText = "Explain";
  updateTimer();

  const readyBtn = document.getElementById("readyBtn");
  if (readyBtn) readyBtn.style.display = "none";
}

function clearTimer() {
  location.href = "index.html";
}

function updateTimer() {
  let m = Math.floor(timeLeft / 60);
  let s = timeLeft % 60;
  document.getElementById("timerDisplay").innerText =
    String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

// ------------------------------
// UTILITY FUNCTIONS
// ------------------------------

function clearWords() {
  words = [];
  angle = 0;
  spinning = false;

  document.getElementById("wordInput").value = "";
  document.getElementById("wordList").innerText = "";
  document.getElementById("wheelContainer").style.display = "flex";
  document.getElementById("selectedWord").style.display = "none";
  document.getElementById("startTimerBtn").style.display = "none";
  document.getElementById("inputSection").style.display = "block";
  document.getElementById("clearWordsBtn").style.display = "none";
}