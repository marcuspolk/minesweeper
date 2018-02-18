//     A B C D E F G H I // represents 0 -> 8.
// 0 [ 9 1 0 1 0 1 0 0 1]
// 1 [ 2 1 0 1 0 0 0 0 1]
// 2 [ 9 1 0 0 0 1 0 0 1]
// 3 [ 0 0 0 1 0 1 0 0 1]
// 4 [ 0 0 0 1 0 1 1 0 1]
// 5 [ 0 1 0 0 1 1 0 0 1]
// 6 [ 0 0 0 1 0 1 0 0 1]
// 7 [ 0 0 0 0 0 1 0 0 1]
// 8 [ 0 0 0 0 0 1 0 0 1]
// Height, Width: 9
// 
// Given: LetterNum A0, pos: (Num*Width + LetterToI)
// Given: D3 (3 * 9 + 3), pos: 30

// Task: Flag all bombs present in mine.
// Beg: 9 * 9, 10 mines.
// Inter: 16 * 16, 40 mines
// Expert: 16 * 30, 99 mines. <----- Does mine traversal work in this case?
// yes, just inc by width to find nextRow adj.. 
// Cell is clicked.
  // Place cell on stack. While !stack.isEmpty()
    // if there's a bomb there: simple, game over.
    // If not: Assuming we have access to this cell's adj bomb count, if it's 0, put all surrounding unvisited spaces on stack.
    // If it's > 0, simply reveal that number and stop. 
    // End of move.
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


class Minesweeper {
  constructor() {
    console.log('hi');
    // Prompt for difficulty: E, M, H. C (custom).
    // Create the mine array, initialize all values to 0.
    // For each bomb, placeBomb() at randomBombPos(). Increment all surrounding non bomb by 1..
  }

  async play() {

  }

  promptFirstMove() {
    // getsUserInput
    // if bomb there, move it to first available place from 0, inc by 1 each time. call placeBomb(i).
  }

  getUserInput() {
    // returns promise.
  }

  draw() {

  }

  randomBombPos() {
    // if board pct < 30
    // keep generating randoms...
    // otherwise probe after.
    // gen random i in mine size
    // until mine[i] === 0, inc i. 
    // return i.
  }

  placeBomb(position) {

  }



}
