// mutual-exclusion.js

let processCount = 0;
let currentTime = 0;
let isRunning = false;
let animationInterval;
let processQueue = [];
let activeProcess = null;
let completedProcesses = new Set();
let requestDelay = Math.floor(Math.random() * 3000) + 1000;
let processesRequestingResource = new Set();

// Semaphore Class (kept from previous implementation)
class Semaphore {
    constructor() {
        this.value = 1;
        this.q = []; // blocked queue
        this.readyQ = []; // ready queue
    }

    reset() {
        this.value = 1;
        this.q = []; 
        this.readyQ = []; 
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
            this.addToReady(p);
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

// Mutual Exclusion Algorithm Class
class MutualExclusionAlgorithm {
    constructor() {
        this.flag = [false, false];
        this.turn = 1;
        this.activeProcess = null;
        this.processQueue = [];
        this.algorithmType = '';
    }

    // Dekker's Algorithm
    dekkerAlgorithm(processId) {
        this.algorithmType = 'Dekker';
        const processIndex = processId === 'P1' ? 0 : 1;
        const otherIndex = processIndex === 0 ? 1 : 0;

        // Set flag for current process
        this.flag[processIndex] = true;

        // Wait while other process is interested
        while (this.flag[otherIndex]) {
            // If other process has turn, back off
            if (this.turn === otherIndex) {
                this.flag[processIndex] = false;
                
                // Wait until turn changes
                while (this.turn === otherIndex) {
                    // Busy wait
                }
                
                // Try to enter again
                this.flag[processIndex] = true;
            }
        }

        // Critical section
        this.activeProcess = processId;
        
        // Release
        this.turn = otherIndex;
        this.flag[processIndex] = false;

        return true;
    }

    // Peterson's Algorithm
    petersonAlgorithm(processId) {
        this.algorithmType = 'Peterson';
        const processIndex = processId === 'P1' ? 0 : 1;
        const otherIndex = processIndex === 0 ? 1 : 0;

        // Indicate interest
        this.flag[processIndex] = true;
        
        // Give turn to other process
        this.turn = otherIndex;

        // Wait while other process is interested and has turn
        while (this.flag[otherIndex] && this.turn === otherIndex) {
            // Busy wait
        }

        // Critical section
        this.activeProcess = processId;

        // Exit protocol
        this.flag[processIndex] = false;

        return true;
    }

    // Semaphore-based approach
    semaphoreAlgorithm(processId) {
        this.algorithmType = 'Semaphore';
        return true;
    }

    // Visualization helper
    updateVisualization(processId) {
        const descriptionElement = document.getElementById('mutualExclusionDescription');
        descriptionElement.innerHTML += `
            <p><strong>${this.algorithmType} Algorithm:</strong> 
            Process ${processId} attempting to enter critical section.</p>
        `;
        descriptionElement.scrollTop = descriptionElement.scrollHeight;
    }
}

// Process Class
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

// Existing Functions from Previous Implementation
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

function handleRequestArrival(processId) {
    const requestBall = document.getElementById(`request-${processId}`);
    if (requestBall) {
        requestBall.remove();
    }

    const process = processQueue.find(p => p.id === processId);
    if (process) {
        // Just for visualization, always allow process
        const processDiv = document.getElementById(process.id);
        processDiv.style.backgroundColor = 'green';
        
        updateRaceConditionDescription(`${processId} entered critical section`);
    }
}

function createGrantBall(processId) {
    // Similar to createRequestBall, but indicates resource grant
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
}

function startMutualExclusionSimulation(algorithmType) {
    // Reset previous state
    resetVisualization();

    // Create mutual exclusion algorithm instance
    const mutualExclusionAlgo = new MutualExclusionAlgorithm();

    // Clear previous description
    document.getElementById('mutualExclusionDescription').innerHTML = '';

    // Create two processes
    addProcess(); // P1
    addProcess(); // P2

    const processes = processQueue;
    if (processes.length >= 2) {
        const process1 = processes[0];
        const process2 = processes[1];

        // Override send request to demonstrate algorithm
        process1.sendRequest = () => {
            mutualExclusionAlgo.updateVisualization(process1.id);
            createRequestBall(process1.id);
        };

        process2.sendRequest = () => {
            mutualExclusionAlgo.updateVisualization(process2.id);
            createRequestBall(process2.id);
        };

        // Trigger requests
        setTimeout(() => {
            process1.sendRequest();
            process2.sendRequest();
        }, 500);

        // Start visualization
        startVisualization();
    }
}

function startVisualization() {
    if (processQueue.length === 0) {
        alert('Add some processes first!');
        return;
    }
    
    isRunning = true;
    // More flexible button selection
    const startButton = document.querySelector('button[onclick*="startVisualization"]');
    if (startButton) {
        startButton.disabled = true;
    }
    
    
    animationInterval = setInterval(() => {
        if (isRunning) {
            currentTime++;
            updateProcessStates();
        }
    }, 1000);
}

function updateProcessStates() {
    const readyProcesses = processQueue.filter(p => 
        !p.hasRequestedResource && 
        !p.isBlocked
    );

    // Randomly select a process to request resource
    if (readyProcesses.length > 0) {
        const randomIndex = Math.floor(Math.random() * readyProcesses.length);
        const selectedProcess = readyProcesses[randomIndex];
        
        selectedProcess.sendRequest();
    }
    
    updateProcessInfo();
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

    // Reset visual elements
    const processInfo = document.querySelector('#processInfo');
    if (processInfo) processInfo.style.display = 'none';

    const mutualExclusionDescription = document.querySelector('#mutualExclusionDescription');
    if (mutualExclusionDescription) {
        mutualExclusionDescription.style.display = 'block';
        mutualExclusionDescription.innerHTML = '';
    }
    
    // Re-enable start button with a more flexible selector
    const startButton = document.querySelector('button[onclick*="startVisualization"]');
    if (startButton) startButton.disabled = false;
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

function updateRaceConditionDescription(message) {
    const descriptionElement = document.getElementById('mutualExclusionDescription');
    descriptionElement.style.display = 'block';
    if (descriptionElement) {
        descriptionElement.innerHTML += `<p>${message}</p>`;
        
        // Scroll to the bottom of the description element
        descriptionElement.scrollTop = descriptionElement.scrollHeight;
    }
}

// Create algorithm selection buttons
function createAlgorithmButtons() {
    const buttonContainer = document.createElement('div');
    buttonContainer.innerHTML = `
        <button onclick="startMutualExclusionSimulation('Semaphore')">Semaphore Algorithm</button>
        <button onclick="startMutualExclusionSimulation('Dekker')">Dekker's Algorithm</button>
        <button onclick="startMutualExclusionSimulation('Peterson')">Peterson's Algorithm</button>
    `;
    document.body.insertBefore(buttonContainer, document.querySelector('.container'));
}

// Call this when the page loads
document.addEventListener('DOMContentLoaded', createAlgorithmButtons);
