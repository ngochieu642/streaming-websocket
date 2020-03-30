const fs = require("fs");
const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const WebSocket = require("ws");

const STREAM_PORT = process.env.STREAM_PORT;
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT;

const cameraRoutes = require("./routes/api/camera");
const { childrenProcess } = require("./util/ffmpeg");

const app = express();

//  Web socket
const socketServer = new WebSocket.Server({
  port: WEBSOCKET_PORT,
  perMessageDeflate: false
});

socketServer.connectionCount = 0;

socketServer.on("connection", (socket, request) => {
  socketServer.connectionCount++;

  socket.uuid = request.url.replace("/?token=", "");
  console.log(
    `New WebSocket Connection: `,
    (request || socket.request).socket.remoteAddress,
    (request || socket.request).headers["user-agent"],
    `( ${socketServer.connectionCount} total)`
  );

  socket.on("close", (code, reason) => {
    socketServer.connectionCount--;
    console.log(
      `Disconnected WebSocket, ${socketServer.connectionCount} total`
    );
  });
});

socketServer.broadcast = (data, params) => {
  socketServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client.uuid === params[0]) {
      client.send(data);
    }
  });
};

// HTTP Server to accept incoming MPEG-TS Stream from FFMPEG
const streamServer = http.createServer((request, response) => {
  let params = request.url.substr(1).split("/");

  response.connection.setTimeout(0);
  console.log(
    `Stream Connected: ${request.socket.remoteAddress}:${request.socket.remotePort}`
  );

  request.on("data", data => {
    socketServer.broadcast(data, params);
    if (request.socket.recording) {
      request.socket.recording.write(data);
    }
  });

  request.on("end", () => {
    console.log("close");
    if (request.socket.recording) {
      request.socket.recording.close();
    }
  });
});

// Start Streaming Servers
streamServer.listen(STREAM_PORT);

// Routing
const server = app.listen(3000, () => {
  console.log("Server started on port " + server.address().port);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use("/api/camera", cameraRoutes);

// Kill all child process
process.stdin.resume();
process.on("SIGINT", function() {
  console.log("Got SIGINT.  Press Control-D to exit.");
  for (let child of childrenProcess) {
    console.log(`${child.pid}`);
    child.kill();
    console.log('killed')
  }
  process.exit();
});
