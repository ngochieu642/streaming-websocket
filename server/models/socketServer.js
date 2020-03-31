//  Web socket
const WebSocket = require("ws");

const { DEBUG_WEB_SOCKET: debugWebSocket } = require("../util/constants").DEBUG;
const database = require("../util/database");

const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT;

const socketServer = new WebSocket.Server({
  port: WEBSOCKET_PORT,
  perMessageDeflate: false
});

socketServer.connectionCount = 0;

socketServer.on("connection", (socket, request) => {
  socketServer.connectionCount++;

  socket.uuid = request.url.replace("/?token=", "");

  database
    .IncreaseKeyBy1(database.DatabaseClient, socket.uuid)
    .then(function(rs) {
      debugWebSocket.info(
        `Increased connections for key ${socket.uuid}. Total connection for token ${socket.uuid}: ${rs}`
      );
    });

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

    database
      .DecreaseKeyBy1(database.DatabaseClient, socket.uuid)
      .then(function(rs) {
        debugWebSocket.info(
          `Decreased connections for key ${socket.uuid}. Total connection for token ${socket.uuid}: ${rs}`
        );
      });

    // TODO: Check if sockerServer.connectionCount = 0 => Kill Child PID
  });
});

socketServer.broadcast = (data, params) => {
  socketServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client.uuid === params[0]) {
      client.send(data);
    }
  });
};

exports.socketServer = socketServer;
