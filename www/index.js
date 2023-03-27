// import the web assembly interface
import { Universe } from "wasm-game-of-life";
// allows direct memory access
import { memory } from "wasm-game-of-life/wasm_game_of_life_bg";

const canvas = document.getElementById("game-of-life-canvas");
const range = document.getElementById("tpc");
const label = document.getElementById("tpc_label")
const CELL_SIZE = 5; // px
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";
const WIDTH = Math.floor(window.innerWidth / CELL_SIZE);
const HEIGHT = Math.floor(window.innerHeight / CELL_SIZE);

// Instantiates a new universe
const universe = Universe.new(WIDTH, HEIGHT);

window.universe = universe

canvas.height = window.innerHeight
canvas.width = window.innerWidth

canvas.addEventListener("dblclick", event => drawSpaceship(event));
canvas.addEventListener("mousedown", _ => {
    const cb = (event) => {
        toggleCells(event, true)
        drawGrid();
        drawCells();
    }
    const cleanup = _ => {
        canvas.removeEventListener("mousemove", cb)
        canvas.removeEventListener("mouseup", cleanup)
    }
    canvas.addEventListener("mousemove", cb)
    canvas.addEventListener("mouseup", cleanup)
})
canvas.addEventListener("click", event => toggleCells(event, false))

const drawSpaceship = (event) => {
  const boundingRect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / boundingRect.width;
  const scaleY = canvas.height / boundingRect.height;

  const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
  const canvasTop = (event.clientY - boundingRect.top) * scaleY;

  const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), HEIGHT - 1);
  const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), WIDTH - 1);

  universe.spawn_spaceship(row, col);
}

const toggleCells = (event, toggle) => {
  const boundingRect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / boundingRect.width;
  const scaleY = canvas.height / boundingRect.height;

  const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
  const canvasTop = (event.clientY - boundingRect.top) * scaleY;

  const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), HEIGHT - 1);
  const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), WIDTH - 1);

  universe.toggle_cell(row, col, toggle);
}

const ctx = canvas.getContext('2d')

const bitIsSet = (n, arr) => {
  const byte = Math.floor(n / 8);
  const mask = 1 << (n % 8);
  return (arr[byte] & mask) === mask;
};

const getIndex = (row, column) => {
  return row * WIDTH + column;
};

const drawGrid = () => {
    ctx.beginPath();
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 0.5;
  
    // Vertical lines.
    for (let i = 0; i <= WIDTH; i++) {
      ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
      ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * HEIGHT + 1);
    }

    // Horizontal lines.
    for (let j = 0; j <= HEIGHT; j++) {
      ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
      ctx.lineTo((CELL_SIZE + 1) * WIDTH + 1, j * (CELL_SIZE + 1) + 1);
    }
  
    ctx.stroke();
  };  

const drawCells = () => {
    const cellsPtr = universe.cells();
  
    // This is updated!
    const cells = new Uint8Array(memory.buffer, cellsPtr, WIDTH * HEIGHT / 8);
  
    ctx.beginPath();
  
    for (let row = 0; row < HEIGHT; row++) {
      for (let col = 0; col < WIDTH; col++) {
        const idx = getIndex(row, col);
  
        // This is updated!
        ctx.fillStyle = bitIsSet(idx, cells)
          ? ALIVE_COLOR
          : DEAD_COLOR;
  
        ctx.fillRect(
          col * (CELL_SIZE + 1) + 1,
          row * (CELL_SIZE + 1) + 1,
          CELL_SIZE,
          CELL_SIZE
        );
      }
    }
  
    ctx.stroke();
};

let animationId = null;

const isPaused = () => {
  return animationId === null;
};

const playPauseButton = document.getElementById("play-pause");

const play = () => {
  playPauseButton.textContent = "⏸";
  renderLoop();
};

const pause = () => {
  playPauseButton.textContent = "▶";
  cancelAnimationFrame(animationId);
  animationId = null;
};

playPauseButton.addEventListener("click", event => {
  if (isPaused()) {
    play();
  } else {
    pause();
  }
});

let ticks = 0

const renderLoop = () => {
  ticks += Math.abs(range.value)

  label.innerHTML = `${range.value} t/r`

  while (ticks >= 1) {
    universe.tick(true);
    ticks--
  };

  drawGrid();
  drawCells();

  animationId = requestAnimationFrame(renderLoop);
};

play();
