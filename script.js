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
      if (this.isFlagged) return '^'  // Flag
      if (this.isRevealed) {
         if (this.hasMine) return '*' // Mine
         return this.adjMines         // Number 0-8
      }
      return '-'                      // Not revealed, nor flagged
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
   let x = Number(document.getElementById("X").value)
   let y = Number(document.getElementById("Y").value)

   //var a = document.createElement("div")

   if (x * y > maxGridsize) {
      console.log("The grid cannot contain more than " + maxGridsize + " tiles!")
      grid = [] // Reset grid
      return
   }
   
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

   console.clear()
   printGrid()
}

function printGrid() {
   let str = ""
   // First loop through rows (vertical), then columns (horizontal)
   for (let i = grid.length - 1; i >= 0; i--) {
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
   // If flagged then 'unflag'
   if (mat[y][x].isFlagged) flag(x, y)
   // [6 7 8]
   // [4 . 5] Order of revealing from center: .
   // [1 2 3]
   // If tile has mine
   if (mat[y][x].reveal()) {
      console.log("Gameover")
      return
   }
   // A tile is empty if it has no mine nor any adjecent mines, this allows chain revealing
   if (!mat[y][x].isEmpty) return
   // Check all surrounding indexes, if they are valid, if they are revealed and revealing if not
   for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
         if (!i && !j) continue
         if (indexInMatrix(x + i, y + j, mat)) if (notRev(x + i, y + j)) revealTile(x + i, y + j)
      }
   }
}

function indexInMatrix(x, y, mat) {
   if (mat.length === 0) return false
   return x < mat[0].length && y < mat.length && x >= 0 && y >= 0
}

// Check if tile is not revealed
function notRev(x, y) {
   return !grid[y][x].isRevealed
}

// Counts how many mines a tile is adjecent to, except for tiles which has a mine
function countAdjMines() {
   let mat = grid
   for (let y = 0; y < mat.length; y++) {
      for (let x = 0; x < mat[0].length; x++) {

         if (!mat[y][x].hasMine) continue

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
   if (totalMines == flaggedMines && totalFlags == flaggedMines) console.log("You win!")
}

function onReveal() {
   let x = Number(document.getElementById("XReveal").value)
   let y = Number(document.getElementById("YReveal").value)

   if (x < 0 || y < 0) {
      console.log("All numbers must be filled in and be positive")
      return
   }
   console.clear()
   revealTile(x, y)
   printGrid()
}

function onFlag() {
   let x = Number(document.getElementById("XFlag").value)
   let y = Number(document.getElementById("YFlag").value)

   if (x < 0 || y < 0) {
      console.log("All numbers must be filled in and be positive")
      return
   }
   console.clear()
   flag(x, y)
   printGrid()
}

// test printing tiles
document.getElementsByClassName("grid")[0].innerHTML += `<div class="row"></div>`
for (let i = 6; i < 9; i++) {
   document.getElementsByClassName('row')[2].innerHTML += 
      `<div 
         class="tile" 
         onclick="test(${i})" 
         oncontextmenu="alert('Flagged ' + ${i});return false">
         ${i}
      </div>`
}

// test revealing tile, changing style and value
function test(i) {
   let elements = document.getElementsByClassName("tile")
   elements[i].className = "tile revealed"
   elements[i].innerHTML = " "
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
