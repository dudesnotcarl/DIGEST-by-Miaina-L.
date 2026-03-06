// ------------------------------
// GLOBAL VARIABLES
// ------------------------------

let words = [];
let angle = 0;
let spinning = false;
let timer;
let timeLeft = 300;
let paused = false;
let timerStarted = false;
let currentPhase = "research";

const canvas = document.getElementById("wheelCanvas");
let ctx = canvas ? canvas.getContext("2d") : null;

const selectionSound = new Audio("ding.mp3");
const timerEndSound = new Audio("end.mp3");
const tickingSound = new Audio("tick.mp3");

tickingSound.loop = true;

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
  if (!ctx || words.length === 0) return;

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

  if (spinning || words.length < 2) return;

  spinning = true;
  canvas.classList.add("spinGlow");


  let angularVelocity = Math.random() * 0.3 + 0.4;

  function rotate() {
    angularVelocity *= 0.98;
    angle += angularVelocity;

    drawRotatedWheel();

    if (angularVelocity > 0.002) {
      requestAnimationFrame(rotate);
    } else {
      spinning = false;

      selectWord();

      // Show buttons after spin
      document.getElementById("spinBtn").style.display = "inline";
      document.getElementById("clearWordsBtn").style.display = "inline";
      document.getElementById("timerBtn").style.display = "inline";
    }
  }

  rotate();
}

function handleSpin() {
   const input = document.getElementById("wordInput").value;

  // Load words if not already loaded
  if (words.length === 0) {
    words = input.split("\n").map(w => w.trim()).filter(w => w !== "");
    if (words.length < 2) {
      alert("Enter at least 2 words la bro");
      return;
    }
    document.getElementById("wordList").innerText = "Words added: " + words.join(", ");
    drawWheel();

    document.getElementById("inputSection").style.display = "none";
    document.getElementById("savedWordsBtn").style.display = "none";
  }

  // Hide buttons while spinning
  document.getElementById("spinBtn").style.display = "none";
  document.getElementById("clearWordsBtn").style.display = "none";
  document.getElementById("startTimerBtn").style.display = "none";

  // Hide previous word, show wheel
  document.getElementById("selectedWord").style.display = "none";
  document.getElementById("wheelContainer").style.display = "flex";

  // Start actual spin
  spinWheel();
}

function selectWord() {
  canvas.classList.remove("spinGlow");

  let normalizedAngle = angle % (2 * Math.PI);
  if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;

  let index = Math.floor((words.length - (normalizedAngle / (2 * Math.PI)) * words.length)) % words.length;
  if (index < 0) index += words.length;

  const chosen = words[index];

  document.getElementById("wheelContainer").style.display = "none";

  const selectedEl = document.getElementById("selectedWord");
  selectedEl.innerText = chosen;
  selectedEl.style.display = "block";

  document.getElementById("startTimerBtn").style.display = "inline-block";

  localStorage.setItem("topicWord", chosen);
  selectionSound.play();
}

function goToTimer() {
  window.location.href = "timer.html";
}

// ------------------------------
// TIMER FUNCTIONS
// ------------------------------

window.onload = function() {
  const spinBtn = document.getElementById("spinBtn");
  if (spinBtn) {
    spinBtn.style.display = "inline-block";
  }

  const topicElement = document.getElementById("topicWord");
  if (topicElement) {
    const topic = localStorage.getItem("topicWord") || "No topic selected";
    topicElement.innerText = "Topic: " + topic;

    updateTimer();

    tickingSound.currentTime = 0;
    tickingSound.play().catch(() => {});
  }
};

function startTimer() {
  const display = document.getElementById("timerDisplay");
  if (!display) return;

  clearInterval(timer);

  timer = setInterval(() => {
    if (paused) return;

    timeLeft--;
    updateTimer();

    if (timeLeft <= 0) {
      if (currentPhase === "research") {
        goToExplainPhase();
      } else if (currentPhase === "explain") {
        clearInterval(timer);

        timerEndSound.currentTime = 0;
        timerEndSound.play().catch(() => {});
      }
    }
  }, 1000);
}

function pauseTimer() {
  if (!timerStarted) return;

  paused = !paused;
  const btn = document.getElementById("pauseBtn");
  if (btn) btn.innerText = paused ? "Resume" : "Pause";

  if (paused) {
    tickingSound.pause();
  } else {
    if (currentPhase === "research") {
      tickingSound.play().catch(() => {});
    }
  }
}

function readyNext() {
  if (!timerStarted || currentPhase !== "research") return;
  goToExplainPhase();
}

function clearTimer() {
  clearInterval(timer);

  timerStarted = false;
  paused = false;
  timeLeft = 300;
  currentPhase = "research";

  tickingSound.pause();
  tickingSound.currentTime = 0;

  timerEndSound.pause();
  timerEndSound.currentTime = 0;

  location.href = "index.html";
}

function updateTimer() {
  const display = document.getElementById("timerDisplay");
  if (!display) return;

  let m = Math.floor(timeLeft / 60);
  let s = timeLeft % 60;

  display.innerText =
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
  document.getElementById("wheelContainer").style.display = "none";
  document.getElementById("selectedWord").style.display = "none";
  document.getElementById("startTimerBtn").style.display = "none";
  document.getElementById("inputSection").style.display = "block";
  document.getElementById("savedWordsBtn").style.display = "inline-block";
  document.getElementById("spinBtn").style.display = "inline-block";
  document.getElementById("clearWordsBtn").style.display = "none";

  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function saveWords(){

  const input = document.getElementById("wordInput").value;

  const list = input.split("\n").map(w=>w.trim()).filter(w=>w!="");

  if(list.length < 2){
    alert("You must enter at least 2 words.");
    return;
  }

  let savedSets = JSON.parse(localStorage.getItem("savedWordSets")) || [];

  const newSet = JSON.stringify(list);

  const exists = savedSets.some(set => JSON.stringify(set) === newSet);

  if(exists){
    alert("This word set already exists.");
    return;
  }

  savedSets.push(list);

  localStorage.setItem("savedWordSets", JSON.stringify(savedSets));

  alert("Word set saved.");

}

function renderSavedLists(){

  const container = document.getElementById("savedContainer");

  container.innerHTML="";

  let savedSets = JSON.parse(localStorage.getItem("savedWordSets")) || [];

  savedSets.forEach((set,index)=>{

    const div=document.createElement("div");
    div.className="savedSet";

    div.innerHTML=`
      <p>${set.join(", ")}</p>

      <button onclick="loadSavedSet(${index})">Load</button>

      <button onclick="deleteSavedSet(${index})">Delete</button>

      <hr>
    `;

    container.appendChild(div);

  });

}

function loadSavedSet(index){

  let savedSets = JSON.parse(localStorage.getItem("savedWordSets")) || [];

  document.getElementById("wordInput").value = savedSets[index].join("\n");

  closeSavedUI();
}

function deleteSavedSet(index){

  let savedSets = JSON.parse(localStorage.getItem("savedWordSets")) || [];

  savedSets.splice(index,1);

  localStorage.setItem("savedWordSets", JSON.stringify(savedSets));

  renderSavedLists();
}



function openSavedUI(){
  document.getElementById("savedUI").style.display="flex";
  renderSavedLists();
}

function closeSavedUI(){
  document.getElementById("savedUI").style.display="none";
}



function beginTimer() {
  if (timerStarted) return;

  timerStarted = true;
  paused = false;
  currentPhase = "research";
  timeLeft = 300;

  const beginBtn = document.getElementById("beginTimerBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const readyBtn = document.getElementById("readyBtn");
  const label = document.getElementById("timerLabel");

  if (label) label.innerText = "Research / Plan";
  if (beginBtn) beginBtn.style.display = "none";
  if (pauseBtn) pauseBtn.style.display = "inline-block";
  if (readyBtn) readyBtn.style.display = "inline-block";

  updateTimer();

  tickingSound.currentTime = 0;
  tickingSound.play().catch(() => {});

  startTimer();
}

function goToExplainPhase() {
  currentPhase = "explain";
  timeLeft = 60;

  const label = document.getElementById("timerLabel");
  if (label) label.innerText = "Explain";

  const readyBtn = document.getElementById("readyBtn");
  if (readyBtn) readyBtn.style.display = "none";

  tickingSound.pause();
  tickingSound.currentTime = 0;

  updateTimer();
}