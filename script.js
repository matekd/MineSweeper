class Tile {

   constructor(hasMine) {
      this.hasMine = Boolean(hasMine)
      this.isEmpty = !Boolean(hasMine)
      this.isFlagged = false
      this.isRevealed = false
      this.adjMines = 0
   }

   toggleFlag() {
      this.isFlagged = !this.isFlagged
   }

   // Reveal the tile, return true if it has a mine
   reveal() {
      this.isRevealed = true
      return this.hasMine
   }

   // temp values
   toString() {
      if (this.isFlagged) return '^'   // Flag
      if (this.isRevealed) {
         if (this.hasMine) return '*'  // Mine
         if (this.adjMines) return this.adjMines // Number 1-8
         return ' '                    // Empty
      }
      return '-'                       // Not revealed, nor flagged
   }

   // Only tiles without a mine needs to know how many adjecent mines there are
   addAdjMines() {
      if (this.hasMine) return
      this.adjMines++
      this.isEmpty = false
   }
}

var totalMines = 0, totalFlags = 0, flaggedMines = 0, grid = []

// Creates an array of tiles, mined tiles are placed first
function fillArray(mines, x, y) {

   // Check that all mines fit and that the grid is not zero in size
   if (x * y < mines || x * y == 0) return

   let arr = []

   for (let i = x * y; i > 0; i--) {
      arr.push(new Tile(mines-- > 0))
   }
   return arr
}

// Shuffles the array to spread the mined tiles throughout the array
function shuffleArray(arr) {

   let randIndex, temp

   for (let i = arr.length - 1; i > 0; i--) {

      randIndex = Math.floor(Math.random() * (i + 1))
      temp = arr[i]
      arr[i] = arr[randIndex]
      arr[randIndex] = temp
   }
   return arr
}

// Slices the array to form a matrix of size x * y
function toMatrix(x, y, arr) {

   if (x * y !== arr.length) return null

   let mat = []
   let row = []

   for (let i = 0; i < y; i++) {
      row = arr.slice(x * i, x * (i + 1))
      mat.push(row)
   }

   return mat
}

function generate() {

   let mines = document.getElementById("Mines").value
   let x = document.getElementById("X").value
   let y = document.getElementById("Y").value
   
   if (!x || !y || !mines || mines <= 0 || x <= 0 || y <= 0) {
      console.log("All numbers must be filled in and be above 0")
      return
   }

   totalMines = mines
   
   // Create an array of tiles, shuffle them, then form them into a matrix (grid)
   grid = toMatrix(x, y, shuffleArray(fillArray(mines, x, y)))

   if (grid === null) return

   // Add the amount of adjecent mines for each tile, if more than 0 then it is no longer empty
   countAdjMines()

   printGrid()
}

function printGrid() {
   console.clear()
   let str = ""
   // First loop through rows (vertical), then columns (horizontal)
   for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[0].length; j++) {
         str += grid[i][j].toString()
      }
      str += "\n"
   }
   console.log(str)
}

// Reveal Tile Vertical, Horizontal and Diagonal
function revealTile(x, y) {
   mat = grid
   // Reached outside of matrix
   if (!indexInMatrix(x, y, mat)) return
   // Is already revealed
   if (mat[y][x].isRevealed) return
   // [6 7 8]
   // [5 . 1] Order of revealing from center: .
   // [4 3 2]
   // If tile has mine
   if (mat[y][x].reveal()) {
      printGrid()
      console.log("Gameover")
      return
   }
   printGrid()
   // A tile is empty if it has no mine nor any adjecent mines, this allows chain revealing
   if (!mat[y][x].isEmpty) return
   // First check if X and Y is within the matrix, only if they are check if the tile is revealed
   if (indexInMatrix(x+1, y,   mat)) if (notRev(x+1, y  )) revealTile(x+1, y  ) // right
   if (indexInMatrix(x+1, y+1, mat)) if (notRev(x+1, y+1)) revealTile(x+1, y+1) // down right
   if (indexInMatrix(x,   y+1, mat)) if (notRev(x,   y+1)) revealTile(x,   y+1) // down
   if (indexInMatrix(x-1, y+1, mat)) if (notRev(x-1, y+1)) revealTile(x-1, y+1) // down left
   if (indexInMatrix(x-1, y,   mat)) if (notRev(x-1, y  )) revealTile(x-1, y  ) // left
   if (indexInMatrix(x-1, y-1, mat)) if (notRev(x-1, y-1)) revealTile(x-1, y-1) // up left
   if (indexInMatrix(x,   y-1, mat)) if (notRev(x,   y-1)) revealTile(x,   y-1) // up
   if (indexInMatrix(x+1, y-1, mat)) if (notRev(x+1, y-1)) revealTile(x+1, y-1) // up right
   
}

function indexInMatrix(x, y, mat) {
   return x < mat[0].length && y < mat.length && x >= 0 && y >= 0
}

// Check if tile is not revealed
function notRev(x, y) {
   return !grid[y][x].isRevealed
}

// Counts how many mines a tile is adjecent to, except for tiles which has a mine
function countAdjMines() {
   let mat = grid
   for (let i = 0; i < mat.length; i++) {
      for (let j = 0; j < mat[0].length; j++) {
         if (mat[i][j].hasMine) {
               if (indexInMatrix(j+1, i,   mat)) mat[i][j+1].addAdjMines()   // right
               if (indexInMatrix(j+1, i+1, mat)) mat[i+1][j+1].addAdjMines() // down right
               if (indexInMatrix(j,   i+1, mat)) mat[i+1][j].addAdjMines()   // down
               if (indexInMatrix(j-1, i+1, mat)) mat[i+1][j-1].addAdjMines() // down left
               if (indexInMatrix(j-1, i,   mat)) mat[i][j-1].addAdjMines()   // left
               if (indexInMatrix(j-1, i-1, mat)) mat[i-1][j-1].addAdjMines() // up left
               if (indexInMatrix(j,   i-1, mat)) mat[i-1][j].addAdjMines()   // up
               if (indexInMatrix(j+1, i-1, mat)) mat[i-1][j+1].addAdjMines() // up right
         }
      }
   }
}

function flag(x, y) {
   if (!indexInMatrix(x, y, grid)) return
   grid[y][x].toggleFlag()
   if (grid[y][x].isFlagged) {
      totalFlags++
      if (grid[y][x].hasMine) flaggedMines++
   } else {
      totalFlags--
      if (grid[y][x].hasMine) flaggedMines--
   }
   printGrid()
   if (totalMines == flaggedMines && totalFlags == flaggedMines) console.log("You win!")
}

//function adjIndeces(x, y) {}