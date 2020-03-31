const { execFile, spawn } = require("child_process");
const hash = require("object-hash");

const STREAM_PORT = process.env.STREAM_PORT;
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT;

const {
  DEBUG_CHILD_PROCESS: debugChildProcess,
  DEBUG_STREAM: debugStream,
  DEBUG_SERVER: debugServer,
} = require("../util/constants").DEBUG;

const { SERVER_IP, WEBSOCKET_SERVER_IP } = require("../util/constants");

let childrenProcess = [];

exports.RemoveChildProcess = childToKill => {
  childrenProcess = childrenProcess.filter(
      child => child.pid !== childToKill.pid
  );
  process.kill(-childToKill.pid, "SIGTERM");
  process.kill(-childToKill.pid, "SIGKILL");
  debugChildProcess.info(`[socketServer.js ] Child ${childToKill.pid} killed`);
};

exports.AddChildProcess = childToAdd => {
  childrenProcess.push(childToAdd);
  debugChildProcess.info(`[stream.js] Child ${childToAdd.pid} added`);
};

exports.GetChildrenProcess = () => {
  return childrenProcess;
}
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
  return `${SERVER_IP}:${STREAM_PORT}/${streamKey}`;
};

exports.getWebSocketLink = async input => {
  let streamKey = await this.getStreamKey(input);
  return `${WEBSOCKET_SERVER_IP}:${WEBSOCKET_PORT}/?token=${streamKey}`;
};

exports.openUsingScriptFile = async (pathToScriptFile, rtspLink) => {
  try {
    let streamToken = await this.getStreamKey(rtspLink);
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
    child.streamToken = streamToken;

    child.stdout.on("data", function(data) {
      debugStream.info(`stdout: ${data}`);
    });

    child.stderr.on("data", function(data) {
      // console.error(`stderr: ${data}`);
    });

    child.on("close", function(code, signal) {
      childrenProcess = childrenProcess.filter(eachChild => eachChild.pid !== child.pid);
      debugChildProcess.info(
        `CLOSED signal - child process ${child.pid} exited with code ${code} and signal ${signal}`
      );
      debugChildProcess.info(`Children Process: [${childrenProcess.map(x => x.pid)}]`);
    });

    child.on("exit", function(code, signal) {
      childrenProcess = [...childrenProcess].filter(eachChild => eachChild.pid !== child.pid);
      debugChildProcess.info(
        `EXIT SIGNAL - child process ${child.pid} exited with code ${code} and signal ${signal}`
      );
      debugChildProcess.info(`Children Process: [${childrenProcess.map(x => x.pid)}]`);
    });

    this.AddChildProcess(child);

    debugChildProcess.info(
      `[stream.js] Children PIDs [${childrenProcess.map(child => child.pid)}]`
    );

    return websocketLink;
  } catch (err) {
    debugChildProcess.error(err);
  }
};
