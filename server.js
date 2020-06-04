const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const Game = require('./server/models/Game');

const app = express();

app.use(bodyParser.json());

app.use(cors());

mongoose.connect(process.env.DATABASE_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(() => {
    console.log("Database connected");
}).catch((err) => {
    console.log(err);
});

app.use("/api/auth", require("./server/routes/auth.routes"));
app.use("/api/tests", require("./server/routes/tests.routes"));
app.use("/api/photo", require("./server/routes/photo.routes"));

app.use(express.static(__dirname + "/dist/testing-app"));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/dist/testing-app/index.html"));
});

app.listen(process.env.PORT || 8084, () => {
  console.log(`Server is running on port ${process.env.PORT || 8084}`);
});

//socket------------------------------------------------------------

const http = require("http").Server(express);
const Socketio = require("socket.io")(http);


Socketio.of("/game").on("connection", (socket) => {
  socket.emit("Join the game", "You have joined the game");

  socket.on("createGame", (data) => {
    const {quiz, userId} = data;
    let roomId = getRandom();
    createGame(roomId, quiz, userId);
    socket.emit("quiz created", quiz);
    socket.emit("roomId", roomId);
  });

  socket.on("joinGameRoom", async (data) => {
    const {room, userId} = data;
    if (roomExists(room)) {
      addNewUser(room, userId);
      socket.join(room);
      socket.emit("joinedRoom", "You have joined the room");
      let quiz;
       await getQuiz(room)
         .then( res => {
           quiz = res.quiz
         });
      Socketio.of("/game").in(room).emit("quiz",quiz);
      socket.on("gameStarted",()=>{
        Socketio.of("/game").in(room).emit("startGame",quiz);
      })

    } else {
      return socket.emit("error","Not joined to the room")
    }
  });

});

async function createGame(room, quiz, userId) {
  const newGame  = await new Game ({
    created_by: userId,
    testId: quiz._id,
    roomId: room,
    status: 'Created',
    quiz: quiz,
    users: [
    ],
  });

  await newGame.save();
}


function getQuiz(roomId) {
   return Game.findOne({roomId: roomId})
}

async function roomExists(room) {
  const game = await Game.findOne({roomId: room});
  return !!game;
}

  function addNewUser(room, userId) {
  console.log('Add user', userId);
  console.log('Room', room);
   Game.findOneAndUpdate({roomId: room},
  { "$push": { "users": {
      userId: userId, result: 0,
  }
    } },
    {new: true, useFindAndModify: false},
    function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
      }
    });
}

function saveUserResults(room, userId, result) {
  const gameRoom = Game.findOne({roomId: room});
  const user = gameRoom.users.filter(i => i.userId === userId);
  user.result = result;
  console.log(gameRoom);
  gameRoom.save();
}

function getRandom() {
  return Math.round(Math.random() * 1000000).toString();
}

http.listen(3000, () => {
  console.log("Listening at port 3000");
});

