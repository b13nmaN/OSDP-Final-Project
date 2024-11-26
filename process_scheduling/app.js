let processes = [];
let currentTime = 0;
let processIdCounter = 1;

class Process {
    constructor(id, arrivalTime, burstTime, priority) {
        this.id = id;
        this.arrivalTime = parseInt(arrivalTime);
        this.burstTime = parseInt(burstTime);
        this.priority = parseInt(priority);
        this.remainingTime = parseInt(burstTime);
        this.startTime = 0;
        this.endTime = 0;
        this.waitingTime = 0;
        this.turnaroundTime = 0;
    }
}

function addProcess() {
    const arrivalTime = Math.floor(Math.random() * 10);
    const burstTime = Math.floor(Math.random() * 10) + 1;
    const priority = Math.floor(Math.random() * 5) + 1;
    
    const process = new Process(processIdCounter++, arrivalTime, burstTime, priority);
    processes.push(process);
    updateProcessTable();
}

function updateProcessTable() {
    const tbody = document.getElementById('processTableBody');
    tbody.innerHTML = '';
    
    processes.forEach(process => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = `P${process.id}`;
        row.insertCell(1).textContent = process.arrivalTime;
        row.insertCell(2).textContent = process.burstTime;
        row.insertCell(3).textContent = process.priority;
    });
}

async function startSimulation() {
    const algorithm = document.getElementById('algorithm').value;
    const ganttChart = document.getElementById('ganttChart');
    ganttChart.innerHTML = '';
    currentTime = 0;

    // Reset process states
    processes.forEach(p => {
        p.remainingTime = p.burstTime;
        p.startTime = 0;
        p.endTime = 0;
        p.waitingTime = 0;
        p.turnaroundTime = 0;
    });

    switch(algorithm) {
        case 'fcfs':
            await simulateFCFS();
            break;
        case 'sjf':
            await simulateSJF();
            break;
        case 'rr':
            await simulateRR();
            break;
        case 'priority':
            await simulatePriority();
            break;
    }

    displayStats();
}

async function simulateFCFS() {
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    for (let process of sortedProcesses) {
        // Wait until process arrives
        while (currentTime < process.arrivalTime) {
            await addGanttBlock('Idle', 1);
            currentTime++;
        }

        process.startTime = currentTime;
        
        // Execute process
        for (let i = 0; i < process.burstTime; i++) {
            await addGanttBlock(`P${process.id}`, 1);
            currentTime++;
        }

        process.endTime = currentTime;
        calculateProcessMetrics(process);
    }
}

async function simulateSJF() {
    let remainingProcesses = [...processes];
    
    while (remainingProcesses.length > 0) {
        const availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
        
        if (availableProcesses.length === 0) {
            await addGanttBlock('Idle', 1);
            currentTime++;
            continue;
        }

        const shortestJob = availableProcesses.reduce((prev, curr) => 
            prev.burstTime < curr.burstTime ? prev : curr
        );

        shortestJob.startTime = currentTime;
        
        // Execute process
        for (let i = 0; i < shortestJob.burstTime; i++) {
            await addGanttBlock(`P${shortestJob.id}`, 1);
            currentTime++;
        }

        shortestJob.endTime = currentTime;
        calculateProcessMetrics(shortestJob);
        
        remainingProcesses = remainingProcesses.filter(p => p.id !== shortestJob.id);
    }
}

async function simulateRR() {
    const timeQuantum = parseInt(document.getElementById('timeQuantum').value);
    let remainingProcesses = [...processes];
    
    while (remainingProcesses.length > 0) {
        for (let i = 0; i < remainingProcesses.length; i++) {
            const process = remainingProcesses[i];
            
            if (process.arrivalTime <= currentTime) {
                if (process.startTime === 0) {
                    process.startTime = currentTime;
                }

                const executeTime = Math.min(timeQuantum, process.remainingTime);
                
                // Execute process for time quantum
                for (let j = 0; j < executeTime; j++) {
                    await addGanttBlock(`P${process.id}`, 1);
                    currentTime++;
                    process.remainingTime--;
                }

                if (process.remainingTime === 0) {
                    process.endTime = currentTime;
                    calculateProcessMetrics(process);
                    remainingProcesses = remainingProcesses.filter(p => p.id !== process.id);
                    i--;
                }
            }
        }

        if (remainingProcesses.every(p => p.arrivalTime > currentTime)) {
            await addGanttBlock('Idle', 1);
            currentTime++;
        }
    }
}

async function simulatePriority() {
    let remainingProcesses = [...processes];
    
    while (remainingProcesses.length > 0) {
        const availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
        
        if (availableProcesses.length === 0) {
            await addGanttBlock('Idle', 1);
            currentTime++;
            continue;
        }

        const highestPriority = availableProcesses.reduce((prev, curr) => 
            prev.priority < curr.priority ? prev : curr
        );

        highestPriority.startTime = currentTime;
        
        // Execute process
        for (let i = 0; i < highestPriority.burstTime; i++) {
            await addGanttBlock(`P${highestPriority.id}`, 1);
            currentTime++;
        }

        highestPriority.endTime = currentTime;
        calculateProcessMetrics(highestPriority);
        
        remainingProcesses = remainingProcesses.filter(p => p.id !== highestPriority.id);
    }
}

async function addGanttBlock(processId, duration) {
    return new Promise(resolve => {
        const block = document.createElement('div');
        block.className = 'gantt-block';
        block.style.backgroundColor = processId === 'Idle' ? '#f0f0f0' : `hsl(${processId.charCodeAt(1) * 50 % 360}, 70%, 80%)`;
        block.textContent = processId;
        
        const timeMarker = document.createElement('div');
        timeMarker.className = 'time-marker';
        timeMarker.textContent = currentTime;
        block.appendChild(timeMarker);

        document.getElementById('ganttChart').appendChild(block);
        setTimeout(resolve, 500 * duration);
    });
}

function calculateProcessMetrics(process) {
    process.turnaroundTime = process.endTime - process.arrivalTime;
    process.waitingTime = process.turnaroundTime - process.burstTime;
}

function displayStats() {
    const stats = document.getElementById('stats');
    let avgWaitingTime = processes.reduce((sum, p) => sum + p.waitingTime, 0) / processes.length;
    let avgTurnaroundTime = processes.reduce((sum, p) => sum + p.turnaroundTime, 0) / processes.length;
    
    stats.innerHTML = `
        <h3>Statistics</h3>
        <p>Average Waiting Time: ${avgWaitingTime.toFixed(2)}</p>
        <p>Average Turnaround Time: ${avgTurnaroundTime.toFixed(2)}</p>
        <table>
            <tr>
                <th>Process</th>
                <th>Waiting Time</th>
                <th>Turnaround Time</th>
            </tr>
            ${processes.map(p => `
                <tr>
                    <td>P${p.id}</td>
                    <td>${p.waitingTime}</td>
                    <td>${p.turnaroundTime}</td>
                </tr>
            `).join('')}
        </table>
    `;
}

function resetSimulation() {
    processes = [];
    currentTime = 0;
    processIdCounter = 1;
    document.getElementById('ganttChart').innerHTML = '';
    document.getElementById('stats').innerHTML = '';
    document.getElementById('processTableBody').innerHTML = '';
}
