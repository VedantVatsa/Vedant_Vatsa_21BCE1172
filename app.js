const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

const games = new Map();

class Game {
  constructor(id) {
    this.id = id;
    this.players = [];
    this.grid = Array(5)
      .fill()
      .map(() => Array(5).fill(null));
    this.currentPlayer = 0;
    this.charactersPlaced = 0;
  }

  addPlayer(player) {
    if (this.players.length < 2) {
      const playerId = this.players.length;
      this.players.push({ id: player, letter: playerId === 0 ? "A" : "B" });
      return playerId;
    }
    return -1;
  }

  placeCharacters(playerLetter, characters) {
    const row = playerLetter === "A" ? 4 : 0;
    characters.forEach((char, col) => {
      this.grid[row][col] = `${playerLetter}-${char}`;
    });
    this.charactersPlaced++;
  }

  move(playerId, character, direction) {
    const [row, col] = this.findCharacter(character);
    if (row === -1 || col === -1) return false;

    const [charOwner, charType] = character.split("-");
    if (
      (playerId === 0 && charOwner !== "A") ||
      (playerId === 1 && charOwner !== "B")
    ) {
      return false;
    }

    let newRow = row,
      newCol = col;
    let validMove = false;

    switch (charType[0]) {
      case "P":
        [newRow, newCol, validMove] = this.movePawn(row, col, direction);
        break;
      case "H":
        if (charType[1] === "1") {
          [newRow, newCol, validMove] = this.moveHero1(row, col, direction);
        } else if (charType[1] === "2") {
          [newRow, newCol, validMove] = this.moveHero2(row, col, direction);
        }
        break;
    }

    if (validMove && this.isValidPosition(newRow, newCol)) {
      if (
        this.grid[newRow][newCol] &&
        this.grid[newRow][newCol][0] !== charOwner
      ) {
        this.grid[newRow][newCol] = null;
      }
      this.grid[newRow][newCol] = this.grid[row][col];
      this.grid[row][col] = null;
      return true;
    }

    return false;
  }

  findCharacter(character) {
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (this.grid[i][j] === character) {
          return [i, j];
        }
      }
    }
    return [-1, -1];
  }

  movePawn(row, col, direction) {
    switch (direction) {
      case "F":
        return [row - 1, col, true];
      case "B":
        return [row + 1, col, true];
      case "L":
        return [row, col - 1, true];
      case "R":
        return [row, col + 1, true];
      default:
        return [row, col, false];
    }
  }

  moveHero1(row, col, direction) {
    switch (direction) {
      case "F":
        return [row - 2, col, true];
      case "B":
        return [row + 2, col, true];
      case "L":
        return [row, col - 2, true];
      case "R":
        return [row, col + 2, true];
      default:
        return [row, col, false];
    }
  }

  moveHero2(row, col, direction) {
    switch (direction) {
      case "FL":
        return [row - 2, col - 2, true];
      case "FR":
        return [row - 2, col + 2, true];
      case "BL":
        return [row + 2, col - 2, true];
      case "BR":
        return [row + 2, col + 2, true];
      default:
        return [row, col, false];
    }
  }

  isValidPosition(row, col) {
    return row >= 0 && row < 5 && col >= 0 && col < 5;
  }

  isGameOver() {
    const playerA = this.grid
      .flat()
      .some((cell) => cell && cell.startsWith("A"));
    const playerB = this.grid
      .flat()
      .some((cell) => cell && cell.startsWith("B"));
    return !playerA || !playerB;
  }
}

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("joinGame", () => {
    let game = [...games.values()].find((g) => g.players.length < 2);
    if (!game) {
      game = new Game(games.size);
      games.set(game.id, game);
    }
    const playerId = game.addPlayer(socket.id);
    if (playerId !== -1) {
      socket.join(game.id);
      const playerLetter = game.players[playerId].letter;
      console.log(`Player ${playerLetter} joined game ${game.id}`);
      socket.emit("gameJoined", { gameId: game.id, playerId, playerLetter });

      if (game.players.length === 2) {
        console.log(
          `Game ${game.id} starting with players: ${game.players
            .map((p) => p.letter)
            .join(", ")}`
        );
        io.to(game.id).emit("gameStart", {
          currentPlayer: game.players[game.currentPlayer].letter,
        });
      }
    } else {
      socket.emit("gameFullError");
    }
  });

  socket.on("placeCharacters", (data) => {
    const game = games.get(data.gameId);
    if (game) {
      const player = game.players.find((p) => p.id === socket.id);
      if (player) {
        game.placeCharacters(player.letter, data.characters);
        console.log(`Player ${player.letter} placed characters`);
        if (game.charactersPlaced === 2) {
          io.to(data.gameId).emit("charactersPlaced", { grid: game.grid });
        }
      }
    }
  });

  socket.on("move", (data) => {
    const game = games.get(data.gameId);
    if (game) {
      const playerId = game.players.findIndex((p) => p.id === socket.id);
      const moveSuccessful = game.move(
        playerId,
        data.character,
        data.direction
      );

      if (moveSuccessful) {
        if (game.isGameOver()) {
          io.to(data.gameId).emit("gameOver", {
            winner: game.players[playerId].letter,
          });
        } else {
          game.currentPlayer = 1 - game.currentPlayer;
          io.to(data.gameId).emit("gameUpdate", {
            grid: game.grid,
            currentPlayer: game.players[game.currentPlayer].letter,
          });
        }
      } else {
        socket.emit("invalidMove");
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    games.forEach((game) => {
      const index = game.players.findIndex((p) => p.id === socket.id);
      if (index !== -1) {
        game.players.splice(index, 1);
        if (game.players.length === 0) {
          games.delete(game.id);
        } else {
          io.to(game.id).emit("playerDisconnected");
        }
      }
    });
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
