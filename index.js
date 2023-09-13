let settings={columns:10,rows:10}
let columns;
let rows;
let longerSide;
let fontSize;
let boxSize;
let gridItemList;
// make different difficulty levels with different amounts of mines
let mineCount;
let flagCount;
let gameBoard = document.getElementById("board");
let used;

let leftButtonDown = false;
let rightButtonDown = false;

function createMines(mineCount)
{
    for(let i = 0; i < mineCount; i++)
    {
        let box = (Math.floor(Math.random() * gridItemList.length));
        if(!gridItemList[box].classList.contains("mine"))
        {
            gridItemList[box].classList.add("mine");
        }
        else
        {
            i--;
        }
    }
}

function gridItemCreate(boxCount)
{
    for (let i = 0; i < boxCount; i++)
    {
        let gridItem = document.createElement("div");
        gridItem.className = "grid-item";
        gridItem.style.fontSize = `${fontSize}px`;
        gameBoard.appendChild(gridItem);
        gridItemList.push(gridItem);
        gridItem.addEventListener("mousedown", click);
        gridItem.dataset.cellLocation = i;
    }
}

function click(e)
{   
    setTimeout(()=>{
        if (leftButtonDown && rightButtonDown)
        {
            bothClick(e);
        }    
        else if (leftButtonDown)
        {
            leftClick(e);
        }
        else if (rightButtonDown)
        {
            rightClick(e);
        }
    },20);
}

function leftClick(e)
{
    if (e.target.classList.contains("flag")) { return; }
    if (gameBoard.classList.contains("you-won")) { return; }
    if (gameBoard.classList.contains("game-over")) { return; }
    let cellLocation = parseInt(e.target.dataset.cellLocation);

    let numOfMines = getAdjacentClass(cellLocation, "mine");

    if(e.target.classList.contains("mine"))
    {
        gameBoard.classList.add("game-over");
    }
    else
    {
        if(numOfMines !== 0)
        {
            e.target.classList.add("clicked");
            e.target.classList.remove("flag");
            e.target.dataset.mineCount = numOfMines;
        }
        else
        {
            getBlankCells(cellLocation);
        }
    }
    for (let i = 0; i < gridItemList.length; i++)
    {
        if (gridItemList[i].className === "grid-item" || gridItemList[i].className === "grid-item flag") { return; }
    }
    gameBoard.classList.add("you-won");
    document.getElementById("mineCounter").innerText = "Mines: 0";
}

function rightClick(e)
{
    if (e.target.classList.contains("clicked")) { return; }
    if (e.target.classList.contains("empty-cell")) { return; }
    if (gameBoard.classList.contains("you-won")) { return; }
    if (gameBoard.classList.contains("game-over")) { return; }
    e.target.classList.toggle("flag");
    if (e.target.classList.contains("flag"))
    {
        flagCount++;
    }
    else 
    {
        flagCount--;
    }
    document.getElementById("mineCounter").innerText = `Mines: ${mineCount - flagCount}`;
}

function bothClick(e)
{
    let cellLocation = parseInt(e.target.dataset.cellLocation);
    let numOfAdjacentFlags = getAdjacentClass(cellLocation, "flag");
    let numOfMines = getAdjacentClass(cellLocation, "mine");

    if (e.target.classList.contains("clicked") && numOfAdjacentFlags === numOfMines)
    {
        let adjacentCells = getAdjacentCells(cellLocation);
        console.log(adjacentCells);
        adjacentCells.forEach(cell => leftClick({target:cell}));
    }
}

function getBlankCells(cellLocation)
{
    if (used.includes(cellLocation)){ return; }

    used.push(cellLocation);

    let numOfMines = getAdjacentClass(cellLocation, "mine");
    
    if (numOfMines !== 0)
    {
        gridItemList[cellLocation].dataset.mineCount = numOfMines;
        gridItemList[cellLocation].classList.add("clicked");
        gridItemList[cellLocation].classList.remove("flag");
        return;
    }

    gridItemList[cellLocation].classList.add("empty-cell");

    let adjacentCells = getAdjacentCells(cellLocation);

    adjacentCells.forEach(cell => {getBlankCells(parseInt(cell.dataset.cellLocation))});
}

function getAdjacentCells(cellLocation)
{
    let checkLocations = [];
    const columnIndex = cellLocation % columns;
    
    if (columnIndex !== 0) // left
    {
        checkLocations.push(gridItemList[cellLocation - 1]);
    }
    if (columnIndex !== columns - 1) // right
    {
        checkLocations.push(gridItemList[cellLocation + 1]);
    }
    if ((cellLocation - columns) >= 0) // up
    {
        checkLocations.push(gridItemList[cellLocation - columns]);
    }
    if ((cellLocation + columns) < gridItemList.length) // down
    {
        checkLocations.push(gridItemList[cellLocation + columns]);
    }
    if (columnIndex !== 0 && (cellLocation - columns - 1) >= 0) // up left
    {
        checkLocations.push(gridItemList[cellLocation - columns - 1]);
    }
    if (columnIndex !== (columns - 1) && (cellLocation + columns + 1) < gridItemList.length) // down right
    {
        checkLocations.push(gridItemList[cellLocation + columns + 1]);
    }
    if (columnIndex !== (columns - 1) && (cellLocation - columns) >= 0) // up right
    {
        checkLocations.push(gridItemList[cellLocation - columns + 1]);
    }
    if (columnIndex !== 0 && (cellLocation + columns) < gridItemList.length) // down left
    {
        checkLocations.push(gridItemList[cellLocation + columns - 1]);
    }

    return checkLocations;
}

function getAdjacentClass(cellLocation, className)
{
    let adjacentCells = getAdjacentCells(cellLocation);

    let numOfAdjacentCells = 0;
    adjacentCells.forEach(cell => 
        {
            if(cell.classList.contains(className))
            {
                numOfAdjacentCells++;
            }
        });

    return numOfAdjacentCells;
}

function reset(){
    // sets all values to default settings
    columns = settings.columns;
    rows = settings.rows;

    if (columns >= rows)
    {
        longerSide = columns;
    }
    else if (rows > columns)
    {
        longerSide = rows;
    }

    if (longerSide < 10){fontSize = 34;}
    else if (longerSide <= 10){fontSize = 30;}
    else if (longerSide > 10 && longerSide <= 14){fontSize = 20;}
    else if (longerSide > 14 && longerSide <= 18){fontSize = 14;}
    else if (longerSide > 18 && longerSide <= 22){fontSize = 10;}
    else if (longerSide > 22 && longerSide <= 30){fontSize = 6;}
    else if (longerSide > 30){fontSize = 2;}
    /*
    C x R ttl fs
    30x30     06
    29x29     06
    28x28     07
    27x27     07
    26x26     08
    25x25     08
    24x24     09
    23x23     09
    22x22     10
    21x21     11
    20x20     12
    19x19     13
    18x18     14
    17x17     15
    16x16     16
    15x15     18
    14x14     20
    13x13     22
    12x12     24
    11x11     27
    10x10     30
    09x09     34
    */

    gridItemList = [];

    // make different difficulty levels with different amounts of mines
    mineCount = Math.floor(longerSide * 2);
    // mineCount = Math.floor(3);
    flagCount = 0;


    used = [];

    boxSize = 500 / longerSide;
    gameBoard.innerHTML = "";
    gameBoard.className = "grid-container"
    gameBoard.style.gridTemplateColumns=`repeat(${columns}, ${boxSize}px)`;
    gameBoard.style.gridTemplateRows=`repeat(${rows}, ${boxSize}px)`;
    gridItemCreate(columns * rows);
    createMines(mineCount);
    document.getElementById("mineCounter").innerText = `Mines: ${mineCount}`;
}
function updateCols(e){
    settings.columns=parseInt(e.target.value);
    document.getElementById('cols-selector-value').innerText=e.target.value;
    reset();
}

function updateRows(e){
    settings.rows=parseInt(e.target.value);
    document.getElementById('rows-selector-value').innerText=e.target.value;
    reset();
}

document.addEventListener("mousedown", (e) => {
    // left click
    if (e.button === 0) 
    {
        leftButtonDown = true;
    }
    // right button
    if (e.button === 2) 
    {
        rightButtonDown = true;
    }
});

document.addEventListener("mouseup", (e) => {
    // left click
    if (e.button === 0) 
    {
        leftButtonDown = false;
    }
    // right button
    if (e.button === 2) 
    {
        rightButtonDown = false;
    }
});

document.getElementById("play-area").addEventListener("contextmenu",(e)=>e.preventDefault());
document.getElementById("restartButton").addEventListener("click",reset)
document.getElementById("cols-selector").addEventListener("input",updateCols)
document.getElementById("rows-selector").addEventListener("input",updateRows)

// game setup
reset();