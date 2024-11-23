let processCount = 0;
let currentTime = 0;
let isRunning = false;
let animationInterval;
let processQueue = [];
let blockedQueue = [];
let activeProcess = null;
let completedProcesses = new Set();
let requestDelay = Math.floor(Math.random() * 3000) + 1000;
let processesRequestingResource = new Set();

class Process {
    constructor(id) {
        this.id = id;
        this.executionTime = Math.floor(Math.random() * 5) + 1;
        this.remainingTime = this.executionTime;
        this.state = 'waiting';
        this.hasRequestedResource = false;
        this.hasResource = false;
        this.isBlocked = false;
    }

    sendRequest() {
        if (!this.hasRequestedResource && !this.hasResource && !this.isBlocked) {
            this.hasRequestedResource = true;
            setTimeout(() => {
                createRequestBall(this.id);
            }, Math.random() * requestDelay);
        }
    }
}

function addProcess() {
    if (!isRunning) {
        processCount++;
        const process = new Process(`P${processCount}`);
        
        const container = document.querySelector('.container');
        const processDiv = document.createElement('div');
        processDiv.className = 'process';
        processDiv.id = process.id;
        processDiv.innerHTML = process.id;
        
        container.appendChild(processDiv);
        processQueue.push(process);
        
        updateProcessPositions();
        updateProcessInfo();
    }
}

function removeProcess() {
    if (!isRunning && processCount > 0) {
        const lastProcess = document.getElementById(`P${processCount}`);
        if (lastProcess) {
            lastProcess.remove();
            processQueue.pop();
            processCount--;
            updateProcessPositions();
            updateProcessInfo();
        }
    }
}

function createRequestBall(processId) {
    const process = document.getElementById(processId);
    const resource = document.getElementById('resource');
    const container = document.querySelector('.container');
    
    const ball = document.createElement('div');
    ball.className = 'request-ball';
    ball.id = `request-${processId}`;
    container.appendChild(ball);

    const processRect = process.getBoundingClientRect();
    const resourceRect = resource.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    ball.style.left = `${processRect.left - containerRect.left + process.offsetWidth/2 - 6}px`;
    ball.style.top = `${processRect.top - containerRect.top + process.offsetHeight/2 - 6}px`;

    setTimeout(() => {
        ball.style.left = `${resourceRect.left - containerRect.left + resource.offsetWidth/2 - 6}px`;
        ball.style.top = `${resourceRect.top - containerRect.top + resource.offsetHeight/2 - 6}px`;
    }, 50);

    setTimeout(() => {
        handleRequestArrival(processId);
    }, 550);
}

function createGrantBall(processId) {
    const process = document.getElementById(processId);
    const resource = document.getElementById('resource');
    const container = document.querySelector('.container');
    
    const ball = document.createElement('div');
    ball.className = 'grant-ball';
    ball.id = `grant-${processId}`;
    container.appendChild(ball);

    const processRect = process.getBoundingClientRect();
    const resourceRect = resource.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    ball.style.left = `${resourceRect.left - containerRect.left + resource.offsetWidth/2 - 6}px`;
    ball.style.top = `${resourceRect.top - containerRect.top + resource.offsetHeight/2 - 6}px`;

    setTimeout(() => {
        ball.style.left = `${processRect.left - containerRect.left + process.offsetWidth/2 - 6}px`;
        ball.style.top = `${processRect.top - containerRect.top + process.offsetHeight/2 - 6}px`;
    }, 50);

    setTimeout(() => {
        ball.remove();
        startProcessExecution(processId);
    }, 550);
}

function handleRequestArrival(processId) {
    const requestBall = document.getElementById(`request-${processId}`);
    if (requestBall) {
        requestBall.remove();
    }

    const process = processQueue.find(p => p.id === processId);
    if (process) {
        if (!activeProcess) {
            createGrantBall(processId);
        } else {
            process.state = 'blocked';
            process.isBlocked = true;
            if (!blockedQueue.includes(process)) {
                blockedQueue.push(process);
            }
            
            const processDiv = document.getElementById(process.id);
            processDiv.style.backgroundColor = '#ff9999';
            processDiv.innerHTML = `${process.id} (blocked)`;
        }
        updateProcessInfo();
    }
}
function startVisualization() {
    if (processQueue.length === 0) {
        alert('Add some processes first!');
        return;
    }
    
    isRunning = true;
    document.querySelector('button[onclick="startVisualization()"]').disabled = true;
    document.getElementById('pauseButton').disabled = false;
    
    animationInterval = setInterval(() => {
        if (isRunning) {
            currentTime++;
            updateTimer();
            updateProcessStates();
        }
    }, 1000);
}

function pauseVisualization() {
    isRunning = false;
    document.querySelector('button[onclick="startVisualization()"]').disabled = false;
    document.getElementById('pauseButton').disabled = true;
    clearInterval(animationInterval);
}

function updateTimer() {
    document.getElementById('timer').textContent = `Time: ${currentTime}s`;
}

function updateProcessStates() {
    if (!activeProcess) {
        const availableProcesses = processQueue.filter(p => 
            p.state === 'waiting' && 
            !p.hasRequestedResource && 
            !p.isBlocked && 
            !completedProcesses.has(p.id)
        );

        if (availableProcesses.length > 0) {
            const numProcessesToRequest = Math.min(
                Math.floor(Math.random() * 2) + 2,
                availableProcesses.length
            );

            for (let i = 0; i < numProcessesToRequest; i++) {
                const randomIndex = Math.floor(Math.random() * availableProcesses.length);
                const selectedProcess = availableProcesses.splice(randomIndex, 1)[0];
                processesRequestingResource.add(selectedProcess.id);
                selectedProcess.sendRequest();
            }
        }
    }

    if (activeProcess) {
        activeProcess.remainingTime--;
        
        if (activeProcess.remainingTime <= 0) {
            completeProcess(activeProcess);
            startNextProcess();
        }
    }
    
    updateProcessInfo();
    drawLines();
    
    if (completedProcesses.size === processQueue.length) {
        endVisualization();
    }
}

function startProcessExecution(processId) {
    if (activeProcess) {
        const process = processQueue.find(p => p.id === processId);
        if (process) {
            process.state = 'blocked';
            process.isBlocked = true;
            if (!blockedQueue.includes(process)) {
                blockedQueue.push(process);
            }
            const processDiv = document.getElementById(process.id);
            processDiv.style.backgroundColor = '#ff9999';
            processDiv.innerHTML = `${process.id} (blocked)`;
        }
        return;
    }

    const process = processQueue.find(p => p.id === processId);
    if (process) {
        activeProcess = process;
        process.state = 'running';
        process.hasResource = true;
        process.hasRequestedResource = false;
        process.isBlocked = false;
        
        const blockIndex = blockedQueue.findIndex(p => p.id === process.id);
        if (blockIndex !== -1) {
            blockedQueue.splice(blockIndex, 1);
        }
        
        const processDiv = document.getElementById(process.id);
        processDiv.style.backgroundColor = '#90EE90';
        processDiv.innerHTML = `${process.id} (using resource)`;
        
        processQueue.forEach(p => {
            if (p.id !== process.id && p.hasRequestedResource) {
                p.state = 'blocked';
                p.isBlocked = true;
                if (!blockedQueue.includes(p)) {
                    blockedQueue.push(p);
                }
                const pDiv = document.getElementById(p.id);
                pDiv.style.backgroundColor = '#ff9999';
                pDiv.innerHTML = `${p.id} (blocked)`;
            }
        });
        
        updateProcessInfo();
        drawLines();
    }
}

function updateProcessInfo() {
    const info = document.getElementById('processInfo');
    let html = '<h3>Process Information:</h3>';
    processQueue.forEach(process => {
        html += `
            <div>
                ${process.id}: ${process.state}
                (${process.remainingTime}s/${process.executionTime}s)
            </div>
        `;
    });
    info.innerHTML = html;
}

function completeProcess(process) {
    process.state = 'completed';
    process.hasResource = false;
    process.isBlocked = false;
    completedProcesses.add(process.id);
    
    const processDiv = document.getElementById(process.id);
    processDiv.style.backgroundColor = '#ddd';
    processDiv.innerHTML = process.id;
    
    activeProcess = null;
    
    const index = blockedQueue.findIndex(p => p.id === process.id);
    if (index !== -1) {
        blockedQueue.splice(index, 1);
    }
}

function startNextProcess() {
    if (!activeProcess) {
        if (blockedQueue.length > 0) {
            const nextProcess = blockedQueue.shift();
            nextProcess.isBlocked = false;
            createGrantBall(nextProcess.id);
        } else {
            const waitingProcess = processQueue.find(p => 
                p.state === 'waiting' && 
                p.hasRequestedResource && 
                !p.isBlocked
            );
            if (waitingProcess) {
                createGrantBall(waitingProcess.id);
            }
        }
    }
}

function updateProcessPositions() {
    const processes = document.querySelectorAll('.process');
    const containerWidth = document.querySelector('.container').offsetWidth;
    const containerHeight = document.querySelector('.container').offsetHeight;
    const radius = 200;
    
    processes.forEach((process, index) => {
        const angle = (index * 2 * Math.PI / processes.length) - Math.PI / 2;
        const x = containerWidth/2 + radius * Math.cos(angle);
        const y = containerHeight/2 + radius * Math.sin(angle);
        
        process.style.left = `${x - process.offsetWidth/2}px`;
        process.style.top = `${y - process.offsetHeight/2}px`;
    });
    
    drawLines();
}

function drawLines() {
    const canvas = document.getElementById('connectingLines');
    const container = canvas.parentElement;
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const processes = document.querySelectorAll('.process');
    const resource = document.getElementById('resource');
    
    processes.forEach(process => {
        const processId = process.id;
        const processObj = processQueue.find(p => p.id === processId);
        
        if (processObj) {
            const processRect = process.getBoundingClientRect();
            const resourceRect = resource.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            ctx.beginPath();
            ctx.moveTo(
                processRect.left - containerRect.left + process.offsetWidth/2,
                processRect.top - containerRect.top + process.offsetHeight/2
            );
            ctx.lineTo(
                resourceRect.left - containerRect.left + resource.offsetWidth/2,
                resourceRect.top - containerRect.top + resource.offsetHeight/2
            );
            
            if (processObj.hasRequestedResource) {
                ctx.strokeStyle = '#ff9999';
                ctx.lineWidth = 2;
            } else if (processObj.state === 'running') {
                ctx.strokeStyle = 'green';
                ctx.lineWidth = 3;
            } else if (processObj.state === 'completed') {
                ctx.strokeStyle = '#ddd';
                ctx.lineWidth = 1;
            } else {
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 1;
            }
            
            ctx.stroke();
        }
    });
}

function endVisualization() {
    pauseVisualization();
    alert('All processes completed!');
    currentTime = 0;
    completedProcesses.clear();
    processQueue.forEach(process => {
        process.remainingTime = process.executionTime;
        process.state = 'waiting';
        process.hasRequestedResource = false;
        process.hasResource = false;
        process.isBlocked = false;
    });
    blockedQueue = [];
    processesRequestingResource.clear();
    updateTimer();
    updateProcessInfo();
}

window.onload = () => {
    updateTimer();
    document.getElementById('processInfo').innerHTML = 
        '<h3>Process Information:</h3><p>No processes added yet</p>';
};

window.onresize = updateProcessPositions;
