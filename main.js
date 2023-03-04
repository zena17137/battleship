const optionContainer = document.querySelector('.option-container');
const gamesBoardContainer = document.getElementById('gamesboard-container');

const infoDisplay = document.getElementById('info');
const turnDisplay = document.getElementById('turn-display');

const flipButton = document.getElementById('flipButton');
const startButton = document.getElementById('startButton');

let angle = 0;

//-------------------------------------------------------------------------------------------------------------

function flip() {
	const opstionShips = Array.from(optionContainer.children);

	if (angle === 0) {
		angle = 90;
	} else {
		angle = 0;
	}

	opstionShips.forEach((optionShip) => (optionShip.style.transform = `rotate(${angle}deg)`));
}

//-------------------------------------------------------------------------------------------------------------

const width = 10;

function createBoard(color, user) {
	const gameBoardContainer = document.createElement('div');
	gameBoardContainer.classList.add('game-board');
	gameBoardContainer.style.background = color;
	gameBoardContainer.id = user;

	for (let i = 0; i < width * width; i++) {
		const block = document.createElement('div');
		block.classList.add('block');
		block.id = i;
		gameBoardContainer.append(block);
	}

	gamesBoardContainer.append(gameBoardContainer);
}

createBoard('pink', 'player');
createBoard('yellow', 'computer');

//-------------------------------------------------------------------------------------------------------------

class Ship {
	constructor(name, length) {
		this.name = name;
		this.length = length;
	}
}

const destroyer = new Ship('destroyer', 2);
const submarine = new Ship('submarine', 3);
const cruiser = new Ship('cruiser', 3);
const battleship = new Ship('battleship', 4);
const carrier = new Ship('carrier', 5);

//-------------------------------------------------------------------------------------------------------------

function getValidity(allBoardBlocks, isHorizontal, startIndex, ship) {
	let validStart = isHorizontal
		? startIndex <= width * width - ship.length
			? startIndex
			: width * width - ship.length
		: startIndex <= width * width - width * ship.length
		? startIndex
		: startIndex - ship.length * width + width;

	let shipBlocks = [];

	for (let i = 0; i < ship.length; i++) {
		if (isHorizontal) {
			shipBlocks.push(allBoardBlocks[parseInt(validStart) + i]);
		} else {
			shipBlocks.push(allBoardBlocks[parseInt(validStart) + i * width]);
		}
	}

	let valid;

	if (isHorizontal) {
		valid = shipBlocks.every((_shipBlocks, index) => {
			return shipBlocks[0].id % width !== width - shipBlocks.length - (index + 1);
		});
	} else {
		valid = shipBlocks.every((_shipBlocks, index) => shipBlocks[0].id < 90 + (width * index + 1));
	}

	const notTaken = shipBlocks.every((shipBlock) => !shipBlock.classList.contains('taken'));

	return { shipBlocks, valid, notTaken };
}

//-------------------------------------------------------------------------------------------------------------

let ship123;

const ships = [destroyer, submarine, cruiser, battleship, carrier];
let notDropped = null;

function addShipPieces(user, ship, startID) {
	const allBoardBlocks = document.querySelectorAll(`#${user} div`);
	let randomBoolean = Math.random() < 0.5;
	let isHorizontal = user === 'player' ? angle === 0 : randomBoolean;
	let randomStartIndex = Math.floor(Math.random() * width * width);

	let startIndex = parseInt(startID) ? parseInt(startID) : randomStartIndex;

	const { shipBlocks, valid, notTaken } = getValidity(allBoardBlocks, isHorizontal, startIndex, ship);

	if (valid && notTaken) {
		shipBlocks.forEach((shipBlocks) => {
			shipBlocks.classList.add(ship.name);
			shipBlocks.classList.add('taken');
		});
	} else {
		if (user === 'computer') addShipPieces(user, ship, startID);
		else if (user === 'player') notDropped = true;
	}
}

ships.forEach((ship) => addShipPieces('computer', ship));

//-------------------------------------------------------------------------------------------------------------

let draggedShip = null;

let allPlayerBlocks = document.querySelectorAll('#player div');
allPlayerBlocks.forEach((playerBlock) => {
	playerBlock.addEventListener('dragover', dragOver);
	playerBlock.addEventListener('drop', dropShip);
});

const optionShips = Array.from(optionContainer.children);

optionShips.forEach((optionShip) => optionShip.addEventListener('dragstart', dragStart));

function dragStart(e) {
	notDropped = false;
	draggedShip = e.target;
}

function dragOver(e) {
	e.preventDefault();
	const ship = ships[draggedShip.id];
	higlightArea(e.target.id, ship);
}

function dropShip(e) {
	const startID = e.target.id;
	const ship = ships[draggedShip.id];
	addShipPieces('player', ship, startID);

	if (!notDropped) {
		draggedShip.remove();
	}
}

//-------------------------------------------------------------------------------------------------------------

function higlightArea(startIndex, ship) {
	const allBoardBlocks = document.querySelectorAll('#player div');
	let isHorizontal = angle === 0;

	const { shipBlocks, valid, notTaken } = getValidity(allBoardBlocks, isHorizontal, startIndex, ship);

	if (valid && notTaken) {
		shipBlocks.forEach((shipBlock) => {
			shipBlock.classList.add('hover');
			setTimeout(() => {
				shipBlock.classList.remove('hover');
			}, 500);
		});
	}
}

//-------------------------------------------------------------------------------------------------------------

let playerHits = [];
let computerHits = [];

function handleClick(e) {
	if (!gameOver) {
		if (e.target.classList.contains('taken')) {
			e.target.classList.add('boom');
			infoDisplay.textContent = 'You hit the computers ship!';
			let classes = Array.from(e.target.classList);
			classes = classes.filter((className) => className !== 'block');
			classes = classes.filter((className) => className !== 'boom');
			classes = classes.filter((className) => className !== 'taken');

			playerHits.push(...classes);
			//checkScore('player', playerHits, playerSunkShips);
		}
		if (!e.target.classList.contains('taken')) {
			infoDisplay.textContent = 'Nothing hit this time.';
			e.target.classList.add('empty');
		}
		//playerTurn = false;
		let allBoardBlocks = document.querySelectorAll('#computer div');
		allBoardBlocks.forEach((block) => block.replaceWith(block.cloneNode(true)));
		//computerGo();
	}
}

//-------------------------------------------------------------------------------------------------------------

//function computerGo() {
//	if (!gameOver) {
//		turnDisplay.textContent = 'Computers turn';
//		infoDisplay.textContent = 'The computer is thinking...';

//		let randomGo = Math.floor(Math.random() * width * width);
//		let allBoardBlocks = document.querySelectorAll('#player div');

//		if (allBoardBlocks[randomGo].classList.contains('taken') && allBoardBlocks[randomGo].classList.contains('boom')) {
//			computerGo();
//			return;
//		} else if (
//			allBoardBlocks[randomGo].classList.contains('taken') &&
//			!allBoardBlocks[randomGo].classList.contains('boom')
//		) {
//			allBoardBlocks[randomGo].classList.add('boom');
//			infoDisplay.textContent = 'The computer hit your ship!';
//			let classes = Array.from(e.target.classList);
//			classes = classes.filter((className) => className !== 'block');
//			classes = classes.filter((className) => className !== 'boom');
//			classes = classes.filter((className) => className !== 'taken');
//			computerHits.push(...classes);
//		} else {
//			infoDisplay.textContent = 'Nothing hit this time.';
//			allBoardBlocks[randomGo].classList.add('empty');
//		}

//		playerTurn = true;
//		turnDisplay.textContent = 'Your go!'
//		infoDisplay.textContent = 'Please thake your go.'
//		let allBoardBlocks22 = document.querySelectorAll('#computer div')
//		allBoardBlocks22.forEach(block => block.addEventListener('click', handleClick))
//	}
//}

//-------------------------------------------------------------------------------------------------------------

//function checkScore() {

//}

//-------------------------------------------------------------------------------------------------------------

let gameOver = false;
let playerTurn = null;

function startGame() {
	if (optionContainer.children.length !== 0) {
		infoDisplay.textContent = 'Please place all your pieces first!';
	} else {
		const allBoardBlocks = document.querySelectorAll('#computer div');
		allBoardBlocks.forEach((block) => block.addEventListener('click', handleClick));
	}
}

//-------------------------------------------------------------------------------------------------------------

flipButton.addEventListener('click', flip);
startButton.addEventListener('click', startGame);

//-------------------------------------------------------------------------------------------------------------

//setInterval(flip, 5)

//-------------------------------------------------------------------------------------------------------------

// # 1:08:00
