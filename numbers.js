const GAME_WAIT_TIME = 5; //5sec

const GAME_OBJECTS_TYPES = {
    PLAYER: 'player',
    COMPUTER: 'computer',
    OBSTACLE: 'obstacle',
    REWARD: 'reward'
}

const IMAGES = {
    TRANSPARENT: './transparent.png',

    // Player: https://www.pngegg.com/en/png-zgeha
    PLAYER: './player.png',

    // opponent: https://www.pngegg.com/en/png-dlxmh
    COMPUTER: './computer.png',

    //gems './gems-license.pdf
    GEMS: ['./gem1.png', './gem2.png', './gem3.png', './gem4.png', './gem5.png', './gem6.png']
}

const GEMS = {
    1: { gem: IMAGES.GEMS[0], score: 1 },
    2: { gem: IMAGES.GEMS[1], score: 2 },
    3: { gem: IMAGES.GEMS[2], score: 3 },
    4: { gem: IMAGES.GEMS[3], score: 4 },
    5: { gem: IMAGES.GEMS[4], score: 5 },
    6: { gem: IMAGES.GEMS[5], score: 6 },
}

const GAME_STATUS_TYPES = {
    SETUP: 'setup',
    PLAY: 'play',
    END: 'end'
}

//game variables
let gameStatus = GAME_STATUS_TYPES.SETUP;
let currentPlayer = null;
let currentRound = 0;

//Game setup
const setupGame = () => {
    //setup game screen
    const gameScreen = document.getElementsByClassName('game')[0];
    const gameTextScreen = document.getElementsByClassName('game-text')[0];
    gameTextScreen.classList.remove('hidden');
    gameScreen.classList.remove('hidden');

    //setting up game variables
    //game board: will store info about the objects on board: obstacles and gems
    const gameBoard = [];
    for(var i = 0; i < 10; i++) {
        const gameRow = [];
        for(var j = 0; j < 10; j++)
            gameRow.push(null); //null: there is nothing in that cell
        gameBoard.push(gameRow)
    }

    //player
    const player = {
        location: { x: 0, y: 0 },
        bag: [],
        score: 0,
    }

    //computer
    const computer = {
        location: { x: 9, y: 9 },
        bag: [],
        score: 0,
    }

    // --- Game setyp ---
    // board setup
    const boardDiv = document.getElementsByClassName('board')[0];
    for(var i = 0; i < 10; i++) {
        for(var j = 0; j < 10; j++) {
            const box = document.createElement('img')
            box.classList.add('board-box');
            // mines license: './mines-license.pdf'
            box.src = `./mine${Math.floor(Math.random() * 14) + 1}.png`
            boardDiv.append(box);
        }
    }

    //generating obstacles: once generated, stones wont move
    //generating objstacles locations
    for(var i = 0; i < 10; i++) {
        const generateCoords = () => {
            const x = Math.floor(Math.random() * 8) + 1;
            const y = Math.floor(Math.random() * 8) + 1;
            return { x, y }
        }
    
        const generateObstcle = () => {
            const cords = generateCoords();

            //if there is already a stone, i.e recursive
            if(gameBoard[cords.x][cords.y]) generateObstcle();
            else {
                gameBoard[cords.x][cords.y] = {
                    type: GAME_OBJECTS_TYPES.OBSTACLE,
                    //can keep some data ralated to the object: will be useful for gems to store score
                }
            }
        }
        generateObstcle();
    }

    //genarting obstacles
    const obstacleDiv = document.getElementsByClassName('obstacles')[0];
    const obstacles = [];
    for(var i = 0; i < 10; i++) {
        const obstacleRow = [];
        for(var j = 0; j < 10; j++) {
            const obstacle = document.createElement('img')
            obstacle.classList.add('board-box');
            if(gameBoard[i][j]?.type == GAME_OBJECTS_TYPES.OBSTACLE)
                // rock license: './rock-license.pdf'
                obstacle.src = `./rock.png`;
            else
                obstacle.src = IMAGES.TRANSPARENT;
            obstacleDiv.append(obstacle);
            obstacleRow.push(obstacle);
        }
        obstacles.push(obstacleRow);
    }

    //generate gems
    //locations
    for(var i = 1; i <= 6; i++) {
        for(var j = 1; j <= 3; j++) {
            const generateCoords = () => {
                const x = Math.floor(Math.random() * 10);
                const y = Math.floor(Math.random() * 10);
                return { x, y }
            }
        
            const generateGems = () => {
                const cords = generateCoords();
    
                //if there is already a stone, i.e recursive
                if(gameBoard[cords.x][cords.y]) generateGems();
                else {
                    gameBoard[cords.x][cords.y] = {
                        type: GAME_OBJECTS_TYPES.REWARD,
                        reward: GEMS[i]
                    }
                }
            }
            generateGems();
        }
    } 

    //spawn gems
    const treaserDiv = document.getElementsByClassName('treasures')[0];
    const treasers = [];
    for(var i = 0; i < 10; i ++) {
        const treaserRow = [];
        for(var j = 0; j < 10; j++) {
            const treaser = document.createElement('img');
            treaser.classList.add('tresure-cell');
            if(gameBoard[i][j]?.type == GAME_OBJECTS_TYPES.REWARD) {
                const reward = gameBoard[i][j].reward;
                treaser.src = reward.gem;
            }
            else
                treaser.src = IMAGES.TRANSPARENT;
            treaserDiv.append(treaser);
            treaserRow.push(treaser);
        }
        treasers.push(treaserRow);
    }

    //collectGem
    const collectGem = (gemLocation, newGemLocation) => {
        const reward = gameBoard[gemLocation.x][gemLocation.y].reward;

        if(newGemLocation) {
            treasers[newGemLocation.x][newGemLocation.y].src = reward.gem;
            gameBoard[newGemLocation.x][newGemLocation.y] = {
                type: GAME_OBJECTS_TYPES.REWARD,
                reward
            }
        }
        treasers[gemLocation.x][gemLocation.y].classList.add('collect-treaser'); //1s animation
        gameBoard[gemLocation.x][gemLocation.y] = null;
        setTimeout(() => {
            treasers[gemLocation.x][gemLocation.y].src = IMAGES.TRANSPARENT;
            treasers[gemLocation.x][gemLocation.y].classList.remove('collect-treaser');
        }, 1000)
    }

    //Player
    //generate player loc
    const generatePlayerLoc = () => {
        const generateCoords = () => {
            const x = Math.floor(Math.random() * 5);
            const y = Math.floor(Math.random() * 5);
            return { x, y }
        }

        const cords = generateCoords();
        if(gameBoard[cords.x][cords.y]) generatePlayerLoc(); //occupied
        else {
            player.location = cords;
            gameBoard[cords.x][cords.y] = {
                type: GAME_OBJECTS_TYPES.PLAYER
            }
        }
    }
    generatePlayerLoc();
    //update function to update player location
    const updatePlayerLoc = ({ x, y }) => {
        //clear previous location
        playerCells[player.location.x][player.location.y].src = IMAGES.TRANSPARENT;
        gameBoard[player.location.x][player.location.y] = null

        //update
        player.location = { x, y };
        playerCells[x][y].src = IMAGES.PLAYER;
        gameBoard[x][y] = {
            type: GAME_OBJECTS_TYPES.PLAYER
        }
    }

    //player plane
    const playerPlane = document.getElementsByClassName('player')[0];
    const playerCells = [];
    for(var i = 0; i < 10; i++) {
        const playerRow = [];
        for(var j = 0; j < 10; j++) {
            const cell = document.createElement('img')
            cell.classList.add('cell');

            cell.src = IMAGES.TRANSPARENT;
            playerPlane.append(cell);
            playerRow.push(cell);
        }
        playerCells.push(playerRow);
    }
    playerCells[player.location.x][player.location.y].src = IMAGES.PLAYER;

    //Computer
    //Computer location
    const generateComputerLoc = () => {
        const generateCoords = () => {
            const x = Math.floor(Math.random() * 5) + 5;
            const y = Math.floor(Math.random() * 5) + 5;
            return { x, y }
        }

        const cords = generateCoords();
        if(gameBoard[cords.x][cords.y]) generateComputerLoc(); //occupied
        else {
            computer.location = cords;
            gameBoard[cords.x][cords.y] = {
                type: GAME_OBJECTS_TYPES.COMPUTER
            }
        }
    }
    generateComputerLoc();

    //computer loca
    const updateComputerLoc = ({ x, y }) => {
        //clear previous location
        computerCells[computer.location.x][computer.location.y].src = IMAGES.TRANSPARENT;
        gameBoard[computer.location.x][computer.location.y] = null

        //update
        computer.location = { x, y };
        computerCells[x][y].src = IMAGES.COMPUTER;
        gameBoard[x][y] = {
            type: GAME_OBJECTS_TYPES.COMPUTER
        }
    }

    //Computer plane
    const computerPlane = document.getElementsByClassName('computer')[0];
    const computerCells = [];
    for(var i = 0; i < 10; i++) {
        const computerRow = [];
        for(var j = 0; j < 10; j++) {
            const cell = document.createElement('img')
            cell.classList.add('cell');

            cell.src = IMAGES.TRANSPARENT;
            computerPlane.append(cell);
            computerRow.push(cell);
        }
        computerCells.push(computerRow);
    }
    computerCells[computer.location.x][computer.location.y].src = IMAGES.COMPUTER; 
    //

    return {
        gameBoard, 
        collectGem,
        player,
        updatePlayerLoc,
        computer,
        playerCells,
        computer,
        updateComputerLoc,
        computerCells
    }
}

//function to generate bushes
const setupBushes = (gameBoard) => {
    const bushesDiv = document.getElementsByClassName('bushes')[0];
    const bushes = [];
    const generateBushes = () => {
        for(var i = 0; i < 10; i++) {
            const bushRow = [];
            for(var j = 0; j < 10; j++) {
                const bush = document.createElement('img')
                bush.classList.add('bush');

                //if occupied by player or computer
                if(gameBoard[i][j]?.type === GAME_OBJECTS_TYPES.PLAYER || gameBoard[i][j]?.type === GAME_OBJECTS_TYPES.COMPUTER) 
                    bush.src = IMAGES.TRANSPARENT;
                else
                    //bush license  './grass-license.pdf'
                    bush.src = `./bush.png`;
                
                bushesDiv.append(bush);
                bushRow.push(bush);
            }
            bushes.push(bushRow);
        }
    }
    generateBushes();
    return bushes;
}

//function to remove a bush at a location
const removeBushAtPos = (bushes, {x, y}) => {
    if(x < 0 || x >= 10 || y < 0 || y >= 10) return;
    bushes[x][y].src = IMAGES.TRANSPARENT;
}

//game setup
const manageGame = () => {
    //close setup
    const setupScreen = document.getElementsByClassName('setup')[0];
    setupScreen.classList.add('hidden')

    //start game
    const { gameBoard, collectGem, player, updatePlayerLoc, playerCells, computer, updateComputerLoc, computerCells } = setupGame();
    let bushes = [];

    //game text
    let gameTimer = GAME_WAIT_TIME 
    const gameStartText = document.querySelector('.game-text-main p');
    gameStartText.innerHTML = `${gameTimer}`

    //game timer : start on timeUp
    const timer = setInterval(() => {
        gameTimer--;
        gameStartText.innerHTML = `${gameTimer}`;
        if(gameTimer <= 0) {
            clearInterval(timer);
            document.getElementsByClassName('game-text-main')[0].classList.add('close');

            //start game
            bushes = setupBushes(gameBoard);
            gameStatus = GAME_STATUS_TYPES.PLAY;
        }
    }, 1000);

    //Player and computer moving logics
    const isCellPossibleToVisit = ({x, y}) => {
        //Boundry check
        if(x < 0 || x >= 10 || y < 0 || y >= 10) return false;
    
        //check for rock
        if(gameBoard[x][y]?.type == GAME_OBJECTS_TYPES.OBSTACLE) return false;

        // reward
    
        //Is already occupied
        if((gameBoard[x][y]?.type == GAME_OBJECTS_TYPES.PLAYER) || (gameBoard[x][y]?.type == GAME_OBJECTS_TYPES.COMPUTER)) return false;
    
        //return status
        return true;
    }

    //additional score calculation
    function calculateAddScore(arr) {
        // Destructure the array to get the three numbers
        const [a, b, c] = arr;
      
        // Check if all three numbers are the same
        if (a === b && b === c) {
          return 300;
        }
      
        // Check if two of the three numbers are the same
        if (a === b || b === c || a === c) {
          return 200;
        }
      
        // Sort the array to check if the numbers are in order
        const sortedArr = arr.slice().sort((x, y) => x - y);
        
        // Check if numbers are in order
        if (sortedArr[1] === sortedArr[0] + 1 && sortedArr[2] === sortedArr[1] + 1) {
          return 100;
        }
      
        // If all three numbers are different and not in order
        return 0;
      }

    //player movement
    window.addEventListener('keydown', ({key}) => {
        if(gameStatus != GAME_STATUS_TYPES.PLAY) return;
        if(currentPlayer != GAME_OBJECTS_TYPES.PLAYER) return;

        const input = key.toUpperCase();
        let newCoords = { x: player.location.x, y: player.location.y };
    
        if(input === 'D') newCoords.y++;
        else if(input === 'A') newCoords.y--;
        else if(input === 'W') newCoords.x--;
        else if(input === 'S') newCoords.x++;
        else {
            //show pop
            openPopup('Please press a valid key. (W to move up, S to move down, A to move left, D to move right)');
            return;
        }
        //open the bush irrespective of possibility
        removeBushAtPos(bushes, {x: newCoords.x, y: newCoords.y});
    
        //Do nothing if not possible
        if(!isCellPossibleToVisit(newCoords)) {
            //show popup
            openPopup('This step is blocked');
            return;
        }

        //logic for gem collection
        if(gameBoard[newCoords.x][newCoords.y]?.type === GAME_OBJECTS_TYPES.REWARD) {
            const reward = gameBoard[newCoords.x][newCoords.y].reward;
            const generateNewGemColation = () => {
                const generateCoords = () => {
                    const x = Math.floor(Math.random() * 10);
                    const y = Math.floor(Math.random() * 10);
                    return { x, y }
                }

                const coords = generateCoords();
                if(gameBoard[coords.x][coords.y]) return generateNewGemColation();
                else return coords;
            }

            const newGemLocation = generateNewGemColation();
            collectGem(newCoords, newGemLocation);

            //score manage here
            player?.bag.push(reward);
            if(player.bag.length >= 3) {
                //score logic
                const scores = [player.bag[0].score, player.bag[1].score, player.bag[2].score];
                player.score += calculateAddScore(scores) + scores.reduce((a, b) => a + b, 0);

                //empty bag
                player.bag = [];
            }

            const playerScoreUi = document.querySelector('.player-bag span');
            playerScoreUi.innerHTML = player?.score;

            const bagItem1 = document.querySelector('.player-bag .bag-item-1');
            bagItem1.src = player.bag[0]?.gem || IMAGES.TRANSPARENT;

            const bagItem2 = document.querySelector('.player-bag .bag-item-2');
            bagItem2.src = player.bag[1]?.gem || IMAGES.TRANSPARENT;

            const bagItem3 = document.querySelector('.player-bag .bag-item-3');
            bagItem3.src = player.bag[2]?.gem || IMAGES.TRANSPARENT;
        }

        updatePlayerLoc(newCoords);

        //player step is over: awake computer
        computerMove();
    })

    //computer move
    const calculateComputerMove = () => {
        const cuurentPos = computer.location;
        let queue = [
            { loc: { x: cuurentPos.x + 1, y: cuurentPos.y }, val: 0 }, //top
            { loc: { x: cuurentPos.x - 1, y: cuurentPos.y }, val: 1 }, //down
            { loc: { x: cuurentPos.x, y: cuurentPos.y + 1 }, val: 2 }, //right
            { loc: { x: cuurentPos.x, y: cuurentPos.y - 1 }, val: 3 }, //left
        ];
        const isVisited = [];
        for(var i = 0; i < 10; i++) {
            const row = [];
            for(var j = 0; j < 10; j++) 
                row.push(false);
            isVisited.push(row);
        }
        

        const calculateNextMove = () => {
            const cell = queue.pop();
            const currStep = cell.loc;
            const currVal = cell.val;

            if((currStep.x < 0 || currStep.x >= 10 || currStep.y < 0 || currStep.y >= 10) ||    //out of boundary
            (isVisited[currStep.x][currStep.y]) ||                                              //Already visited
            (gameBoard[currStep.x][currStep.y]?.type === GAME_OBJECTS_TYPES.OBSTACLE) ||        //obstacle
            (gameBoard[currStep.x][currStep.y]?.type === GAME_OBJECTS_TYPES.PLAYER || gameBoard[currStep.x][currStep.y]?.type === GAME_OBJECTS_TYPES.COMPUTER)) { //occupied cell
                return calculateNextMove();
            }
            
            isVisited[currStep.x][currStep.y] = true;
            if(gameBoard[currStep.x][currStep.y]?.type === GAME_OBJECTS_TYPES.REWARD) return currVal;
            else {
               queue = [
                { loc: { x: currStep.x + 1, y: currStep.y }, val: currVal }, //top
                { loc: { x: currStep.x - 1, y: currStep.y }, val: currVal }, //down
                { loc: { x: currStep.x, y: currStep.y + 1 }, val: currVal }, //right
                { loc: { x: currStep.x, y: currStep.y - 1 }, val: currVal }, //left
                ...queue
               ]
            }
            return calculateNextMove();
        }


        const nextStep = calculateNextMove();
        if(nextStep == 0) return { x: cuurentPos.x + 1, y: cuurentPos.y }
        if(nextStep == 1) return { x: cuurentPos.x - 1, y: cuurentPos.y }
        if(nextStep == 2) return { x: cuurentPos.x, y: cuurentPos.y + 1 }
        else return { x: cuurentPos.x, y: cuurentPos.y - 1 }
    }

    const computerMove  = () => {
        currentPlayer = GAME_OBJECTS_TYPES.COMPUTER;

        //computer move logic
        const newComputerCords = calculateComputerMove();
        console.log(newComputerCords, 'comp')
        removeBushAtPos(bushes, newComputerCords);
        if(gameBoard[newComputerCords.x][newComputerCords.y]?.type === GAME_OBJECTS_TYPES.REWARD) {
            const reward = gameBoard[newComputerCords.x][newComputerCords.y].reward;
            collectGem(newComputerCords, null);

            //score manage here
            computer?.bag.push(reward);
            if(computer.bag.length >= 3) {
                //score logic
                const scores = [computer.bag[0].score, computer.bag[1].score, computer.bag[2].score];
                computer.score += calculateAddScore(scores) + scores.reduce((a, b) => a + b, 0);

                //empty bag
                computer.bag = [];
            }

            const computerScoreUi = document.querySelector('.computer-bag span');
            computerScoreUi.innerHTML = computer?.score;

            const bagItem1 = document.querySelector('.computer-bag .bag-item-1');
            bagItem1.src = computer.bag[0]?.gem || IMAGES.TRANSPARENT;

            const bagItem2 = document.querySelector('.computer-bag .bag-item-2');
            bagItem2.src = computer.bag[1]?.gem || IMAGES.TRANSPARENT;

            const bagItem3 = document.querySelector('.computer-bag .bag-item-3');
            bagItem3.src = computer.bag[2]?.gem || IMAGES.TRANSPARENT;
        }
        updateComputerLoc(newComputerCords);

        //computer step is over: report to round manager
        roundManager();
    }

    const roundManager = () => {
        //Check fof gameEnd: no gems on board
        //check for no.of gems on the board... if is 0. end game 
        const noOfGemsOnBoard = () => {
            let gems = 0;
            for(var i = 0; i < 10; i++) {
                for(var j = 0; j < 10; j++) {
                    if(gameBoard[i][j]?.type == GAME_OBJECTS_TYPES.REWARD)
                        gems++;
                }
            }
    
            return gems;
        }
        if(!noOfGemsOnBoard()) {
            let gameMessage = '';
            if(player.score > computer.score) {
                gameMessage = `You won the game by ${player.score - computer.score} points`
            } else if(computer.score > player.score) {
                gameMessage = `You lost. Computer won the game by ${computer.score - player.score} points`
            } else {
                gameMessage = `Draw. That was a tough compitation`
            }

            endGame(gameMessage);
        }

        currentRound++;
        const roundUi = document.querySelector('.round-ui span');
        roundUi.innerHTML = currentRound;
        
        //allows player to move
        currentPlayer = GAME_OBJECTS_TYPES.PLAYER;

        //At end of players turn, we will call computer top make its move.
        //Once computer turn is over. it will call roundManger again to manage game again
    }
    roundManager();
}
// manageGame();

const endGame = (message = 'You have ended the game') => {
    //close game screen
    const gameScreen = document.getElementsByClassName('game')[0];
    const gameTextScreen = document.getElementsByClassName('game-text')[0];
    gameScreen.classList.add('hidden');
    gameTextScreen.classList.add('hidden');

    const endScreen = document.getElementsByClassName('end')[0];
    endScreen.classList.remove('hidden');
    const endUi = document.querySelector('.end p');
    endUi.innerHTML = message;
}

const playAgain = () => {
    window.location.reload();
}

const openPopup = (message) => {
    setTimeout(() => {
        const popOverlay = document.getElementsByClassName('popup-overlay')[0];
        popOverlay.classList.remove('hidden');
        
        const popui = document.querySelector('.popup-overlay p');
        popui.innerHTML = message || 'This is a popup';
    }, 250)
}

const closePopup = () => {
    const popOverlay = document.getElementsByClassName('popup-overlay')[0];
    popOverlay.classList.add('hidden');
}