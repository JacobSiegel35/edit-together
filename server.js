const express = require('express');
const io = require("socket.io")();
const path = require("path");
const app = express();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const axios = require('axios').default;

const EXEC_SERVER_1_LOCALHOST = "http://localhost:3001/runcode";
const EXEC_SERVER_2_LOCALHOST = "http://localhost:3002/runcode";
const EXEC_SERVER_1_AZURE = "http://execserver1.southcentralus.cloudapp.azure.com:1337/runcode";
const EXEC_SERVER_2_AZURE = "http://execserver2.southcentralus.cloudapp.azure.com:1337/runcode";

const EXEC_SERVER_1 = EXEC_SERVER_1_AZURE;
const EXEC_SERVER_2 = EXEC_SERVER_2_AZURE;

class ExecServer {
  constructor(url) {
    this.url = url;
    this.next = null;
  }
}

// setup circular linked list for round robin scheduling.
let node1 = new ExecServer(EXEC_SERVER_1);
let node2 = new ExecServer(EXEC_SERVER_2);
node1.next = node2;
node2.next = node1;

let curNode = node1;

// serve the react app
const buildPath = path.join(__dirname, 'build');

app.use(express.static(buildPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.post('/runcode', jsonParser, (req, res) => {
  const code = req.body.code;
  const FILE_NAME = "code" + req.body.roomID + ".py";

  axios.post(curNode.url, { 'code': code, 'fileName': FILE_NAME })
    .then(response => {
      console.log(response.data);
      res.json({data: response.data});
    })
    .catch(e => {
      console.log(e)
    });
  
  curNode = curNode.next;
});

// start servers
const server = app.listen(1337, () => {
  console.log("server started");
});

io.listen(server);

// all of the editors currently open
// { id : { text : Array, users : [socket.id], language : String } }
// entry deleted when no users connected anymore
let editors = {}

// keep track of what roomID each socket is in as well as its name
// { socket.id : { roomID : str/num, nickname : str } }
let sockets = {};

const createEditor = () => {
  // create a new editor and return its id
  const roomID = Date.now();
  editors[roomID] = {text: "", clients: new Set(), language: "python"};
  return roomID;
}

// socket io events

io.on("connection", (socket) => {

  socket.on("create-editor", () => {
    const roomID = createEditor();
    socket.emit("editor-created", roomID);
  });

  const getClients = (roomID) => {
    // return an array of client names connected to roomID
    let res = {};
    for (const socketID of editors[roomID].clients) {
      res[socketID] = sockets[socketID].nickname;
    }
    return res;
  }

  socket.on("join-room", (roomID) => {
    // join the room with the name roomID if it exists
    if (!(roomID in editors)) 
      socket.emit("err", "editor does not exist");
    else {
      editors[roomID].clients.add(socket.id);
      sockets[socket.id] = {roomID, nickname:socket.id};
      // join the socket to the room called roomID
      socket.join(roomID);
      // send the value of the editor back to the client
      socket.emit("set-editor-text", editors[roomID].text);
      // send the clients to everyone in the room
      io.to(roomID).emit(
        "connected-clients", 
        getClients(roomID)
      );
    }
  });

  socket.on("change-editor-text", (text) => {
    // update the editor if the socket is in a room
    // socket.id is in sockets only if it is in a room
    if (socket.id in sockets) {
      const roomID = sockets[socket.id].roomID;
      editors[roomID].text = text;
      // broadcast the editor value to the room
      socket.to(roomID).emit("set-editor-text", editors[roomID].text);
    }
  });

  socket.on("socket-name-changed", (nickname) => {
    sockets[socket.id].nickname = nickname
    const roomID = sockets[socket.id].roomID
    io.to(roomID).emit(
      "connected-clients",
      getClients(roomID)
    )
  });

  socket.on("language-change", newLanguage => {
    const roomID = sockets[socket.id].roomID;
    socket.to(roomID).emit("language-change", newLanguage);
  });

  const disconnect = socket => {
    // helper function to disconnect a socket 
    const roomID = sockets[socket.id] ? sockets[socket.id].roomID : null;
    if (roomID) {
      delete sockets[socket.id];
      editors[roomID].clients.delete(socket.id);
      socket.leave(roomID);
      // send the connected clients to everyone in the room
      if (roomID in editors)
        io.to(roomID).emit(
          "connected-clients", 
          getClients(roomID)
      );
    }

    return roomID
  }

  socket.on("leave-room", () => {
    const roomID = disconnect(socket);
    if (!editors[roomID])
      delete editors[roomID];
  });

  socket.on("disconnect", () => {
    disconnect(socket);
  });

});