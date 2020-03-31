// HTTP Server to accept incoming MPEG-TS Stream from FFMPEG
const http = require("http");

const { DEBUG_STREAM: debugStream } = require("../util/constants").DEBUG;
const { socketServer } = require("./socketServer");

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

exports.streamServer = streamServer;
