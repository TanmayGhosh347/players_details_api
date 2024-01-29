const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializedDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error : ${error.message}`);
    process.exit(1);
  }
};

initializedDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// Returns a list of all players in the team
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
        SELECT * FROM cricket_team 
        ;
    `;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

// Creates a new player in the team (database) . player_id is auto-incremented
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO 
    cricket_team (player_name , jersey_number , role)
    VALUES (
    '${playerName}',
    '${jerseyNumber}',
    '${role}');`;

  const dbResponse = await db.run(addPlayerQuery);
  ////   console.log(dbResponse);
  response.send("Player Added to Team");
});

// Returns a player based on player ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT *
    FROM 
    cricket_team
    WHERE 
    player_id = ${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});

// Updates the details of a player in the team (database) based on the player 10
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerApi = `
        UPDATE cricket_team 
        SET player_name = '${playerName}' , jersey_number = '${jerseyNumber}' , role = '${role}'
        WHERE player_id = '${playerId}';
    `;
  await db.run(updatePlayerApi);
  response.send("Player Details Updated");
});

// Deletes  a player from the (database) based on the player ID
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerApi = `
        DELETE FROM cricket_team
        WHERE player_id = ${playerId};
    `;
  await db.run(deletePlayerApi);
  response.send("Player Removed");
});

module.exports = app;
