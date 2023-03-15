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
      if (!this.isRevealed) return ' ' // Not revealed
      if (this.hasMine) return '*'     // Mine
      return this.adjMines ? this.adjMines : ' ' // 1-8 or ' ' if 0
   }

   // Only tiles without a mine needs to know how many adjecent mines there are
   addAdjMines() {
      if (this.hasMine) return
      this.adjMines++
      this.isEmpty = false
   }
}

var totalMines = 0, totalFlags = 0, flaggedMines = 0, grid = []
const maxGridsize = 2500

// Creates an array of tiles, tiles with mines are placed first
function fillArray(mines, x, y) {

   let arr = []

   for (let i = x * y; i > 0; i--) {
      arr.push(new Tile(mines-- > 0))
   }
   return arr
}

// Shuffles the array to spread the tiles with mines
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

   let mat = [], row = []

   for (let i = 0; i < y; i++) {
      row = arr.slice(x * i, x * (i + 1))
      mat.push(row)
   }

   return mat
}

function generate() {

   let mines = Number(document.getElementById("Mines").value)
   let x = Number(document.getElementById("X").value)
   let y = Number(document.getElementById("Y").value)
   
   // Reset before next grid
   totalFlags = 0, totalMines = 0, flaggedMines = 0, grid = []
   document.getElementById("grid").innerHTML = ""

   if (x * y > maxGridsize) {
      alert("The grid cannot contain more than " + maxGridsize + " tiles!")
      return
   }
   
   if (!x || !y || !mines || mines <= 0 || x <= 0 || y <= 0) {
      alert("All numbers must be filled in and be above 0")
      return
   }

   if (x * y <= mines) {
      alert("All tiles can't have mines")
      return
   }

   totalMines = mines
   // Create an array of tiles, shuffle them, then slice them into a matrix (grid)
   grid = toMatrix(x, y, shuffleArray(fillArray(mines, x, y)))

   if (grid === null) return

   // Add the amount of adjecent mines for each tile, if more than 0 then it is no longer empty
   countAdjMines()

   // Output
   for (let i = 0; i < y; i++) {
      document.getElementById("grid").innerHTML += `<div class="row"></div>`
      for (let j = 0; j < x; j++) {
         
         document.getElementsByClassName('row')[i].innerHTML += 
            `<div 
               class="tile" 
               onclick="onReveal(${j}, ${i})" 
               oncontextmenu="onFlag(${j}, ${i});return false">
               ${grid[i][j].toString()}
            </div>`
      }
   }
   console.clear()
   printGrid()
}

function printGrid() {
   let str = ""
   // Flipping Y axis to move (0,0) to bottom left corner
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
   // Outside of matrix
   if (!indexInMatrix(x, y, mat)) return

   // Is already revealed
   if (mat[y][x].isRevealed) return

   // Unflag if flagged
   if (mat[y][x].isFlagged) flag(x, y)

   // If tile has mine
   if (mat[y][x].reveal()) {
      alert("Gameover")
      return
   }
   // If a tile is empty, reveal all neighbours, otherwise return
   if (!mat[y][x].isEmpty) return

   // Check if all surrounding indexes are valid then reveal them
   for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
         // If both are 0 then it is the center, not a neighbour
         if (!i && !j) continue
         if (!indexInMatrix(x + i, y + j, mat)) continue
         if (!grid[y + j][x + i].isRevealed) revealTile(x + i, y + j)
         
      }
   }
}

function indexInMatrix(x, y, mat) {
   if (mat.length === 0) return false
   return x < mat[0].length && y < mat.length && x >= 0 && y >= 0
}

// Counts how many mines a tile is adjecent to, except for tiles which has a mine
function countAdjMines() {
   let mat = grid
   for (let y = 0; y < mat.length; y++) {
      for (let x = 0; x < mat[0].length; x++) {

         if (!mat[y][x].hasMine) continue

         // Checking adjecent indexes, ignoring the center
         for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
               if (!i && !j) continue
               if (indexInMatrix(x + i, y + j, mat)) mat[y + j][x + i].addAdjMines()
            }
         }
      }
   }
}

function flag(x, y) {
   if (!indexInMatrix(x, y, grid)) return
   if (grid[y][x].isRevealed) return

   grid[y][x].toggleFlag()

   if (grid[y][x].isFlagged) {
      totalFlags++
      if (grid[y][x].hasMine) flaggedMines++
   } else {
      totalFlags--
      if (grid[y][x].hasMine) flaggedMines--
   }
   if (totalMines == flaggedMines && totalFlags == flaggedMines) alert("You win!")
}

function onReveal(x, y) {

   if (x < 0 || y < 0) {
      console.log("All numbers must be filled in and be positive")
      return
   }

   revealTile(x, y)

   // Output
   for (let i = 0; i < grid.length; i++) {
      let row = document.getElementsByClassName("row")[i]
      for (let j = 0; j < grid[0].length; j++) {
         
         if (grid[i][j].isRevealed) {
            row.children[j].className = "tile revealed"
            row.children[j].innerHTML = grid[i][j].toString()
         }
      }
   }
   console.clear()
   printGrid()
}

function onFlag(x, y) {

   if (x < 0 || y < 0) {
      console.log("All numbers must be filled in and be positive")
      return
   }
   
   flag(x, y)

   // Output
   let row = document.getElementsByClassName('row')[y]
   row.children[x].innerHTML = grid[y][x].toString()
   console.clear()
   printGrid()
}

// For developing only
function revAll() {
   console.clear()
   let str = ""
   for (let i = grid.length - 1; i >= 0; i--) {
      for (let j = 0; j < grid[0].length; j++) {
         grid[i][j].isRevealed = true
         str += grid[i][j].toString()
      }
      str += "\n"
   }
   console.log(str)
}
