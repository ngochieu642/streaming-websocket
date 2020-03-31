const { execFile, spawn } = require("child_process");
const hash = require("object-hash");

const STREAM_PORT = process.env.STREAM_PORT;
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT;

const {
  DEBUG_CHILD_PROCESS: debugChildProcess,
  DEBUG_STREAM: debugStream
} = require("../util/constants").DEBUG;

const childrenProcess = [];

exports.childrenProcess = childrenProcess;

/**
 *
 * This function return a streamKey from rtsp link
 * @param input
 */
exports.getStreamKey = input => {
  return new Promise((resolve, reject) => {
    resolve(hash.sha1(input));
  });
};

exports.getStreamLink = async input => {
  let streamKey = await this.getStreamKey(input);
  return `http://localhost:${STREAM_PORT}/${streamKey}`;
};

exports.getWebSocketLink = async input => {
  let streamKey = await this.getStreamKey(input);
  return `ws://localhost:${WEBSOCKET_PORT}/?token=${streamKey}`;
};

exports.openUsingScriptFile = async (pathToScriptFile, rtspLink) => {
  try {
    let streamLink = await this.getStreamLink(rtspLink);
    let websocketLink = await this.getWebSocketLink(rtspLink);

    debugStream.info(
      `Stream link: ${streamLink}; WebSocket link: ${websocketLink}`
    );

    const spawnParams = [pathToScriptFile, rtspLink, streamLink];

    /**
     * Allows killing of all of child's descendants.
     * cf. http://azimi.me/2014/12/31/kill-child_process-node-js.html
     * https://github.com/nodejs/node-v0.x-archive/issues/1811
     */
    const spawnOpts = {
      detached: true
    };

    const child = spawn("bash", spawnParams, spawnOpts);

    child.stdout.on("data", function(data) {
      // console.log(`stdout: ${data}`);
    });

    child.stderr.on("data", function(data) {
      // console.error(`stderr: ${data}`);
    });

    child.on("close", function(code, signal) {
      debugChildProcess.info(
        `child process exited with code ${code} and signal ${signal}`
      );
    });

    child.on("exit", function(code, signal) {
      debugChildProcess.info(
        `child process exited with code ${code} and signal ${signal}`
      );
    });

    childrenProcess.push(child);

    debugChildProcess.info(
      `Children PIDs [${childrenProcess.map(child => child.pid)}]`
    );

    return websocketLink;
  } catch (err) {
    debugChildProcess.error(err);
  }
};
