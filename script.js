let words = []
let angle = 0
let spinning = false

const selectionSound = new Audio("ding.mp3"); // replace with your ding file
const canvas = document.getElementById("wheelCanvas")
let ctx

if(canvas){
ctx = canvas.getContext("2d")
}

const timerStartSound = new Audio("start.mp3")
const timerEndSound = new Audio("end.mp3")
const alarmSound = new Audio("alarm.mp3")
const spinSound = new Audio("wheel.mp3") // spinning sound

function getColor(i){

if(words.length % 2 === 0){

return i % 2 === 0 ? "#000000" : "#f0ceb2"

}else{

const colors = ["#000000","#f0ceb2","#444"]

return colors[i % 3]

}

}

function drawWheel(){

const size = canvas.width/2
const arc = Math.PI * 2 / words.length

ctx.clearRect(0,0,canvas.width,canvas.height)

for(let i=0;i<words.length;i++){

let angleStart = i * arc

ctx.beginPath()
ctx.moveTo(size,size)
ctx.arc(size,size,size,angleStart,angleStart+arc)
ctx.fillStyle = getColor(i)
ctx.fill()

ctx.save()

ctx.translate(size,size)
ctx.rotate(angleStart + arc/2)

ctx.fillStyle="white"
ctx.font="16px Arial"
ctx.fillText(words[i],size/2,5)

ctx.restore()

}

}

function spinWheel(){
    if(spinning) return;

    spinning = true;

    canvas.classList.add("spinGlow")

    spinSound.loop = true;
    spinSound.play();

    let angularVelocity = (Math.random() * 0.3) + 0.4;

    function rotate(){
        angularVelocity *= 0.98; // friction
        angle += angularVelocity;

        drawRotatedWheel();

        // calculate current segment under pointer
        const arc = 2 * Math.PI / words.length;
        let normalizedAngle = (angle + Math.PI) % (2*Math.PI); // pointer on left
        let currentSegment = Math.floor(normalizedAngle / arc) % words.length;
        if(currentSegment < 0) currentSegment += words.length;

        if(angularVelocity > 0.002){
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

    // if words not added yet
    if(words.length === 0){
        words = input.split(",").map(w => w.trim()).filter(w => w !== "");
        if(words.length < 2){
            alert("Enter at least 2 words");
            return;
        }
        document.getElementById("wordList").innerText = "Words added: " + words.join(", ");
        drawWheel();
        document.getElementById("clearWordsBtn").style.display = "inline";
    }

    // hide selected word if visible
    document.getElementById("selectedWord").style.display = "none";

    // show wheel
    document.getElementById("wheelContainer").style.display = "flex";

    // start spinning
    spinWheel();
}

function drawRotatedWheel(){

const size = canvas.width/2

ctx.clearRect(0,0,canvas.width,canvas.height)

ctx.save()
ctx.translate(size,size)
ctx.rotate(angle)
ctx.translate(-size,-size)

drawWheel()

ctx.restore()

}

function selectWord(){

    canvas.classList.remove("spinGlow")

    const arc = 2 * Math.PI / words.length;

    let normalizedAngle = angle % (2 * Math.PI);
    if(normalizedAngle < 0) normalizedAngle += 2 * Math.PI;

    let index = Math.floor((words.length - (normalizedAngle / (2*Math.PI)) * words.length)) % words.length;
    if(index < 0) index += words.length;

    const chosen = words[index];

    // hide wheel
    document.getElementById("wheelContainer").style.display = "none";

    // show selected word
    const selectedEl = document.getElementById("selectedWord");
    selectedEl.innerText = chosen;
    selectedEl.style.display = "block";

    // show start timer button
    document.getElementById("startTimerBtn").style.display = "inline";

    localStorage.setItem("topicWord", chosen);

    // play selection sound
    selectionSound.play();
}

function goToTimer(){

window.location.href="timer.html"

}


/* TIMER PAGE */

window.onload = function(){

const topicElement = document.getElementById("topicWord")
    
if(topicElement){
    
const topic = localStorage.getItem("topicWord")
    
topicElement.innerText = "Topic: " + topic
    
startTimer()
    
}
    
}

let timer
let timeLeft = 300
let paused = false

function startTimer(){

timerStartSound.play()
    
timer = setInterval(()=>{
    
if(paused) return
    
timeLeft--
    
updateTimer()
    
if(timeLeft<=0){
    
clearInterval(timer)
    
timerEndSound.play()
    
}
    
},1000)
    
}

function pauseTimer(){

paused = !paused
    
const btn = document.getElementById("pauseBtn")
    
if(btn){
btn.innerText = paused ? "Resume" : "Pause"
}
    
}

function readyNext(){

timeLeft = 60
    
document.getElementById("timerLabel").innerText = "Explain"
    
updateTimer()
    
}

function clearTimer(){

location.href="index.html"

}

function updateTimer(){

let m = Math.floor(timeLeft/60)
let s = timeLeft%60

document.getElementById("timerDisplay").innerText =
String(m).padStart(2,"0")+":"+
String(s).padStart(2,"0")

}

function clearWords(){
    words = [];
    angle = 0;
    spinning = false;

    document.getElementById("wordInput").value = "";
    document.getElementById("wordList").innerText = "";
    document.getElementById("wheelContainer").style.display = "flex";
    document.getElementById("selectedWord").style.display = "none";
    document.getElementById("startTimerBtn").style.display = "none";
    
}