const debugWebSocket = require("debug-level").log("server:websocket");
const debugStream = require("debug-level").log("server:stream");
const debugServer = require("debug-level").log("server:general");
const debugCamera = require("debug-level").log("server:camera");
const debugDatabase = require("debug-level").log("server:database");
const debugChildProcess = require("debug-level").log("server:childprocess");

module.exports = {
  DEBUG: {
    DEBUG_WEB_SOCKET: debugWebSocket,
    DEBUG_STREAM: debugStream,
    DEBUG_SERVER: debugServer,
    DEBUG_CAMERA: debugCamera,
    DEBUG_DATABASE: debugDatabase,
    DEBUG_CHILD_PROCESS: debugChildProcess
  },
  SERVER_IP: `http://localhost`,
  WEBSOCKET_SERVER_IP: `ws://localhost`
};
