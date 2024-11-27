
// Shared state
let petersonState = {
    processes: [],
    flag: [0, 0],
    turn: 0,
    attempts: 0,
    conflicts: 0
};

let dekkerState = {
    processes: [],
    flag: [0, 0],
    turn: 0,
    attempts: 0,
    conflicts: 0
};

class Process {
    constructor(id, algorithm) {
        this.id = id;
        this.algorithm = algorithm;
        this.state = 'idle';
        this.hasRequestedResource = false;
        this.hasResource = false;
    }
}

// Add these functions to your JavaScript

function highlightCodeLine(algorithm, lineNumber) {
    const codeSection = document.querySelector(`#${algorithm} .code-section`);
    const lines = codeSection.querySelectorAll('.code-line');
    
    // Remove previous highlights
    lines.forEach(line => line.classList.remove('highlighted'));
    
    // Add highlight to specified line
    if (lineNumber >= 0 && lineNumber < lines.length) {
        lines[lineNumber].classList.add('highlighted');
    }
}


function addProcess(algorithm) {
    const state = algorithm === 'peterson' ? petersonState : dekkerState;
    const processId = `${algorithm}-P${state.processes.length + 1}`;
    const process = new Process(processId, algorithm);
    
    const visArea = document.querySelector(`#${algorithm}-vis .visualization`);
    const processDiv = document.createElement('div');
    processDiv.className = 'process';
    processDiv.id = processId;
    processDiv.innerHTML = `P${state.processes.length + 1}`;
    
    visArea.appendChild(processDiv);
    state.processes.push(process);
    
    updateProcessPositions(algorithm);
}

function createRequestBall(processId, algorithm) {
    const visArea = document.querySelector(`#${algorithm}-vis .visualization`);
    const process = document.getElementById(processId);
    const criticalSection = visArea.querySelector('.critical-section');
    
    const ball = document.createElement('div');
    ball.className = 'request-ball';
    ball.id = `request-${processId}`;
    visArea.appendChild(ball);

    const processRect = process.getBoundingClientRect();
    const csRect = criticalSection.getBoundingClientRect();
    const visAreaRect = visArea.getBoundingClientRect();

    // Position relative to visualization area
    ball.style.left = `${processRect.left - visAreaRect.left + process.offsetWidth/2 - 6}px`;
    ball.style.top = `${processRect.top - visAreaRect.top + process.offsetHeight/2 - 6}px`;

    setTimeout(() => {
        ball.style.left = `${csRect.left - visAreaRect.left + criticalSection.offsetWidth/2 - 6}px`;
        ball.style.top = `${csRect.top - visAreaRect.top + criticalSection.offsetHeight/2 - 6}px`;
        
        // Remove ball after animation
        setTimeout(() => {
            ball.remove();
        }, 2000);
    }, 200);
}

function createGrantBall(processId, algorithm) {
    const visArea = document.querySelector(`#${algorithm}-vis .visualization`);
    const process = document.getElementById(processId);
    const criticalSection = visArea.querySelector('.critical-section');
    
    const ball = document.createElement('div');
    ball.className = 'grant-ball';
    ball.id = `grant-${processId}`;
    visArea.appendChild(ball);

    const processRect = process.getBoundingClientRect();
    const csRect = criticalSection.getBoundingClientRect();
    const visAreaRect = visArea.getBoundingClientRect();

    // Position relative to visualization area
    ball.style.left = `${csRect.left - visAreaRect.left + criticalSection.offsetWidth/2 - 6}px`;
    ball.style.top = `${csRect.top - visAreaRect.top + criticalSection.offsetHeight/2 - 6}px`;

    setTimeout(() => {
        ball.style.left = `${processRect.left - visAreaRect.left + process.offsetWidth/2 - 6}px`;
        ball.style.top = `${processRect.top - visAreaRect.top + process.offsetHeight/2 - 6}px`;
        
        // Remove ball after animation
        setTimeout(() => {
            ball.remove();
        }, 2000);
    }, 200);
}



function updateProcessPositions(algorithm) {
    const visArea = document.querySelector(`#${algorithm}-vis .visualization`);
    const processes = visArea.querySelectorAll('.process');
    const containerWidth = visArea.offsetWidth;
    const containerHeight = visArea.offsetHeight;
    const radius = Math.min(containerWidth, containerHeight) / 3; // Adjusted radius
    
    processes.forEach((process, index) => {
        const angle = (index * 2 * Math.PI / processes.length) - Math.PI / 2;
        const x = containerWidth/2 + radius * Math.cos(angle);
        const y = containerHeight/2 + radius * Math.sin(angle);
        
        process.style.left = `${x - process.offsetWidth/2}px`;
        process.style.top = `${y - process.offsetHeight/2}px`;
    });
    
    drawLines(algorithm);
}


function drawLines(algorithm) {
    const visArea = document.querySelector(`#${algorithm}-vis .visualization`);
    const canvas = visArea.querySelector('canvas');
    canvas.width = visArea.offsetWidth;
    canvas.height = visArea.offsetHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const processes = visArea.querySelectorAll('.process');
    const criticalSection = visArea.querySelector('.critical-section');
    
    processes.forEach(process => {
        const processRect = process.getBoundingClientRect();
        const csRect = criticalSection.getBoundingClientRect();
        const visAreaRect = visArea.getBoundingClientRect();
        
        ctx.beginPath();
        ctx.moveTo(
            processRect.left - visAreaRect.left + process.offsetWidth/2,
            processRect.top - visAreaRect.top + process.offsetHeight/2
        );
        ctx.lineTo(
            csRect.left - visAreaRect.left + criticalSection.offsetWidth/2,
            csRect.top - visAreaRect.top + criticalSection.offsetHeight/2
        );
        
        ctx.strokeStyle = process.classList.contains('process-critical') ? '#44ff44' : '#ffffff';
        ctx.lineWidth = process.classList.contains('process-critical') ? 3 : 1;
        ctx.stroke();
    });
}

// Add these functions to your existing script section:

let petersonInterval;
let dekkerInterval;

/// Update startPeterson function
function startPeterson() {
if (petersonState.processes.length < 2) {
alert('Add at least two processes first!');
return;
}

// Clear previous explanations
document.getElementById('peterson-explanation').innerHTML = '';

document.querySelector('button[onclick="startPeterson()"]').disabled = true;
petersonState.attempts++;
document.getElementById('peterson-attempts').textContent = petersonState.attempts;

let process1 = petersonState.processes[0];
let process2 = petersonState.processes[1];

// Process 1 attempts to enter
highlightCodeLine('peterson', 5);
addExplanation('peterson', 'Process P1 sets its flag to indicate interest in entering critical section');

setTimeout(() => {
process1.hasRequestedResource = true;
createRequestBall(process1.id, 'peterson');

highlightCodeLine('peterson', 6);
addExplanation('peterson', 'P1 sets turn to 1, giving P2 priority if there is contention');

setTimeout(() => {
    highlightCodeLine('peterson', 7);
    addExplanation('peterson', 'P1 checks if P2 is interested and has priority');
    
    // Process 2 attempts shortly after
    setTimeout(() => {
        highlightCodeLine('peterson', 13);
        addExplanation('peterson', 'P2 also wants to enter, sets its flag');
        process2.hasRequestedResource = true;
        createRequestBall(process2.id, 'peterson');
        
        highlightCodeLine('peterson', 14);
        addExplanation('peterson', 'P2 sets turn to 0, giving P1 priority');
        
        setTimeout(() => {
            highlightCodeLine('peterson', 15);
            addExplanation('peterson', 'P2 must wait since P1 has priority (turn = 0)');
            
            setTimeout(() => {
                if (petersonState.turn === 0) {
                    highlightCodeLine('peterson', 8);
                    addExplanation('peterson', 'P1 enters critical section while P2 waits');
                    enterCriticalSection(process1, 'peterson');
                    blockProcess(process2, 'peterson');
                    petersonState.conflicts++;
                    document.getElementById('peterson-conflicts').textContent = petersonState.conflicts;
                    
                    setTimeout(() => {
                        highlightCodeLine('peterson', 9);
                        addExplanation('peterson', 'P1 exits critical section and resets its flag');
                        exitCriticalSection(process1, 'peterson');
                        
                        setTimeout(() => {
                            highlightCodeLine('peterson', 16);
                            addExplanation('peterson', 'P2 can now enter critical section');
                            enterCriticalSection(process2, 'peterson');
                            
                            setTimeout(() => {
                                highlightCodeLine('peterson', 17);
                                addExplanation('peterson', 'P2 exits critical section and resets its flag');
                                exitCriticalSection(process2, 'peterson');
                                document.querySelector('button[onclick="startPeterson()"]').disabled = false;
                            }, 1000);
                        }, 500);
                    }, 1000);
                }
            }, 1000);
        }, 500);
    }, 1000);
}, 500);
}, 500);
}

// Update startDekker function
function startDekker() {
if (dekkerState.processes.length < 2) {
alert('Add at least two processes first!');
return;
}

// Clear previous explanations
document.getElementById('dekker-explanation').innerHTML = '';

document.querySelector('button[onclick="startDekker()"]').disabled = true;
dekkerState.attempts++;
document.getElementById('dekker-attempts').textContent = dekkerState.attempts;

let process1 = dekkerState.processes[0];
let process2 = dekkerState.processes[1];

highlightCodeLine('dekker', 5);
addExplanation('dekker', 'Process P1 indicates interest by setting its flag');

setTimeout(() => {
process1.hasRequestedResource = true;
createRequestBall(process1.id, 'dekker');

setTimeout(() => {
    highlightCodeLine('dekker', 19);
    addExplanation('dekker', 'P2 also sets its flag, indicating interest');
    process2.hasRequestedResource = true;
    createRequestBall(process2.id, 'dekker');
    
    setTimeout(() => {
        highlightCodeLine('dekker', 6);
        highlightCodeLine('dekker', 20);
        addExplanation('dekker', 'Both processes detect conflict (both flags are set)');
        
        setTimeout(() => {
            highlightCodeLine('dekker', 7);
            addExplanation('dekker', 'P1 checks if it has priority (turn value)');
            
            if (dekkerState.turn === 0) {
                highlightCodeLine('dekker', 13);
                addExplanation('dekker', 'P1 has priority, enters critical section');
                enterCriticalSection(process1, 'dekker');
                
                highlightCodeLine('dekker', 22);
                highlightCodeLine('dekker', 23);
                addExplanation('dekker', 'P2 must back off and wait (sets flag to 0)');
                blockProcess(process2, 'dekker');
                dekkerState.conflicts++;
                document.getElementById('dekker-conflicts').textContent = dekkerState.conflicts;
                
                setTimeout(() => {
                    highlightCodeLine('dekker', 14);
                    highlightCodeLine('dekker', 15);
                    addExplanation('dekker', 'P1 finishes, sets turn to 1 and resets flag');
                    exitCriticalSection(process1, 'dekker');
                    
                    setTimeout(() => {
                        highlightCodeLine('dekker', 24);
                        highlightCodeLine('dekker', 25);
                        addExplanation('dekker', 'P2 sees its turn, sets flag and enters critical section');
                        enterCriticalSection(process2, 'dekker');
                        
                        setTimeout(() => {
                            highlightCodeLine('dekker', 29);
                            highlightCodeLine('dekker', 30);
                            addExplanation('dekker', 'P2 finishes, sets turn to 0 and resets flag');
                            exitCriticalSection(process2, 'dekker');
                            document.querySelector('button[onclick="startDekker()"]').disabled = false;
                        }, 1000);
                    }, 1000);
                }, 1000);
            }
        }, 1000);
    }, 1000);
}, 1000);
}, 1000);
}



// Add this helper function
function addExplanation(algorithm, text) {
const explanationArea = document.getElementById(`${algorithm}-explanation`);
const step = document.createElement('div');
step.className = 'step';
step.textContent = text;
explanationArea.appendChild(step);
explanationArea.scrollTop = explanationArea.scrollHeight;
}



// Update the enter/exit critical section functions to better reflect Dekker's behavior
function enterCriticalSection(process, algorithm) {
const processDiv = document.getElementById(process.id);
processDiv.classList.add('process-critical');
processDiv.style.backgroundColor = 'rgba(72, 176, 89, 0.3)';
processDiv.style.color = '#4ade80';
processDiv.innerHTML = `${process.id.split('-')[1]} (in CS)`;
process.hasResource = true;
createGrantBall(process.id, algorithm);
drawLines(algorithm);
}


function exitCriticalSection(process, algorithm) {
const processDiv = document.getElementById(process.id);
processDiv.classList.remove('process-critical');
processDiv.style.backgroundColor = '#253746';
processDiv.style.color = '#ffffff';
processDiv.innerHTML = process.id.split('-')[1];
process.hasResource = false;
process.hasRequestedResource = false;

if (algorithm === 'dekker') {
const state = dekkerState;
// Update turn for Dekker's algorithm
state.turn = process.id.includes('P1') ? 1 : 0;
}

drawLines(algorithm);
}

function blockProcess(process, algorithm) {
const processDiv = document.getElementById(process.id);
processDiv.style.backgroundColor = 'rgba(150, 33, 33, 0.3)';
processDiv.style.color = '#ff6b6b';
processDiv.innerHTML = `${process.id.split('-')[1]} (waiting)`;
if (algorithm === 'dekker') {
// For Dekker's algorithm, show the process giving up its attempt
processDiv.innerHTML = `${process.id.split('-')[1]} (backing off)`;
}
}


function resetPeterson() {
clearInterval(petersonInterval);
const visArea = document.getElementById('peterson-vis');
const processes = visArea.querySelectorAll('.process');
processes.forEach(process => process.remove());
highlightCodeLine('peterson', -1); // Clear highlights
document.getElementById('peterson-explanation').innerHTML = '';
// Remove any request or grant balls
const balls = visArea.querySelectorAll('.request-ball, .grant-ball');
balls.forEach(ball => ball.remove());

petersonState = {
processes: [],
flag: [0, 0],
turn: 0,
attempts: 0,
conflicts: 0
};

document.getElementById('peterson-attempts').textContent = '0';
document.getElementById('peterson-conflicts').textContent = '0';
document.querySelector('button[onclick="startPeterson()"]').disabled = false;
drawLines('peterson');
}

function resetDekker() {
clearInterval(dekkerInterval);
const visArea = document.getElementById('dekker-vis');
const processes = visArea.querySelectorAll('.process');
processes.forEach(process => process.remove());
highlightCodeLine('dekker', -1); // Clear highlights
document.getElementById('dekker-explanation').innerHTML = '';

// Remove any request or grant balls
const balls = visArea.querySelectorAll('.request-ball, .grant-ball');
balls.forEach(ball => ball.remove());

dekkerState = {
processes: [],
flag: [0, 0],
turn: 0,
attempts: 0,
conflicts: 0
};

document.getElementById('dekker-attempts').textContent = '0';
document.getElementById('dekker-conflicts').textContent = '0';
document.querySelector('button[onclick="startDekker()"]').disabled = false;
drawLines('dekker');
}

// Original expand/collapse functionality
document.querySelectorAll('.algorithm-header').forEach(header => {
    header.addEventListener('click', () => {
        const algorithm = header.parentElement;
        algorithm.classList.toggle('active');
        const btn = header.querySelector('.expand-btn');
        btn.textContent = algorithm.classList.contains('active') ? '-' : '+';
    });
});

window.addEventListener('resize', () => {
    updateProcessPositions('peterson');
    updateProcessPositions('dekker');
});

