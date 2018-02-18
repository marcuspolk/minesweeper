

// yes, just inc by width to find nextRow adj..
// When all cells are visited/marked, game is over. Reveal whether won or not...Actually, for all cells to have been visited and have no bomb discovered, you already won...
// Wait but it's possible to have checked all cells as having bomb.
// So when all cells are visited, let's say we keep an array 'MARKEDINVALID'.
// Keep a counter of encountered/marked. If there are 100 cells, when we visit or mark a cell, inc counter.
// When counter === totalCellCount, game over.
// If MARKEDINVALID.length > 0, LOSS.
// Else: WON
// For flagging cell:
// if visited: do nothing. (visited means val > 9)
// otherwise: decrease the val by 10. so all negatives means flagged.
// if the val === -9, it was an accurate bomb flag. so dec total bombs by 1.
// Unflagging cell:
// inc val by 10.
// if newVal === 9, inc totalBombs by 1.
// Game over when either
// all cells visited and total bombs: 0.
// clicked on bomb.
// exploredCount = totalCount - bombCount.

// Edge cases:
// if first click is bomb, move bomb to top left (move right until no bomb there, update surrounding bomb counters)
// if clicked unvisited, adj to flag. (behave as usual)
// selects flagged.. unflag? print: unflagged cell.
// or commands: prepend with f, it will either flag or unflag. so cant use row with f...

// Auxiliary nice to haves:
// timer.
// clickCounter.
// bombCounter (when flagged, dec this.. can go negative.)
// soft reset ()

// Data model:
// Array of size width * height.
// int values for each index where val in range: [-10, 18] (-10 means flagged a 0 surronded. 18 means clicked a completly surrounded)
// [-10, -1] surCount = val + 10. flagged.
// [0, 8]: surCount = val. unvisited.
// 9: bomb. unvisited (only possible).
// [10,18]: curCount = val - 10. visited

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getUserInput(message) {
  // possible bad input. should be handled by question's error handling.
  if (typeof message !== 'string'){
    console.error('non string message given to readline.')
    return '';
  }
  return new Promise((res, rej) => {
    rl.question(message, (input) => {
      rl.close()
      .then(()=>res(input));
    });
  });
}

class Minesweeper {
  constructor() {
    this.width = 0;
    this.height = 0;
    this.bombCount = 0;
    this.flagCount = 0;
    this.leftToVisit = 0;
    this.boardSize = 0;
    this.gameInProgress = true;

    // Create the mine array, initialize all values to 0.
    // For each bomb, placeBomb() at randomBombPos(). Increment all surrounding non bomb by 1..
  }

  async play() {
    await this.init();
    await this.makeFirstMove();
    
    while (this.gameInProgress) {
      this.draw();
      await this.makePlayerMove(); // returns move string.
    }
  }

  makePlayerMove() {
    let position = await this.getValidMove();
    if (this.isOnBoard(position)) this.explore(position);
    else if (position === this.boardSize) this.toggleFlag(0);
    else this.toggleFlag(Math.abs(position));
  }

  getValidMove() { // want this to be used by both makePlayerMove and getFirstMove
    // returns negative input if flagging the position... how to flag pos 0? return boardSize...hacky. 
    let userIsFlagging = false;
    let position;
    do {
      // get valid move from user.
      let input = await getUserInput();
      if (input.length > 1 && input.length <= 4) {
        userIsFlagging = (input.charAt(0) === '.');
        if (userIsFlagging) {
          input = input.slice(1);
        }
        const tempPosition = this.coordToI(input); // returns -1 if can't be converted.
        if (this.isOnBoard(tempPosition) && !this.isVisited(tempPosition)) position = tempPosition; // <-- SOLE JOB OF THIS FUNCTION.
      }
    } while (position === undefined);

    if (userIsFlagging)
      return (position === 0) ? this.boardSize : position * -1; // hacky but necessary given implementation.
    else
      return position;
  }

  async init() {
    // prompt for difficulty.
    const difficulties = { E: [9, 9, 10], M: [16, 16, 40], H: [30, 16, 99] };
    const queryDifficulty = 'Please enter a difficulty: E, M, H.';
    // TODO: handle custom difficulty.
    let difficulty;
    do {
      let tempDifficultyString = await getUserInput(queryDifficulty).charAt(0).toUpperCase();
      difficulty = difficulties[tempDifficultyString];
    } while (difficulty === undefined)

    [this.width, this.height, this.bombCount] = difficulty;
    this.boardSize = this.width * this.height;
    this.leftToVisit = this.boardSize - this.bombCount;
    
    for (let i = 0; i < this.boardSize; i++) {
      this.mines[i] = 0;
    }
    this.genBombs();
  }

  isOnBoard(pos) {
    return (pos >= 0 && pos < this.boardSize);
  }

  gameWon() {
    console.log('Congratulations! You have cleanly swept the mine!');
    this.gameInProgress = false;
    this.draw();
  }
  
  gameLost(detonatedBomb) {
    console.log('Game over! You detonated a bomb!');
    this.gameInProgress = false;
    this.draw();
  }

  makeFirstMove() {
    let position;
    do {
      let tempPosition = await this.getValidMove();
      if (this.isOnBoard(tempPosition)) {
        position = tempPosition;
      } else {
        console.log('You cannot set a flag as first move.');
      }
    } while (position === undefined);

    if (this.isBomb(position)) {
      let newBombLocation = this.findBomblessCell();
      this.placeBomb(newBombLocation);
      this.removeBomb(position);
    }

    this.explore(position);
  }
  


  isPlayable(pos) {
    const cell = this.mines[pos];
    return (cell >= 0 && cell < 10);
  }

  isAllClear(pos) {
    return this.mines[pos] === 0;
  }

  isBomb(pos) {
    return (this.mines[pos] === 9);
  }

  isVisited(pos) {
    return (this.mines[pos] >= 10);
  }

  isFlagged(pos) {
    return (this.mines[pos] < 0);
  }

  toggleFlag(pos) {
    this.isFlagged(pos) ? this.flag(pos) : this.unflag(pos);
  }

  flag(pos) {
    this.mines[pos] -= 10;
    this.flagCount += 1;
  }

  unflag(pos) {
    this.mines[pos] += 10;
    this.flagCount -= 1;
  }

  explore(pos) {
    if (this.isFlagged(pos)) { // need to check if flagged before checking if it's a bomb!
      console.log("Please unflag the cell before exploring it.");
      return;
    }
    if (this.isBomb(pos)) {
      return this.gameLost(pos);
    }

    const toVisitStack = [pos]; // stores positions to be visited.
    while (toVisitStack.length > 0) {
      let cell = toVisitStack.pop();
      if (this.isAllClear(cell))
        this.getNeighbors(cell).forEach(neighbor => toVisitStack.push(neighbor)); //getNeighbors returns onBoard neighboring positions.
      if (!this.isVisited(cell) && !this.isFlagged(cell)) {
        this.markVisited(cell);
        if (this.leftToVisit === 0) 
          this.gameWon();  
      }
    }
  }

  markVisited(pos) {
    this.mines[pos] += 10;
    this.leftToVisit -= 1;
  }

  getNeighbors(pos) {
    const neighbors = []; // can maybe make this array global and only create one. meh.
    const w = this.width;

    neighbors.push(pos - w);
    neighbors.push(pos - w - 1);
    neighbors.push(pos - w + 1);
    neighbors.push(pos - 1);
    neighbors.push(pos + 1);
    neighbors.push(pos + w);
    neighbors.push(pos + w - 1);
    neighbors.push(pos + w + 1);

    return neighbors.filter(cell => this.isOnBoard(cell));
  }

  coordToI(coordinate) {
    // takes coordinate string, converts it to corresponding index.
    const rowChar = coordinate.charAt(0).toUpperCase();
    const col = parseInt(coordinate.slice(1));
    
    if (typeof rowChar !== 'string') return -1;
    if (isNaN(col)) return -1;

    const rowNum = rowChar.charToI.charCodeAt() - 65;
    return (rowNum * this.width) + col;
  }

  draw() {
    // iterate through mine array.
    // if isExplored(mine[i]), draw mine[i] - 10.
    // else if isFlagged(mine[i]), draw F.
    // else draw blank.

  }

  genBombs() {
    // if board pct < 30
    // keep generating randoms...
    // otherwise probe after.
    // gen random i in mine size
    // until mine[i] === 0, inc i.
    // return i.
    for (let i = 0; i < this.bombCount; i++) {
      let pos = findBomblessCell();
      placeBomb(pos);
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
    this.getNeighbors(position).forEach(cell => 
      {
        if (!this.isBomb(cell))
          this.mines[cell] += 1;
      });
  }
  removeBomb(position) {
    this.mines[position] = this.getNeighbors(position)
      .reduce((neighborBombCount, cell) => {
        if (this.isBomb(cell)) neighborBombCount += 1;
      }, 0);
  }
}

const game = new Minesweeper();
game.play();
