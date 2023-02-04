const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB is obtained ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
    SELECT * FROM cricket_team;`;
  const playerQuery = await db.all(getPlayerQuery);
  response.send(
    playerQuery.map((eachPlayer) => {
      return {
        playerId: eachPlayer.player_id,
        playerName: eachPlayer.player_name,
        jerseyNumber: eachPlayer.jersey_number,
        role: eachPlayer.role,
      };
    })
  );
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const getAddPlayer = `
    INSERT INTO cricket_team 
    (player_name,jersey_number,role)
    VALUES
    ('${playerName}',${jerseyNumber},'${role}');`;
  const addPlayer = await db.run(getAddPlayer);
  response.send("Player Added to Team");
});
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerId = `SELECT * 
    FROM cricket_team WHERE player_id=${playerId};`;
  const player = await db.get(getPlayerId);
  response.send(convertDbObjectToResponseObject(player));
});

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerUpdateDetails = request.body;
  const { playerName, jerseyNumber, role } = playerUpdateDetails;
  const getUpdatePlayer = `
    UPDATE cricket_team
    SET
    player_name='${playerName}',
    jersey_number=${jerseyNumber},
    role='${role}'
    WHERE player_id=${playerId};`;
  await db.run(getUpdatePlayer);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
    DELETE FROM cricket_team
    WHERE player_id=${playerId};`;
  await db.run(deletePlayer);
  response.send("Player Removed");
});

module.exports = app;
