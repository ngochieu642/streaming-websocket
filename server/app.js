const fs = require("fs");
const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const WebSocket = require("ws");

const debugWebSocket = require("debug-level").log("server:websocket");
const debugStream = require("debug-level").log("server:stream");
const debugServer = require("debug-level").log("server:general");

const STREAM_PORT = process.env.STREAM_PORT;
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT;

const cameraRoutes = require("./routes/api/camera");
const { childrenProcess } = require("./util/stream");

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

  debugWebSocket.info(
    "New WebSocket Connection: ",
    (request || socket.request).socket.remoteAddress,
    (request || socket.request).headers["user-agent"],
    `( ${socketServer.connectionCount} total)`
  );

  socket.on("close", (code, reason) => {
    socketServer.connectionCount--;
    debugWebSocket.info(
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
  debugStream.info(
    `Stream Connected: ${request.socket.remoteAddress}:${request.socket.remotePort}`
  );

  request.on("data", data => {
    socketServer.broadcast(data, params);
    if (request.socket.recording) {
      request.socket.recording.write(data);
    }
  });

  request.on("end", () => {
    debugStream.info("close");
    if (request.socket.recording) {
      request.socket.recording.close();
    }
  });
});

// Start Streaming Servers
streamServer.listen(STREAM_PORT);

// Routing
const server = app.listen(3000, () => {
  debugServer.info("Server started on port " + server.address().port);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use("/api/camera", cameraRoutes);

// Kill all child process
process.stdin.resume();
process.on("SIGINT", function() {
  debugServer.info("Got SIGINT.  Press Control-D to exit.");
  for (let child of childrenProcess) {
    process.kill(-child.pid, "SIGTERM");
    process.kill(-child.pid, "SIGKILL");
    debugServer.info(`Child ${child.pid} killed`);
  }
  process.exit();
});
