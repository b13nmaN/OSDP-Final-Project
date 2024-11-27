let processCount = 0;
let currentTime = 0;
let isRunning = false;
let animationInterval;
let processQueue = [];
let activeProcess = null;
let completedProcesses = new Set();
let requestDelay = Math.floor(Math.random() * 3000) + 1000;
let processesRequestingResource = new Set();

class Semaphore {
    constructor() {
        this.value = 1;
        this.q = []; // blocked queue
        this.readyQ = []; // ready queue
    }

    reset() {
        this.value = 1;
        this.q = []; // blocked queue
        this.readyQ = []; // ready queue
    }

    addToReady(process) {
        if (!this.readyQ.includes(process)) {
            this.readyQ.push(process);
            process.inReadyQueue = true;
            process.state = 'ready';
            updateReadyQueueDisplay();
        }
    }

    removeFromReady(process) {
        const index = this.readyQ.findIndex(p => p.id === process.id);
        if (index !== -1) {
            this.readyQ.splice(index, 1);
            process.inReadyQueue = false;
            updateReadyQueueDisplay();
        }
    }

    P(process) {
        if (this.value === 1) {
            this.value = 0;
            this.removeFromReady(process);
            return true;
        } else {
            this.removeFromReady(process);
            this.q.push(process);
            process.isBlocked = true;
            process.state = 'blocked';
            console.log(`Process ${process.id} is blocked`);
            updateBlockedQueueDisplay();
            return false;
        }
    }

    V() {
        if (this.q.length === 0) {
            this.value = 1;
        } else {
            let p = this.q.shift();
            p.isBlocked = false;
            this.addToReady(p); // this method adds the process to the ready queue
            console.log(`Process ${p.id} is unblocked`);
            createGrantBall(p.id);
        }
        updateBlockedQueueDisplay();
    }

    getReadyProcesses() {
        return this.readyQ;
    }

    getBlockedProcesses() {
        return this.q;
    }
}

let semaphore = new Semaphore();

class Process {
    constructor(id) {
        this.id = id;
        this.executionTime = Math.floor(Math.random() * 5) + 1;
        this.remainingTime = this.executionTime;
        this.state = 'ready';
        this.hasRequestedResource = false;
        this.hasResource = false;
        this.isBlocked = false;
        this.inReadyQueue = true;
    }

    sendRequest() {
        if (!this.hasRequestedResource && !this.hasResource && !this.isBlocked) {
            this.hasRequestedResource = true;
            this.state = 'waiting';
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
        semaphore.addToReady(process);
        
        updateProcessPositions();
        updateProcessInfo();
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
    }, 200);

    setTimeout(() => {
        handleRequestArrival(processId);
    }, 2500);
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
    }, 200);

    setTimeout(() => {
        ball.remove();
        startProcessExecution(processId);
    }, 2500);
}

function handleRequestArrival(processId) {
    const requestBall = document.getElementById(`request-${processId}`);
    if (requestBall) {
        requestBall.remove();
    }

    const process = processQueue.find(p => p.id === processId);
    if (process) {
        if (semaphore.P(process)) {
            createGrantBall(processId);
        } else {
            const processDiv = document.getElementById(process.id);
            processDiv.style.backgroundColor = 'white';
            processDiv.innerHTML = `${process.id} (blocked)`;
        }
        updateProcessInfo();
        updateReadyQueueDisplay();
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


function updateProcessStates() {
    if (!activeProcess) {
        const readyProcesses = semaphore.getReadyProcesses();
        const availableProcesses = readyProcesses.filter(p => 
            !p.hasRequestedResource && 
            !p.isBlocked && 
            !completedProcesses.has(p.id)
        );
        // selects a random process and sends a request
        if (availableProcesses.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableProcesses.length);
            const selectedProcess = availableProcesses[randomIndex];
            
            if (!processesRequestingResource.has(selectedProcess.id)) {
                processesRequestingResource.add(selectedProcess.id);
                selectedProcess.sendRequest();
            }
        }
    }

    if (activeProcess) {
        activeProcess.remainingTime--;
        
        if (activeProcess.remainingTime <= 0) {
            completeProcess(activeProcess);
        }
    }
    
    updateProcessInfo();
    updateReadyQueueDisplay();
    updateBlockedQueueDisplay();
    drawLines();
    
    if (completedProcesses.size === processQueue.length) {
        endVisualization();
    }
}

function startProcessExecution(processId) {
    const process = processQueue.find(p => p.id === processId);
    if (!process) return;

    if (activeProcess) {
        process.state = 'blocked';
        process.isBlocked = true;
        semaphore.removeFromReady(process);
        if (!semaphore.q.includes(process)) {
            semaphore.q.push(process);
        }
        const processDiv = document.getElementById(process.id);
        processDiv.style.backgroundColor = 'rgba(150, 33, 33, 0.3)'; // More transparent dark red
        processDiv.style.color = '#ff6b6b'; // Lighter text for better readability
        processDiv.innerHTML = `${process.id} (blocked)`;
        return;
    }

    activeProcess = process;
    process.state = 'running';
    process.hasResource = true;
    process.hasRequestedResource = false;
    process.isBlocked = false;
    semaphore.removeFromReady(process);
    
    const processDiv = document.getElementById(process.id);
    processDiv.style.backgroundColor = 'rgba(72, 176, 89, 0.3)'; // More transparent green
    processDiv.style.color = '#4ade80'; // Lighter green text
    processDiv.innerHTML = `${process.id} (using resource)`;
    
    updateBlockedQueueDisplay();
    updateReadyQueueDisplay();
    updateProcessInfo();
    drawLines();
}

function updateProcessInfo() {
    const info = document.getElementById('processInfo');
    info.style.display = 'block';
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

function updateReadyQueueDisplay() {
    const readyQueueContainer = document.querySelector('.ready-queue-container');
    if (!readyQueueContainer) return;
    
    readyQueueContainer.innerHTML = '<h3>Ready Queue:</h3>';
    
    const readyProcesses = semaphore.getReadyProcesses();
    if (readyProcesses.length === 0) {
        readyQueueContainer.innerHTML += '<div style="color: #666; padding: 5px;">Empty</div>';
        return;
    }

    readyProcesses.forEach((process) => {
        const processElement = document.createElement('div');
        processElement.className = 'ready-process';
        processElement.innerHTML = `${process.id} (${process.remainingTime}s)`;
        readyQueueContainer.appendChild(processElement);
    });
}

function updateBlockedQueueDisplay() {
    const queueContainer = document.querySelector('.queue-container');
    queueContainer.innerHTML = '';
    
    const blockedProcesses = semaphore.getBlockedProcesses();
    if (blockedProcesses.length === 0) {
        queueContainer.innerHTML = '<div style="color: #666; padding: 5px;">Empty</div>';
        return;
    }

    blockedProcesses.forEach((process) => {
        const processElement = document.createElement('div');
        processElement.className = 'blocked-process';
        processElement.innerHTML = `${process.id}`;
        queueContainer.appendChild(processElement);
    });
}

function completeProcess(process) {
    process.state = 'completed';
    process.hasResource = false;
    process.isBlocked = false;
    completedProcesses.add(process.id);
    
    const processDiv = document.getElementById(process.id);
    processDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; // More transparent white
    processDiv.style.color = '#ffffff';
    processDiv.innerHTML = process.id;
    
    activeProcess = null;
    
    semaphore.removeFromReady(process);
    semaphore.V(); // this will add the process to the ready queue
    
    // Add race condition explanation
    updateRaceConditionDescription(`${process.id} has completed its execution and released the resource.`);
    
    updateReadyQueueDisplay();
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
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
            } else if (processObj.state === 'running') {
                ctx.strokeStyle = '#44ff44';
                ctx.lineWidth = 3;
            } else if (processObj.state === 'completed') {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
            } else {
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 1;
            }
            
            ctx.stroke();
        }
    });

}

function startRaceCondition() {
    // Clear previous description
    const descriptionElement = document.getElementById('raceConditionDescription');
    if (descriptionElement) {
        descriptionElement.innerHTML = '';
    }

    // Explain the race condition setup
    updateRaceConditionDescription('Setting up a race condition scenario with two processes attempting to access a shared resource.');
    updateRaceConditionDescription('Both processes will try to request the resource simultaneously.');

    // Reset the visualization first
    resetVisualization();

    // Create two processes
    addProcess(); // This will create P1
    addProcess(); // This will create P2

    // Modify the processes to simulate race condition
    const processes = processQueue;
    if (processes.length >= 2) {
        const process1 = processes[0];
        const process2 = processes[1];

        // Override the sendRequest method to immediately create request balls
        process1.sendRequest = () => {
            if (!process1.hasRequestedResource && !process1.hasResource && !process1.isBlocked) {
                process1.hasRequestedResource = true;
                process1.state = 'waiting';
                createRequestBall(process1.id);
                
                // Add explanation
                updateRaceConditionDescription(`${process1.id} is attempting to request the shared resource.`);
            }
        };

        process2.sendRequest = () => {
            if (!process2.hasRequestedResource && !process2.hasResource && !process2.isBlocked) {
                process2.hasRequestedResource = true;
                process2.state = 'waiting';
                createRequestBall(process2.id);
                
                // Add explanation
                updateRaceConditionDescription(`${process2.id} is attempting to request the shared resource.`);
            }
        };

        // Immediately send requests for both processes
        setTimeout(() => {
            process1.sendRequest();
            process2.sendRequest();
            
            // Add overall explanation
            updateRaceConditionDescription('Race condition initiated: Both processes are competing to access the shared resource simultaneously.');
        }, 500);

        // Start the visualization
        startVisualization();
    }
}
function updateRaceConditionDescription(message) {
    const descriptionElement = document.getElementById('raceConditionDescription');
    descriptionElement.style.display = 'block';
    if (descriptionElement) {
        descriptionElement.innerHTML += `<p>${message}</p>`;
        
        // Scroll to the bottom of the description element
        descriptionElement.scrollTop = descriptionElement.scrollHeight;
    }
}

// Modify the handleRequestArrival function to show race condition details
function handleRequestArrival(processId) {
    const requestBall = document.getElementById(`request-${processId}`);
    if (requestBall) {
        requestBall.remove();
    }

    const process = processQueue.find(p => p.id === processId);
    if (process) {
        if (semaphore.P(process)) {
            // If the semaphore is free, grant immediately
            createGrantBall(processId);
            updateRaceConditionDescription(`${processId} successfully acquired the resource.`);
        } else {
            // If semaphore is already taken, block the process
            const processDiv = document.getElementById(process.id);
            processDiv.style.backgroundColor = 'rgba(150, 33, 33, 0.3)'; // this is should be dark red
            processDiv.innerHTML = `${process.id} (blocked)`;
            
            // Add detailed race condition explanation
            updateRaceConditionDescription(`Race Condition: ${processId} is blocked because the resource is already in use.`);
            updateRaceConditionDescription('This demonstrates how processes compete for a shared resource, leading to potential waiting or blocking.');
        }
        updateProcessInfo();
        updateReadyQueueDisplay();
    }
}


function resetVisualization() {
    // Stop any running animation
    clearInterval(animationInterval);
    
    // Reset global variables
    processCount = 0;
    currentTime = 0;
    isRunning = false;
    activeProcess = null;
    processesRequestingResource.clear();
    completedProcesses.clear();
    
    // Reset semaphore
    semaphore.reset();
    
    // Remove all process elements from the DOM
    const container = document.querySelector('.container');
    const processes = container.querySelectorAll('.process');
    processes.forEach(process => process.remove());
    
    // Remove any request or grant balls
    const balls = container.querySelectorAll('.request-ball, .grant-ball');
    balls.forEach(ball => ball.remove());
    
    // Reset process queue
    processQueue = [];

     // Clear race condition description
     const descriptionElement = document.getElementById('raceConditionDescription');
     if (descriptionElement) {
         descriptionElement.innerHTML = '';
     }
     
    
    // Reset visual elements
    document.querySelector('#processInfo').style.display = 'none';
    document.querySelector('#raceConditionDescription').style.display = 'none';
    updateProcessInfo();
    updateBlockedQueueDisplay();
    updateReadyQueueDisplay();
    drawLines();
    
    // Re-enable start button and disable pause
    document.querySelector('button[onclick="startVisualization()"]').disabled = false;
    document.getElementById('pauseButton').disabled = true;
}


document.addEventListener('DOMContentLoaded', () => {
    updateBlockedQueueDisplay();
    updateReadyQueueDisplay();
});

window.addEventListener('resize', updateProcessPositions);
