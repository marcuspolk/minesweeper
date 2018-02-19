const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

class Minesweeper {
  constructor() {
    this.width = 0;
    this.height = 0;
    this.bombCount = 0;
    this.flagCount = 0;
    this.leftToVisit = 0;
    this.boardSize = 0;
    this.moveCount = 0;
    this.gameInProgress = true;
  }

  async play() {
    await this.init();
    this.draw();
    await this.makeFirstMove();

    while (this.gameInProgress) {
      console.log('---------------------------------------------------');
      this.draw();
      await this.makePlayerMove();
    }
  }

  async makePlayerMove() {
    const position = await this.getValidMove();
    if (this.isOnBoard(position)) this.explore(position);
    else if (position === this.boardSize) this.toggleFlag(0);
    else this.toggleFlag(Math.abs(position));
  }

  async getValidMove() {
    let userIsFlagging = false;
    let position;
    let input;
    const setTempInput = function (userInput) {
      input = userInput;
    };
    const askForMoveString = 'Please insert a valid move.';
    do {
      await getUserInput(askForMoveString).then(setTempInput);
      if (input.length > 1 && input.length <= 4) {
        userIsFlagging = (input.charAt(0) === '.');
        if (userIsFlagging) {
          input = input.slice(1);
        }
        const tempPosition = this.coordToI(input);
        if (this.isOnBoard(tempPosition) && !this.isVisited(tempPosition)) position = tempPosition;
      }
    } while (position === undefined);

    if (userIsFlagging) return (position === 0) ? this.boardSize : position * -1;
    return position;
  }


  isOnBoard(pos) {
    return (pos >= 0 && pos < this.boardSize);
  }

  gameWon() {
    this.gameInProgress = false;
    this.draw();
    console.log('Congratulations! You have cleanly swept the mine!');
  }

  gameLost() {
    this.gameInProgress = false;
    this.draw();
    console.log('Game over! You detonated a bomb!');
  }

  explore(pos) {
    if (this.isFlagged(pos)) {
      console.log('Please unflag the cell before exploring it.');
      return;
    }
    this.moveCount += 1;
    if (this.isBomb(pos)) {
      this.gameLost(pos);
      return;
    }
    const toVisitStack = [pos];
    while (toVisitStack.length > 0) {
      const cell = toVisitStack.pop();
      if (this.isAllClear(cell)) {
        this.getNeighbors(cell).forEach(neighbor => toVisitStack.push(neighbor));
      }
      if (!this.isVisited(cell) && !this.isFlagged(cell)) {
        this.markVisited(cell);
        if (this.leftToVisit === 0) this.gameWon();
      }
    }
  }

  markVisited(pos) {
    this.mines[pos] += 10;
    this.leftToVisit -= 1;
  }

  isVisited(pos) {
    return (this.mines[pos] >= 10);
  }

  isAllClear(pos) {
    return this.mines[pos] === 0;
  }

  isBomb(pos) {
    return (this.mines[pos] === 9);
  }

  isFlagged(pos) {
    return (this.mines[pos] < 0);
  }

  toggleFlag(pos) {
    this.isFlagged(pos) ? this.unflag(pos) : this.flag(pos);
  }

  flag(pos) {
    this.mines[pos] -= 10;
    this.flagCount += 1;
  }

  unflag(pos) {
    this.mines[pos] += 10;
    this.flagCount -= 1;
  }

  getNeighbors(pos) {
    const neighbors = [];
    const w = this.width;

    const above = pos - w;
    const aboveRow = Math.floor(above / w);
    neighbors.push(above); 
    if (Math.floor((above - 1) / w) === aboveRow) neighbors.push(above - 1);
    if (Math.floor((above + 1) / w) === aboveRow) neighbors.push(above + 1);

    const curRow = Math.floor(pos / w);
    if (Math.floor((pos - 1) / w) === curRow) neighbors.push(pos - 1);
    if (Math.floor((pos + 1) / w) === curRow) neighbors.push(pos + 1);

    const below = pos + w;
    const belowRow = Math.floor(below / w);
    neighbors.push(below);
    if (Math.floor((below - 1) / w) === belowRow) neighbors.push(below - 1);
    if (Math.floor((below + 1) / w) === belowRow) neighbors.push(below + 1);

    return neighbors.filter(cell => this.isOnBoard(cell));
  }

  genBombs() {
    for (let i = 0; i < this.bombCount; i += 1) {
      const pos = this.findBomblessCell();
      this.placeBomb(pos);
    }
  }

  findBomblessCell() {
    const size = this.boardSize;
    let position;
    do {
      position = Math.floor(Math.random() * size);
    } while (this.isBomb(position));
    return position;
  }

  placeBomb(position) {
    this.mines[position] = 9;
    this.getNeighbors(position).forEach((cell) => {
      if (!this.isBomb(cell)) this.mines[cell] += 1;
    });
  }
  removeBomb(position) {
    this.mines[position] = this.getNeighbors(position)
      .reduce((neighborBombCount, cell) => {
        if (this.isBomb(cell)) return neighborBombCount + 1;
        return neighborBombCount;
      }, 0);
  }
  draw() {
    console.log(`Bombs: ${this.bombCount - this.flagCount} Time: TODO Clicks: ${this.moveCount}`);
    let position = 0;
    for (let i = 0; i < this.height; i += 1) {
      const row = [];
      for (let j = 0; j < this.width; j += 1) {
        let char;
        if (this.isVisited(position)) char = ` ${this.mines[position] - 10} `;
        else if (this.isFlagged(position)) char = ' F ';
        else if (this.gameInProgress) char = `${this.iToCoord(position)}`;
        else char = ' X ';
        row.push(char);
        position += 1;
      }
      console.log(`| ${row.join(' | ')} |`);
    }
  }

  coordToI(coordinate) {
    const rowChar = coordinate.charAt(0).toUpperCase();
    const col = parseInt(coordinate.slice(1), 10);

    if (typeof rowChar !== 'string') return -1;
    if (isNaN(col)) return -1;

    const rowNum = rowChar.charCodeAt() - 65;
    return (rowNum * this.width) + col;
  }

  iToCoord(pos) {
    const w = this.width;
    const charNum = Math.floor(pos / w);
    const colNum = pos - (charNum * w);
    const char = String.fromCharCode(charNum + 65);
    const colString = colNum < 10 ? ` ${colNum}` : `${colNum}`;
    return `${char}${colString}`;
  }

  async makeFirstMove() {
    let position;
    do {
      const tempPosition = await this.getValidMove();
      if (this.isOnBoard(tempPosition)) {
        position = tempPosition;
      } else {
        console.log('You cannot set a flag as first move.');
      }
    } while (position === undefined);

    if (this.isBomb(position)) {
      const newBombLocation = this.findBomblessCell();
      this.placeBomb(newBombLocation);
      this.removeBomb(position);
    }
    this.explore(position);
  }

  async init() {
    this.mines = [];
    const difficulties = { E: [9, 9, 10], M: [16, 16, 40], H: [30, 16, 99] };
    const difficultyMessage = 'Please enter a difficulty: E, M, H.';
    // TODO: handle custom difficulty.
    let difficulty;
    let difficultyChar;
    const setDifficultyChar = function (userInput) {
      difficultyChar = userInput.charAt(0).toUpperCase();
    };
    do {
      await getUserInput(difficultyMessage)
        .then(setDifficultyChar);
      difficulty = difficulties[difficultyChar];
    } while (difficulty === undefined);
    [this.width, this.height, this.bombCount] = difficulty;
    this.boardSize = this.width * this.height;
    this.leftToVisit = this.boardSize - this.bombCount;

    for (let i = 0; i < this.boardSize; i += 1) {
      this.mines[i] = 0;
    }
    this.genBombs();
  }
}

function getUserInput(message) {
  // possible bad input. should be handled by question's error handling.
  if (typeof message !== 'string') {
    console.error(`You gave the message: ${message}`);
    console.error('non string message given to readline.');
    return '';
  }
  return new Promise((res) => {
    rl.question(message, (input) => {
      rl.pause();
      res(input);
    });
  });
}


const game = new Minesweeper();
game.play();
