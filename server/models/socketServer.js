//  Web socket
const WebSocket = require("ws");

const {
  DEBUG_WEB_SOCKET: debugWebSocket,
  DEBUG_SERVER: debugServer,
  DEBUG_CHILD_PROCESS: debugChildProcess
} = require("../util/constants").DEBUG;
const database = require("../util/database");
const { RemoveChildProcess, GetChildrenProcess } = require("../util/stream");

const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT;

const socketServer = new WebSocket.Server({
  port: WEBSOCKET_PORT,
  perMessageDeflate: false
});

socketServer.connectionCount = 0;

socketServer.on("connection", async (socket, request) => {
  socketServer.connectionCount++;

  socket.uuid = request.url.replace("/?token=", "");

  let keyExisted = await database.KeyExisted(
    database.DatabaseClient,
    socket.uuid
  );

  if (keyExisted) {
    database
      .IncreaseKeyBy1(database.DatabaseClient, socket.uuid)
      .then(function(rs) {
        debugWebSocket.info(
          `Increased connections for key ${socket.uuid}. Total connection for token ${socket.uuid}: ${rs}`
        );
      });
  }

  debugWebSocket.info(
    "New WebSocket Connection: ",
    (request || socket.request).socket.remoteAddress,
    (request || socket.request).headers["user-agent"],
    `( ${socketServer.connectionCount} total)`
  );

  socket.on("close", async (code, reason) => {
    let childrenProcess = GetChildrenProcess();
    socketServer.connectionCount--;
    debugChildProcess.warn(
      `[socketServer.js] ${childrenProcess.map(x => x.pid)}`
    );
    debugWebSocket.info(
      `Disconnected WebSocket ${socket.uuid}, ${socketServer.connectionCount} total`
    );
    let socketConnectionCount = await database.CountConnections(
      database.DatabaseClient,
      socket.uuid
    );

    if (socketConnectionCount > 0) {
      await database
        .DecreaseKeyBy1(database.DatabaseClient, socket.uuid)
        .then(function(rs) {
          debugWebSocket.info(
            `Decreased connections for key ${socket.uuid}. Total connection for token ${socket.uuid}: ${rs}`
          );
        });
    }

    // TODO: Check if total number of client with that id not exist => Kill Child PID
    // socketServer.clients is a Set. Convert it to array to get the work done easier.
    let clientSocketArray = Array.from(socketServer.clients);
    let countConnections = clientSocketArray.filter(
      client => client.uuid === socket.uuid
    ).length;

    // Kill the Child process & delete the key from redis
    if (countConnections === 0) {
      let childrenProcess = GetChildrenProcess();
      debugServer.warn(
        `[socketServer.js] All Children ${childrenProcess.map(
          child => child.pid
        )}`
      );

      let childToKill = childrenProcess.find(
        child => child.streamToken === socket.uuid
      );

      if (!!childToKill) {
        RemoveChildProcess(childToKill);
      }

      await database.RemoveKey(database.DatabaseClient, socket.uuid);
    }
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
