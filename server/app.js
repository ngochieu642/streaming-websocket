const fs = require("fs");
const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");

// models
const {socketServer} = require('./models/socketServer');
const {streamServer} = require('./models/streamServer');

// Environment
const STREAM_PORT = process.env.STREAM_PORT;
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT;

// Routes
const cameraRoutes = require("./routes/api/camera");

// Utils
const { GetChildrenProcess, RemoveChildProcess } = require("./util/stream");
const { DatabaseClient } = require("./util/database");
const {
  DEBUG_WEB_SOCKET: debugWebSocket,
  DEBUG_STREAM: debugStream,
  DEBUG_SERVER: debugServer,
  DEBUG_DATABASE: debugDatabase,
} = require("./util/constants").DEBUG;

// // HTTP Server to accept incoming MPEG-TS Stream from FFMPEG
streamServer.listen(STREAM_PORT);

// API Server
const app = express();
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

  debugServer.warn('Flush all Key from Database');
  DatabaseClient.flushall(function (err, succeeded) {
    if (err) debugDatabase.err(err);
    else debugDatabase.info(succeeded);
  });
  DatabaseClient.quit(function(){
    debugServer.info('Connection to Client closed')
  });

  debugServer.warn("Kill children process");
  let childrenProcess = GetChildrenProcess();
  debugServer.info('All Child PIDs: ', childrenProcess.map(x => x.pid));
  for (let child of childrenProcess) {
    RemoveChildProcess(child);
  }
  process.exit();
});
