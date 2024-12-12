const gridDocumentElement = document.getElementById('gridSize');

// Game state variables
let gridSize = 3; // default value
let grid = [];
let currentRobot = 1;
let robot1 = { row: 0, col: 0 };
let robot2 = { row: 0, col: 2 };
let score1 = 0;
let score2 = 0;
let visitedCells = new Set();
let robotPaths = new Set();
let isAutoPlaying = false;


const generateRandomNumber = () => {
  return Math.floor(Math.random() * 9) + 1;
}

// Initialize game
const generateGrid = () => {
  gridSize = parseInt(gridDocumentElement.value);
  grid = [];
  for (let i = 0; i < gridSize; i++) {
    grid[i] = [];
    for (let j = 0; j < gridSize; j++) {
      grid[i][j] = generateRandomNumber();
    }
  }
  console.log({ grid })
  resetGame();
}

// creating Grid board here
const renderGrid = () => {
  const gridElement = document.getElementById('grid');
  // use grid template columns here
  gridElement.style.gridTemplateColumns = `repeat(${gridSize}, 60px)`;
  gridElement.innerHTML = '';

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const cell = document.createElement('div');
      cell.className = 'cell';

      console.log(grid[i][j])

      cell.textContent = grid[i][j];

      if (i === robot1.row && j === robot1.col) {
        const robot = document.createElement('div');
        robot.className = `robot robot1 ${currentRobot === 1 ? 'active' : ''}`;
        cell.appendChild(robot);
      }

      if (i === robot2.row && j === robot2.col) {
        const robot = document.createElement('div');
        robot.className = `robot robot2 ${currentRobot === 2 ? 'active' : ''}`;
        cell.appendChild(robot);
      }

      gridElement.appendChild(cell);
    }
  }
  updateScore();
}

const moveRobot = (direction) => {
  if (isAutoPlaying) return;

  const pos = currentRobot === 1 ? robot1 : robot2;
  const newPos = { ...pos };

  switch (direction) {
    case 'down':
      newPos.row++;
      break;
    case 'diagonal-left':
      newPos.row++;
      newPos.col--;
      break;
    case 'diagonal-right':
      newPos.row++;
      newPos.col++;
      break;
  }

  if (isValidMove(newPos)) {
    if (currentRobot === 1) {
      robot1 = newPos;
      collectChocolate(1);
    } else {
      robot2 = newPos;
      collectChocolate(2);
    }

    robotPaths.add(`${newPos.row},${newPos.col},${currentRobot}`);
    renderGrid();

    if (isGameOver()) {
      setTimeout(() => {
        alert(`Game Over!\nRobot 1: ${score1}\nRobot 2: ${score2}`);
      }, 100);
      return;
    }

    currentRobot = currentRobot === 1 ? 2 : 1;
  }
}

const isValidMove = (pos) => {
  return pos.row >= 0 && pos.row < gridSize &&
    pos.col >= 0 && pos.col < gridSize;
}

const collectChocolate = (robotNum) => {
  const pos = robotNum === 1 ? robot1 : robot2;
  const cellKey = `${pos.row},${pos.col}`;

  if (!visitedCells.has(cellKey)) {
    if (robotNum === 1) {
      score1 += grid[pos.row][pos.col];
    } else {
      score2 += grid[pos.row][pos.col];
    }
    visitedCells.add(cellKey);
  }
}

const updateScore = () => {
  document.getElementById('score1').textContent = score1;
  document.getElementById('score2').textContent = score2;
}

const resetGame = () => {
  robot1 = { row: 0, col: 0 };
  robot2 = { row: 0, col: gridSize - 1 };
  score1 = 0;
  score2 = 0;
  currentRobot = 1;
  visitedCells.clear();
  robotPaths.clear();
  isAutoPlaying = false;
  renderGrid();
}

const isGameOver = () => {
  return robot1.row === gridSize - 1 && robot2.row === gridSize - 1;
}

const toggleAutoPlay = () => {
  isAutoPlaying = !isAutoPlaying;
  if (isAutoPlaying) {
    autoPlay();
  }
}

const autoPlay = () => {
  if (!isAutoPlaying) return;

  const currentPos = currentRobot === 1 ? robot1 : robot2;
  const moves = ['down', 'diagonal-left', 'diagonal-right'];
  let bestMove = null;
  let bestScore = -1;

  for (const move of moves) {
    const newPos = { ...currentPos };
    switch (move) {
      case 'down':
        newPos.row++;
        break;
      case 'diagonal-left':
        newPos.row++;
        newPos.col--;
        break;
      case 'diagonal-right':
        newPos.row++;
        newPos.col++;
        break;
    }

    if (isValidMove(newPos) && grid[newPos.row][newPos.col] > bestScore) {
      bestScore = grid[newPos.row][newPos.col];
      bestMove = move;
    }
  }

  if (bestMove) {
    if (currentRobot === 1) {
      robot1 = getNewPosition(robot1, bestMove);
      collectChocolate(1);
    } else {
      robot2 = getNewPosition(robot2, bestMove);
      collectChocolate(2);
    }

    const newPos = currentRobot === 1 ? robot1 : robot2;
    robotPaths.add(`${newPos.row},${newPos.col},${currentRobot}`);

    renderGrid();

    if (isGameOver()) {
      setTimeout(() => {
        alert(`Game Over!\nRobot 1: ${score1}\nRobot 2: ${score2}\nTotal Score: ${score1 + score2}`);
        isAutoPlaying = false;
      }, 100);
      return;
    }

    currentRobot = currentRobot === 1 ? 2 : 1;
    setTimeout(autoPlay, 500);
  }
}

const getNewPosition = (pos, direction) => {
  const newPos = { ...pos };
  switch (direction) {
    case 'down':
      newPos.row++;
      break;
    case 'diagonal-left':
      newPos.row++;
      newPos.col--;
      break;
    case 'diagonal-right':
      newPos.row++;
      newPos.col++;
      break;
  }
  return newPos;
}

const skipCurrentUser = () => {
  currentRobot = currentRobot === 1 ? 2 : 1;
  renderGrid();
}

// Event listeners
document.addEventListener('keydown', (e) => {
  if (isAutoPlaying) return;

  switch (e.key) {
    case 'ArrowDown':
      moveRobot('down');
      break;
    case 'ArrowLeft':
      moveRobot('diagonal-left');
      break;
    case 'ArrowRight':
      moveRobot('diagonal-right');
      break;
  }
});

// Initialize the game
generateGrid();