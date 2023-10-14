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

   toString() {
      if (this.isFlagged) return '^'   // Flag
      if (!this.isRevealed) return ' ' // Not revealed
      if (this.hasMine) return '*'     // Mine
      return this.adjMines ? this.adjMines : ' ' // 1-8 or ' ' if 0
   }

   addAdjMines() {
      this.adjMines++
      this.isEmpty = false
   }

   remAdjMines() {
      this.adjMines--
      // Ensure tiles can be empty again
      if (!this.adjMines && !this.hasMine) this.isEmpty = true
   }
}

var totalMines = 0, totalFlags = 0, flaggedMines = 0, grid = [], firstClick = true, gridX = 0, gridY = 0
const maxGridsize = 2500
const colors = ['#000000', '#0000cc', '#339933', '#cc3300', '#000080', '#800000', '#006600', '#b36b00', '#ff9900']

// Creates an array of tiles, tiles with mines are placed first
function fillArray(mines, amount) {

   let arr = Array(amount)

   for (let i = 0; i < amount; i++) {
      arr[i] = new Tile(mines-- > 0)
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

   let mat = Array(y)

   for (let i = 0; i < y; i++) {
      mat[i] = arr.slice(x * i, x * (i + 1))
   }

   return mat
}

function generate() {

   let mines = Number(document.getElementById("Mines").value)
   gridX = Number(document.getElementById("X").value)
   gridY = Number(document.getElementById("Y").value)
   
   // Reset before next grid
   totalFlags = 0, totalMines = 0, flaggedMines = 0, grid = []
   document.getElementById("grid").innerHTML = ""

   if (gridX * gridY > maxGridsize) {
      alert("The grid cannot contain more than " + maxGridsize + " tiles!")
      return
   }
   
   if (!gridX || !gridY || !mines || mines <= 0 || gridX <= 0 || gridY <= 0) {
      alert("All numbers must be filled in and be above 0")
      return
   }

   if (gridX * gridY <= mines) {
      alert("All tiles can't have mines")
      return
   }

   firstClick = true
   totalMines = mines
   // Create an array of tiles, shuffle them, then slice them into a matrix (grid)
   // Create an array of tiles for the grid, last one is added on first click
   grid = shuffleArray(fillArray(mines, (gridX * gridY - 1)))

   if (grid === null) return

   // Create the elements of the grid
   for (let i = 0; i < gridY; i++) {
      document.getElementById("grid").innerHTML += `<div class="row"></div>`
      for (let j = 0; j < gridX; j++) {
         document.getElementsByClassName('row')[i].innerHTML += 
            `<div 
               class="tile" 
               onclick="onReveal(${j}, ${i})" 
               oncontextmenu="onFlag(${j}, ${i});return false">
            </div>`
      }
   }
   printGrid()
}

function printGrid() {
   let str = ""
   for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[0].length; j++) {
         str += grid[i][j].toString()
      }
      str += "\n"
   }
   console.clear()
   console.log(str)
}

// Reveal Tile Vertical, Horizontal and Diagonal
function revealTile(x, y) {

   if (!indexInMatrix(x, y, grid)) return 0

   if (grid[y][x].isRevealed) return 0

   if (grid[y][x].isFlagged) flag(x, y)

   // If tile has mine
   if (grid[y][x].reveal()) return 1

   // Reveal all surrounding indexes
   if (grid[y][x].isEmpty) adjacent(x, y, grid, (x, y, mat) => { if (!mat[y][x].isRevealed) revealTile(x, y) })

   return 0
}

function indexInMatrix(x, y, mat) {
   if (mat.length === 0) return false
   return x < mat[0].length && y < mat.length && x >= 0 && y >= 0
}

// Used for detecting 3x3s of mines
var surrMines = 0

// Counts how many mines a tile is adjacent to, except for tiles with a mine
function countAdjMines() {
   let minesRemoved = 0
   // Search for mines and add to adjacent mines for all surrounding tiles
   for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {

         if (!grid[y][x].hasMine) continue

         surrMines = 0
         adjacent(x, y, grid, (x, y, mat) => {
            mat[y][x].addAdjMines()
            if (mat[y][x].hasMine) surrMines++
         })
         // Remove mine and reduce surrounding adjacent mines
         if (grid[y][x].hasMine && surrMines == 8) {
            grid[y][x].hasMine = false
            grid[y][x].isRevealed = true
            totalMines--
            minesRemoved++
            adjacent(x, y, grid, (x, y, mat) => { mat[y][x].remAdjMines() })
         }
      }
   }
   if (minesRemoved) {
      alert("Removed " + minesRemoved + " mines")
      onReveal(-1, -1) // Special case for updating grid
   }
}

function flag(x, y) {
   if (!indexInMatrix(x, y, grid)) return 1
   if (grid[y][x].isRevealed) return 0

   grid[y][x].toggleFlag()

   if (grid[y][x].isFlagged) {
      totalFlags++
      if (grid[y][x].hasMine) flaggedMines++
   } else {
      totalFlags--
      if (grid[y][x].hasMine) flaggedMines--
   }
   return 0
}

function onReveal(x, y) {

   // Add empty tile on first attempt, slice final grid array into matrix, and count adjacent mines
   if (firstClick) {
      firstClick = false
      // Flatten grid coordiantes, insert empty tile
      grid.splice(y * gridX + x, 0, new Tile(0))
      grid = toMatrix(gridX, gridY, grid)
      if (grid === null) return
      countAdjMines()
   }

   // Disallow all negative numbers except for (-1, -1) which is for updating grid
   if (x < 0 || y < 0) {
      if (x != -1 && y != -1) {
         console.log("All numbers must be filled in and be positive")
         return
      }
   } else {
      if (revealTile(x, y)) {
         revAll()
         document.getElementsByClassName("row")[y].children[x].style.borderColor = "red"; // Highlight mine
         setTimeout(() => alert("Gameover"), 1)
      }
   }

   // Update elements on screen
   updateTileElements((tile, element) => {
      if (tile.isRevealed) {
         element.className = "tile revealed"
         element.innerHTML = tile.toString()
         // Only change color if not a flag or mine
         if (element.innerHTML != '^' && element.innerHTML != '*') {
            element.style.color = colors[tile.adjMines]
         }
      }
   })
   
   printGrid()
}

function onFlag(x, y) {

   if (flag(x, y)) {
      console.log(x + " and" + y + " is not inside the grid")
      return
   }
   // Output
   if (totalMines == flaggedMines && totalFlags == flaggedMines) {
      revAll()
      onReveal(0, 0) // Reveal tile that exists, updates entire grid
      setTimeout(() => alert("You win!"), 1)
   } else {
      let row = document.getElementsByClassName('row')[y]
      row.children[x].innerHTML = grid[y][x].toString()
   }
   printGrid()
}

function adjacent(x, y, mat, callback) {
   // Checking adjacent indexes, ignoring the center
	for (let i = -1; i < 2; i++) {
		for (let j = -1; j < 2; j++) {
			if (!i && !j) continue
			if (!indexInMatrix(x + i, y + j, mat)) continue
			callback(x + i, y + j, mat)
		}
	}
}

function updateTileElements(callback) {
   // Update elements on screen
   for (let i = 0; i < grid.length; i++) {
      // The class 'row' is used outside the grid. Those in the grid are first on the page.
      let row = document.getElementsByClassName("row")[i]
      for (let j = 0; j < grid[0].length; j++) {
         callback(grid[i][j], row.children[j])
      }
   }
}

function revAll() {
   for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[0].length; j++) {
         grid[i][j].reveal()
      }
   }
}
