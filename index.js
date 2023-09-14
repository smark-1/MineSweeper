// get the settings from local storage, if unset provide default values
let settings = JSON.parse(localStorage.getItem("settings"))||{ columns: 10, rows: 10, mines: 10 };
let longerSide;
let fontSize;
let boxSize;
let gridItemList;
// make different difficulty levels with different amounts of mines
let mineCount;
let flagCount;
let gameBoard = document.getElementById("board");
const minesRangeSelector = document.getElementById("mines-selector");
let used;
let turnCount;
let availableForMine;

let leftButtonDown = false;
let rightButtonDown = false;

function createMines(mineCount) {
    for (let i = 0; i < mineCount; i++) {
        let cell = Math.floor(Math.random() * availableForMine.length);
        gridItemList[availableForMine[cell]].classList.add("mine");
        availableForMine = availableForMine.filter((mine)=>{return parseInt(gridItemList[availableForMine[cell]].dataset.cellLocation) !== mine});
    }
}

function gridItemCreate(boxCount) {
    for (let i = 0; i < boxCount; i++) {
        let gridItem = document.createElement("div");
        gridItem.className = "grid-item";
        gridItem.style.fontSize = `${fontSize}px`;
        gameBoard.appendChild(gridItem);
        gridItemList.push(gridItem);
        gridItem.addEventListener("mousedown", click);
        gridItem.dataset.cellLocation = i;
    }
}

function click(e) {
    setTimeout(() => {
        if (leftButtonDown && rightButtonDown) {
            bothClick(e);
        } else if (leftButtonDown) {
            leftClick(e);
        } else if (rightButtonDown) {
            rightClick(e);
        }
    }, 20);
}

function leftClick(e) {
    if (e.target.classList.contains("flag")) {
        return;
    }
    if (gameBoard.classList.contains("you-won")) {
        return;
    }
    if (gameBoard.classList.contains("game-over")) {
        return;
    }
    turnCount++; // adds turnCount
    let cellLocation = parseInt(e.target.dataset.cellLocation);

    // only creates mines after left click has occurred so location is known to avoid mines
    if (turnCount === 1) {
        let notAvailableForMine = [cellLocation , ...getAdjacentCells(cellLocation).map((cell)=>{return parseInt(cell.dataset.cellLocation)})];
        console.log(notAvailableForMine);
        availableForMine = [...Array(gridItemList.length).keys()].filter((num)=>{
            return !notAvailableForMine.includes(num);
        });
        console.log(availableForMine);
        createMines(mineCount);
    }

    let numOfMines = getAdjacentClass(cellLocation, "mine");

    if (e.target.classList.contains("mine")) {
        gameBoard.classList.add("game-over");
    } else {
        if (numOfMines !== 0) {
            e.target.classList.add("clicked");
            e.target.classList.remove("flag");
            e.target.dataset.mineCount = numOfMines;
        } else {
            getBlankCells(cellLocation);
        }
    }
    for (let i = 0; i < gridItemList.length; i++) {
        if (
            gridItemList[i].className === "grid-item" ||
            gridItemList[i].className === "grid-item flag"
        ) {
            return;
        }
    }
    gameBoard.classList.add("you-won");
    document.getElementById("mineCounter").innerText = "Mines: 0";
}

function rightClick(e) {
    if (e.target.classList.contains("clicked")) {
        return;
    }
    if (e.target.classList.contains("empty-cell")) {
        return;
    }
    if (gameBoard.classList.contains("you-won")) {
        return;
    }
    if (gameBoard.classList.contains("game-over")) {
        return;
    }
    e.target.classList.toggle("flag");
    if (e.target.classList.contains("flag")) {
        flagCount++;
    } else {
        flagCount--;
    }
    document.getElementById("mineCounter").innerText = `Mines: ${
        mineCount - flagCount
    }`;
}

function bothClick(e) {
    let cellLocation = parseInt(e.target.dataset.cellLocation);
    let numOfAdjacentFlags = getAdjacentClass(cellLocation, "flag");
    let numOfMines = getAdjacentClass(cellLocation, "mine");

    if (
        e.target.classList.contains("clicked") &&
        numOfAdjacentFlags === numOfMines
    ) {
        turnCount++;
        let adjacentCells = getAdjacentCells(cellLocation);
        console.log(adjacentCells);
        adjacentCells.forEach((cell) => leftClick({ target: cell }));
    }
}

function getBlankCells(cellLocation) {
    if (used.includes(cellLocation)) {
        return;
    }

    used.push(cellLocation);

    let numOfMines = getAdjacentClass(cellLocation, "mine");

    gridItemList[cellLocation].classList.remove("flag");
    if (numOfMines !== 0) {
        gridItemList[cellLocation].dataset.mineCount = numOfMines;
        gridItemList[cellLocation].classList.add("clicked");
        return;
    }

    gridItemList[cellLocation].classList.add("empty-cell");

    let adjacentCells = getAdjacentCells(cellLocation);

    adjacentCells.forEach((cell) => {
        getBlankCells(parseInt(cell.dataset.cellLocation));
    });
}

function getAdjacentCells(cellLocation) {
    let checkLocations = [];
    const columnIndex = cellLocation % settings.columns;

    if (columnIndex !== 0) {
        // left
        checkLocations.push(gridItemList[cellLocation - 1]);
    }
    if (columnIndex !== settings.columns - 1) {
        // right
        checkLocations.push(gridItemList[cellLocation + 1]);
    }
    if (cellLocation - settings.columns >= 0) {
        // up
        checkLocations.push(gridItemList[cellLocation - settings.columns]);
    }
    if (cellLocation + settings.columns < gridItemList.length) {
        // down
        checkLocations.push(gridItemList[cellLocation + settings.columns]);
    }
    if (columnIndex !== 0 && cellLocation - settings.columns - 1 >= 0) {
        // up left
        checkLocations.push(gridItemList[cellLocation - settings.columns - 1]);
    }
    if (
        columnIndex !== settings.columns - 1 &&
        cellLocation + settings.columns + 1 < gridItemList.length
    ) {
        // down right
        checkLocations.push(gridItemList[cellLocation + settings.columns + 1]);
    }
    if (
        columnIndex !== settings.columns - 1 &&
        cellLocation - settings.columns >= 0
    ) {
        // up right
        checkLocations.push(gridItemList[cellLocation - settings.columns + 1]);
    }
    if (
        columnIndex !== 0 &&
        cellLocation + settings.columns < gridItemList.length
    ) {
        // down left
        checkLocations.push(gridItemList[cellLocation + settings.columns - 1]);
    }

    return checkLocations;
}

function getAdjacentClass(cellLocation, className) {
    let adjacentCells = getAdjacentCells(cellLocation);

    let numOfAdjacentCells = 0;
    adjacentCells.forEach((cell) => {
        if (cell.classList.contains(className)) {
        numOfAdjacentCells++;
        }
    });

    return numOfAdjacentCells;
}

function reset() {
      // sets all values to default settings
      turnCount = 0;

    if (settings.columns >= settings.rows) {
        longerSide = settings.columns;
    } else if (settings.rows > settings.columns) {
        longerSide = settings.rows;
    }

    switch (longerSide) {
    case 10:
      fontSize = 47;
      break;
    case 11:
      fontSize = 41;
      break;
    case 12:
      fontSize = 36;
      break;
    case 13:
      fontSize = 32;
      break;
    case 14:
      fontSize = 30;
      break;
    case 15:
      fontSize = 28;
      break;
    case 16:
      fontSize = 26;
      break;
    case 17:
      fontSize = 24;
      break;
    case 18:
      fontSize = 22;
      break;
    case 19:
      fontSize = 20;
      break;
    case 20:
      fontSize = 19;
      break;
    case 21:
      fontSize = 18;
      break;
    case 22:
      fontSize = 17;
      break;
    case 23:
      fontSize = 16;
      break;
    case 24:
      fontSize = 15;
      break;
    case 25:
      fontSize = 14;
      break;
    case 26:
      fontSize = 13;
      break;
    case 27:
      fontSize = 12;
      break;
    case 28:
      fontSize = 12;
      break;
    case 29:
      fontSize = 12;
      break;
    case 30:
      fontSize = 11;
      break;
  }


    gridItemList = [];
    availableForMine = [];

    // make different difficulty levels with different amounts of mines
    mineCount = Math.floor(settings.mines);
    // mineCount = Math.floor(3);
    flagCount = 0;

    used = [];

    boxSize = 700 / longerSide;
    gameBoard.innerHTML = "";
    gameBoard.className = "grid-container";
    gameBoard.style.gridTemplateColumns = `repeat(${settings.columns}, ${boxSize}px)`;
    gameBoard.style.gridTemplateRows = `repeat(${settings.rows}, ${boxSize}px)`;
    document.getElementById("rows-selector-value").innerText = settings.rows;
    document.getElementById("mines-selector-value").innerText = settings.mines;
    document.getElementById("cols-selector-value").innerText = settings.columns;
    document.getElementById("cols-selector").value=settings.columns;
    document.getElementById("rows-selector").value=settings.rows;

    minesRangeSelector.max = Math.floor(
        settings.columns * settings.rows * .9
    );
    minesRangeSelector.min = Math.floor(longerSide / 2);
    minesRangeSelector.value = settings.mines;

    gridItemCreate(settings.columns * settings.rows);
    document.getElementById("mineCounter").innerText = `Mines: ${mineCount}`;
}

function updateCols(e) {
    settings.columns = parseInt(e.target.value);
    if (
        settings.mines >
        Math.floor(settings.columns * settings.rows * .9)
    ) {
        settings.mines = Math.floor(
            settings.columns * settings.rows * .9
        );
    }
    reset();
}

function updateRows(e) {
    settings.rows = parseInt(e.target.value);
    if (
        settings.mines >
        Math.floor(settings.columns * settings.rows * .9)
    ) {
        settings.mines = Math.floor(
            settings.columns * settings.rows * .9
        );
    }
    reset();
}

function updateMines(e) {
    settings.mines = parseInt(e.target.value);
    reset();
}


// event listeners
document.addEventListener("mousedown", (e) => {
  // left click
  if (e.button === 0) {
    leftButtonDown = true;
  }
  // right button
  if (e.button === 2) {
    rightButtonDown = true;
  }
});

document.addEventListener("mouseup", (e) => {
  // left click
  if (e.button === 0) {
    leftButtonDown = false;
  }
  // right button
  if (e.button === 2) {
    rightButtonDown = false;
  }
});

document
    .getElementById("play-area")
    .addEventListener("contextmenu", (e) => e.preventDefault());
document.getElementById("restartButton").addEventListener("click", reset);
document.getElementById("cols-selector").addEventListener("input", updateCols);
document.getElementById("rows-selector").addEventListener("input", updateRows);
document
    .getElementById("mines-selector")
    .addEventListener("input", updateMines);

// save all settings before closing window
window.onbeforeunload = function(){
   localStorage.setItem("settings",JSON.stringify(settings))
}

// game setup
reset();
