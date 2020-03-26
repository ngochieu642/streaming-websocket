const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");

const STREAM_SECRET = process.env.STREAM_SECRET;
const STREAM_PORT = process.env.STREAM_PORT;
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT;
const RECORD_STREAM = false;

const socketServer = new WebSocket.Server({
  port: WEBSOCKET_PORT,
  perMessageDeflate: false
});

socketServer.connectionCount = 0;

// Connections from Frontend
socketServer.on("connection", (socket, request) => {
  socketServer.connectionCount++;
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

socketServer.broadcast = data => {
  socketServer.clients.forEach(client => {
    client.readyState === WebSocket.OPEN && client.send(data);
  });
};

// HTTP Server to accept incoming MPEG-TS Stream from FFMPEG
const streamServer = http.createServer((request, response) => {
  let params = request.url.substr(1).split("/");

  if (params[0] !== STREAM_SECRET) {
    console.log(
      `Failed Stream Connection: ${request.socket.remoteAddress}:${request.socket.remotePort} Wrong Secret`
    );
    response.end();
  }

  response.connection.setTimeout(0);
  console.log(
    `Stream Connected: ${request.socket.remoteAddress}:${request.socket.remotePort}`
  );

  request.on("data", data => {
    socketServer.broadcast(data);
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
}).listen(STREAM_PORT);
