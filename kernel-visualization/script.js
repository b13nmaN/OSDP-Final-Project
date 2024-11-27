// const canvas = document.getElementById("visualizationCanvas");
// const ctx = canvas.getContext("2d");

// // Colors for states and modes
// const colors = {
//   new: "gray",
//   ready: "green",
//   running: "blue",
//   blocked: "yellow",
//   exit: "red",
//   kernel: "orange",
//   user: "lightblue",
// };

// // State diagram positions
// const states = {
//   new: { x: 100, y: 300 },
//   ready: { x: 300, y: 150 },
//   running: { x: 500, y: 150 },
//   blocked: { x: 500, y: 350 },
//   exit: { x: 700, y: 300 },
// };

// // Processes and modes
// let processes = [];
// let currentMode = "user";
// let running = false;

// // Process class
// class Process {
//   constructor(id, state) {
//     this.id = id;
//     this.x = states[state].x;
//     this.y = states[state].y;
//     this.state = state;
//     this.target = null;
//   }

//   draw() {
//     ctx.beginPath();
//     ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
//     ctx.fillStyle = colors[this.state];
//     ctx.fill();
//     ctx.closePath();

//     // Draw mode indicator
//     ctx.fillStyle = currentMode === "kernel" ? colors.kernel : colors.user;
//     ctx.fillRect(this.x - 15, this.y - 40, 30, 10);

//     // Draw process ID
//     ctx.fillStyle = "black";
//     ctx.font = "14px Arial";
//     ctx.fillText(`P${this.id}`, this.x - 10, this.y + 5);
//   }

//   moveTo(targetState) {
//     this.target = states[targetState];
//     this.state = targetState;
//   }

//   update() {
//     if (this.target) {
//       const dx = this.target.x - this.x;
//       const dy = this.target.y - this.y;
//       if (Math.abs(dx) > 2) this.x += Math.sign(dx) * 2;
//       if (Math.abs(dy) > 2) this.y += Math.sign(dy) * 2;
//       if (Math.abs(dx) <= 2 && Math.abs(dy) <= 2) {
//         this.target = null;
//       }
//     }
//   }
// }

// // Create processes
// for (let i = 1; i <= 5; i++) {
//   processes.push(new Process(i, "new"));
// }

// // State transitions
// function transitionProcess(process) {
//   switch (process.state) {
//     case "new":
//       process.moveTo("ready");
//       break;
//     case "ready":
//       process.moveTo("running");
//       break;
//     case "running":
//       if (Math.random() < 0.5) {
//         process.moveTo("blocked");
//       } else {
//         process.moveTo("exit");
//       }
//       break;
//     case "blocked":
//       process.moveTo("ready");
//       break;
//   }
// }

// // Toggle kernel/user mode
// function toggleMode() {
//   currentMode = currentMode === "kernel" ? "user" : "kernel";
// }

// // Draw state diagram
// function drawStateDiagram() {
//   for (const [state, pos] of Object.entries(states)) {
//     ctx.beginPath();
//     ctx.arc(pos.x, pos.y, 50, 0, Math.PI * 2);
//     ctx.fillStyle = colors[state];
//     ctx.fill();
//     ctx.closePath();

//     ctx.fillStyle = "black";
//     ctx.font = "18px Arial";
//     ctx.fillText(state.charAt(0).toUpperCase() + state.slice(1), pos.x - 30, pos.y + 70);
//   }
// }

// // Update loop
// function update() {
//   if (!running) return;

//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   drawStateDiagram();

//   // Update and draw processes
//   processes.forEach((process) => {
//     process.update();
//     process.draw();
//   });

//   requestAnimationFrame(update);
// }

// // Start/Stop controls
// document.getElementById("startBtn").addEventListener("click", () => {
//   running = true;
//   document.getElementById("startBtn").disabled = true;
//   document.getElementById("stopBtn").disabled = false;
//   update();
//   setInterval(() => {
//     toggleMode();
//     processes.forEach((process) => {
//       if (!process.target && running) {
//         transitionProcess(process);
//       }
//     });
//   }, 2000);
// });

// document.getElementById("stopBtn").addEventListener("click", () => {
//   running = false;
//   document.getElementById("startBtn").disabled = false;
//   document.getElementById("stopBtn").disabled = true;
// });

const canvas = document.getElementById("visualizationCanvas");
const ctx = canvas.getContext("2d");

// Colors for states and modes
const colors = {
  new: "gray",
  ready: "green",
  running: "blue",
  blocked: "yellow",
  exit: "red",
  kernel: "orange",
  user: "lightblue",
};

// State diagram positions
const states = {
  new: { x: 100, y: 300 },
  ready: { x: 300, y: 150 },
  running: { x: 500, y: 150 },
  blocked: { x: 500, y: 350 },
  exit: { x: 700, y: 300 },
};

// Processes and modes
let processes = [];
let currentMode = "user";
let running = false;
let currentProcessIndex = 0;

// Process class
class Process {
  constructor(id, state) {
    this.id = id;
    this.x = states[state].x;
    this.y = states[state].y;
    this.state = state;
    this.target = null;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
    ctx.fillStyle = colors[this.state];
    ctx.fill();
    ctx.closePath();

    // Draw mode indicator
    ctx.fillStyle = currentMode === "kernel" ? colors.kernel : colors.user;
    ctx.fillRect(this.x - 15, this.y - 40, 30, 10);

    // Draw process ID
    ctx.fillStyle = "black";
    ctx.font = "14px Arial";
    ctx.fillText(`P${this.id}`, this.x - 10, this.y + 5);
  }

  moveTo(targetState) {
    this.target = states[targetState];
    this.state = targetState;
  }

  update() {
    if (this.target) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      if (Math.abs(dx) > 2) this.x += Math.sign(dx) * 2;
      if (Math.abs(dy) > 2) this.y += Math.sign(dy) * 2;
      if (Math.abs(dx) <= 2 && Math.abs(dy) <= 2) {
        this.target = null;
      }
    }
  }
}

// Create processes
for (let i = 1; i <= 5; i++) {
  processes.push(new Process(i, "new"));
}

// Draw lines connecting states
function drawStateConnections() {
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;

  // Connect New → Ready
  drawArrow(states.new, states.ready);
  // Connect Ready → Running
  drawArrow(states.ready, states.running);
  // Connect Running → Blocked
  drawArrow(states.running, states.blocked);
  // Connect Blocked → Ready
  drawArrow(states.blocked, states.ready);
  // Connect Running → Exit
  drawArrow(states.running, states.exit);
}

// Helper to draw arrows
function drawArrow(start, end) {
  const headlen = 10; // Arrowhead size
  const angle = Math.atan2(end.y - start.y, end.x - start.x);

  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();

  // Arrowhead
  ctx.beginPath();
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(
    end.x - headlen * Math.cos(angle - Math.PI / 6),
    end.y - headlen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    end.x - headlen * Math.cos(angle + Math.PI / 6),
    end.y - headlen * Math.sin(angle + Math.PI / 6)
  );
  ctx.lineTo(end.x, end.y);
  ctx.fill();
}

// Draw legend
function drawLegend() {
  ctx.fillStyle = "black";
  ctx.font = "16px Arial";
  ctx.fillText("Legend:", 20, 20);

  // Kernel/User Mode
  ctx.fillStyle = colors.kernel;
  ctx.fillRect(20, 40, 20, 20);
  ctx.fillStyle = "black";
  ctx.fillText("Kernel Mode", 50, 55);

  ctx.fillStyle = colors.user;
  ctx.fillRect(20, 70, 20, 20);
  ctx.fillStyle = "black";
  ctx.fillText("User Mode", 50, 85);

  // States
  let y = 110;
  for (const [state, color] of Object.entries(colors)) {
    if (state === "kernel" || state === "user") continue;
    ctx.fillStyle = color;
    ctx.fillRect(20, y, 20, 20);
    ctx.fillStyle = "black";
    ctx.fillText(state.charAt(0).toUpperCase() + state.slice(1), 50, y + 15);
    y += 30;
  }
}

// Transition logic for sequential handling
function processTransition(process) {
  switch (process.state) {
    case "new":
      process.moveTo("ready");
      break;
    case "ready":
      process.moveTo("running");
      break;
    case "running":
      if (Math.random() < 0.5) {
        process.moveTo("blocked");
      } else {
        process.moveTo("exit");
      }
      break;
    case "blocked":
      process.moveTo("ready");
      break;
  }
}

// Toggle kernel/user mode
function toggleMode() {
  currentMode = currentMode === "kernel" ? "user" : "kernel";
}

// Draw state diagram
function drawStateDiagram() {
  for (const [state, pos] of Object.entries(states)) {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 50, 0, Math.PI * 2);
    ctx.fillStyle = colors[state];
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = "black";
    ctx.font = "18px Arial";
    ctx.fillText(state.charAt(0).toUpperCase() + state.slice(1), pos.x - 30, pos.y + 70);
  }
}

// Update loop
function update() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawLegend();
  drawStateDiagram();
  drawStateConnections();

  // Update and draw processes
  processes.forEach((process) => {
    process.update();
    process.draw();
  });

  requestAnimationFrame(update);
}

// Handle process transitions one at a time
function handleProcesses() {
  if (!running || currentProcessIndex >= processes.length) return;
  const process = processes[currentProcessIndex];
  if (!process.target) {
    toggleMode(); // Switch mode on each transition
    processTransition(process);
    if (process.state === "exit") {
      currentProcessIndex++;
    }
  }
}

// Start/Stop controls
document.getElementById("startBtn").addEventListener("click", () => {
  running = true;
  document.getElementById("startBtn").disabled = true;
  document.getElementById("stopBtn").disabled = false;
  update();
  setInterval(handleProcesses, 2000); // Transition processes every 2 seconds
});

document.getElementById("stopBtn").addEventListener("click", () => {
  running = false;
  document.getElementById("startBtn").disabled = false;
  document.getElementById("stopBtn").disabled = true;
});
