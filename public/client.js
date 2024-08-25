const socket = io();

const gameInfo = document.getElementById("gameInfo");
const grid = document.getElementById("grid");
const characterInput = document.getElementById("characterInput");
const moveInput = document.getElementById("moveInput");
const moveButton = document.getElementById("moveButton");

let gameId, playerId, playerLetter, currentPlayer;

socket.emit("joinGame");

socket.on("gameJoined", (data) => {
  gameId = data.gameId;
  playerId = data.playerId;
  playerLetter = data.playerLetter;
  console.log(`Joined game as Player ${playerLetter}`);
  gameInfo.textContent = `You are Player ${playerLetter}`;
});

socket.on("gameStart", (data) => {
  currentPlayer = data.currentPlayer;
  console.log(`Game started. Current player: ${currentPlayer}`);
  updateGameInfo();
  promptCharacterPlacement();
});

function promptCharacterPlacement() {
  const characters = prompt("Enter your 5 characters (e.g., P1,H1,P2,H2,P3):");
  if (characters) {
    console.log(`Placing characters: ${characters}`);
    socket.emit("placeCharacters", {
      gameId,
      characters: characters.split(","),
    });
  }
}

socket.on("charactersPlaced", (data) => {
  console.log("Characters placed. Rendering grid:");
  console.log(data.grid);
  renderGrid(data.grid);
});

function renderGrid(gridData) {
  grid.innerHTML = "";
  gridData.forEach((row) => {
    row.forEach((cell) => {
      const cellElement = document.createElement("div");
      cellElement.className = "cell";
      cellElement.textContent = cell || "";
      grid.appendChild(cellElement);
    });
  });
}

function updateGameInfo() {
  gameInfo.textContent = `You are Player ${playerLetter} | Current Turn: Player ${currentPlayer}`;
}

socket.on("gameUpdate", (data) => {
  renderGrid(data.grid);
  currentPlayer = data.currentPlayer;
  updateGameInfo();
});

socket.on("invalidMove", () => {
  alert("Invalid move. Try again.");
});

socket.on("gameOver", (data) => {
  alert(`Game Over! Player ${data.winner} wins!`);
});

socket.on("gameFullError", () => {
  alert("The game is full. Please try again later.");
});

socket.on("playerDisconnected", () => {
  alert("The other player has disconnected. The game will end.");
});

moveButton.addEventListener("click", () => {
  const character = characterInput.value;
  const move = moveInput.value;
  if (character && move) {
    console.log(
      `Sending move for character ${character} with direction ${move}`
    );
    socket.emit("move", { gameId, character, direction: move });
    characterInput.value = "";
    moveInput.value = "";
  }
});
