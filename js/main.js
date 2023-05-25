

let ROWS = 10;
let COLS = 10;
let MINES = 10;

let minesIndex = [];
let cells = [];
let visitedCells = new Set();

let isClicked = false;
let clicksCounter = 0;
let minesCountRender = MINES;
let isSound = false;
let isTheme = true;

let rgb = `rgb(255,255,255)`;

let red = "red";
let dark = "#1a79d1";
let darkStyle = red;
isTheme = true;
darkStyle = dark;
document.querySelector('html').classList.add("dark");


YaGames.init().then(ysdk => {
        console.log('Yandex SDK initialized');
        window.ysdk = ysdk;
    });

function renderCells() {
    for (let i = 0; i < ROWS; i++) {
        const row = document.createElement("div");
        row.classList.add("row");
        for (let j = 0; j < COLS; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            row.appendChild(cell);
            cells.push(cell);
            const desk = document.querySelector(".minesweeper__desk");
            cell.addEventListener("click", cellHandler);
            cell.addEventListener("contextmenu", contexHandler);
            desk.appendChild(row);

        }
    }
}

function soundStart() {
    if (isSound) {
        const audio = new Audio();
        audio.src = "sound/start.mp3";
        audio.autoplay = true;
    }
}

function soundTick() {
    if (isSound) {
        const audio = new Audio();
        audio.src = "sound/tick.mp3";
        audio.autoplay = true;
    }
}

function soundLose() {
    if (isSound) {
        const audio = new Audio();
        audio.src = "sound/lose.mp3";
        audio.autoplay = true;
    }
}

function soundWin() {
    if (isSound) {
        const audio = new Audio();
        audio.src = "sound/win.mp3";
        audio.autoplay = true;
    }
}

function renderClicksCount() {
    const clicks = document.querySelector(".clicks__count");
    clicks.textContent = `Количество твоих ходов: ${clicksCounter}`;
}

function renderMineCounts() {
    const mineImg = document.createElement("img");
    mineImg.classList.add("mines__count-img");
    mineImg.setAttribute("alt", "mine image");
    mineImg.setAttribute("src", "images/mine.png");

    const mines = document.querySelector(".mines__count");

    mines.textContent = `${minesCountRender}`;
    mines.appendChild(mineImg);
}

function cellHandler(event) {
    const index = cells.indexOf(event.target);

    //количество кликов
    if (!visitedCells.has(index)) {
        clicksCounter++;
        renderClicksCount();
    }

    cellHandlerIndex(index);
    checkWins();
}

let minutes = 0;
let seconds = 0;

function getTimer() {
    const time = document.querySelector(".time");
    seconds++;

    if (seconds < 10) {
        seconds = "0" + seconds;
    }

    if (seconds > 59) {
        seconds = 0;
        minutes++;
    }

    time.textContent = `Время игры: ${minutes.toString().padStart(2, "0")}:${seconds}`;
    soundTick();
}

let timeInterval = setInterval(() => {
    if (isClicked) {
        getTimer();
    }
}, 1000);

function cellHandlerIndex(index) {

    if (!isClicked) {
        addMines(index);
        isClicked = true;
    }

    let minesCounter = minesCount(minesIndex, index);

    if (minesIndex.includes(index)) {
        renderMines();
        clearInterval(timeInterval);

        const allCells = document.querySelectorAll(".cell");

        for (let i = 0; i < allCells.length; i++) {
            allCells[i].removeEventListener("click", cellHandler);
            allCells[i].removeEventListener("contextmenu", contexHandler);
        }

        soundLose();

        return;
    }

    if (minesCounter === 0) {
        zeroMines(index);

        let queue = [];

        for (let i = -1; i < 2; i++) {

            if (index - COLS + i >= 0 && Math.floor((index - COLS + i) / COLS) === Math.floor((index - COLS) / COLS)) {
                queue.push(index - COLS + i);
            }

            if (i !== 0 && Math.floor((index + i) / COLS) === Math.floor((index) / COLS)) {
                queue.push(index + i);
            }

            if (index + COLS + i < cells.length && Math.floor((index + COLS + i) / COLS) === Math.floor((index + COLS) / COLS)) {
                queue.push(index + COLS + i);
            }

        }

        queue.forEach((item) => {
            if (!visitedCells.has(item)) {
                visitedCells.add(item);
                cellHandlerIndex(item);
            }

        });

    } else {
        visitedCells.add(index);
        cells[index].style.background = "darkgray";
        cells[index].textContent = `${minesCounter}`;
        if (minesCounter === 1) {
            rgb = `rgb(0,0,255)`;
            cells[index].style.color = rgb;
        }

        if (minesCounter === 2) {
            rgb = `rgb(0,128,0)`;
            cells[index].style.color = rgb;
        }

        if (minesCounter > 2) {
            rgb = `rgb(255,0,0)`;
            cells[index].style.color = rgb;
        }
    }

}

function renderMines() {
    for (let i = 0; i < minesIndex.length; i++) {
        const mineImg = document.createElement("img");
        mineImg.classList.add("mines__desk");
        mineImg.setAttribute("alt", "mine image");
        mineImg.setAttribute("src", "images/mine.png");

        const mineIndex = minesIndex[i];
        cells[mineIndex].textContent = "";
        cells[mineIndex].appendChild(mineImg);
    }
}

function renderFlags() {
    for (let i = 0; i < minesIndex.length; i++) {
        const mineIndex = minesIndex[i];
        cells[mineIndex].textContent = "🚩";
    }
}

function zeroMines(index) {
    cells[index].style.backgroundColor = "darkgray";
}

function minesCount(minesIndex, index) {

    let minesCounter = 0;

    if (minesIndex.includes(index - COLS)) { minesCounter++; };
    if (minesIndex.includes(index + COLS)) { minesCounter++; };

    if (index % COLS !== 0 && minesIndex.includes(index - COLS - 1)) { minesCounter++; };
    if ((index + 1) % COLS !== 0 && minesIndex.includes(index - COLS + 1)) { minesCounter++; };

    if ((index % COLS !== 0 && minesIndex.includes(index - 1))) { minesCounter++; };
    if ((index + 1) % COLS !== 0 && minesIndex.includes(index + 1)) { minesCounter++; };

    if ((index + 1) % COLS !== 0 && minesIndex.includes(index + COLS + 1)) { minesCounter++; };
    if (index % COLS !== 0 && minesIndex.includes(index + COLS - 1)) { minesCounter++; };

    return minesCounter;

}

function contexHandler(event) {
    const index = cells.indexOf(event.target);
    event.preventDefault();

    if (event.target.textContent !== "" && visitedCells.has(index)) {
        return;
    }

    if (event.target.textContent === "" && !visitedCells.has(index)) {
        if (minesCountRender !== 0) {
            event.target.textContent = "🚩";
            event.target.removeEventListener("click", cellHandler);
            minesCountRender--;
            renderMineCounts();
        }
    } else {
        event.target.textContent = "";
        event.target.addEventListener("click", cellHandler);
        if (!visitedCells.has(index) && minesCountRender < MINES) {
            minesCountRender++;
            renderMineCounts();
        }

    }
}

function checkWins() {
    if (visitedCells.size + MINES === cells.length) {
        const allCells = document.querySelectorAll(".cell");

        for (let i = 0; i < allCells.length; i++) {
            allCells[i].removeEventListener("click", cellHandler);
            allCells[i].removeEventListener("contextmenu", contexHandler);
        }

        clearInterval(timeInterval);
        renderFlags();

        soundWin();
    }
}

function addMines(cellIndex) {
    while (minesIndex.length < MINES) {
        const index = Math.floor(Math.random() * cells.length);
        if (!minesIndex.includes(index) && index !== cellIndex) {
            minesIndex.push(index);
        }
    }
}

function createMenu() {
    return `
    <div class="menu">
        <ul class="menu__list">
            <li class="menu__list-item">
                Размеры поля
                <ul class="menu__sublist">
                    <li class="menu__sublist-item menu__sublist-item--active" data-size="10">Легкий (10х10)</li>
                    <li class="menu__sublist-item" data-size="15">Средний (15х15)</li>
                    <li class="menu__sublist-item" data-size="25">Сложный (25х25)</li>
                </ul>
            </li>

            <li class="menu__list-item">
            Звук
            <ul class="menu__sublist">
                <li class="menu__sublist-item" data-sound="1">Вкл</li>
                <li class="menu__sublist-item menu__sublist-item--active" data-sound="0">Выкл</li>
            </ul>
            </li>
            <!--
            <li class="menu__list-item">
            Тема игрового поля
            <ul class="menu__sublist">
                <li class="menu__sublist-item menu__sublist-item--active" data-theme="1">Светлая</li>
                <li class="menu__sublist-item" data-theme="2">Тёмная</li>
            </ul>
            </li>-->
        </ul>
    </div>
    `;
}

function basicMarkup() {
    const body = document.body;

    const section = document.createElement("section");
    section.classList.add("minesweeper");
    const container = document.createElement("div");
    container.classList.add("container");
    const minesweeperInner = document.createElement("div");
    minesweeperInner.classList.add("minesweeper__inner");
    const minesweeperTitle = document.createElement("h1");
    minesweeperTitle.classList.add("minesweeper__title");
    minesweeperTitle.textContent = "Сапер";
    const minesweeperSubtitle = document.createElement("h3");
    minesweeperSubtitle.classList.add("minesweeper__subtitle");
    minesweeperSubtitle.innerHTML = `Нажмите на смайлик чтобы перезапустить игру.<br>
        Клик правой кнопкой мыши - пометить точку флажком.<br>
        Меню открывается кнопкой в левом верхнем углу.
    `;
    const minesweeperBox = document.createElement("div");
    minesweeperBox.classList.add("minesweeper__box");
    const minesweeperStat = document.createElement("div");
    minesweeperStat.classList.add("minesweeper__stat");
    const menuBtn = document.createElement("button");
    menuBtn.classList.add("menu__btn");
    const menuBtnLine = document.createElement("span");
    menuBtnLine.classList.add("menu__btn-line");
    const mineCount = document.createElement("span");
    mineCount.classList.add("mines__count");
    const mineImg = document.createElement("img");
    mineImg.classList.add("mines__count-img");
    mineImg.setAttribute("alt", "mine image");
    mineImg.setAttribute("src", "images/mine.png");
    const startBtn = document.createElement("button");
    startBtn.classList.add("start__btn");
    const startIcon = document.createElement("img");
    startIcon.classList.add("start__btn-img");
    startIcon.setAttribute("alt", "start game image");
    startIcon.setAttribute("src", "images/face_unpressed.svg");
    const time = document.createElement("span");
    time.classList.add("time");
    const clicksCount = document.createElement("span");
    clicksCount.classList.add("clicks__count");
    const desk = document.createElement("div");
    desk.classList.add("minesweeper__desk");

    clicksCount.textContent = `Количество ходов: ${clicksCounter}`;
    time.textContent = `Время игры: 00:00`;

    mineCount.textContent = `${minesCountRender}`;

    clicksCount.style.color = darkStyle;
    time.style.color = darkStyle;
    mineCount.style.color = darkStyle;

    menuBtn.appendChild(menuBtnLine);

    startBtn.appendChild(startIcon);
    mineCount.appendChild(mineImg);
    minesweeperStat.innerHTML = createMenu();
    minesweeperStat.appendChild(menuBtn);
    minesweeperStat.appendChild(mineCount);
    minesweeperStat.appendChild(startBtn);
    minesweeperStat.appendChild(time);
    minesweeperStat.appendChild(clicksCount);

    section.appendChild(container);
    container.appendChild(minesweeperInner);
    minesweeperInner.appendChild(minesweeperTitle);
    minesweeperInner.appendChild(minesweeperSubtitle);
    minesweeperBox.appendChild(minesweeperStat);
    minesweeperBox.appendChild(desk);
    minesweeperInner.appendChild(minesweeperBox);

    startBtn.addEventListener("click", startNewGame);

    menuBtn.addEventListener("click", () => {
        const menu = document.querySelector(".menu");
        menu.classList.toggle("menu--active");
    });

    body.appendChild(section);
}

function startNewGame() {
    document.body.innerHTML = "";

    myCheckInterval = setInterval(() => {
        if (document.querySelectorAll(".menu__sublist-item")) {
            subMenuClick();
            clearInterval(myCheckInterval);
        }
    }, 500);

    ROWS = ROWS;
    COLS = COLS;
    MINES = MINES;
    isSound = isSound;
    isTheme = isTheme;
    darkStyle = darkStyle;

    minesCountRender = MINES
    clicksCounter = 0;
    minesIndex = [];
    cells = [];
    isClicked = false;
    visitedCells = new Set();

    seconds = 0;
    minutes = 0;

    clearInterval(timeInterval);

    timeInterval = setInterval(() => {
        if (isClicked) {
            getTimer();
        }
    }, 1000);

    initGame();

    changeActiveSize();
    changeActiveSound();
    changeActiveTheme();
}

function initGame() {
    soundStart();
    basicMarkup();
    renderCells();
}

initGame();

function subMenuClick() {
    const menuSetting = document.querySelectorAll(".menu__sublist-item");

    menuSetting.forEach((item) => {
        item.addEventListener("click", subMenuHandler);
    });
}

let myCheckInterval = setInterval(() => {
    if (document.querySelectorAll(".menu__sublist-item")) {
        subMenuClick();
        clearInterval(myCheckInterval);
    }
}, 500);

function changeActiveSize() {
    const allSizes = document.querySelectorAll('[data-size]');

    for (let i = 0; i < allSizes.length; i++) {
        allSizes[i].classList.remove("menu__sublist-item--active");

        if (MINES === 10) {
            allSizes[0].classList.add("menu__sublist-item--active");
        }
        if (MINES === 40) {
            allSizes[1].classList.add("menu__sublist-item--active");
        }

        if (MINES === 99) {
            allSizes[2].classList.add("menu__sublist-item--active");
        }
    }
}

function changeActiveSound() {
    const allSound = document.querySelectorAll('[data-sound]');

    for (let i = 0; i < allSound.length; i++) {
        allSound[i].classList.remove("menu__sublist-item--active");

        if (isSound) {
            allSound[0].classList.add("menu__sublist-item--active");
        }

        if (!isSound) {
            allSound[1].classList.add("menu__sublist-item--active");
        }
    }
}

function changeActiveTheme() {
    const allTheme = document.querySelectorAll('[data-theme]');

    for (let i = 0; i < allTheme.length; i++) {
        allTheme[i].classList.remove("menu__sublist-item--active");

        if (!isTheme) {
            allTheme[0].classList.add("menu__sublist-item--active");
        }

        if (isTheme) {
            allTheme[1].classList.add("menu__sublist-item--active");
        }
    }
}

function subMenuHandler(event) {
    const size = event.target.dataset.size;
    const volume = event.target.dataset.sound;
    const theme = event.target.dataset.theme;
    const html = document.querySelector('html');

    if (size === "10") {
        ROWS = 10;
        COLS = 10;
        MINES = 10;
        startNewGame();
    }

    if (size === "15") {
        ROWS = 15;
        COLS = 15;
        MINES = 40;
        startNewGame();
    }

    if (size === "25") {
        ROWS = 25;
        COLS = 25;
        MINES = 99;
        startNewGame();
    }

    if (volume === "1") {
        isSound = true;
        startNewGame();
    }

    if (volume === "0") {
        isSound = false;
        startNewGame();
    }

    // if (theme === "1") {
    //     isTheme = false;
    //     darkStyle = red;
    //     html.classList.remove("dark");
    //     startNewGame();
    // }
    // theme = "2"
    //if (theme === "2") {
        // isTheme = true;
        // darkStyle = dark;
        // html.classList.add("dark");
        // startNewGame();
    // }

}