# Chess-like Turn-Based Game

This is a simple turn-based game inspired by chess, built with Node.js, Express, and Socket.IO for real-time communication. The game is played on a 5x5 grid, where each player controls a set of characters. The goal is to eliminate the opponent's characters by strategically moving your own.

## Features

- **Two-player game:** Players join the game automatically when two connections are made.
- **Real-time gameplay:** Moves are communicated in real-time using WebSocket connections.
- **Character placement:** Players place their characters at the beginning of the game.
- **Grid-based movement:** Different characters have unique movement abilities.
- **Game Over condition:** The game ends when one player eliminates all of the opponent's characters.
![image](https://github.com/user-attachments/assets/9b533a47-3913-44dc-a51b-9895f3ca64e5)
![image](https://github.com/user-attachments/assets/09cdb7c0-214e-4b5b-a824-955703566dd0)

## Prerequisites

- Node.js installed on your system

## Installation

1. Clone this repository to your local machine:

    ```bash
    git clone [https://github.com/yourusername/your-repository-name.git](https://github.com/VedantVatsa/Vedant_Vatsa_21BCE1172.git)
    ```

2. Navigate to the root folder:

    ```bash
    cd Vedant_Vatsa_21BCE1172
    ```

3. Install the dependencies:

    ```bash
    npm install
    ```

## Running the Game

To run the game, simply go to the root folder and type:

```bash
node app.js
```
The server will start on port 3000. Open your browser and go to http://localhost:3000 to start playing.

## How to Play
When the game starts, each player will be prompted to place their characters. Player A will place characters on the bottom row, and Player B on the top row.
After placing the characters, the game will begin with Player A taking the first move.
Players take turns moving their characters. Use the input fields to specify the character and the direction of movement.
The game ends when one player eliminates all of the opponent's characters.
## Controls
Character Input: Enter the character you want to move (e.g., P1).
Move Input: Enter the direction you want to move the character (e.g., L for left).
## Game Rules
Pawns (P): Move one step in any direction.
Hero1 (H1): Move two steps in any straight direction.
Hero2 (H2): Move two steps diagonally.
Victory: The game ends when all characters of one player are eliminated.
## File Structure
app.js: The main server file that sets up the Express server and Socket.IO communication.
public/
index.html: The frontend of the game.
client.js: Handles client-side logic and communication with the server.
styles.css: Basic styling for the game interface.
