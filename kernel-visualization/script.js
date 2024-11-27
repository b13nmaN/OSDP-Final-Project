let currentState = "ready";
let currentMode = "user";
let processCounter = 0;
let selectedProcess = null;

function createProcess(id) {
  const process = document.createElement("div");
  process.className = "process";
  process.id = `process-${id}`;
  process.innerHTML = `
          Process ${id}
          <div class="operation-menu">
              <button class="operation-button" onclick="triggerOperation('file', ${id})">📁 File Operation</button>
              <button class="operation-button" onclick="triggerOperation('memory', ${id})">💾 Memory Request</button>
              <button class="operation-button" onclick="triggerOperation('network', ${id})">🌐 Network Access</button>
          </div>
      `;
  process.onclick = () => selectProcess(id);
  return process;
}

function selectProcess(id) {
  const processes = document.querySelectorAll(".process");
  processes.forEach((p) => p.classList.remove("selected"));
  const selected = document.getElementById(`process-${id}`);
  if (selected) {
    selected.classList.add("selected");
    selectedProcess = id;
  }
}

function triggerOperation(type, processId) {
  updateMode("kernel");
  document.getElementById(
    "currentProcess"
  ).textContent = `Process ${processId}`;
  document.getElementById("currentMode").textContent = "Kernel";

  // Hide all operations and descriptions
  document
    .querySelectorAll(".kernel-operation")
    .forEach((op) => op.classList.remove("active"));
  document
    .querySelectorAll(".operation-description")
    .forEach((desc) => desc.classList.remove("active"));

  // Show specific operation and description
  let operationElement, descriptionElement, operationName;
  switch (type) {
    case "file":
      operationElement = document.getElementById("fileOperation");
      descriptionElement = document.getElementById("fileOpDescription");
      operationName = "File System Operation";
      break;
    case "memory":
      operationElement = document.getElementById("memoryOperation");
      descriptionElement = document.getElementById("memoryOpDescription");
      operationName = "Memory Management";
      break;
    case "network":
      operationElement = document.getElementById("networkOperation");
      descriptionElement = document.getElementById(
        "networkOpDescription"
      );
      operationName = "Network Communication";
      break;
  }

  operationElement.classList.add("active");
  descriptionElement.classList.add("active");
  document.getElementById("currentOperation").textContent = operationName;

  // Simulate operation completion
  setTimeout(() => {
    updateMode("user");
    operationElement.classList.remove("active");
    document.getElementById("currentMode").textContent = "User";
    document.getElementById("currentOperation").textContent = "None";
    updateProcessInfo(`${operationName} completed`);
  }, 3000);
}

function startSimulation() {
  processCounter++;
  const processList = document.getElementById("processList");
  processList.appendChild(createProcess(processCounter));
  updateState("running");
  updateMode("user");
  document.getElementById(
    "currentProcess"
  ).textContent = `Process ${processCounter}`;
  updateProcessInfo("New process created");
}

function updateState(newState) {
  document.querySelectorAll(".state").forEach((state) => {
    state.classList.remove("active");
  });
  document.getElementById(newState).classList.add("active");
  currentState = newState;
}

function updateMode(newMode) {
  document.getElementById("userMode").classList.remove("active");
  document.getElementById("kernelMode").classList.remove("active");
  document.getElementById(newMode + "Mode").classList.add("active");
  currentMode = newMode;
}

function triggerContextSwitch() {
  if (processCounter < 2) {
    updateProcessInfo("Need at least 2 processes for context switch");
    return;
  }

  updateMode("kernel");
  updateState("waiting");
  document.getElementById("currentMode").textContent = "Kernel";
  updateProcessInfo("Context switch in progress");

  setTimeout(() => {
    updateMode("user");
    updateState("running");
    document.getElementById("currentMode").textContent = "User";
    updateProcessInfo("Context switch completed");
  }, 2000);
}

function updateProcessInfo(message = "") {
  const info = document.getElementById("processInfo");
  const timestamp = new Date().toLocaleTimeString();
  info.innerHTML = `
          <strong>${timestamp}</strong><br>
          Current State: ${currentState}<br>
          Current Mode: ${currentMode}<br>
          ${message ? `<br>${message}` : ""}
      `;
}

// Initial state
updateProcessInfo('System ready - Click "Start New Process" to begin');

